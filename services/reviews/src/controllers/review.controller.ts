import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Review, ReviewType } from '../entities/review.entity';
import { z } from 'zod';

const reviewRepository = AppDataSource.getRepository(Review);

const attributeSchema = z.object({
  punctuality: z.number().min(1).max(5).optional(),
  cleanliness: z.number().min(1).max(5).optional(),
  communication: z.number().min(1).max(5).optional(),
  safety: z.number().min(1).max(5).optional(),
});

const createReviewSchema = z.object({
  rideId: z.string().uuid(),
  reviewerId: z.string().uuid(),
  targetUserId: z.string().uuid(),
  type: z.nativeEnum(ReviewType),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
  attributes: attributeSchema.optional(),
});

const reportReviewSchema = z.object({
  reason: z.string().min(1),
});

export class ReviewController {
  async create(req: Request, res: Response) {
    const validatedData = createReviewSchema.parse(req.body);
    
    // Check if review already exists
    const existingReview = await reviewRepository.findOne({
      where: {
        rideId: validatedData.rideId,
        reviewerId: validatedData.reviewerId,
        targetUserId: validatedData.targetUserId,
      },
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists' });
    }

    const review = reviewRepository.create(validatedData);
    await reviewRepository.save(review);
    res.status(201).json(review);
  }

  async findAll(req: Request, res: Response) {
    const { userId, type } = req.query;
    
    const queryBuilder = reviewRepository.createQueryBuilder('review')
      .where('review.isVisible = :isVisible', { isVisible: true });

    if (userId) {
      queryBuilder.andWhere('review.targetUserId = :userId', { userId });
    }

    if (type) {
      queryBuilder.andWhere('review.type = :type', { type });
    }

    const reviews = await queryBuilder
      .orderBy('review.createdAt', 'DESC')
      .getMany();

    res.json(reviews);
  }

  async findOne(req: Request, res: Response) {
    const review = await reviewRepository.findOneBy({ id: req.params.id });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  }

  async getUserStats(req: Request, res: Response) {
    const { userId } = req.params;
    
    const stats = await reviewRepository
      .createQueryBuilder('review')
      .where('review.targetUserId = :userId', { userId })
      .andWhere('review.isVisible = :isVisible', { isVisible: true })
      .select([
        'review.type',
        'AVG(review.rating) as averageRating',
        'COUNT(*) as totalReviews',
        'AVG(CAST(review.attributes->>\'punctuality\' AS FLOAT)) as avgPunctuality',
        'AVG(CAST(review.attributes->>\'cleanliness\' AS FLOAT)) as avgCleanliness',
        'AVG(CAST(review.attributes->>\'communication\' AS FLOAT)) as avgCommunication',
        'AVG(CAST(review.attributes->>\'safety\' AS FLOAT)) as avgSafety'
      ])
      .groupBy('review.type')
      .getRawMany();

    res.json(stats);
  }

  async report(req: Request, res: Response) {
    const review = await reviewRepository.findOneBy({ id: req.params.id });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const { reason } = reportReviewSchema.parse(req.body);
    review.isReported = true;
    review.reportReason = reason;
    await reviewRepository.save(review);
    res.json(review);
  }

  async moderate(req: Request, res: Response) {
    const review = await reviewRepository.findOneBy({ id: req.params.id });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const { isVisible } = req.body;
    review.isVisible = isVisible;
    await reviewRepository.save(review);
    res.json(review);
  }
} 