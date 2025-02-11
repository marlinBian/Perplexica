// import ChatWindow from '@/components/ChatWindow';
import LogInChatWindow from '@/components/LogInChatWindow';

import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Chat - Perplexica',
  description: 'Chat with the internet, chat with Perplexica.',
};


const Home = () => {
  return (
    <div>
      <Suspense>
        <LogInChatWindow />
      </Suspense>
    </div>
  );
};

export default Home;
