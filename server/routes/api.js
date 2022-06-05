import { Router } from 'express';
import apiController from '../controllers/apiController.js';

const apiRouter = Router();

apiRouter.get('/', apiController.exampleMiddleware, function(req, res) {
  return res.json({ msg: res.locals.example });
});

export default apiRouter;