import { RequestHandler } from 'webpack-dev-server';

enum AuthMethod {
  VALIDATE_NEW_USER = 'validateNewUser',
  VERIFY_USER = 'verifyUser'
}

type AuthController = Record<AuthMethod, RequestHandler>;

const authController: AuthController = {
  validateNewUser: (req, res, next) => {
    next({ msg: 'This route has not been implemented yet' }); // TODO:
  },
  verifyUser: (req, res, next) => {
    next({ msg: 'This route has not been implemented yet' }); // TODO:
  }
}

export default authController;
