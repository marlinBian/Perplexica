"use client";
import ChatWindow from "./ChatWindow";

import { useUser } from '@stackframe/stack';
import { setCookie } from 'cookies-next';
import { useEffect, useState } from 'react';

const LogInChatWindow = ({id}: {id?:string})=>{
    const [isReady, setIsReady] = useState(false);

    const user = useUser();
    useEffect(() => {
        (async () => {
          console.info('use effect user');
          if (user) {
            const { accessToken, refreshToken } = await user.getAuthJson();
            setCookie('user_refresh_token', refreshToken, { maxAge: 3600 });
            setCookie('user_access_token', accessToken, { maxAge: 3600 });
            setIsReady(true)
          } else {
            setCookie('user_refresh_token', '', { maxAge: 0 });
            setCookie('user_access_token', '', { maxAge: 0 });
          }
        })();
      }, [user]);
    return isReady?<ChatWindow id={id}/>:(
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p className="dark:text-white/70 text-black/70 text-sm">
            No login. After login, please try again later.
            </p>
        </div>
    )
}
export default LogInChatWindow;