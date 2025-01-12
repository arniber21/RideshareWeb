import Stripe from 'stripe';
import { Payment, PaymentStatus } from '../entities/payment.entity';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY must be defined');
}

if (!process.env.STRIPE_PLATFORM_FEE_PERCENT) {
  throw new Error('STRIPE_PLATFORM_FEE_PERCENT must be defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

const PLATFORM_FEE_PERCENT = parseFloat(process.env.STRIPE_PLATFORM_FEE_PERCENT);

export class StripeService {
  async createPaymentIntent(payment: Payment): Promise<string> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(payment.amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        paymentId: payment.id,
        rideId: payment.rideId,
        payerId: payment.payerId,
        recipientId: payment.recipientId
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent.id;
  }

  async createTransfer(payment: Payment): Promise<string> {
    const amountAfterFee = payment.amount * (1 - PLATFORM_FEE_PERCENT / 100);
    
    const transfer = await stripe.transfers.create({
      amount: Math.round(amountAfterFee * 100), // Convert to cents
      currency: 'usd',
      destination: payment.recipientId, // Stripe Connect account ID
      transfer_group: payment.rideId,
      metadata: {
        paymentId: payment.id,
        rideId: payment.rideId,
        recipientId: payment.recipientId
      }
    });

    return transfer.id;
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<{ status: PaymentStatus; metadata?: any }> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        return {
          status: PaymentStatus.COMPLETED,
          metadata: paymentIntent.metadata
        };

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        return {
          status: PaymentStatus.FAILED,
          metadata: {
            ...failedPayment.metadata,
            failureReason: failedPayment.last_payment_error?.message
          }
        };

      default:
        return {
          status: PaymentStatus.PROCESSING
        };
    }
  }

  async refundPayment(paymentIntentId: string): Promise<Stripe.Refund> {
    return stripe.refunds.create({
      payment_intent: paymentIntentId
    });
  }
} 