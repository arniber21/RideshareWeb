import express from 'express';
import { ReviewController } from '../controllers/review.controller';

const router = express.Router();
const reviewController = new ReviewController();

// Create a new review
router.post('/', (req, res) => reviewController.create(req, res));

// Get reviews for a specific ride
router.get('/ride/:rideId', (req, res) => reviewController.getRideReviews(req, res));

// Get reviews for a user (as reviewee)
router.get('/user/:userId', (req, res) => reviewController.getUserReviews(req, res));

// Get my reviews (as reviewer)
router.get('/reviewer/me', (req, res) => reviewController.getMyGivenReviews(req, res));

// Get reviews about me (as reviewee)
router.get('/reviewee/me', (req, res) => reviewController.getMyReceivedReviews(req, res));

// Get aggregate rating for a user
router.get('/rating/:userId', (req, res) => reviewController.getUserRating(req, res));

// Review moderation routes
router.post('/:id/report', (req, res) => reviewController.report(req, res));
router.put('/:id/moderate', (req, res) => reviewController.moderate(req, res));

export { router as reviewRouter }; 