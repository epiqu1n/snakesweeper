import { query, queryOne, sql } from '../models/model.js'; 
import { getBodyProps } from '../utils/utils.js';
const scoreController = {};

/** @typedef {import("express").RequestHandler} RequestHandler */

/**
 * Retrieves all Examples from database and stores into `res.locals.examples`
 * @type {RequestHandler}
 */
scoreController.getTopScores = async function (req, res, next) {
  const getQuery = sql`
    SELECT * FROM User_Scores
    ORDER BY time_seconds ASC
    LIMIT 10
  `;

  try {
    res.locals.scores = (await query(getQuery)).rows;
    return next();
  } catch (err) {
    return next({
      msg: 'An error occurred retrieving top scores',
      err: err
    });
  }
};

/**
 * Adds an Example to the database
 * @type {RequestHandler}
 */
scoreController.addScore = async function (req, res, next) {
  let body = {};
  try {
    body = getBodyProps(req, { score: 'number', username: 'string' });
  } catch (err) {
    return next({
      msg: 'Invalid JSON parameters',
      err: err
    });
  }

  const userIDQuery = sql`
    SELECT id FROM Users
    WHERE name = ($1)
  `;
  const userParams = [body.username];

  const scoreInsQuery = sql`
    INSERT INTO User_Scores (user_id, time_seconds)
    VALUES ($1, $2)
  `;
  let scoreParams; // [userId, body.score]

  try {
    const userResult = await queryOne(userIDQuery, userParams);
    if (!userResult) return next({
      msg: 'Failed to locate user for score submission',
      err: `Could not locate user "${body.username}" for score submission`
    });
    scoreParams = [userResult.id, body.score];
    await query(scoreInsQuery, scoreParams);

    return next();
  } catch (err) {
    return next({
      msg: 'An error occurred during score submission',
      err: err
    });
  }
};

export default scoreController;