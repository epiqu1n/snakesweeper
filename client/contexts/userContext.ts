import { createContext } from 'react';

export interface UserInfo {
  name: string,
  id: number
}

export interface UserContext {
  user: UserInfo | null,
  setUser: (user: UserInfo | null) => void
}

const userContext = createContext<UserContext>({
  user: null,
  setUser: () => null // Placeholder
});

export default userContext;
