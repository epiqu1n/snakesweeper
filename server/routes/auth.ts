import { Router } from 'express';
import authController from '../controllers/authController';
import userController from '../controllers/userController';
import { getLocalsUser } from '../locals/users';

const authRouter = Router();

authRouter.post('/signup', authController.validateNewUserInfo, userController.addUser, (req, res) => {
  res.json({});
});

authRouter.post('/login', authController.verifyLoginAttempt, authController.setAuthToken, (req, res) => {
  // TODO: Add updateLastLogin once implemented
  res.json({ data: getLocalsUser(res) });
});

authRouter.post('/logout', authController.clearAuthToken, (req, res) => res.json({}));

export default authRouter;
