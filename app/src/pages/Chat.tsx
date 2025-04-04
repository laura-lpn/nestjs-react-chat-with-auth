import { useAuth } from "@/contexts/AuthContext";
import MessageForm from "../components/chat/MessageForm";
import MessageList from "../components/chat/MessageList";
import UserInfo from "../components/chat/UserInfo";
import LogoutButton from "../components/LogoutButton";
import UsersList from "@/components/chat/UsersList";

const Chat = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto w-full h-screen py-8 flex px-8">
      <div className="w-4/5 h-full px-4">
        <div className="h-5/6 relative">
          <div className="backdrop-blur-sm bg-white/50 h-1/6 absolute top-0 right-3 w-full"></div>
          <div className="overflow-y-scroll h-full px-4">
            <MessageList />
          </div>
        </div>
        <div className="h-1/6 flex justify-center items-center">
          <div className="w-full gap-4 flex flex-col">
            {user && (
              <div className="">
                <MessageForm />
              </div>
            )}
            <div className=" flex justify-between">
              <UserInfo />
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
      <div className="w-1/5 h-full">
        <UsersList />
      </div>
    </div>
  );
};

export default Chat;
