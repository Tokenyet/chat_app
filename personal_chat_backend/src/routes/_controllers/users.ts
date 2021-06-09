import { DocumentType } from '@typegoose/typegoose';
import { Request, Response } from 'express';
import { RoomModel } from '../../model/room';
import { User, UserModel } from '../../model/user';

export const postLogin = async (req: Request, res: Response) => {
  const name = req.body['name'];
  const password = req.body['password'];

  let user: DocumentType<User> | null = null;

  try {
    user = await UserModel.findOne({ name: name }).exec();
  } catch (err) {
    res.status(500).send(err.toString());
  }

  if (user == null) res.status(404).send('User not found!');

  if (!user!.validPassword(password)) res.status(406).send('Password error!');

  return res.status(200).json(user!.toAuthJson());
};

export const postSignup = async (req: Request, res: Response) => {
  const name = req.body['name'];
  const picture = req.body['picture'];
  const password = req.body['password'];
  let user: DocumentType<User> | null = null;

  try {
    user = await UserModel.findOne({ name: name }).exec();
  } catch (err) {
    return res.status(500).send(err.toString());
  }

  if (user != null) return res.status(400).send('User aleeady existed!');

  user = new UserModel();
  user.name = name;
  user.picture = picture;
  user.setPassword(password);

  const room = new RoomModel();
  room.host = user;
  room.audiences = [];

  try {
    await user.save();
    await room.save();
  } catch (err) {
    return res.status(500).send(err.toString());
  }

  return res.status(200).json(user!.toAuthJson());
};

export const getMe = async (req: Request, res: Response) => {
  const userId = req.payload?.id;
  let user: DocumentType<User> | null = null;

  try {
    user = await UserModel.findById(userId).exec();
  } catch (err) {
    return res.status(500).send(err.toString());
  }

  if (user == null) return res.status(400).send('User not existed!');

  return res.status(200).json(user.toAuthJson());
};
