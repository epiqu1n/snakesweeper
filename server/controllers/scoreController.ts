import { RequestHandler } from 'express';
import Users from '../models/Users';
import Scores from '../models/Scores';
import { ClientError, extractBody, isNum, PropertyMap, ServerError } from '../utils/utils';
import { getLocalsUser } from '../locals/users';

interface ScoreController {
  /** Retrieves all scores from database and stores into `res.locals.scores` */
  getTopScores: RequestHandler,
  /** Retrieves a user's scores from database and stores into `res.locals.scores` */
  getUserScores: RequestHandler,
  /** 
   * Adds a score submission to the database and updates that user's high score.
   * Depends on authorized user info stored in `res.locals.user`.
   */
  addScore: RequestHandler,
  /** Clears a score for a user */
  removeScore: RequestHandler
};

const scoreController: ScoreController = {
  async getTopScores(req, res, next) {
    const modeId = parseInt(req.query.modeId as string) || undefined;
    const offset = parseInt(req.query.offset as string) || undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (modeId !== undefined && isNaN(modeId)) return next({
      msg: 'Invalid mode',
      err: new ClientError('Invalid mode')
    });
  
    try {
      res.locals.scores = await Scores.getScores({ modeId, limit, offset });
      return next();
    } catch (err) {
      return next({
        msg: 'An error occurred retrieving top scores',
        err: err
      });
    }
  },

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

  async addScore(req, res, next) {
    const expProps = { score: 'number', modeId: 'number' } as const;
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
    const user = getLocalsUser(res);
    if (!user) return next({
      msg: 'You must be logged in to submit a score',
      code: 403
    });

    const userId = user.id;
    try {
      await Promise.all([
        Scores.insertScore(userId, body.modeId, body.score),
        Users.updateHighScore(userId, body.score)
      ]);
    } catch (err) {
      return next({
        msg: 'An error occurred during score submission',
        err: err
      });
    }
    
    return next();
  },

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
