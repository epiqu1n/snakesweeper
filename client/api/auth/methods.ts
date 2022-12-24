import { UserInfo } from '../../contexts/userContext';
import { post } from '../../utils/request';

export interface LoginInfo {
  username: string,
  password: string
}

export async function postLogin(login: LoginInfo): Promise<UserInfo> {
  const { data } = await post<UserInfo>('/api/auth/login', login);
  return data!;
}

export async function postLogout() {
  await post('/api/auth/logout', {});
  return;
}
