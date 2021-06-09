import { plainToClass } from 'class-transformer';
import request from 'superagent';
import { API_URL } from '../config';
import { Message } from '../data/room';
import { User } from '../data/user';
import Ccookie from 'js-cookie';

export default class UserRepository {
  async signup({
    name,
    picture,
    password,
  }: {
    name: string;
    picture: string;
    password: string;
  }): Promise<User> {
    const requestObject: Record<any, any> = {
      name: name,
      picture: picture,
      password: password,
    };
    const response = await request
      .post(API_URL + '/users/signup')
      .send(requestObject);

    const token = response.body['token'];

    if (token) Ccookie.set('TOKEN', token);

    return plainToClass(User, response.body as User);
  }

  async login({
    name,
    password,
  }: {
    name: string;
    password: string;
  }): Promise<User> {
    const requestObject: Record<any, any> = {
      name: name,
      password: password,
    };
    const response = await request
      .post(API_URL + '/users/login')
      .send(requestObject);

    const token = response.body['token'];

    if (token) Ccookie.set('TOKEN', token);

    return plainToClass(User, response.body as User);
  }

  async addUser({ name }: { name: string }) {
    await request
      .post(API_URL + '/messages/addUser/' + name)
      .set('Authorization', 'Bearer ' + Ccookie.get('TOKEN'))
      .send();

    return null;
  }

  async getMe(token?: string): Promise<User> {
    const response = await request
      .get(API_URL + '/users/me')
      .set('Authorization', 'Bearer ' + (token ?? Ccookie.get('TOKEN')));

    return response.body as User;
  }

  async getMsgHistory({
    chatterId,
    limit,
    beforeTimestamp,
  }: {
    chatterId: string;
    limit: number;
    beforeTimestamp: Date;
  }): Promise<Message[]> {
    const response = await request
      .get(API_URL + `/messages/history/${chatterId}`)
      .set('Authorization', 'Bearer ' + Ccookie.get('TOKEN'))
      .query({
        limit: limit,
        before_timestamp: beforeTimestamp.getTime(),
      });
    const result = response.body as { _id: string; history: Message }[];
    return plainToClass(
      Message,
      result.map((r) => r.history)
    );
  }
}
