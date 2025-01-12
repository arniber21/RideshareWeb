import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { AppDataSource } from './data-source';
import { rideRouter } from './routes/ride.routes';

const app = express();

app.use(json());
app.use(cors());

// Routes
app.use('/api/rides', rideRouter);

const start = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    const port = process.env.PORT || 3003;
    app.listen(port, () => {
      console.log(`Rides service listening on port ${port}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();
