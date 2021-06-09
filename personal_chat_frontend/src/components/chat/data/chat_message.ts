import { NonFunctionProperties } from 'utility-types/dist/mapped-types';
import { Message } from '../../../data/room';

export class ChatMessage {
  public chatterId!: string;
  public name!: string;
  public picture!: string;
  public isOnline!: boolean;
  public latestMessage!: Message | null;
  public unreadCount!: number;
  public hasReachedMax!: boolean;

  constructor(data: NonFunctionProperties<ChatMessage>) {
    Object.assign(this, data);
  }

  copyWith(data: Partial<NonFunctionProperties<ChatMessage>>) {
    return new ChatMessage({
      chatterId: data.chatterId ?? this.chatterId,
      name: data.name ?? this.name,
      picture: data.picture ?? this.picture,
      isOnline: data.isOnline ?? this.isOnline,
      latestMessage:
        data.latestMessage !== undefined
          ? data.latestMessage
          : this.latestMessage,
      unreadCount: data.unreadCount ?? this.unreadCount,
      hasReachedMax: data.hasReachedMax ?? this.hasReachedMax,
    });
  }
}
