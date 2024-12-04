import { orderHistory, orders, OrderStatus } from "../db/schema"
import db from '../db/index';
import { and, eq, gt, inArray } from "drizzle-orm";

export const procOrder = async () => {
    // 1. 计算订单是否订阅过期，并更新订单状态
    // 2. 将过期（endDate）超过5天的订单转移到历史表
    // 3. 将创建时间超过3天且付款失败订单转移到历史表
    const batchSize = 50
    const dayMs = 1000 * 60 * 60 * 24
    // 按条件更新 status 字段
    const updateOrderStatus = async (
        startStatus: OrderStatus,
        endStatus: OrderStatus,
        condition: (o: {
            id: number;
            userID: string;
            createdAt: string;
            planID: string;
            startDate: string;
            endDate: string;
            status: "pendingPayment" | "failedPayment" | "active" | "expired" | "canceled";
        }) => boolean
    ) => {
        let minId = -1
        let needStop = false
        while (!needStop) {
            const res = await db.query.orders.findMany({
                where: and(eq(orders.status, startStatus), gt(orders.id, minId)),
                limit: batchSize,
                orderBy: orders.id,
            }).execute()
            needStop = res.length < batchSize ? true : false
            res.forEach(o => minId = Math.max(minId, o.id))
            const expiredIDs = res.filter(o => condition(o)).map(o => o.id)
            db.update(orders).set({ status: endStatus }).where(inArray(orders.id, expiredIDs)).run()
        }
    }
    await updateOrderStatus('active', 'expired', (o) => new Date().getTime() > Date.parse(o.endDate))


    const mvToHistory = async (status: OrderStatus, condition: (o: {
        id: number;
        userID: string;
        createdAt: string;
        planID: string;
        startDate: string;
        endDate: string;
        status: "pendingPayment" | "failedPayment" | "active" | "expired" | "canceled";
    }) => boolean) => {
        let needStop = false
        let minId = -1
        while (!needStop) {
            const res = await db.query.orders.findMany({
                where: and(eq(orders.status, status), gt(orders.id, minId)),
                limit: batchSize,
                orderBy: orders.id,
            }).execute()
            needStop = res.length < batchSize ? true : false
            res.forEach(o => minId = Math.max(minId, o.id))
            const expiredRecords = res.filter(o => condition(o))
            const expiredIDs = expiredRecords.map(o => o.id)
            db.transaction((tx) => {
                tx.insert(orderHistory).values(expiredRecords).run()
                tx.delete(orders).where(inArray(orders.id, expiredIDs)).run()
            })
        }
    }

    mvToHistory('expired', (o) => new Date().getTime() - Date.parse(o.endDate) > dayMs * 5)
    
    mvToHistory('failedPayment', (o) => new Date().getTime() - Date.parse(o.endDate) > dayMs * 3)
}