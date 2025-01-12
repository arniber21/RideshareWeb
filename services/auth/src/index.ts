import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { json } from 'body-parser';
import passport from 'passport';
import path from 'path';

import { errorHandler } from './middleware/error-handler';
import { NotFoundError } from './errors/not-found-error';
import { authRouter } from './routes/auth-routes';
import './config/passport';

dotenv.config();

const app = express();
app.use(json());
app.use(cors());
app.use(passport.initialize());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRouter);

// Not found handler
app.all('*', async () => {
  throw new NotFoundError();
});

// Error handler
app.use(errorHandler);

const start = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined');
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID must be defined');
  }
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_SECRET must be defined');
  }

  try {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Auth service listening on port ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
};

start();
