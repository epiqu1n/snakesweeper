import { ClientError } from '../utils/utils';
import { compareHash, Model, query, queryOne, sql } from './model';

interface UsersModel extends Model {
  getIdByName: (name: string) => Promise<number | null>,
  updateHighScore: (userId: number, time: number) => ReturnType<typeof query>,
  createUser: (username: string, password: string) => ReturnType<typeof query>,
  getUserByName: (username: string) => Promise<UserInfo | null>,
  checkPassword: (username: string, password: string) => Promise<{ user: UserInfo | null, isValid: boolean }>
  // Attempting to make it so the `isValid` property dictates whether or not `user` will be null
  // checkPassword: <TReturn>(username: string, password: string) => Promise<TReturn extends { user: UserInfo | null, isValid: boolean }>(username: string, password: string) => Promise<TReturn['isValid'] extends true ? { user: UserInfo, isValid: true } : { user: null, isValid: false }>
}

const Users: UsersModel = {
  getIdByName: async (name) => {
    const queryStr = sql`
      SELECT id FROM Users
      WHERE LOWER(name) = LOWER($1::varchar)
    `;
    const params = [name];

    return await queryOne(queryStr, params).then((res) => res.id as number);
  },
  updateHighScore: async (userId, time) => {
    const queryStr = sql`
      UPDATE Users
      SET best_time = LEAST(best_time, $1::int)
      WHERE id = $2::int
    `;
    const params = [time, userId];
    
    return await query(queryStr, params);
  },
  createUser: async (username, password) => {
    const userInsQuery = sql`
      INSERT INTO Users ("name", "password")
      VALUES ($1::varchar, $2::varchar)
    `;
    const userParams = [username, password];

    return await query(userInsQuery, userParams);
  },
  getUserByName: async (username) => {
    const userQuery = sql`
      SELECT "name", "id" FROM Users
      WHERE LOWER(name) = LOWER($1::varchar)
    `;
    const userParams = [username];

    return await queryOne(userQuery, userParams) as UserInfo;
  },
  checkPassword: async (username, password) => {
    const passQuery = sql`
      SELECT name, password, id FROM Users
      WHERE name = $1::varchar
    `;
    const passParams = [username];

    const user: UserInfo & { password?: string } = await queryOne(passQuery, passParams);
    if (!user) throw new ClientError(`User ${username} not found`);

    const isValid = await compareHash(password, user.password!);
    delete user.password;
    return {
      isValid,
      user: (isValid ? user : null)
    };
  }
}

export interface UserInfo {
  name: string,
  id: number
}

export default Users;
