import { UserInfo } from '../../contexts/userContext';
import { post } from '../../utils/request';

export interface LoginInfo {
  username: string,
  password: string
}

export async function postLogin(login: LoginInfo) {
  const userInfo = await post<UserInfo>('/api/auth/login', login);
  return userInfo;
}
