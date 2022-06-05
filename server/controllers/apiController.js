/** @type {{[funcName: string]: import("express").RequestHandler}} */
const apiController = {};

apiController.exampleMiddleware = (req, res, next) => {
  console.log('Hitting API middleware');
  return next();
};

export default apiController;