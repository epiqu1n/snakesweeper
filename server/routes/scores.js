import { Router } from 'express';
import apiController from '../controllers/apiController.js';
import scoreController from '../controllers/scoreController.js';

const scoreRouter = Router();

scoreRouter.post('/', scoreController.addScore, function(req, res) {
  return res.json({ success: true });
});

scoreRouter.get('/', scoreController.getTopScores, function(req, res) {
  return res.json({ examples: res.locals.scores });
});

export default scoreRouter;