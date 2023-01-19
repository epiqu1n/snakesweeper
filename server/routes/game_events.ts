import { Router } from 'express';
import authController from '../controllers/authController';
import gameEventController from '../controllers/gameEventController';

const gameEventsRouter = Router();

gameEventsRouter.post('/start', authController.validateAuth, gameEventController.handleGameStart, (req, res) => res.sendStatus(200));

export default gameEventsRouter;
