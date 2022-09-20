import { RequestHandler } from 'express';
import { query, queryOne, sql } from '../models/model'; 
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

    const userInsQuery = sql`
      INSERT INTO Users ("name")
      VALUES ($1)
    `;
    const userParams = [body.username];

    try {
      await query(userInsQuery, userParams);
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

    // json_agg(json_build_object(''))
    const userQuery = sql`
      SELECT "name", best_time FROM Users
      WHERE name = $1
    `;
    const userParams = [username];

    try {
      res.locals.user = await queryOne(userQuery, userParams);
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