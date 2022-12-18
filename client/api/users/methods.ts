import { UserInfo } from '../../contexts/userContext';
import { get } from '../../utils/request';

export async function getUserInfo(): Promise<UserInfo | null> {
  const { data } = await get<UserInfo>('/api/users');
  return data || null;
}
