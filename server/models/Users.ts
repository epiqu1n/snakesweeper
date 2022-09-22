import { Model, query, queryOne, sql } from './model';

interface UsersModel extends Model {
  GET_ID_BY_NAME: (name: string) => Promise<number | null>,
  UPDATE_HIGH_SCORE: (userId: number, time: number) => ReturnType<typeof query>,
  CREATE_USER: (username: string) => ReturnType<typeof query>,
  GET_USER: (username: string) => Promise<UserInfo>
}

const Users: UsersModel = {
  GET_ID_BY_NAME: async (name) => {
    const queryStr = sql`
      SELECT id FROM Users
      WHERE name = LOWER($1::varchar)
    `;
    const params = [name];

    return await queryOne(queryStr, params).then((res) => res.id as number);
  },
  UPDATE_HIGH_SCORE: async (userId, time) => {
    const queryStr = sql`
      UPDATE Users
      SET best_time = LEAST(best_time, $1::int)
      WHERE id = $2::int
    `;
    const params = [time, userId];
    
    return await query(queryStr, params);
  },
  CREATE_USER: async (username) => {
    const userInsQuery = sql`
      INSERT INTO Users ("name")
      VALUES ($1::varchar)
    `;
    const userParams = [username];

    return await query(userInsQuery, userParams);
  },
  GET_USER: async (username) => {
    const userQuery = sql`
      SELECT "name", best_time FROM Users
      WHERE name = LOWER($1::varchar)
    `;
    const userParams = [username];

    return await queryOne(userQuery, userParams) as UserInfo;
  }
}

interface UserInfo {
  name: string,
  best_time?: number
}

export default Users;