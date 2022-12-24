import { Router } from 'express';
import authController from '../controllers/authController';
import userController from '../controllers/userController';
import { getLocalsUser } from '../locals/users';
const userRouter = Router();

userRouter.get('/', authController.validateAuth, function(req, res) {
  return res.status(200).json({ data: getLocalsUser(res) });
});

userRouter.post('/', authController.validateNewUserInfo, userController.addUser, authController.setAuthToken, (req, res) => {
  res.json({ data: getLocalsUser(res) });
});

export default userRouter;
