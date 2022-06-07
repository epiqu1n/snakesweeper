import { Router } from 'express';
import scoreController from '../controllers/scoreController.js';

const scoreRouter = Router();

scoreRouter.post('/', scoreController.addScore, function(req, res) {
  return res.json({ success: true });
});

scoreRouter.get('/', scoreController.getTopScores, function(req, res) {
  return res.json({ scores: res.locals.scores });
});

scoreRouter.get('/:username', scoreController.getUserScores, function(req, res) {
  return res.json({ scores: res.locals.scores });
});

export default scoreRouter;