import { Router } from 'express';
import authController from '../controllers/authController';
import userController from '../controllers/userController';
import { getLocalsUser } from '../locals/users';

const authRouter = Router();

authRouter.post('/login', authController.verifyLoginAttempt, authController.setAuthToken, userController.updateLastLogin, (req, res) => {
  res.json({ data: getLocalsUser(res) });
});

authRouter.post('/logout', authController.clearAuthToken, (req, res) => res.json({}));

export default authRouter;
