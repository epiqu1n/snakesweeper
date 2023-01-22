import { compareHash, Model, query, queryOne, sql } from './model';

// TODO: Refactor or remove extends so that nonexistent methods cannot be used
interface UsersModel extends Model {
  getIdByName: (name: string) => Promise<number | null>,
  createUser: (username: string, password: string) => Promise<UserInfo>,
  getUserByName: (username: string) => Promise<UserInfo | null>,
  checkPassword: (username: string, password: string) => Promise<{ user: UserInfo | null, isValid: boolean }>
  // Attempting to make it so the `isValid` property dictates whether or not `user` will be null
  // checkPassword: <TReturn>(username: string, password: string) => Promise<TReturn extends { user: UserInfo | null, isValid: boolean }>(username: string, password: string) => Promise<TReturn['isValid'] extends true ? { user: UserInfo, isValid: true } : { user: null, isValid: false }>
  updateLastLogin: (userId: number) => ReturnType<typeof query>
}

const Users: UsersModel = {
  getIdByName: async (name) => {
    const queryStr = sql`
      SELECT id FROM Users
      WHERE name = $1::citext
    `;
    const params = [name];

    return await queryOne(queryStr, params).then((res) => res.id as number);
  },
  createUser: async (username, password) => {
    const userInsQuery = sql`
      INSERT INTO Users ("name", "password")
      VALUES ($1::citext, $2::varchar)
      RETURNING name, id
    `;
    const userParams = [username, password];

    return await queryOne(userInsQuery, userParams) as UserInfo;
  },
  getUserByName: async (username) => {
    const userQuery = sql`
      SELECT "name", "id" FROM Users
      WHERE name = $1::citext
    `;
    const userParams = [username];

    return await queryOne(userQuery, userParams) as UserInfo;
  },
  checkPassword: async (username, password) => {
    const passQuery = sql`
      SELECT name, password, id FROM Users
      WHERE name = $1::citext
    `;
    const passParams = [username];

    // console.log()
    const user: UserInfo & { password?: string } = await queryOne(passQuery, passParams);

    const isValid = (user ? await compareHash(password, user.password!) : false);
    delete user?.password;
    return {
      isValid,
      user: (isValid ? user : null)
    };
  },
  updateLastLogin: async (userId) => {
    const updQuery = sql`
      UPDATE Users
      SET last_login = NOW()
      WHERE id = $1::int
    `;
    const updParams = [userId];

    return await query(updQuery, updParams);
  },
};

export interface UserInfo {
  name: string,
  id: number
}

export default Users;
