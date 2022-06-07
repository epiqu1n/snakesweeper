import { query, queryOne, sql } from '../models/model.js'; 
import { getBodyProps } from '../utils/utils.js';
const scoreController = {};

/** @typedef {import("express").RequestHandler} RequestHandler */

/**
 * Retrieves all scores from database and stores into `res.locals.scores`
 * @type {RequestHandler}
 */
scoreController.getTopScores = async function (req, res, next) {
  const scoreQuery = sql`
    SELECT Users.name, US.time_seconds, US.submitted_at FROM User_Scores US
    LEFT JOIN Users ON Users.id = US.user_id
    ORDER BY US.time_seconds ASC
    LIMIT 10
  `;

  try {
    res.locals.scores = (await query(scoreQuery)).rows;
    return next();
  } catch (err) {
    return next({
      msg: 'An error occurred retrieving top scores',
      err: err
    });
  }
};

/**
 * Retrieves a user's scores from database and stores into `res.locals.scores`
 * @type {RequestHandler}
 */
scoreController.getUserScores = async function (req, res, next) {
  const { username } = req.params;

  if (!username) {
    return next({
      msg: 'Invalid URL parameters',
      err: 'Invalid URL parameters',
      code: 400
    });
  }

  const scoreQuery = sql`
    SELECT Users.name, US.time_seconds, US.submitted_at FROM User_Scores US
    LEFT JOIN Users ON Users.id = US.user_id
    WHERE LOWER(Users.name) = LOWER($1)
    ORDER BY US.time_seconds ASC
    LIMIT 10
  `;
  const scoreParams = [username];

  try {
    res.locals.scores = (await query(scoreQuery, scoreParams)).rows;
    return next();
  } catch (err) {
    return next({
      msg: 'An error occurred retrieving top scores',
      err: err
    });
  }
};



/**
 * Adds a score submission to the database
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
      err: `Could not locate user "${body.username}" for score submission`,
      code: 400
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