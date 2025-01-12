import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { AppDataSource } from './data-source';
import { createChatRouter } from './routes/chat.routes';
import { ChatService } from './services/chat.service';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(json());
app.use(cors());

// Initialize chat service
const chatService = new ChatService(io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  chatService.handleConnection(socket);
});

// Routes
app.use('/api/chat', createChatRouter(io));

const start = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    const port = process.env.PORT || 3006;
    httpServer.listen(port, () => {
      console.log(`Chat service listening on port ${port}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();
