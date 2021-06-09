import { NonFunctionProperties } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from '@typegoose/typegoose';
import { User } from './user';

@modelOptions({
  schemaOptions: {
    _id: false,
  },
})
export class Message {
  @prop({ ref: () => User })
  public from!: Ref<User>;

  @prop()
  public message!: string;

  @prop()
  public createdAt!: Date;

  constructor(data: NonFunctionProperties<Message>) {
    Object.assign(this, data);
  }
}

@modelOptions({
  schemaOptions: {
    _id: false,
  },
})
export class Audience {
  @prop({ ref: () => User })
  public user!: Ref<User>;

  @prop({ type: () => Message, default: null })
  public latestMessage!: Message | null;

  @prop()
  public unreadCount!: number;

  constructor(data: NonFunctionProperties<Audience>) {
    Object.assign(this, data);
  }
}

export class Room {
  readonly _id!: ObjectId;

  @prop({ ref: () => User })
  public host!: Ref<User>;

  @prop({
    type: () => [Audience],
  })
  public audiences!: Audience[];

  public toJSON() {
    return {
      _id: this._id,
      host: this.host,
      audiences: this.audiences,
    };
  }
}

export const RoomModel = getModelForClass(Room, {
  schemaOptions: { timestamps: true },
});
