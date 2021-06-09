import { DocumentType } from '@typegoose/typegoose';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { User, UserModel } from '../../model/user';
import { SocketAppServer } from '../../server';
import { getMessages } from '../../services/message_history_service';
import { addUserToRoom } from '../../services/room_service';

// /messages/history/:chatterId?limit=xx&before_timestamp=xx
export const getMessage = async (req: Request, res: Response) => {
  const chatterId = req.params['chatterId'];
  const limit = parseInt(req.query['limit'] as string) ?? 20;
  const beforeTimestamp = parseInt(req.query['before_timestamp'] as string);

  if (chatterId == null || chatterId == '') {
    return res.status(400).send('Invalid Id');
  }

  if (beforeTimestamp == null) return res.status(400).send('Invalid Timestamp');

  const userId = req.payload?.id;
  let user: DocumentType<User> | null = null;
  try {
    user = await UserModel.findById(userId).exec();
  } catch (err) {
    return res.status(500).send('Internal Server Error');
  }
  if (user == null) return res.status(406).send('No auth');

  const messages = await getMessages(
    new ObjectId(userId),
    new ObjectId(chatterId),
    limit,
    new Date(beforeTimestamp)
  );

  return res.status(200).json(messages);
};

// /messages/addUser/:name
export const postNewUser = async (req: Request, res: Response) => {
  // room add one audience to user
  const name = req.params['name'];

  // Check auth
  const userId = req.payload?.id;
  let user: DocumentType<User> | null = null;
  try {
    user = await UserModel.findById(userId).exec();
  } catch (err) {
    return res.status(500).send('Internal Server Error');
  }
  if (user == null) return res.status(406).send('No auth');

  const room = await addUserToRoom(userId!, name);

  SocketAppServer.server.to(user._id.toHexString()).emit('room', room.toJSON());
  return res.status(200).json(room.toJSON());
};
