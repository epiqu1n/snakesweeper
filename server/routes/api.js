import { Router } from 'express';
import scoreRouter from './scores.js';
import userRouter from './users.js';
const apiRouter = Router();

apiRouter.use('/scores', scoreRouter);
apiRouter.use('/users', userRouter);

export default apiRouter;