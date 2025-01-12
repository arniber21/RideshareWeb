import express from 'express';
import { ReviewController } from '../controllers/review.controller';

const router = express.Router();
const reviewController = new ReviewController();

// Review CRUD routes
router.post('/', (req, res) => reviewController.create(req, res));
router.get('/', (req, res) => reviewController.findAll(req, res));
router.get('/:id', (req, res) => reviewController.findOne(req, res));

// User stats route
router.get('/users/:userId/stats', (req, res) => reviewController.getUserStats(req, res));

// Review moderation routes
router.post('/:id/report', (req, res) => reviewController.report(req, res));
router.put('/:id/moderate', (req, res) => reviewController.moderate(req, res));

export { router as reviewRouter }; 