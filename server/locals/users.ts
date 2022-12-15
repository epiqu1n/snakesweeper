import { Response } from 'express';
import { UserInfo } from '../models/Users';

export function getLocalsUser(res: Response) {
  return res.locals.user as UserInfo | null | undefined;
}

export function setLocalsUser(res: Response, userInfo: UserInfo) {
  res.locals.user = userInfo;
  return;
}
