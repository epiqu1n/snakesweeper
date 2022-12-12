import { RequestHandler } from 'express';
import Users from '../models/Users';
import { extractBody, PropertyMap } from '../utils/utils';
import { encrypt } from '../models/model';

enum UserMethod {
  ADD_USER = 'addUser',
  GET_USER = 'getUser'
};
type UserController = Record<UserMethod, RequestHandler>;

const userController: UserController = {
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
  getUser: async (req, res, next) => {
    const { username } = req.params;
    if (!username) return next({
      msg: 'Invalid URL parameters',
      err: 'Invalid URL parameters',
      code: 400
    });

    try {
      res.locals.user = await Users.getUserByName(username);
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
