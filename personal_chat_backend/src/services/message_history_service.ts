import { ObjectId } from 'mongodb';
import { MessageHistoryModel } from '../model/message_history';
import { Message } from '../model/room';

export async function getMessages(
  userId: ObjectId,
  chatterId: ObjectId,
  limit: number,
  beforeTimestamp: Date
): Promise<Message[]> {
  return await MessageHistoryModel.aggregate([
    {
      $match: {
        pairs: {
          $all: [userId, chatterId],
        },
      },
    },
    {
      $project: {
        history: {
          $filter: {
            input: '$history',
            as: 'msg',
            cond: {
              $lt: ['$$msg.createdAt', beforeTimestamp],
            },
          },
        },
      },
    },
    {
      $project: {
        history: {
          $slice: ['$history', 0, limit],
        },
      },
    },
    {
      $unwind: '$history',
    },
    {
      $lookup: {
        from: 'users',
        localField: 'history.from',
        foreignField: '_id',
        as: 'history_user',
      },
    },
    {
      $unwind: '$history_user',
    },
    {
      $project: {
        _id: 1,
        history: {
          from: '$history_user',
          message: 1,
          createdAt: 1,
        },
      },
    },
  ]).exec();
}

export async function createMessageToHistory(
  userA: ObjectId,
  userB: ObjectId,
  message: Message
) {
  let msgHistory = await MessageHistoryModel.findOneAndUpdate(
    {
      pairs: {
        $all: [userA, userB],
      },
    },
    {
      pairs: [userA, userB],
      $push: {
        history: {
          $each: [message],
          $sort: { createdAt: -1 },
        },
      },
    },
    {
      sort: 'history.createdAt',
    }
  ).exec();

  if(msgHistory == null) {
    msgHistory = new MessageHistoryModel();
    msgHistory.pairs = [userA, userB];
    msgHistory.history = [message];
    await msgHistory.save();
  }
}
