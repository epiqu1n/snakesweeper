import { query, sql } from '../models/model.js'; 
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

export default userController;