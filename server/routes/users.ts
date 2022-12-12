import { Router } from 'express';
import userController from '../controllers/userController';
const userRouter = Router();

userRouter.get('/:username', userController.getUser, function(req, res) {
  return res.status(200).json({ user: res.locals.user });
});

/* userRouter.post('/', userController.addUser, function(req, res) {
  return res.status(200).json({ success: true });
}); */

export default userRouter;
