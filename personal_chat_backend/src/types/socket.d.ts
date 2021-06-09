import { Socket } from 'socket.io';
import { User } from '../model/user';

declare module 'socket.io' {
  export interface Socket {
    user: User;
  }
}
