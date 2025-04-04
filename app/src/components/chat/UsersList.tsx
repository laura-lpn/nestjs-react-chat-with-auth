import { useSocket } from "@/contexts/SocketContext";
import { formatDistance, setDefaultOptions, compareDesc } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useState } from "react";

export interface UserSocket {
  socketId: string;
  email: string;
  lastConnection: Date;
  isConnected: boolean;
}

const UsersList = () => {
  const socketContext = useSocket();

  const [users, setUsers] = useState<UserSocket[]>([]);

  useEffect(() => {
    const handleUsers = (users: UserSocket[]) => {
      setUsers(users);
    };

    socketContext?.socket?.on("users", handleUsers);

    return () => {
      socketContext?.socket?.off("users", handleUsers);
    };
  }, [socketContext?.socket]);

  setDefaultOptions({ locale: fr });
  const formatDate = (date: Date | null) => {
    if (date === null) {
      return "Depuis un moment";
    }
    return formatDistance(new Date(date), new Date(), {
      addSuffix: true,
    });
  };

  const connectedUsers = users.filter((user) => user.isConnected);
  const disconnectedUsers = users
    .filter((user) => !user.isConnected)
    .sort((a, b) =>
      compareDesc(new Date(a.lastConnection), new Date(b.lastConnection))
    );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Utilisateurs</h2>
        <div className="flex flex-col gap-2">
          {connectedUsers.map((user) => (
            <div
              key={user.socketId}
              className="flex items-center gap-3 p-2 rounded-lg bg-gray-100"
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                  {user.email?.[0]?.toUpperCase() || ""}
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{user.email}</span>
                <span className="text-sm text-gray-500">En ligne</span>
              </div>
            </div>
          ))}
          {disconnectedUsers.map((user) => (
            <div
              key={user.socketId}
              className="flex items-center gap-3 p-2 rounded-lg bg-gray-100"
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                  {user.email?.[0]?.toUpperCase() || ""}
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{user.email}</span>
                <span className="text-sm text-gray-500">
                  Hors ligne - {formatDate(user.lastConnection)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersList;
