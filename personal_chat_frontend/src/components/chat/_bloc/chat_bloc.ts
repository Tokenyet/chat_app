// Responsibility
// * Socket received room, will emit the list to find onlines by default (see socket.ts)
// Chat/Socket Init => SyncRoom, SyncOnline(Ack)
// Data Received => SyncRoom, SyncOnline(Ack), Add new data to first line of array
// Data Send => Do all DataReceived
// Chat View => Will do Data Received
// Fetch History => call api and add to array
// Add User => Call rest api and do init method

import { Bloc } from '@tokenyet/bloc';
import { FormzStatus } from '@tokenyet/react-bloc';
import { Subscription } from 'rxjs';
import { NonFunctionProperties } from 'utility-types/dist/mapped-types';
import { Message, Room } from '../../../data/room';
import UserRepository from '../../../repositories/user_repository';
import { SocketRepo } from '../../../socket';
import { ChatMessage } from '../data/chat_message';

export abstract class ChatEvent {}

export class SyncRoomEvent extends ChatEvent {
  public room!: Room;

  constructor(data: NonFunctionProperties<SyncRoomEvent>) {
    super();
    Object.assign(this, data);
  }
}

export class SyncOnlinesEvent extends ChatEvent {
  public onlines!: string[];

  constructor(data: NonFunctionProperties<SyncOnlinesEvent>) {
    super();
    Object.assign(this, data);
  }
}

export class SendMessageEvent extends ChatEvent {
  public to!: string;
  public message!: string;

  constructor(data: NonFunctionProperties<SendMessageEvent>) {
    super();
    Object.assign(this, data);
  }
}

export class ViewMessageEvent extends ChatEvent {
  public read!: string;

  constructor(data: NonFunctionProperties<ViewMessageEvent>) {
    super();
    Object.assign(this, data);
  }
}

export class ReceivedMessageEvent extends ChatEvent {
  public room!: string;
  public message!: Message;

  constructor(data: NonFunctionProperties<ReceivedMessageEvent>) {
    super();
    Object.assign(this, data);
  }
}

export class AddUserEvent extends ChatEvent {
  public name!: string;
  constructor(data: NonFunctionProperties<AddUserEvent>) {
    super();
    Object.assign(this, data);
  }
}

export class FetchHistoryEvent extends ChatEvent {
  public id!: string;
  constructor(data: NonFunctionProperties<FetchHistoryEvent>) {
    super();
    Object.assign(this, data);
  }
}

export class ChatState {
  public hostId!: string;
  public currentViewId!: string;
  public chatters!: ChatMessage[];
  public realtimeMsgs!: Map<string, Message[]>;

  // restful api
  public status!: FormzStatus;

  constructor(data: NonFunctionProperties<ChatState>) {
    Object.assign(this, data);
  }

  copyWith(data: Partial<NonFunctionProperties<ChatState>>) {
    return new ChatState({
      chatters: data.chatters ?? this.chatters,
      hostId: data.hostId ?? this.hostId,
      currentViewId: data.currentViewId ?? this.currentViewId,
      status: data.status ?? this.status,
      realtimeMsgs: data.realtimeMsgs ?? this.realtimeMsgs,
    });
  }

  public getChatterById(id: string): ChatMessage | null {
    if (this.chatters == null || this.chatters.length == 0) return null;
    return this.chatters.find((chatter) => chatter.chatterId === id) ?? null;
  }
}

export class ChatBloc extends Bloc<ChatEvent, ChatState> {
  userRepo!: UserRepository;
  socketRepo!: SocketRepo;

  subs!: Subscription[];

  constructor(userRepo: UserRepository, socketRepo: SocketRepo) {
    super(
      new ChatState({
        chatters: [],
        currentViewId: '',
        hostId: '',
        realtimeMsgs: new Map<string, Message[]>(),
        status: FormzStatus.pure,
      })
    );

    if (typeof window === 'undefined') return;

    this.userRepo = userRepo;
    this.socketRepo = socketRepo;

    this.subs = [];

    const roomSub = socketRepo.roomSubject.subscribe((r) => {
      this.add(new SyncRoomEvent({ room: r! }));
    });

    this.subs.push(roomSub);

    const onlineSub = socketRepo.onlineSubject.subscribe((onlines) => {
      this.add(new SyncOnlinesEvent({ onlines: onlines! }));
    });
    this.subs.push(onlineSub);

    const msgSub = socketRepo.msgMapSubject.subscribe((msgMap) => {
      if (msgMap == null) return;
      this.add(
        new ReceivedMessageEvent({
          room: msgMap.room,
          message: msgMap.message,
        })
      );
    });
    this.subs.push(msgSub);

    socketRepo.connect();
  }

