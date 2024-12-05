import axios from 'axios';
import express from 'express';
import db from '../db/index';
import { eq } from 'drizzle-orm';
import logger from '../utils/logger';
import crypto from 'crypto';
import { wxCode2SessionURL, wxMiniAppID, wxMiniAppSecret, wxJwtToken } from '../config';
import { wxUsers, chats, messages } from '../db/schema';
import jwt from 'jsonwebtoken';
import { desc,and,lt } from 'drizzle-orm';

const router = express.Router();

// 实现 wechat 登陆
router.post('/login', async (req, res) => {
    const { code } = req.body;
    logger.info(`req body = ${req}`)
    try {
        const response = await axios.get(wxCode2SessionURL(), {
            params: {
                appid: wxMiniAppID(),
                secret: wxMiniAppSecret(),
                js_code: code,
                grant_type: 'authorization_code'
            }
        })
        const { openid, session_key } = response.data;
        const token = jwt.sign({ openid }, wxJwtToken(), { expiresIn: '15h' })

        let wxUser = await db.query.wxUsers.findFirst({
            where: eq(wxUsers.id, openid),
        })
        // 没有 wx 用户信息，创建
        if (!wxUser) {
            await db.insert(wxUsers).values({
                id: openid,
                session_key: session_key
            }).execute();
        }
        res.status(200).json({ token })
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error: '获取 open id 并创建 user 失败：' + error })
    }
})

// 验证 token 
router.post('/token', async (req, res) => {
    logger.info(`req body = ${req}`)
    const { token } = req.body;
    // const token = (req.headers['x-wxmini-access-token'] as string)
    if (!token) {
        return res.status(400).json({ error: '缺少 token' })
    }
    let decoded
    try {
        decoded = jwt.verify(token, wxJwtToken())
    } catch (error) {
        return res.status(400).json({ error: error })
    }
    const userID = (decoded as any).openid
    let wxUser = await db.query.wxUsers.findFirst({
        where: eq(wxUsers.id, userID),
    })
    if (!wxUser) {
        return res.status(400).json({ error: '缺少用户数据，重新登录' })
    }
    res.status(200).json({})
})

// 获取聊天记录
router.get('/chat', async (req, res) => {
    // const { token } = req.body;
    const token = (req.headers['x-wxmini-access-token'] as string)
    // 如果没有传递 minMsgId 则使用 number max
    const minMsgId = Number(req.headers['x-wxmini-min-msg-id']?? String(Number.MAX_SAFE_INTEGER) as string)
    // 如果没有传递 limit 参数，默认是20
    const limit = Number(req.headers['x-wxmini-limit'] ?? '20' as string)
    if (!token) {
        return res.status(400).json({ error: '缺少 token' })
    }
    let decoded
    try {
        decoded = jwt.verify(token, wxJwtToken())
    } catch (error) {
        return res.status(400).json({ error: error })
    }

    const userID = (decoded as any).openid
    let wxUser = await db.query.wxUsers.findFirst({
        where: eq(wxUsers.id, userID),
    })
    if (!wxUser) {
        return res.status(400).json({ error: '缺少用户数据，重新登录' })
    }

    let chat = await db.query.chats.findFirst({
        where: eq(chats.userID, userID)
    })
    if (!chat) {
        const id = crypto.randomBytes(7).toString('hex');
        chat = {
            id: id,
            userID: userID,
            userType: 'wx',
            title: `${userID} 的聊天框`,
            createdAt: new Date().toString(),
            focusMode: 'psychAssistant',
            files:[],
        }
        await db.insert(chats).values(chat).execute();
    }
    const paginatedMessages = db.select().from(messages)
        .where(and(eq(messages.chatId, chat.id), lt(messages.id, minMsgId)))
        .orderBy(desc(messages.id)).limit(limit).all()
        .sort((a, b) => a.id - b.id)

    return res.status(200).json({ chat: chat, messages: paginatedMessages });
})

// 付款
router.post('/pay', async (req, res)=>{

})

// 
export default router;