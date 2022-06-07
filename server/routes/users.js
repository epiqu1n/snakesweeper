import { Router } from 'express';
import userController from '../controllers/userController.js';
const userRouter = Router();

userRouter.post('/', userController.addUser, function(req, res) {
  return res.status(200).json({ success: true });
});

export default userRouter;