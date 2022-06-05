import { Router } from 'express';
import apiController from '../controllers/apiController.js';

const apiRouter = Router();

apiRouter.get('/', apiController.exampleMiddleware, function(req, res) {
  res.send('API route');
});

export default apiRouter;