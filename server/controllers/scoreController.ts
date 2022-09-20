import { RequestHandler } from 'express';
import { query, queryOne, sql } from '../models/model'; 
import Users from '../models/Users';
import UserScores from '../models/UserScores';
import { ClientError, extractBody, isNum, PropertyMap, ServerError } from '../utils/utils';

enum ScoreMethod {
  GET_TOP_SCORES = 'getTopScores',
  GET_USER_SCORES = 'getUserScores',
  ADD_SCORE = 'addScore',
  REMOVE_SCORE = 'removeScore'
};
type ScoreController = Record<ScoreMethod, RequestHandler>;

const scoreController: ScoreController = {
  /** Retrieves all scores from database and stores into `res.locals.scores` */
  async getTopScores(req, res, next) {
    const modeId = parseInt(req.query.modeId as string) || undefined;
    if (modeId !== undefined && isNaN(modeId)) return next({
      msg: 'Invalid mode',
      err: new ClientError('Invalid mode')
    });
  
    try {
      res.locals.scores = await UserScores.GET_ALL_SCORES(modeId, 10);
      return next();
    } catch (err) {
      return next({
        msg: 'An error occurred retrieving top scores',
        err: err
      });
    }
  },

  /** Retrieves a user's scores from database and stores into `res.locals.scores` */
  async getUserScores(req, res, next) {
    const { username } = req.params;

    if (!username) {
      return next({
        msg: 'Invalid URL parameters',
        err: 'Invalid URL parameters',
        code: 400
      });
    }

    const scoreQuery = sql`
      SELECT Users.name AS username, US.time_seconds, US.submitted_at, US.id AS score_id FROM User_Scores US
      LEFT JOIN Users ON Users.id = US.user_id
      WHERE LOWER(Users.name) = LOWER($1)
      ORDER BY US.time_seconds ASC
      LIMIT 10
    `;
    const scoreParams = [username];

    try {
      res.locals.scores = (await query(scoreQuery, scoreParams)).rows;
      return next();
    } catch (err) {
      return next({
        msg: 'An error occurred retrieving top scores',
        err: err
      });
    }
  },

  /** Adds a score submission to the database and updates that user's high score if applicable */
  async addScore(req, res, next) {
    const expProps = { score: 'number', username: 'string', modeId: 'number' } as const;
    let body: PropertyMap<typeof expProps>;
    try {
      body = extractBody(req, expProps);
    } catch (err) {
      return next({
        msg: 'Invalid JSON parameters',
        err: err
      });
    }

    // Run queries
    try {
      const userId = await Users.GET_ID_BY_NAME(body.username);
      if (userId == null) return next({
        msg: 'Failed to locate user for score submission',
        err: `Could not locate user "${body.username}" for score submission`,
        code: 400
      });
      
      await Promise.all([
        UserScores.INSERT_SCORE(userId, body.modeId, body.score),
        Users.UPDATE_HIGH_SCORE(userId, body.score)
      ]);

      return next();
    } catch (err) {
      return next({
        msg: 'An error occurred during score submission',
        err: err
      });
    }
  },

  /** Clears a score for a user, or all scores if no specific score id is provided */
  async removeScore(req, res, next) {
    const { username, scoreId } = req.params;
    if (typeof username !== 'string' || (scoreId && isNaN(parseInt(scoreId)))) return next({
      msg: 'Invalid URL parameters',
      err: 'scoreController.clearUserScore: Invalid URL parameters',
      code: 400
    });

    const delQuery = sql`
      DELETE FROM User_Scores US
      WHERE user_id = (
        SELECT id FROM Users
        WHERE name = $1
      ) ${scoreId && 'AND US.id = $2'}
      RETURNING US.id AS score_id
    `;
    const delParams = [username];
    if (scoreId) delParams.push(scoreId);

    try {
      res.locals.deletedIds = await query(delQuery, delParams).then(res => res.rows.map(row => row.score_id));
      return next();
    } catch (err) {
      return next({
        msg: 'An error occurred removing scores',
        err: err
      });
    }
  }
};

export default scoreController;