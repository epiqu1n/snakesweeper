import { ServerError } from '../utils/utils.js';

const apiController = {};

/** @type {import("express").RequestHandler} */
apiController.exampleMiddleware = (req, res, next) => {
  console.log('Hitting API middleware');
  res.locals.example = 'API route';
  return next();
};

export default apiController;