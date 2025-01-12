import express from 'express';
import { RideController } from '../controllers/ride.controller';
import { requireAuth } from '../middleware/auth';

const router = express.Router();
const rideController = new RideController();

// Search and list routes
router.get('/search', requireAuth, (req, res) => rideController.searchRides(req, res));
router.get('/', requireAuth, (req, res) => rideController.findAll(req, res));

// Driver/Rider specific routes
router.get('/driver/me', requireAuth, (req, res) => rideController.getDriverRides(req, res));
router.get('/rider/me', requireAuth, (req, res) => rideController.getRiderRides(req, res));

// Ride CRUD routes
router.post('/', requireAuth, (req, res) => rideController.create(req, res));
router.get('/:id', requireAuth, (req, res) => rideController.findOne(req, res));
router.put('/:id', requireAuth, (req, res) => rideController.update(req, res));
router.delete('/:id', requireAuth, (req, res) => rideController.delete(req, res));

// Ride participation routes
router.post('/:id/join', requireAuth, (req, res) => rideController.join(req, res));
router.put('/:id/participants/:participantId', requireAuth, (req, res) => rideController.updateParticipantStatus(req, res));

export { router as rideRouter }; 