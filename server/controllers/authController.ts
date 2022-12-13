import { RequestHandler } from 'webpack-dev-server';
import Users from '../models/Users';
import { ClientError, extractBody, PropertyMap } from '../utils/utils';

interface AuthController {
  /** Checks that the provided info is valid for creating a new user */
  validateNewUserInfo: RequestHandler,
  /** Checks to make sure a user exists and that the provided password is correct */
  verifyUser: RequestHandler
}

const authController: AuthController = {
  /** Checks that the provided info is valid for creating a new user */
  validateNewUserInfo: async (req, res, next) => {
    const expProps = {
      username: "string",
      password: "string"
    } as const;

    // Validate body
    let signupInfo: PropertyMap<typeof expProps>;
    try {
      signupInfo = extractBody(req, expProps);
    } catch (err) {
      return next({
        msg: 'Please provide a username and password',
        err: err
      });
    }

    const { username, password: plainPass } = signupInfo;
    if (plainPass.length < 8) return next({ msg: 'Your password must be longer than 8 characters', code: 400 });
    // TODO? Check to make sure username is appropriate
    // Word filters that aren't overly aggressive are hard though...

    // Check that user doesn't exist yet
    try {
      const user = await Users.getUserByName(username);
      if (user) return next({
        msg: 'Username is already taken',
        code: 400
      });
    } catch (err) {
      return next({
        msg: 'An error occurred validating username',
        err: err
      });
    }

    // A-Ok -> Create user
    return next();
  },
  /** Checks to make sure a user exists and that the provided password is correct */
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
        msg: 'Please enter a username and password',
        err: err
      });
    }

    // Check password
    const { username, password: plainPass } = loginInfo;
    try {
      const passIsValid = await Users.checkPassword(username, plainPass);
      if (!passIsValid) return next({
        msg: `Password for user ${username} does not match`,
        code: 403
      });
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
