import express from 'express';
import ejwt from 'express-jwt';
import { JWT_SECRET } from '../../config';

export function getTokenFromHeader(req: express.Request) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    const token = req.headers.authorization.split(' ')[1];
    if (token === '') return null;
    return req.headers.authorization.split(' ')[1];
  }
  return null;
}

const auth = {
  required: ejwt({
    secret: JWT_SECRET!,
    userProperty: 'payload',
    getToken: getTokenFromHeader,
    algorithms: ['HS256'],
  }),
  optional: ejwt({
    secret: JWT_SECRET!,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromHeader,
    algorithms: ['HS256'],
  }),
};

export default auth;
