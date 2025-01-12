import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { z } from 'zod';

const userRepository = AppDataSource.getRepository(User);

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  avatarUrl: z.string().url().optional(),
});

export class UserController {
  async create(req: Request, res: Response) {
    const validatedData = createUserSchema.parse(req.body);
    const user = userRepository.create(validatedData);
    await userRepository.save(user);
    res.status(201).json(user);
  }

  async findAll(req: Request, res: Response) {
    const users = await userRepository.find();
    res.json(users);
  }

  async findOne(req: Request, res: Response) {
    const user = await userRepository.findOneBy({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  }

  async update(req: Request, res: Response) {
    const user = await userRepository.findOneBy({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const validatedData = createUserSchema.partial().parse(req.body);
    userRepository.merge(user, validatedData);
    const updatedUser = await userRepository.save(user);
    res.json(updatedUser);
  }

  async delete(req: Request, res: Response) {
    const user = await userRepository.findOneBy({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await userRepository.remove(user);
    res.status(204).send();
  }
} 