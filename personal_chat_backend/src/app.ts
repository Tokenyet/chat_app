import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes';
import { ENVIROMENT, MONGODB_URI } from './config';
import mongoose from 'mongoose';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routerSetup();
  }

  private config(): void {
    if (ENVIROMENT !== 'production') mongoose.set('debug', true);
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useUnifiedTopology', true);
    mongoose
      .connect(MONGODB_URI!, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
      })
      .catch((err) => {
        console.error(
          `MongoDB connection error. Please make sure MongoDB is running. ${err}`
        );
      });
    this.app.use(
      cors({
        origin: function (origin, callback) {
          if (!origin || ['http://localhost:5000'].indexOf(origin) !== -1)
            return callback(null, true);
          return callback(new Error('Not allowed by CORS'));
        },
      })
    );
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }

  private routerSetup(): void {
    this.app.use('/', routes);
    this.app.get('/favicon.ico', (_, res) => res.status(204));
  }
}

export default new App().app;
