import { ObjectId } from 'mongodb';
import { NonFunctionProperties } from 'mongoose';
import { Audience, Message, Room, RoomModel } from '../model/room';
import { User, UserModel } from '../model/user';

export const RoomPopulate = {
  audience: {
    key: 'audiences.user',
    value: 'name picture',
  },
  audienceFrom: {
    key: 'audiences.latestMessage.from',
    value: 'name picture',
  },
  host: {
    key: 'host',
    value: 'name picture',
  },
};

export async function addUserToRoom(userId: string, name: string) {
  const room = await RoomModel.findOne({ host: userId })
    .populate(RoomPopulate.audience.key, RoomPopulate.audience.value)
    .populate(RoomPopulate.audienceFrom.key, RoomPopulate.audienceFrom.value)
    .populate(RoomPopulate.host.key, RoomPopulate.host.value)
    .exec();
  const targetUser = await UserModel.findOne({ name: name }).exec();

  if (room == null || targetUser == null) {
    throw new Error('No room or user, unexpected');
  }
  // add audience to user's room
  const existedAud = room.audiences.find(
    (aud) =>
      (aud.user as ObjectId).toHexString() === targetUser._id.toHexString()
  );
  if (existedAud) return room;

  room.audiences.push(
    new Audience({
      latestMessage: null,
      unreadCount: 0,
      user: targetUser,
    })
  );
  return await room.save();
}

export async function getRoomByHost(hostId: ObjectId) {
  return await RoomModel.findOne({ host: hostId })
    .populate(RoomPopulate.audience.key, RoomPopulate.audience.value)
    .populate(RoomPopulate.audienceFrom.key, RoomPopulate.audienceFrom.value)
    .populate(RoomPopulate.host.key, RoomPopulate.host.value)
    .lean()
    .exec();
}

export async function updateLatestMessageToUsersRoom(
  from: ObjectId,
  target: ObjectId,
  message: Message
): Promise<void> {
  const sender = (message.from as User)._id;
  const _updateLatestMsgToTarget = async (
    _target: ObjectId,
    _from: ObjectId
  ) => {
    const room = await RoomModel.findOneAndUpdate(
      {
        host: _target,
        'audiences.user': _from,
      },
      {
        $set: {
          'audiences.$.latestMessage': message,
        },
        $inc: {
          'audiences.$.unreadCount':
            sender.toHexString() === _target.toHexString() ? 0 : 1,
        },
      }
    )
      .lean()
      .exec();

    if (room == null) {
      await RoomModel.findOneAndUpdate(
        {
          host: _target,
        },
        {
          $push: {
            audiences: new Audience({
              user: _from,
              unreadCount: 1,
              latestMessage: message,
            }),
          },
        }
      )
        .lean()
        .exec();
    }
  };

  await _updateLatestMsgToTarget(target, from);
  await _updateLatestMsgToTarget(from, target);
}

export async function updateUnreadToRoom(
  userId: ObjectId,
  readAudience: ObjectId
): Promise<NonFunctionProperties<Room>> {
  const room = await RoomModel.findOneAndUpdate(
    {
      host: userId,
      'audiences.user': readAudience,
    },
    {
      $set: {
        'audiences.$.unreadCount': 0,
      },
    },
    {
      new: true,
    }
  )
    .populate(RoomPopulate.audience.key, RoomPopulate.audience.value)
    .populate(RoomPopulate.audienceFrom.key, RoomPopulate.audienceFrom.value)
    .populate(RoomPopulate.host.key, RoomPopulate.host.value)
    .lean()
    .exec();

  if (room == null) throw Error('Room not found');

  return room;
}
