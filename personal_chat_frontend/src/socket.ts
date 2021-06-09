import { plainToClass, Type } from 'class-transformer';
import Ccookie from 'js-cookie';
import React from 'react';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Message, Room } from './data/room';

export class ReceivedMessage {
  @Type(() => Message)
  message!: Message;
  room!: string;
}

export class SocketRepo {
  public URL = 'http://localhost:3000';
  public socket: Socket;
  // chatlist update
  public roomSubject: BehaviorSubject<Room | null>;
  // online list update
  public onlineSubject: BehaviorSubject<string[]>;
  // error
  public errorSubject: BehaviorSubject<Error | null>;
  // detect self online offline
  public connectionSubject: BehaviorSubject<boolean>;
  // online message
  public msgMapSubject: BehaviorSubject<ReceivedMessage | null>;

  constructor() {
    this.socket = io(this.URL, { autoConnect: false });
    this.socket.auth = (cb) => {
      const token = Ccookie.get('TOKEN');
      cb({
        token: token,
      });
    };

    // Handy comments out for debugging
    // this.socket.onAny((event, ...args) => {
    //   console.log(event, args);
    // });

    // Room
    this.roomSubject = new BehaviorSubject<Room | null>(null);
    // Online always after room and use ack method.
    this.onlineSubject = new BehaviorSubject<string[]>([]);
    // Add realtime message to ChatMessage (server will emit room first, so this won't be orphan message)
    this.msgMapSubject = new BehaviorSubject<ReceivedMessage | null>(null);

    // Advanced error handling, but I'm not really good at It.
    this.errorSubject = new BehaviorSubject<Error | null>(null);
    this.connectionSubject = new BehaviorSubject<boolean>(false);

    this.socket.on('room', (room: any) => {
      const r = plainToClass(Room, room as Room);
      this.roomSubject.next(r);

      // ids, callback
      this.socket.emit(
        'get_onlines',
        r.audiences.map((aud) => aud.user._id),
        (ids: string[]) => {
          this.onlineSubject.next(ids);
        }
      );
    });

    // this.socket.on('online', (ids: string[]) => {
    //   this.onlineSubject.next(ids);
    // });

    // Never mind If user is in room, just check If existed
    this.socket.on('user connected', (id: string) => {
      const onlineUsers = this.onlineSubject.value.includes(id)
        ? this.onlineSubject.value
        : [...this.onlineSubject.value, id];
      this.onlineSubject.next(onlineUsers);
    });

    // Never mind If user is in room, just check If existed
    this.socket.on('user disconnected', (id: string) => {
      const onlineUsers = this.onlineSubject.value.filter((v) => v !== id);
      this.onlineSubject.next(onlineUsers);
    });

    this.socket.on('connect', () => {
      this.connectionSubject.next(true);
      this.errorSubject.next(null);
    });
    this.socket.on('disconnect', () => {
      this.connectionSubject.next(false);
    });
    this.socket.on('connect_error', (err) => {
      this.connectionSubject.next(false);
      this.errorSubject.next(err);
    });

    this.socket.on('private received message', (msg: ReceivedMessage) => {
      this.msgMapSubject.next(plainToClass(ReceivedMessage, msg));
    });
  }

  public connect() {
    if (!this.socket.connected) this.socket.connect();
  }

  public disconnect() {
    if (!this.socket.disconnected) this.socket.disconnect();
  }

  public sendMessage(content: string, to: string) {
    if (this.socket.connected) {
      this.socket.emit('private send message', { content: content, to: to });
    }
  }

  public viewMessage(read: string) {
    if (this.socket.connected) {
      this.socket.emit('private view message', { read: read });
    }
  }
}

export const SocketContext = React.createContext<SocketRepo | null>(null);
