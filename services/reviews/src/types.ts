import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  isAdmin?: boolean;
}

export interface AuthRequest extends Request {
  user?: User;
} 