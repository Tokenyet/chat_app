import { DocumentType, getModelForClass, prop } from '@typegoose/typegoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { NonFunctionProperties } from 'utility-types/dist/mapped-types';
import { JWT_SECRET } from '../config';

export interface Payload {
  id: string;
  name: string;
  exp: number;
}

export class User {
  readonly _id!: ObjectId;

  @prop({ unique: true })
  public name!: string;
  @prop()
  public picture!: string;

  @prop()
  public hash!: string;

  @prop()
  public salt!: string;

  readonly token?: string;

  public generateJWT(this: DocumentType<User>): string {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return jwt.sign(
      {
        id: this._id.toHexString(),
        name: this.name,
        exp: parseInt((exp.getTime() / 1000).toString()),
      } as Payload,
      JWT_SECRET as string
    );
  }

  public setPassword(password: string) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto
      .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
      .toString('hex');
  }

  public validPassword(password: string) {
    const hash = crypto
      .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
      .toString('hex');
    return this.hash === hash;
  }

  public toAuthJson(
    this: DocumentType<User>
  ): Partial<NonFunctionProperties<User>> {
    return {
      _id: this._id,
      name: this.name,
      picture: this.picture,
      token: this.generateJWT(),
    };
  }

  public toJSON(
    this: DocumentType<User>
  ): Partial<NonFunctionProperties<User>> {
    return {
      _id: this._id,
      name: this.name,
      picture: this.picture,
    };
  }
}

export const UserModel = getModelForClass(User, {
  schemaOptions: { timestamps: true },
});
