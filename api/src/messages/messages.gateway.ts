import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface User {
  socketId: string;
  email: string;
  lastConnection: Date;
  isConnected: boolean;
}

interface Message {
  id: string;
  text: string;
  createdAt: Date;
  user: {
    id: string;
    email: string;
  };
  likedBy: {
    id: string;
    email: string;
  }[];
}

const users: User[] = [];

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connecté: ${client.id}`);
    client.emit('users', users);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client déconnecté: ${client.id}`);
    const index = users.findIndex((u) => u.socketId === client.id);
    if (index !== -1) {
      users[index].isConnected = false;
      users[index].lastConnection = new Date();
      users[index].socketId = '';
    }
    this.server.emit('users', users);
  }

  @SubscribeMessage('userConnectedFromFront')
  handleUserConnected(client: Socket, user: User) {
    const existingUserIndex = users.findIndex((u) => u.email === user.email);
    if (existingUserIndex !== -1) {
      users[existingUserIndex].socketId = user.socketId;
      users[existingUserIndex].isConnected = true;
      users[existingUserIndex].lastConnection = new Date();
    } else {
      users.push({ ...user, lastConnection: new Date() });
    }
    this.server.emit('users', users);
  }

  @SubscribeMessage('userDisconnectedFromFront')
  handleUserDisconnected(client: Socket, socketId: string) {
    const index = users.findIndex((u) => u.socketId === socketId);
    if (index !== -1) {
      users[index].isConnected = false;
      users[index].lastConnection = new Date();
      users[index].socketId = '';
    }
    this.server.emit('users', users);
  }

  @SubscribeMessage('newMessageFromFront')
  handleNewMessage(client: Socket, message: Message) {
    this.server.emit('newMessageFromBack', message);
  }

  @SubscribeMessage('likeMessageFromFront')
  handleLikeMessage(client: Socket, messageId: string) {
    this.server.emit('likeMessageFromBack', messageId);
  }
}
