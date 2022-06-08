import { query, queryOne, sql } from '../models/model.js'; 
import { getBodyProps } from '../utils/utils.js';
const userController = {};

/** @typedef {import("express").RequestHandler} RequestHandler */

/** @type {RequestHandler} */
userController.addUser = async function(req, res, next) {
  let body = {};
  try {
    body = getBodyProps(req, { username: 'string' });
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
};

/** @type {RequestHandler} */
userController.getUser = async function(req, res, next) {
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
};


export default userController;