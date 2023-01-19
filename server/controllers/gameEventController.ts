import { RequestHandler } from 'express';
import { getLocalsUser } from '../locals/users';
import UserStats from '../models/UserStats';
import { extractBody } from '../utils/utils';

interface GameEventController {
  /** Handles a game_start event, updating user stats for the given mode */
  handleGameStart: RequestHandler
}

const gameEventController: GameEventController = {
  handleGameStart: async (req, res, next) => {
    const user = getLocalsUser(res);
    if (!user) return next({
      msg: 'You must be logged in to update your stats',
      err: 'Unauthorized user tried to increase stats',
      code: 403
    });

    let modeId: number;
    try {
      modeId = extractBody(req, { modeId: 'number' }).modeId;
    } catch (err) {
      return next({
        msg: 'A mode id must be specified',
        code: 400
      });
    }

    try {
      await UserStats.updateGamesPlayed(user.id, modeId);
    } catch (err) {
      return next({
        msg: 'An error occurred updating user stats (code: gec-hgs-1)',
        err: err,
        code: 500
      });
    }
    
    return next();
  }
};

export default gameEventController;
