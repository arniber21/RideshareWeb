import express from 'express';
import { ChatController } from '../controllers/chat.controller';
import { ChatService } from '../services/chat.service';
import { Server } from 'socket.io';

export const createChatRouter = (io: Server) => {
  const router = express.Router();
  const chatService = new ChatService(io);
  const chatController = new ChatController(chatService);

  // Chat CRUD routes
  router.post('/', (req, res) => chatController.createChat(req, res));
  router.get('/:id', (req, res) => chatController.getChat(req, res));
  router.get('/:id/messages', (req, res) => chatController.getChatMessages(req, res));
  router.get('/users/:userId', (req, res) => chatController.getUserChats(req, res));

  return router;
}; 