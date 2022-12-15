import { RequestHandler } from 'express';
import Users from '../models/Users';
import { extractBody, PropertyMap } from '../utils/utils';
import { encrypt } from '../models/model';
import { setLocalsUser } from '../locals/users';

interface UserController {
  /** Creates a new user in the database */
  addUser: RequestHandler,
  /** Retrieves a user from the database. User info is stored into `res.locals.user` */
  getUser: RequestHandler
}

const userController: UserController = {
  /** Creates a new user in the database */
  addUser: async (req, res, next) => {
    const expProps = {
      username: 'string',
      password: 'string'
    } as const;

    let userInfo: PropertyMap<typeof expProps>;
    try {
      userInfo = extractBody(req, expProps);
    } catch (err) {
      return next({
        msg: 'Invalid body properties',
        err: err,
        code: 400
      });
    }

    const { username, password: plainPass } = userInfo;
    let hashedPass: string;
    try {
      hashedPass = await encrypt(plainPass);
    } catch (err) {
      return next({
        msg: 'Failed to create user (code: uc-au-1)',
        err: err
      });
    }

    try {
      await Users.createUser(username, hashedPass);
      return next();
    } catch (err) {
      return next({
        msg: 'An error occurred creating user',
        err: err
      });
    }
  },
  /** Retrieves a user from the database. User info is stored into `res.locals.user` */
  getUser: async (req, res, next) => {
    const { username } = req.params;
    if (!username) return next({
      msg: 'Invalid URL parameters',
      err: 'Invalid URL parameters',
      code: 400
    });

    try {
      const user = await Users.getUserByName(username);
      if (!user) throw new Error('User does not exist');
      setLocalsUser(res, user);
      return next();
    } catch (err) {
      return next({
        msg: 'An error occurred getting user information',
        err: err
      });
    }
  }
}

export default userController;
