import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['driver', 'rider']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ errors: [{ message: 'Email already in use' }] });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isDriver: role === 'driver',
      },
    });

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.isDriver ? 'driver' : 'rider',
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '24h'
      }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.isDriver ? 'driver' : 'rider',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(e => ({ message: e.message })) });
    }
    console.error('Registration error:', error);
    res.status(500).json({ errors: [{ message: 'Error creating user' }] });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return res.status(400).json({ errors: [{ message: 'Invalid credentials' }] });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ errors: [{ message: 'Invalid credentials' }] });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.isDriver ? 'driver' : 'rider',
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '24h'
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.isDriver ? 'driver' : 'rider',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(e => ({ message: e.message })) });
    }
    console.error('Login error:', error);
    res.status(500).json({ errors: [{ message: 'Error logging in' }] });
  }
});

// Google OAuth routes
router.get(
  '/google',
  (req, res, next) => {
    console.log('Starting Google OAuth flow...');
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('Received Google callback');
    next();
  },
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: '/auth/login?error=google-auth-failed'
  }),
  async (req, res) => {
    try {
      const user = req.user as any;
      console.log('Authenticated user:', user);
      
      // Create JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: '24h'
        }
      );
      
      console.log('Created JWT token, redirecting to frontend...');
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=token-creation-failed`);
    }
  }
);

// Get current user
router.get(
  '/current-user',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const user = req.user as any;
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.isDriver ? 'driver' : 'rider',
      name: dbUser.name,
      phone: dbUser.phone,
      avatar: dbUser.avatar,
    });
  }
);

// Update user profile
router.put(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = req.user as any;
      const data = updateUserSchema.parse(req.body);

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          avatar: data.avatar,
        },
      });

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors.map(e => ({ message: e.message })) });
      }
      console.error('Update profile error:', error);
      res.status(500).json({ errors: [{ message: 'Error updating profile' }] });
    }
  }
);

// Upload avatar
router.post(
  '/avatar',
  passport.authenticate('jwt', { session: false }),
  upload.single('avatar'),
  async (req, res) => {
    try {
      const user = req.user as any;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Get the relative path of the uploaded file
      const avatarUrl = `${process.env.API_URL}/uploads/avatars/${file.filename}`;

      // Update user's avatar in database
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: avatarUrl },
      });

      res.json({
        id: updatedUser.id,
        avatar: updatedUser.avatar,
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({ message: 'Error uploading avatar' });
    }
  }
);

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      phone: user.phone,
      isDriver: user.isDriver
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

export { router as authRouter }; 