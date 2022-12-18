import { RequestHandler } from 'express';
import Users, { UserInfo } from '../models/Users';
import { ClientError, extractBody, PropertyMap } from '../utils/utils';
import { sign, verify } from 'jsonwebtoken';
import config from '../server.config.json';
import { getLocalsUser, setLocalsUser, setLocalsUserToken } from '../locals/users';

interface AuthController {
  /** Checks that the provided info is valid for creating a new user */
  validateNewUserInfo: RequestHandler,
  /** Checks to make sure a user exists and that the provided password is correct */
  verifyLoginAttempt: RequestHandler,
  /** Creates and sets a JWT for a user and stores it in cookies. Depends on user info present in `res.locals.user` */
  setAuthToken: RequestHandler,
  /**
   * Checks the request for a valid auth token.
   * If the token is valid, it is regenerated with a new expiration, and the user's info stored in the token is set in `res.locals.userToken`.
   * If it is not, the token is cleared and the request is sent to the global error handler.
   */
  validateAuthToken: RequestHandler
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
  verifyLoginAttempt: async (req, res, next) => {
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
      const { isValid: passIsValid, user } = await Users.checkPassword(username, plainPass);
      if (!passIsValid || !user) return next({
        msg: `Password for user ${username} does not match`,
        code: 403
      });
      else setLocalsUser(res, user);
    } catch (err) {
      return next({
        msg: 'Invalid username or password',
        err: err
      });
    }

    // All is well
    return next();
  },
  /** Creates and sets a JWT for a user and stores it in cookies. Depends on user info present in `res.locals.user` */
  setAuthToken: (req, res, next) => {
    const userInfo = getLocalsUser(res);
    if (!userInfo) return next({
      msg: 'An error occurred setting user credentials (code: ac-sat-1)',
      err: 'User info is not present in locals',
      code: 400
    });

    const token = sign(userInfo, config.authSecret, { expiresIn: "2w" });
    res.cookie('userAuth', token, {
      maxAge: 2 * 7 * 24 * 60 * 60 * 1000, // 2 weeks,
      httpOnly: true,
      // TODO: Generate local SSL cert and use https; secure: true doesn't work over http
      // secure: true
    });

    return next();
  },
  /**
   * Checks the request for a valid auth token.
   * If the token is valid, it is regenerated with a new expiration, and the user's info stored in the token is set in `res.locals.userToken`.
   * If it is not, the token is cleared and the request is sent to the global error handler.
   */
  validateAuthToken: (req, res, next) => {
    const token = req.cookies.userAuth;
    if (!token) {
      return next({
        msg: 'You are not currently logged in',
        err: 'User auth token is missing or empty',
        code: 403
      });
    }

    const authToken = verify(token, config.authSecret) as AuthToken;
    const tokenIsExpired = authToken.exp * 1000 < Date.now();
    if (tokenIsExpired) return next({
      msg: 'Session has expired. Please trying loggin in again (code: ac-vat-2)',
      err: 'User\'s token has expired',
      code: 403
    });

    setLocalsUserToken(res, authToken);
    return next();
  }
}

export default authController;

export interface AuthToken extends UserInfo {
  /** The datetime the token was created (in seconds) */
  iat: number,
  /** The datetime of when the token expires (in seconds) */
  exp: number
}
