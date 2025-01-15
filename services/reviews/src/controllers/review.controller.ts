import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

export class ReviewController {
  // Create a new review
  async create(req: AuthRequest, res: Response) {
    try {
      const { rideId, revieweeId, rating, comment, type } = req.body;
      const reviewerId = req.user?.id;

      if (!reviewerId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const review = await prisma.review.create({
        data: {
          rideId,
          reviewerId,
          revieweeId,
          rating,
          comment,
          type,
        },
      });

      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create review' });
    }
  }

  // Get reviews for a specific ride
  async getRideReviews(req: Request, res: Response) {
    try {
      const { rideId } = req.params;
      const reviews = await prisma.review.findMany({
        where: { rideId },
        orderBy: { createdAt: 'desc' },
      });

      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get ride reviews' });
    }
  }

  // Get reviews for a user (as reviewee)
  async getUserReviews(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { type } = req.query;
      
      const reviews = await prisma.review.findMany({
        where: {
          revieweeId: userId,
          ...(type ? { type: type as string } : {}),
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user reviews' });
    }
  }

  // Get my reviews (as reviewer)
  async getMyGivenReviews(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const reviews = await prisma.review.findMany({
        where: { reviewerId: userId },
        orderBy: { createdAt: 'desc' },
      });

      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get reviews' });
    }
  }

  // Get reviews about me (as reviewee)
  async getMyReceivedReviews(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { type } = req.query;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const reviews = await prisma.review.findMany({
        where: {
          revieweeId: userId,
          ...(type ? { type: type as string } : {}),
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get reviews' });
    }
  }

  // Get aggregate rating for a user
  async getUserRating(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { type } = req.query;

      const reviews = await prisma.review.findMany({
        where: {
          revieweeId: userId,
          ...(type ? { type: type as string } : {}),
        },
        select: { rating: true },
      });

      if (reviews.length === 0) {
        return res.json({ rating: 0, count: 0 });
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      res.json({
        rating: Number(averageRating.toFixed(1)),
        count: reviews.length,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user rating' });
    }
  }

  // Report a review
  async report(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const reporterId = req.user?.id;

      if (!reporterId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Implementation depends on your reporting system
      res.status(201).json({ message: 'Review reported successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to report review' });
    }
  }

  // Moderate a review (admin only)
  async moderate(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { action } = req.body;

      // Add admin check here
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Implementation depends on your moderation system
      res.json({ message: 'Review moderated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to moderate review' });
    }
  }
} 