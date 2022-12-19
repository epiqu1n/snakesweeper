import { createContext } from 'react';

export interface UserInfo {
  name: string,
  id: number
}

export interface UserContext {
  user: UserInfo | null,
  setUser: (user: UserInfo | null) => void,
  isLoggedIn: boolean
}

const userContext = createContext<UserContext>({
  user: null,
  setUser: () => null, // Placeholder
  isLoggedIn: false
});

export default userContext;
