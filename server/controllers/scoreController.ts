import { RequestHandler } from 'express';
import { query, queryOne, sql } from '../models/model'; 
import Users from '../models/Users';
import Scores from '../models/Scores';
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
    const offset = parseInt(req.query.offset as string) || undefined;
    const modeId = parseInt(req.query.modeId as string) || undefined;
    if (modeId !== undefined && isNaN(modeId)) return next({
      msg: 'Invalid mode',
      err: new ClientError('Invalid mode')
    });
  
    try {
      res.locals.scores = await Scores.getScores({ modeId, limit: 50, offset });
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

    try {
      res.locals.scores = await Scores.getScores({ username });
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
      const userId = await Users.getIdByName(body.username);
      if (userId == null) return next({
        msg: 'Failed to locate user for score submission',
        err: `Could not locate user "${body.username}" for score submission`,
        code: 400
      });
      
      await Promise.all([
        Scores.insertScore(userId, body.modeId, body.score),
        Users.updateHighScore(userId, body.score)
      ]);

      return next();
    } catch (err) {
      return next({
        msg: 'An error occurred during score submission',
        err: err
      });
    }
  },

  /** Clears a score for a user */
  async removeScore(req, res, next) {
    const { username, scoreId } = req.params;
    if (typeof username !== 'string' || !isNum(scoreId)) return next({
      msg: 'Invalid URL parameters',
      err: 'scoreController.clearUserScore: Invalid URL parameters',
      code: 400
    });

    try {
      res.locals.deletedIds = await Scores.deleteScore(username, parseInt(scoreId));
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