import { RequestHandler } from 'express';
import { query, queryOne, sql } from '../models/model'; 
import Users from '../models/Users';
import { extractBody, PropertyMap } from '../utils/utils';

enum UserMethod {
  ADD_USER = 'addUser',
  GET_USER = 'getUser'
};
type UserController = Record<UserMethod, RequestHandler>;

const userController: UserController = {
  addUser: async (req, res, next) => {
    const expProps = { username: 'string' } as const;
    let body: PropertyMap<typeof expProps>;
    try {
      body = extractBody(req, expProps);
    } catch (err) {
      return next({
        msg: 'Invalid body properties',
        err: err
      });
    }

    const { username } = body;

    try {
      await Users.createUser(username)
      return next();
    } catch (err) {
      return next({
        msg: 'An error occurred during score submission',
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