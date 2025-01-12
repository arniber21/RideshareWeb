import express from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = express.Router();
const paymentController = new PaymentController();

// Payment routes
router.post('/', (req, res) => paymentController.initiate(req, res));
router.get('/:id', (req, res) => paymentController.getPayment(req, res));
router.post('/:id/refund', (req, res) => paymentController.refund(req, res));

// Ride payments
router.get('/rides/:rideId', (req, res) => paymentController.getRidePayments(req, res));

// User payments
router.get('/users/:userId', (req, res) => paymentController.getUserPayments(req, res));

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => 
  paymentController.handleWebhook(req, res)
);

export { router as paymentRouter }; 