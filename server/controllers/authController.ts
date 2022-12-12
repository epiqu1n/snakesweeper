import { RequestHandler } from 'webpack-dev-server';
import Users from '../models/Users';
import { ClientError, extractBody, PropertyMap } from '../utils/utils';

enum AuthMethod {
  VALIDATE_NEW_USER = 'validateNewUser',
  VERIFY_USER = 'verifyUser'
}

type AuthController = Record<AuthMethod, RequestHandler>;

const authController: AuthController = {
  validateNewUser: async (req, res, next) => {
    next({ msg: 'This route has not been implemented yet' }); // TODO:
  },
  verifyUser: async (req, res, next) => {
    const expProps = {
      username: "string",
      password: "string"
    } as const;

    // Validate body
    let loginInfo: PropertyMap<typeof expProps>;
    try {
      loginInfo = extractBody(req, expProps);
    } catch (err) {
      return next({
        msg: 'Please provide a username and password',
        err: err
      });
    }

    // Check password
    const { username, password: plainPass } = loginInfo;
    try {
      const passIsValid = await Users.checkPassword(username, plainPass);
      if (!passIsValid) throw new ClientError(`Password for user ${username} does not match`, 403);
    } catch (err) {
      return next({
        msg: 'Invalid username or password',
        err: err
      });
    }

    // All is well
    return next();
  }
}

export default authController;
