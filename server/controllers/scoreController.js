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
    SELECT Users.name AS username, US.time_seconds, US.submitted_at, US.id AS score_id FROM User_Scores US
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
    SELECT Users.name AS username, US.time_seconds, US.submitted_at, US.id AS score_id FROM User_Scores US
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
 * Adds a score submission to the database and updates that user's high score if applicable
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

  // Form queries
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

  const highScoreUpdQuery = sql`
    UPDATE Users
    SET best_time = LEAST(best_time, $1)
    WHERE id = $2
  `;
  let highScoreParams; // [body.score, userId]

  // Run queries
  try {
    const userResult = await queryOne(userIDQuery, userParams);
    if (!userResult) return next({
      msg: 'Failed to locate user for score submission',
      err: `Could not locate user "${body.username}" for score submission`,
      code: 400
    });
    scoreParams = [userResult.id, body.score];
    highScoreParams = [body.score, userResult.id];
    await Promise.all([
      query(scoreInsQuery, scoreParams),
      query(highScoreUpdQuery, highScoreParams)
    ]);

    return next();
  } catch (err) {
    return next({
      msg: 'An error occurred during score submission',
      err: err
    });
  }
};


/**
 * Clears a score for a user, or all scores if no specific score id is provided
 * @type {RequestHandler}
 */
scoreController.removeScore = async function(req, res, next) {
  const { username, scoreId } = req.params;
  if (typeof username !== 'string' || (scoreId && isNaN(scoreId))) return next({
    msg: 'Invalid URL parameters',
    err: 'scoreController.clearUserScore: Invalid URL parameters',
    code: 400
  });
  console.log(username, scoreId);

  const delQuery = sql`
    DELETE FROM User_Scores US
    WHERE user_id = (
      SELECT id FROM Users
      WHERE name = $1
    ) ${scoreId && 'AND US.id = $2'}
    RETURNING US.id AS score_id
  `;
  const delParams = [username];
  if (scoreId) delParams.push(scoreId);

  try {
    res.locals.deletedIds = await query(delQuery, delParams).then(res => res.rows.map(row => row.score_id));
    return next();
  } catch (err) {
    return next({
      msg: 'An error occurred removing scores',
      err: err
    });
  }
};

export default scoreController;