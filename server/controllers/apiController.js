import { ServerError } from '../utils/utils.js';

/** @type {{[funcName: string]: import("express").RequestHandler}} */
const apiController = {};

apiController.exampleMiddleware = (req, res, next) => {
  console.log('Hitting API middleware');
  res.locals.example = 'API route';
  return next();
};

export default apiController;