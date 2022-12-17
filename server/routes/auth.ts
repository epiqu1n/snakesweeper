import { Router } from 'express';
import authController from '../controllers/authController';
import userController from '../controllers/userController';

const authRouter = Router();

authRouter.post('/signup', authController.validateNewUserInfo, userController.addUser, (req, res) => {
  res.json({ success: true });
});

authRouter.post('/login', authController.verifyUser, authController.setAuthToken, (req, res) => {
  // TODO: Add updateLastLogin once implemented
  res.json({ success: true });
});

export default authRouter;
