import {
  authProjectId,
  authSecretServerKey,
  authURL,
  getPort,
  stackUserPath,
} from '../config';

interface LoginStatus {
  isLoggedIn: boolean;
  userType?: string;
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
  return await resp.json();
};

const getUser = async (
  id: string,
)=>{
  const headers = {
    'x-stack-access-type': 'server',
    'x-stack-project-id': authProjectId(),
    'x-stack-secret-server-key': authSecretServerKey(),
  };
  
  const resp = await fetch(stackUserPath() + `/${id}`, { headers });
  return await resp.json();
}

const createUser = async(id: string, name: string)=>{
  const headers = {
    'x-stack-access-type': 'server',
    'x-stack-project-id': authProjectId(),
    'x-stack-secret-server-key': authSecretServerKey(),
  };
  
  const resp = await fetch(stackUserPath(), {
    method:'post',
    headers: headers,
    body:JSON.stringify({
      oauth_providers:{
        id:id,
        account_id:id,
      },
      display_name:name,
    })
   });
  return await resp.json();
}
export { currentUser, getUser, createUser };