  dispose() {
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
  }

  async *mapEventToState(event: ChatEvent): AsyncIterableIterator<ChatState> {
    const currentState = this.state;
    if (event instanceof SyncRoomEvent) {
      yield* this._mapSyncRoomEventToState(event);
    } else if (event instanceof SyncOnlinesEvent) {
      const onlines = event.onlines;
      const chatters = currentState.chatters.map((chat) => chat.copyWith({}));

      for (const chatter of chatters) {
        if (onlines.includes(chatter.chatterId)) {
          chatter.isOnline = true;
        } else {
          chatter.isOnline = false;
        }
      }

      yield currentState.copyWith({
        chatters: chatters,
      });
    } else if (event instanceof SendMessageEvent) {
      this.socketRepo.sendMessage(event.message, event.to);
    } else if (event instanceof ViewMessageEvent) {
      // Prevent user from clicking same chatter
      if (currentState.currentViewId === event.read) return;

      this.socketRepo.viewMessage(event.read);
      yield currentState.copyWith({
        currentViewId: event.read,
      });
    } else if (event instanceof ReceivedMessageEvent) {
      const realtimeMsgs = new Map<string, Message[]>(
        currentState.realtimeMsgs
      );
      const roomId = event.room;

      let msgs = realtimeMsgs.get(roomId)?.slice(0);

      if (msgs == null) msgs = [];

      msgs.unshift(event.message!);

      realtimeMsgs.set(roomId, msgs);

      yield currentState.copyWith({
        realtimeMsgs: realtimeMsgs,
      });

      // Internal ack view message
      if (currentState.currentViewId === event.message.from._id) {
        this.socketRepo.viewMessage(currentState.currentViewId);
      }
    } else if (event instanceof AddUserEvent) {
      await this.userRepo.addUser({ name: event.name });
    } else if (event instanceof FetchHistoryEvent) {
      const chatters = [...currentState.chatters];
      const realtimeMsgs = new Map<string, Message[]>(
        currentState.realtimeMsgs
      );
      let targetChatter: ChatMessage | null = null;
      for (const chatter of chatters) {
        if (chatter.chatterId === event.id) {
          targetChatter = chatter.copyWith({});
          break;
        }
      }
      const chatterMsgs =
        realtimeMsgs.get(event.id)?.map((c) => c.copyWith({})) ?? [];

      if (targetChatter == null || chatterMsgs == null) return;

      const historyMsgs = await this.userRepo.getMsgHistory({
        limit: 15,
        beforeTimestamp:
          chatterMsgs.length > 0
            ? chatterMsgs[chatterMsgs.length - 1].createdAt
            : new Date(),
        chatterId: event.id,
      });
      if (historyMsgs.length < 15) targetChatter.hasReachedMax = true;
      for (const msg of historyMsgs) {
        chatterMsgs.push(msg);
      }

      const index = chatters.findIndex(
        (chatter) => chatter.chatterId === targetChatter?.chatterId
      );
      chatters[index] = targetChatter;
      realtimeMsgs.set(event.id, chatterMsgs);

      yield currentState.copyWith({
        chatters: chatters,
        realtimeMsgs: realtimeMsgs,
      });
    }
  }

  async *_mapSyncRoomEventToState(
    event: SyncRoomEvent
  ): AsyncIterableIterator<ChatState> {
    const currentState = this.state;
    const room = event.room;

    const chatters = room.audiences.map((aud) => {
      return new ChatMessage({
        chatterId: aud.user._id,
        name: aud.user.name,
        isOnline: false,
        latestMessage: aud.latestMessage,
        picture: aud.user.picture,
        unreadCount: aud.unreadCount,
        hasReachedMax: false,
      });
    });

    yield currentState.copyWith({
      chatters: chatters,
      hostId: room.host._id,
    });
  }
}
