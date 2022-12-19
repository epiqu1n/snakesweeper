import { Router } from 'express';
import authController from '../controllers/authController';
import scoreController from '../controllers/scoreController';

const scoreRouter = Router();

scoreRouter.get('/', scoreController.getTopScores, function(req, res) {
  return res.json({ scores: res.locals.scores });
});

scoreRouter.get('/:username', scoreController.getUserScores, function(req, res) {
  return res.json({ scores: res.locals.scores });
});

scoreRouter.post('/', authController.validateAuth, scoreController.addScore, function(req, res) {
  return res.json({ success: true });
});

scoreRouter.delete(['/:username', '/:username/:scoreId'], scoreController.removeScore, function(req, res) {
  return res.json({ deletedIds: res.locals.deletedIds });
});

export default scoreRouter;
