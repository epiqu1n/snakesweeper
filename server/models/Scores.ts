import { Model, query, queryOne, sql } from './model';

interface ScoreResult {
  username: string,
  time_seconds: number,
  submitted_at: Date,
  score_id: number,
  mode_id: number
}

interface ScoresModel extends Model {
  INSERT_SCORE: (userId: number, modeId: number, timeSeconds: number) => ReturnType<typeof query>,
  GET_SCORES: (options?: GetScoresOptions) => Promise<ScoreResult[]>,
  DELETE_SCORE: (username: string, scoreId: number) => Promise<number[]>
}

const Scores: ScoresModel = {
  INSERT_SCORE: async (userId, modeId, timeSeconds) => {
    const queryStr = sql`
      INSERT INTO User_Scores (user_id, time_seconds, mode_id)
      VALUES ($1::int, $2::int, $3::int)
    `;
    const params = [userId, timeSeconds, modeId];

    return await query(queryStr, params);
  },
  GET_SCORES: async (options = {}) => {
    const { username, modeId, limit, offset } = options;

    const queryStr = sql`
      SELECT Users.name AS username, US.time_seconds, US.submitted_at, US.id AS score_id, US.mode_id
      FROM User_Scores US
      LEFT JOIN Users ON Users.id = US.user_id
      WHERE
        ($1::int IS NULL OR mode_id = $1::int)
        AND ($3::varchar IS NULL OR LOWER(Users.name) = LOWER($3::varchar))
      ORDER BY US.time_seconds ASC, US.submitted_at DESC
      LIMIT $2::int OFFSET $4::int
    `;
    const params = [modeId, limit, username, offset];
    
    return await query(queryStr, params).then((res) => res.rows) as ScoreResult[];
  },
  DELETE_SCORE: async (username, scoreId) => {
    const queryStr = sql`
      DELETE FROM User_Scores US
      WHERE user_id = (
        SELECT id FROM Users
        WHERE name = $1::varchar
      ) AND US.id = $2::int
      RETURNING US.id AS score_id
    `;
    const params = [username, scoreId];

    return await query(queryStr, params).then((res) => res.rows.map((row) => row.score_id)) as number[];
  }
}

interface GetScoresOptions {
  username?: string,
  modeId?: number,
  limit?: number,
  offset?: number
}

export default Scores;