import {
  authProjectId,
  authSecretServerKey,
  authURL,
  getPort,
} from '../config';

interface LoginStatus {
  isLoggedIn: boolean;
  userId?: string;
}
declare global {
  namespace Express {
    interface Request {
      loginStatus: LoginStatus;
    }
  }
}

const currentUser = async (
  accessToken: string | undefined,
  refreshToken: string | undefined,
) => {
  const headers = {
    'x-stack-access-type': 'server',
    'x-stack-project-id': authProjectId(),
    'x-stack-secret-server-key': authSecretServerKey(),
    'x-stack-access-token': accessToken,
    'x-stack-refresh-token': refreshToken,
  };
  const resp = await fetch(authURL(), { headers });
  const data = await resp.json();
  return data;
};
export { currentUser };
