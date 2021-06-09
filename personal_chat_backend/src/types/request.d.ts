import { Request } from 'express';
import { Payload } from '../model/user';

declare module 'express' {
  export interface Request {
    payload?: Payload;
  }
}
