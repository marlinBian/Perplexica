// import ChatWindow from '@/components/ChatWindow';
import LogInChatWindow from '@/components/LogInChatWindow'

const Page = ({ params }: { params: { chatId: string } }) => {
  return <LogInChatWindow id={params.chatId} />;
};

export default Page;
