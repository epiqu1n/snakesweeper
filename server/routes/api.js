import { Router } from 'express';
import apiController from '../controllers/apiController.js';
import modelController from '../controllers/modelController.js';

const apiRouter = Router();

apiRouter.get('/', apiController.exampleMiddleware, function(req, res) {
  return res.json({ msg: res.locals.example });
});

apiRouter.post('/example', modelController.addExample, function(req, res) {
  return res.json({ success: true });
});

apiRouter.get('/example', modelController.getAllExamples, function(req, res) {
  return res.json({ examples: res.locals.examples });
});

export default apiRouter;