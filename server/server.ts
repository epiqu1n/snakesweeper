import express, { ErrorRequestHandler } from 'express';
import path from 'path';
import { CustomError, error } from './utils/utils';
import scoreRouter from './routes/scores';
import userRouter from './routes/users';
import authRouter from './routes/auth';
import cookieParser from 'cookie-parser';
import https, { ServerOptions } from 'https';
import http from 'http';
import fs from 'fs';
import server_config from './server.config.json';

///Initialization
// Set up application
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Load SSL key/cert
const sslOpts: ServerOptions = {
  key: fs.readFileSync(path.join(__dirname, `./ssl/${server_config.sslKey}`)),
  cert: fs.readFileSync(path.join(__dirname, `./ssl/${server_config.sslCert}`))
};

// Set up https redirection
app.use('*', (req, res, next) => {
  if (!req.secure) {
    const newPath = 'https://' + req.hostname + `:${server_config.httpsPort}` + req.path/*  + port */;
    return res.redirect(newPath);
  }
  else return next();
});

// Serve static files
app.use('/', express.static(path.join(__dirname, '../dist')));
app.use('/assets', express.static(path.join(__dirname, '../client/assets')));

/// API
app.use('/api/scores', scoreRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);


/// Routes
// Catch-all
app.all('*', function(req, res) {
  return res.sendStatus(404);
});


/// Global error handler
type MiddlewareError = { msg: string, err?: Error | CustomError, code?: number };

const globalErrorHandler: ErrorRequestHandler = (info: MiddlewareError | Error, req, res, next) => {
  const err = (info instanceof Error ? info : info.err);
  const message = (info instanceof Error ? 'An unknown server error occurred' : info.msg);
  const code = (
    info instanceof Error ? 500
    : typeof info.code === 'number' ? info.code
    : info.err instanceof CustomError ? info.err.statusCode
    : 500
  );
  error(message);
  error(err);
  return res.status(code).send({ error: message });
};
app.use(globalErrorHandler);
/*
  Example error info: {
    // Message for client
    msg: 'Sorry stuff\'s borked :(',
    // Error to log
    err: new ServerError('apiController.exampleMiddleware: Error occurred in middleware I guess'),
    code: 9001
  }
*/


https.createServer(sslOpts, app).listen(server_config.httpsPort, () => {
  console.log(`HTTPS server listening on port ${server_config.httpsPort}`.green);
});
http.createServer(app).listen(server_config.httpPort, () => {
  console.log(`HTTP server listening on port ${server_config.httpPort}`.green);
});
