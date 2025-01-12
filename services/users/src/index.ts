import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { AppDataSource } from './data-source';
import { userRouter } from './routes/user.routes';

const app = express();

app.use(json());
app.use(cors());

// Routes
app.use('/api/users', userRouter);

const start = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    const port = process.env.PORT || 3002;
    app.listen(port, () => {
      console.log(`User service listening on port ${port}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();
