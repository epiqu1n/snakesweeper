import { Response } from 'express';
import { AuthToken } from '../controllers/authController';
import { UserInfo } from '../models/Users';

export function getLocalsUser(res: Response) {
  return res.locals.user as Maybe<UserInfo>;
}

export function setLocalsUser(res: Response, userInfo: UserInfo) {
  res.locals.user = userInfo;
  return;
}

export function getLocalsUserToken(res: Response) {
  return res.locals.userToken as Maybe<AuthToken>;
}

export function setLocalsUserToken(res: Response, userToken: AuthToken) {
  res.locals.userToken = userToken;
  return;
}

type Maybe<T> = T | null | undefined;
