import express from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { badJsonHandler, notFoundHandler, errorHandler } from './middlewares/index.js';
import { Logger } from './config/logger.js';
import v1Routes from './routes/v1/index.js';
import * as auth from '../src/auth/passport.js';
import session from 'express-session';
const logger = Logger(fileURLToPath(import.meta.url));

const app = express();

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
}));

app.use(auth.passport.initialize());
app.use(auth.passport.session());

// disable `X-Powered-By` header that reveals information about the server
app.disable('x-powered-by');

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// enable cors
app.use(cors());
app.options('*', cors());

app.use(morgan(
  'combined',
  {
    write(message) {
      logger.info(message.substring(0, message.lastIndexOf('\n')));
    },
    skip() {
      return process.env.NODE_ENV === 'test';
    },
  },
));

// handle bad json format
app.use(badJsonHandler);

// v1 api routes
app.use('/v1', v1Routes);

// handle 404 not found error
app.use(notFoundHandler);

// catch all errors
app.use(errorHandler);

export default app;
