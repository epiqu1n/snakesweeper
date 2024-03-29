import { RequestHandler } from 'express';
import Users from '../models/Users';
import { extractBody, PropertyMap, ServerError } from '../utils/utils';
import { encrypt } from '../models/model';
import { getLocalsUser, setLocalsUser } from '../locals/users';

interface UserController {
  /** Creates a new user in the database and stores info into `res.locals.user` */
  addUser: RequestHandler,
  /** Retrieves a user from the database. User info is stored into `res.locals.user` */
  getUser: RequestHandler,
  /** Updates the last login date for a user. Depends on user info stored in `res.locals.user`  */
  updateLastLogin: RequestHandler
}

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
      const newUser = await Users.createUser(username, hashedPass);
      setLocalsUser(res, newUser);
    } catch (err) {
      return next({
        msg: 'An error occurred creating user',
        err: err
      });
    }
    
    return next();
  },
  
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
  },

  updateLastLogin: async (req, res, next) => {
    const userInfo = getLocalsUser(res);
    if (!userInfo) return next({
      msg: 'An error occurred during login (login may still have been successful, code: uc-ull-1)',
      err: new ServerError('User info is missing from locals')
    }); 

    const { id } = userInfo;
    try {
      await Users.updateLastLogin(id);
    } catch (err) {
      return next({
        msg: 'An error occurred during login (login may still have been successful, code: uc-ull-2)',
        err: err
      });
    }

    return next();
  }
};

export default userController;
