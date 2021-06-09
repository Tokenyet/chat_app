import { Type } from 'class-transformer';
import { NonFunctionProperties } from 'utility-types/dist/mapped-types';
import { User } from './user';

export class Message {
  @Type(() => User)
  public from!: User;
  public message!: string;
  @Type(() => Date)
  public createdAt!: Date;
  constructor(data: NonFunctionProperties<Message>) {
    Object.assign(this, data);
  }

  copyWith(data: Partial<NonFunctionProperties<Message>>) {
    return new Message({
      from: data.from ?? this.from,
      message: data.message ?? this.message,
      createdAt: data.createdAt ?? this.createdAt,
    });
  }
}

export class Audience {
  @Type(() => User)
  public user!: User;
  @Type(() => Message)
  public latestMessage!: Message | null;

  public unreadCount!: number;
  constructor(data: NonFunctionProperties<Audience>) {
    Object.assign(this, data);
  }

  copyWith(data: Partial<NonFunctionProperties<Audience>>) {
    return new Audience({
      user: data.user ?? this.user,
      unreadCount: data.unreadCount ?? this.unreadCount,
      latestMessage: data.latestMessage ?? this.latestMessage,
    });
  }
}

export class Room {
  public _id!: string;
  @Type(() => User)
  public host!: User;
  @Type(() => Audience)
  public audiences!: Audience[];
  constructor(data: NonFunctionProperties<Room>) {
    Object.assign(this, data);
  }

  copyWith(data: Partial<NonFunctionProperties<Room>>) {
    return new Room({
      _id: data._id ?? this._id,
      host: data.host ?? this.host,
      audiences: data.audiences ?? this.audiences,
    });
  }
}
