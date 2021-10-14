import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { NonFunctionProperties } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { JWT_SECRET } from './config';
import { Message, Room } from './model/room';
import { Payload, UserModel } from './model/user';
import { createMessageToHistory } from './services/message_history_service';
import {
  getRoomByHost,
  updateLatestMessageToUsersRoom,
  updateUnreadToRoom,
} from './services/room_service';

export class SocketApp {
  server: Server;

  constructor(httpServer: HttpServer) {
    this.server = new Server(httpServer, {
      cors: {
        origin: function (origin, callback) {
          if (!origin || ['http://localhost:5000'].indexOf(origin) !== -1)
            return callback(null, true);
          return callback(new Error('Not allowed by CORS'));
        },
      },
    });
    this.setup();
  }

  setup() {
    // Check authentication
    handleAuth(this.server);

    // Connection hooks
    this.server.on('connection', async (socket) => {
      const userId = socket.user._id.toHexString();

      // EVENT: Disconnect
      handleUserDisconnected(socket, userId);

      // join self room
      socket.join(userId);

      // notify all users, this guy online
      socket.broadcast.emit('user connected', userId);

      // get user's latest room info, each user per room is created by default.
      let room = await getRoomByHost(new ObjectId(userId));
      if (room == null) throw new Error('Unexpected Room missing error');

      // give room info, this will trigger client sync get_onlines
      socket.emit('room', room);

      // give users online list
      handleUserGetOnlines(this.server, socket);

      // EVENT: forward the private message to the right recipient
      // update message histroy for pair user,
      handlePrivateMessage(this.server, socket, userId);

      // EVENT: view message
      handleViewMessage(socket, userId);
    });
  }
}

function handleAuth(server: Server) {
  server.use(async (socket, next) => {
    const token = socket.handshake.auth['token'];
    if (token == null) return next(new Error('Auth not allowed'));

    const payload = jwt.verify(token, JWT_SECRET as string) as Payload;
    if (payload == null) return next(new Error('Auth(Payload) not allowed'));

    const user = await UserModel.findById(payload.id).exec();
    if (user == null) return next(new Error('User not found'));

    socket.user = user;
    next();
  });
}

/**
 * When user disconnected, broadcast the info to 'user disconnected'.
 *  
 * */ 
function handleUserDisconnected(socket: Socket, userId: string) {
  socket.on('disconnect', () => {
    socket.broadcast.emit('user disconnected', userId);
  });
}


function handleUserGetOnlines(server: Server, socket: Socket) {
  socket.on(
    'get_onlines',
    (ids: string[], callback: (onlines: string[]) => void) => {
      const allOnlines = [];
      for (let [_, socket] of server.of('/').sockets) {
        allOnlines.push(socket.user._id.toHexString());
      }
      const onlineIds: string[] = [];
      for (const id of ids) {
        if (allOnlines.includes(id)) {
          onlineIds.push(id);
        }
      }

      // Acknowledge
      callback(onlineIds);
    }
  );
}

function handlePrivateMessage(server: Server, socket: Socket, userId: string) {
  socket.on(
    'private send message',
    async ({ content, to }: { content: string; to: string }) => {
      const message = new Message({
        from: socket.user,
        message: content,
        createdAt: new Date(),
      });

      // update history for two user (use same history)
      await createMessageToHistory(
        new ObjectId(to),
        new ObjectId(userId),
        message
      );

      // update rooms for two user (use different room)
      await updateLatestMessageToUsersRoom(
        new ObjectId(userId),
        new ObjectId(to),
        message
      );

      let fromRoom: NonFunctionProperties<Room> | null = await getRoomByHost(
        new ObjectId(userId)
      );
      let toRoom: NonFunctionProperties<Room> | null = await getRoomByHost(
        new ObjectId(to)
      );

      socket.to(to).emit('room', toRoom);
      socket.to(to).emit('private received message', {
        message,
        room: userId,
      });
      server.to(userId).emit('room', fromRoom);
      server.to(userId).emit('private received message', {
        message,
        room: to,
      });
    }
  );
}

function handleViewMessage(socket: Socket, userId: string) {
  socket.on('private view message', async ({ read }: { read: string }) => {
    const room = await updateUnreadToRoom(
      new ObjectId(userId),
      new ObjectId(read)
    );

    socket.emit('room', room);
  });
}