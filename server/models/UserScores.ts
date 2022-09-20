import { Model, query, queryOne, sql } from './model';

interface UserScoresQueryResult extends Record<string, unknown> {
  GET_ALL_SCORES: {
    username: string,
    time_seconds: number,
    submitted_at: Date,
    score_id: number,
    mode_id: number
  }
}

interface UserScoresModel extends Model {
  INSERT_SCORE: (userId: number, modeId: number, timeSeconds: number) => ReturnType<typeof query>,
  GET_ALL_SCORES: (modeId?: number, limit?: number) => Promise<UserScoresQueryResult['GET_ALL_SCORES'][]>
}

const UserScores: UserScoresModel = {
  INSERT_SCORE: (userId, modeId, timeSeconds) => {
    const queryStr = sql`
      INSERT INTO User_Scores (user_id, time_seconds, mode_id)
      VALUES ($1, $2, $3)
    `;
    const params = [userId, timeSeconds, modeId];

    return query(queryStr, params);
  },
  GET_ALL_SCORES: async (modeId?: number, limit?: number) => {
    const queryStr = sql`
      SELECT Users.name AS username, US.time_seconds, US.submitted_at, US.id AS score_id, US.mode_id
      FROM User_Scores US
      LEFT JOIN Users ON Users.id = US.user_id
      WHERE ($1::int IS NULL OR mode_id = $1::int)
      ORDER BY US.time_seconds ASC
      LIMIT $2::int
    `;
    const params = [modeId, limit];
    
    return await query(queryStr, params).then((res) => res.rows) as UserScoresQueryResult['GET_ALL_SCORES'][];
  }
}

export default UserScores;