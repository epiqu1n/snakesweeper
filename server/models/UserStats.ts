import { Model, query, sql } from './model';

interface UserStatsModel extends Model {
  /** Increments the number of games played for the given user + mode */
  updateGamesPlayed: (userId: number, modeId: number) => ReturnType<typeof query>
}

const UserStats: UserStatsModel = {
  async updateGamesPlayed(userId, modeId) {
    const statUpdQuery = sql`
      INSERT INTO User_Stats
      (user_id, mode_id, games_played)
      VALUES ($1::int, $2::int, 1)
      ON CONFLICT (user_id, mode_id) DO UPDATE
      SET games_played = EXCLUDED.games_played + 1
    `;
    const statUpdParams = [userId, modeId];

    return await query(statUpdQuery, statUpdParams);
  }
};

export default UserStats;
