import { useAuth } from "@/contexts/AuthContext";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UserSocket {
  socketId: string;
  email: string;
  lastConnection: Date;
  isConnected: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  usersSocket: UserSocket[];
}

export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [usersSocket, setUsersSocket] = useState<UserSocket[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const socketInstance = io("http://localhost:8000");

    setSocket(socketInstance);

    socketInstance.on("users", (users: UserSocket[]) => {
      setUsersSocket(users);
    });

    socketInstance.on("disconnect", () => {
      setUsersSocket((prev) =>
        prev.filter((u) => u.socketId !== socketInstance.id)
      );
    });

    socketInstance.on("connect", () => {
      if (user) {
        socketInstance.emit("userConnectedFromFront", {
          socketId: socketInstance.id || "",
          email: user.email,
          lastConnection: Date.now(),
          isConnected: true,
        });
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, usersSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType | null => {
  return useContext(SocketContext);
};
