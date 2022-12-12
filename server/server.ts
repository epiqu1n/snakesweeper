import express, { ErrorRequestHandler } from 'express';
import path from 'path';
import { CustomError, error, warn } from './utils/utils';
import scoreRouter from './routes/scores';
import userRouter from './routes/users';
import CONFIG from './server.config.json';
import authRouter from './routes/auth';

///Initialization
// Set up application
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, '../dist')));
app.use('/assets', express.static(path.join(__dirname, '../client/assets')));

/// API
app.use('/api/scores', scoreRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);


/// Routes
app.get('/', function(req, res) {
  res.status(200).sendFile(path.join(__dirname, '../dist/index.html'));
});


// Catch-all
app.all('*', function(req, res) {
  return res.sendStatus(404);
});


// Global error handler
type MiddlewareError = { msg: string, err?: Error | CustomError, code?: number };

const globalErrorHandler: ErrorRequestHandler = (info: MiddlewareError, req, res, next) => {
  const err = (info instanceof Error ? info : info.err);
  const message = (info instanceof Error ? 'An unknown server error occurred' : info.msg);
  const code = (
    typeof info.code === 'number' ? info.code
    : info.err instanceof CustomError ? info.err.statusCode
    : 500
  );
  error(message);
  error(err);
  return res.status(code).send({ error: message });
}
app.use(globalErrorHandler);
/*
  next({
    // Message for client
    msg: 'Sorry stuff\'s borked :(',
    // Error to log
    err: new ServerError('apiController.exampleMiddleware: Error occurred in middleware I guess')
  });
*/


// Start server
app.listen(CONFIG.port, () => {
  console.log(`Listening on port ${CONFIG.port}`);
});
