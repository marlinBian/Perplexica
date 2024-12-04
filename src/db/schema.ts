import { sql } from 'drizzle-orm';

import { text, integer, sqliteTable,index,real } from 'drizzle-orm/sqlite-core';

// messages 消息表
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey(),
  content: text('content').notNull(),
  chatId: text('chatId').notNull(),
  messageId: text('messageId').notNull(),
  role: text('type', { enum: ['assistant', 'user'] }),
  metadata: text('metadata', { mode: 'json' }),
});

interface File {
  name: string;
  fileId: string;
}

interface File {
  name: string;
  fileId: string;
}

// userID 与 userType 搭配使用
// userType 为 wx 时，userID 为对应的 openID 
// userType 为 stack 时，则说明使用 stack 进行了 user 管理
export const chats = sqliteTable('chats', {
  id: text('id').primaryKey(),
  userID: text('userID'),
  userType: text('userType'),
  title: text('title').notNull(),
  createdAt: text('createdAt').notNull(),
  focusMode: text('focusMode').notNull(),
  files: text('files', { mode: 'json' })
    .$type<File[]>()
    .default(sql`'[]'`),
});

// 微信用户基本信息
export const wxUsers = sqliteTable('wxUsers', {
  id: text('id').primaryKey(),
  session_key: text('sessionKey'),
  nickName: text('nickName'),
  avatarURL: text('avatarURL'),
})

// 订阅计划表，subscriptionPlans
/*
id	          text	        订阅计划唯一标识符
plan_name	    text       	  订阅计划名称
duration_days	INT	          订阅有效天数
price	        real	        订阅价格
features	    JSON	        包含的功能描述
created_at    timestamp     创建时间
*/
export const subscriptionPlans = sqliteTable('subscriptionPlans', {
  id: text('id').primaryKey(),
  planName: text('planName'),
  durationDays: integer('durationDays'),
  price: real('price'),
  features: text('features', { mode: 'json' }),
  createdAt: text('createdAt').notNull(),
})

// 订单表
/*
id	          text	    订单唯一标识符
user_id	      text	    用户ID
plan_id	      text	    订阅计划ID
start_date	  TIMESTAMP	订阅开始日期
end_date	    TIMESTAMP	订阅结束日期
status	      text(20)	订单状态（如：active, expired, canceled）
created_at    text      创建时间    
 */
/*
待付款 (PendingPayment) - 订单已创建但尚未付款或准备开始处理。
失败 (FailedPayment) - 客户无法完成付款或完成订单所需的其他验证。
生效（Active）
已过期 (Expired) 
已取消 (Canceled) 

状态转移
pendingPayment -[超时等]-> failedPayment
               -[付款成功]-> active（附带：paymentRecords）
active -[订阅过期]-> expired
*/
export type OrderStatus = 'pendingPayment' // 待付款
      | 'failedPayment' // 付款失败
      | 'active'// 订阅订单生效中
      | 'expired' // 订阅订单已过期
      | 'canceled' // 订阅订单已取消（涉及到退费？）
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey(),
  userID: text('userID').notNull().references(() => wxUsers.id, { onDelete: 'cascade' }),
  planID: text('planID').notNull().references(() => subscriptionPlans.id, { onDelete: 'cascade' }),
  startDate: text('startDate').notNull(),
  endDate: text('endDate').notNull(),
  status: text('status', {
    enum: [
      'pendingPayment' // 待付款
      , 'failedPayment' // 付款失败
      , 'active'// 订阅订单生效中
      , 'expired' // 订阅订单已过期
      , 'canceled' // 订阅订单已取消（涉及到退费？）
    ]
  }).notNull().default('pendingPayment'),
  createdAt: text('createdAt').notNull(),
},(orders)=>({
  index:index('index_createdAt').on(orders.createdAt)
}))

export const orderHistory = sqliteTable('orderHistory', {
  id: integer('id').primaryKey(),
  userID: text('userID').notNull().references(() => wxUsers.id, { onDelete: 'cascade' }),
  planID: text('planID').notNull().references(() => subscriptionPlans.id, { onDelete: 'cascade' }),
  startDate: text('startDate').notNull(),
  endDate: text('endDate').notNull(),
  status: text('status', {
    enum: [
      'pendingPayment' // 待付款
      , 'failedPayment' // 付款失败
      , 'active'// 订阅订单生效中
      , 'expired' // 订阅订单已过期
      , 'canceled' // 订阅订单已取消（涉及到退费？）
    ]
  }).notNull().default('pendingPayment'),
  createdAt: text('createdAt').notNull(),
})


// 付款记录表
/*
id	            text	    支付唯一标识符
order_id	      text	    关联的订单ID
amount	        real    	支付金额
payment_method	text(50)	支付方式（如：信用卡、PayPal）
created_at      timestamp 创建时间
 */
export const paymentRecords = sqliteTable('paymentRecords', {
  id: text('id').primaryKey(),
  orderID: integer('orderID').notNull(),
  amount: real('amount').notNull(),
  paymentMethod: text('paymentMethod').notNull(),
  createdAt: text('createdAt').notNull(),
})
