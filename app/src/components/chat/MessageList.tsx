import React, { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messageService, Message } from "../../services/messageService";
import { useSocket } from "@/contexts/SocketContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistance, setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";

const MessageList: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const socketContext = useSocket();
  const { socket } = socketContext || {};
  const { user } = useAuth();
  const {
    data: messages,
    isLoading,
    error,
  } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: () => messageService.findAll(),
  });

  const likeMutation = useMutation({
    mutationFn: (messageId: string) =>
      messageService.toggleLikeMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      if (socket) {
        socket.emit("likeMessageFromFront");
      }
    },
  });

  const handleLike = (messageId: string) => {
    likeMutation.mutate(messageId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages?.length]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = () => {
        queryClient.invalidateQueries({ queryKey: ["messages"] });
      };

      const handleLike = () => {
        queryClient.invalidateQueries({ queryKey: ["messages"] });
      };

      socket.on("newMessageFromBack", handleNewMessage);
      socket.on("likeMessageFromBack", handleLike);
    }
  }, [socket, queryClient]);

  if (isLoading) {
    return <div className="text-center">Loading messages...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Error loading messages. Please try again.
      </div>
    );
  }

  setDefaultOptions({ locale: fr });
  const formatDate = (date: Date | null) => {
    if (date === null) {
      return "Il y a un moment";
    }
    return formatDistance(new Date(date), new Date(), {
      addSuffix: true,
    });
  };

  const sortedMessages = messages?.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedMessages?.map((message) => {
        const isLikedByUser = user?.id
          ? message.likedBy?.some((likedUser) => likedUser.id === user.id)
          : false;
        return (
          <div key={message.id} className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-gray-800">{message.text}</p>
            <Button
              variant={isLikedByUser ? "default" : "outline"}
              className={`${
                isLikedByUser
                  ? "bg-red-200 text-black hover:bg-red-300 hover:text-black"
                  : "bg-white"
              } mt-2 cursor-pointer`}
              onClick={() => handleLike(message.id)}
            >
              {message.likedBy?.length} ❤️
            </Button>
            <div className="flex justify-between items-center text-sm text-gray-500/60 mt-4">
              <p>{message?.user?.email}</p>
              <p>
                {formatDate(
                  message.createdAt ? new Date(message.createdAt) : null
                )}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
