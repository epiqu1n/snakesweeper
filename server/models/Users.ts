import { Model, query, queryOne, sql } from './model';

interface UsersModel extends Model {
  GET_ID_BY_NAME: (name: string) => Promise<number | null>,
  UPDATE_HIGH_SCORE: (userId: number, time: number) => ReturnType<typeof query>
}

const Users: UsersModel = {
  GET_ID_BY_NAME: (name) => {
    const queryStr = sql`
      SELECT id FROM Users
      WHERE name = ($1)
    `;
    const params = [name];

    return queryOne(queryStr, params).then((res) => res.id);
  },
  UPDATE_HIGH_SCORE: (userId, time) => {
    const queryStr = sql`
      UPDATE Users
      SET best_time = LEAST(best_time, $1)
      WHERE id = $2
    `;
    const params = [time, userId];
    
    return query(queryStr, params);
  }
}

export default Users;