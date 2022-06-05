import { Router } from 'express';

const apiRouter = Router();

apiRouter.get('/', function(req, res) {
  res.send('Hi');
});

export default apiRouter;