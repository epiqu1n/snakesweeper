import { UserInfo } from '../../contexts/userContext';
import { get, post } from '../../utils/request';

const BASE_USER_URL = '/api/users';

export async function getUserInfo(): Promise<UserInfo | null> {
  const { data } = await get<UserInfo>(BASE_USER_URL);
  return data || null;
}

export interface NewUserInfo {
  username: string,
  password: string,
  password_conf: string
}

export async function postNewUser(userInfo: NewUserInfo): Promise<UserInfo> {
  if (userInfo.password !== userInfo.password_conf) throw new Error('Passwords do not match');

  const { data } = await post<UserInfo>(BASE_USER_URL, userInfo);
  if (!data) throw new Error('An error occurred while creating user (empty response). Please try refreshing and logging in to see if account creation was successful.');
  return data;
}
