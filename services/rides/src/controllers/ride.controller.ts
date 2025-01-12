import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import auth from '../lib/auth';

const createRideSchema = z.object({
  driverId: z.string().uuid(),
  origin: z.string().min(1),
  destination: z.string().min(1),
  departureTime: z.string().datetime(),
  availableSeats: z.number().int().min(1),
  pricePerSeat: z.number().positive(),
  notes: z.string().optional(),
  route: z.record(z.any()).optional()
});

const joinRideSchema = z.object({
  userId: z.string().uuid(),
  numberOfSeats: z.number().int().min(1),
  notes: z.string().optional()
});

const searchRideSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  date: z.string().optional(),
});

export class RideController {
  async searchRides(req: Request, res: Response) {
    const { origin, destination, date } = searchRideSchema.parse(req.query);
    
    const where = {
      status: 'ACTIVE',
      ...(origin && { origin: { contains: origin, mode: 'insensitive' as const } }),
      ...(destination && { destination: { contains: destination, mode: 'insensitive' as const } }),
      ...(date && {
        departureTime: {
          gte: new Date(date),
          lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
        }
      })
    };

    const rides = await prisma.ride.findMany({
      where,
      include: {
        participants: true
      },
      orderBy: {
        departureTime: 'asc'
      }
    });

    // Fetch driver information for each ride
    const ridesWithDrivers = await Promise.all(
      rides.map(async (ride) => {
        const driver = await auth.getUser(ride.driverId);
        return {
          ...ride,
          driver: driver ? {
            id: driver.id,
            name: driver.name,
            email: driver.email,
            avatar: driver.avatar
          } : null
        };
      })
    );

    res.json(ridesWithDrivers);
  }

  async create(req: Request, res: Response) {
    const validatedData = createRideSchema.parse(req.body);
    const ride = await prisma.ride.create({
      data: {
        ...validatedData,
        departureTime: new Date(validatedData.departureTime),
        status: 'ACTIVE',
        route: validatedData.route as any
      }
    });
    res.status(201).json(ride);
  }

  async findAll(req: Request, res: Response) {
    const rides = await prisma.ride.findMany({
      include: {
        participants: true
      },
      orderBy: {
        departureTime: 'asc'
      }
    });
    res.json(rides);
  }

  async findOne(req: Request, res: Response) {
    const ride = await prisma.ride.findUnique({
      where: { id: req.params.id },
      include: {
        participants: true
      }
    });
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Fetch driver information
    const driver = await auth.getUser(ride.driverId);
    
    // Fetch participant user information
    const participantsWithUsers = await Promise.all(
      ride.participants.map(async (participant) => {
        const user = await auth.getUser(participant.userId);
        return {
          ...participant,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
          } : null
        };
      })
    );

    const rideWithUsers = {
      ...ride,
      driver: driver ? {
        id: driver.id,
        name: driver.name,
        email: driver.email,
        avatar: driver.avatar
      } : null,
      participants: participantsWithUsers
    };

    res.json(rideWithUsers);
  }

  async update(req: Request, res: Response) {
    const ride = await prisma.ride.findUnique({
      where: { id: req.params.id }
    });
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const validatedData = createRideSchema.partial().parse(req.body);
    const updateData = {
      ...(validatedData.departureTime && { departureTime: new Date(validatedData.departureTime) }),
      ...(validatedData.origin && { origin: validatedData.origin }),
      ...(validatedData.destination && { destination: validatedData.destination }),
      ...(validatedData.availableSeats && { availableSeats: validatedData.availableSeats }),
      ...(validatedData.pricePerSeat && { pricePerSeat: validatedData.pricePerSeat }),
      ...(validatedData.notes && { notes: validatedData.notes }),
      ...(validatedData.route && { route: validatedData.route as any })
    };
    
    const updatedRide = await prisma.ride.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(updatedRide);
  }

  async join(req: Request, res: Response) {
    const ride = await prisma.ride.findUnique({
      where: { id: req.params.id },
      include: {
        participants: true
      }
    });
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Ride is not available for joining' });
    }

    const validatedData = joinRideSchema.parse(req.body);
    
    // Check available seats
    const takenSeats = ride.participants.reduce((sum: number, p: { status: string; numberOfSeats: number }) => 
      p.status !== 'CANCELLED' ? sum + p.numberOfSeats : sum, 0);
    
    if (takenSeats + validatedData.numberOfSeats > ride.availableSeats) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    const participant = await prisma.rideParticipant.create({
      data: {
        userId: validatedData.userId,
        rideId: ride.id,
        numberOfSeats: validatedData.numberOfSeats,
        notes: validatedData.notes,
        status: 'PENDING'
      }
    });

    // Fetch user information for the participant
    const user = await auth.getUser(participant.userId);
    const participantWithUser = {
      ...participant,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      } : null
    };

    res.status(201).json(participantWithUser);
  }

  async updateParticipantStatus(req: Request, res: Response) {
    const participant = await prisma.rideParticipant.findFirst({
      where: { 
        id: req.params.participantId,
        rideId: req.params.id 
      },
      include: {
        ride: true
      }
    });

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    const status = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).parse(req.body.status);
    const updatedParticipant = await prisma.rideParticipant.update({
      where: { id: participant.id },
      data: { status }
    });

    // If marking as completed, check if all confirmed participants are completed
    if (status === 'COMPLETED') {
      const allParticipants = await prisma.rideParticipant.findMany({
        where: { 
          rideId: participant.rideId,
          status: 'CONFIRMED'
        }
      });
      
      const allCompleted = allParticipants.every(p => p.status === 'COMPLETED');
      if (allCompleted) {
        await prisma.ride.update({
          where: { id: participant.rideId },
          data: { status: 'COMPLETED' }
        });
      }
    }

    res.json(updatedParticipant);
  }

  async delete(req: Request, res: Response) {
    const ride = await prisma.ride.findUnique({
      where: { id: req.params.id }
    });
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    await prisma.ride.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });
    res.status(204).send();
  }

  async getDriverRides(req: Request, res: Response) {
    const driverId = req.user?.id;
    if (!driverId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const rides = await prisma.ride.findMany({
      where: { driverId },
      include: {
        participants: true
      },
      orderBy: {
        departureTime: 'asc'
      }
    });
    res.json(rides);
  }

  async getRiderRides(req: Request, res: Response) {
    const riderId = req.user?.id;
    if (!riderId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const participants = await prisma.rideParticipant.findMany({
      where: { userId: riderId },
      include: {
        ride: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Fetch driver information for each ride
    const ridesWithDetails = await Promise.all(
      participants.map(async (p) => {
        const driver = await auth.getUser(p.ride.driverId);
        return {
          id: p.ride.id,
          origin: p.ride.origin,
          destination: p.ride.destination,
          departureTime: p.ride.departureTime,
          pricePerSeat: p.ride.pricePerSeat,
          availableSeats: p.ride.availableSeats,
          status: p.ride.status,
          notes: p.ride.notes,
          participantStatus: p.status,
          numberOfSeats: p.numberOfSeats,
          driver: driver ? {
            id: driver.id,
            name: driver.name,
            email: driver.email,
            avatar: driver.avatar
          } : null
        };
      })
    );

    res.json(ridesWithDetails);
  }
} 