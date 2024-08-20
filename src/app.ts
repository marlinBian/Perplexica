import { startWebSocketServer } from './websocket';
import express from 'express';
import cors from 'cors';
import http from 'http';
import routes from './routes';
import { authProjectId, authSecretServerKey, authURL, getPort } from './config';
import logger from './utils/logger';
import { currentUser } from './user/loginStatus';

const port = getPort();

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: '*',
};

app.use(cors(corsOptions));
app.use(express.json());
// 针对特定的path进行认证
app.use(async (req, res, next) => {
  // 针对特定的 path 放过认证
  if (
    req.path === '/api/models' ||
    (req.path === '/api/chats' &&
      req.method === 'GET' &&
      req.params.id !== undefined)
  ) {
    return next();
  }
  console.log('headers', req.headers);
  const accessToken = req.header('x-stack-access-token');
  const refreshToken = req.header('x-stack-refresh-token');
  const { id } = (await currentUser(accessToken, refreshToken)) as any;

  req.loginStatus = {
    isLoggedIn: true,
    userId: id,
  };
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
