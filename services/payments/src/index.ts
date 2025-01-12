import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { AppDataSource } from './data-source';
import { paymentRouter } from './routes/payment.routes';

const app = express();

// Regular routes with JSON parsing
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(json());
app.use(cors());

// Routes
app.use('/api/payments', paymentRouter);

const start = async () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY must be defined');
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET must be defined');
  }
  if (!process.env.STRIPE_PLATFORM_FEE_PERCENT) {
    throw new Error('STRIPE_PLATFORM_FEE_PERCENT must be defined');
  }

  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    const port = process.env.PORT || 3005;
    app.listen(port, () => {
      console.log(`Payments service listening on port ${port}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();
