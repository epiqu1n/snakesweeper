import { Router } from 'express';
import authController from '../controllers/authController';
import userController from '../controllers/userController';

const authRouter = Router();

authRouter.post('/signup', authController.validateNewUser, userController.addUser, (req, res) => {
  res.json({ success: true });
});

authRouter.post('/login', authController.verifyUser, userController.getUser, (req, res) => {
  res.json({ success: true });
});

export default authRouter;
