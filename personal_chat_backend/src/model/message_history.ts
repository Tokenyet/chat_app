import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { ObjectId } from 'mongoose';
import { Message } from './room';
import { User } from './user';

export class MessageHistory {
  readonly _id!: ObjectId;

  @prop({ ref: () => User })
  public pairs!: Ref<User>[];

  @prop({ type: () => Message })
  public history!: Message[];
}

export const MessageHistoryModel = getModelForClass(MessageHistory);
