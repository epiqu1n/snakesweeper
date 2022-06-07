import { Router } from 'express';
import scoreRouter from './scores.js';
const apiRouter = Router();

apiRouter.use('/scores', scoreRouter);

export default apiRouter;