import { startWebSocketServer } from './websocket';
import express from 'express';
import cors from 'cors';
import http from 'http';
import routes from './routes';
import { getPort, wxJwtToken } from './config';
import logger from './utils/logger';
import { currentUser } from './user/loginStatus';
import jwt from 'jsonwebtoken';
import schedule from 'node-schedule';
import { procOrder } from './billing/order';


const port = getPort();

logger.info('启动服务', process.env)
const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: '*',
};
// 每天3点1分10秒进行数据清理
schedule.scheduleJob('10 1 3 * * *', async () => {
  await procOrder()
});

app.use(cors(corsOptions));
app.use(express.json());
// 针对特定的path进行认证
app.use(async (req, res, next) => {
  // 针对特定的 path 放过认证
  if (
    req.path === '/api/models' || req.path === '/api/wechat/login' ||
    (req.path === '/api/chats' &&
      req.method === 'GET' &&
      req.params.id !== undefined)
  ) {
    return next();
  }
  if (req.header('request-type') === 'wx'){
    const token = req.header('x-wxmini-access-token')
    let openid = ''
    try {
      const decoded = jwt.verify(token, wxJwtToken());
      openid = (decoded as any).openid
    } catch (err) {
      return res.status(403).json({ message: 'Unauthorized: Invalid token' });
    }
    req.loginStatus = {
      isLoggedIn: true,
      userId:openid,
      userType:'wx'
    }
  }else{
    logger.info('headers', req.headers);
    const accessToken = req.header('x-stack-access-token');
    const refreshToken = req.header('x-stack-refresh-token');
    const { id } = (await currentUser(accessToken, refreshToken)) as any;
  
    req.loginStatus = {
      isLoggedIn: true,
      userId: id,
    };
  }
  return next();
});

app.use('/api', routes);
app.get('/api', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

server.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

startWebSocketServer(server);

process.on('uncaughtException', (err, origin) => {
  logger.error(`Uncaught Exception at ${origin}: ${err}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});
