import { Router } from 'express';
import authController from '../controllers/authController';
// import userController from '../controllers/userController';
const userRouter = Router();

userRouter.get('/', authController.validateAuth, function(req, res) {
  return res.status(200).json({ data: res.locals.user });
});

/* userRouter.post('/', userController.addUser, function(req, res) {
  return res.status(200).json({ success: true });
}); */

export default userRouter;
