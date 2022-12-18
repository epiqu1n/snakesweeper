import { Response } from 'express';
import { UserInfo } from '../models/Users';

export function getLocalsUser(res: Response) {
  return res.locals.user as Maybe<UserInfo>;
}

export function setLocalsUser(res: Response, userInfo: UserInfo) {
  res.locals.user = userInfo;
  return;
}

type Maybe<T> = T | null | undefined;
