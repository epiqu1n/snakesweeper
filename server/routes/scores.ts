import { Router } from 'express';
import scoreController from '../controllers/scoreController';

const scoreRouter = Router();

scoreRouter.get('/', scoreController.getTopScores, function(req, res) {
  return res.json({ scores: res.locals.scores });
});

scoreRouter.get('/:username', scoreController.getUserScores, function(req, res) {
  return res.json({ scores: res.locals.scores });
});

scoreRouter.post('/', scoreController.addScore, function(req, res) {
  return res.json({ success: true });
});

scoreRouter.delete(['/:username', '/:username/:scoreId'], scoreController.removeScore, function(req, res) {
  return res.json({ deletedIds: res.locals.deletedIds });
});

export default scoreRouter;