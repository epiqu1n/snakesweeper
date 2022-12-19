import { Router } from 'express';
import authController from '../controllers/authController';
import { getLocalsUser } from '../locals/users';

const authRouter = Router();

authRouter.post('/login', authController.verifyLoginAttempt, authController.setAuthToken, (req, res) => {
  // TODO: Add updateLastLogin once implemented
  res.json({ data: getLocalsUser(res) });
});

authRouter.post('/logout', authController.clearAuthToken, (req, res) => res.json({}));

export default authRouter;
