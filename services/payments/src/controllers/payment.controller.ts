import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Payment, PaymentStatus, PaymentMethod } from '../entities/payment.entity';
import { StripeService } from '../services/stripe.service';
import { z } from 'zod';

const paymentRepository = AppDataSource.getRepository(Payment);
const stripeService = new StripeService();

const createPaymentSchema = z.object({
  rideId: z.string().uuid(),
  payerId: z.string().uuid(),
  recipientId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.nativeEnum(PaymentMethod),
  metadata: z.record(z.any()).optional()
});

export class PaymentController {
  async initiate(req: Request, res: Response) {
    const validatedData = createPaymentSchema.parse(req.body);
    
    // Calculate platform fee
    const platformFee = validatedData.amount * 
      (parseFloat(process.env.STRIPE_PLATFORM_FEE_PERCENT!) / 100);

    const payment = paymentRepository.create({
      ...validatedData,
      platformFee,
      status: PaymentStatus.PENDING
    });

    await paymentRepository.save(payment);

    // Create Stripe payment intent
    const paymentIntentId = await stripeService.createPaymentIntent(payment);
    payment.stripePaymentIntentId = paymentIntentId;
    await paymentRepository.save(payment);

    res.status(201).json({
      paymentId: payment.id,
      clientSecret: paymentIntentId
    });
  }

  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      return res.status(400).json({ message: 'No signature header' });
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      const { status, metadata } = await stripeService.handleWebhookEvent(event);
      
      if (metadata?.paymentId) {
        const payment = await paymentRepository.findOneBy({ id: metadata.paymentId });
        
        if (payment) {
          payment.status = status;
          
          if (status === PaymentStatus.COMPLETED) {
            // Create transfer to recipient
            const transferId = await stripeService.createTransfer(payment);
            payment.stripeTransferId = transferId;
          } else if (status === PaymentStatus.FAILED) {
            payment.failureReason = metadata.failureReason;
          }
          
          await paymentRepository.save(payment);
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  async getPayment(req: Request, res: Response) {
    const payment = await paymentRepository.findOneBy({ id: req.params.id });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  }

  async getRidePayments(req: Request, res: Response) {
    const payments = await paymentRepository.find({
      where: { rideId: req.params.rideId },
      order: { createdAt: 'DESC' }
    });
    res.json(payments);
  }

  async getUserPayments(req: Request, res: Response) {
    const { userId, type } = req.query;
    
    const queryBuilder = paymentRepository.createQueryBuilder('payment');
    
    if (type === 'paid') {
      queryBuilder.where('payment.payerId = :userId', { userId });
    } else if (type === 'received') {
      queryBuilder.where('payment.recipientId = :userId', { userId });
    } else {
      queryBuilder.where(
        'payment.payerId = :userId OR payment.recipientId = :userId',
        { userId }
      );
    }

    const payments = await queryBuilder
      .orderBy('payment.createdAt', 'DESC')
      .getMany();

    res.json(payments);
  }

  async refund(req: Request, res: Response) {
    const payment = await paymentRepository.findOneBy({ id: req.params.id });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      return res.status(400).json({ message: 'Payment cannot be refunded' });
    }

    if (!payment.stripePaymentIntentId) {
      return res.status(400).json({ message: 'No payment intent found' });
    }

    try {
      await stripeService.refundPayment(payment.stripePaymentIntentId);
      
      payment.status = PaymentStatus.REFUNDED;
      payment.isRefunded = true;
      payment.refundedAt = new Date();
      await paymentRepository.save(payment);

      res.json(payment);
    } catch (err) {
      console.error('Refund error:', err);
      res.status(400).json({ message: 'Refund failed', error: err.message });
    }
  }
} 