import { NonFunctionProperties } from 'utility-types/dist/mapped-types';

export class User {
  public _id!: string;
  public name!: string;
  public picture!: string;
  public token!: string;

  constructor(data: NonFunctionProperties<User>) {
    Object.assign(this, data);
  }

  copyWith(data: Partial<NonFunctionProperties<User>>) {
    return new User({
      _id: data._id ?? this._id,
      name: data.name ?? this.name,
      picture: data.picture ?? this.picture,
      token: data.token ?? this.token,
    });
  }
}
