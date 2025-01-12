import { Request, Response } from 'express';
import { z } from 'zod';
import { ChatService } from '../services/chat.service';
import { ChatType } from '../entities/chat.entity';

const createChatSchema = z.object({
  type: z.nativeEnum(ChatType),
  rideId: z.string().uuid(),
  participantIds: z.array(z.string().uuid()).min(2)
});

const getMessagesSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  before: z.string().datetime().optional()
});

export class ChatController {
  constructor(private chatService: ChatService) {}

  async createChat(req: Request, res: Response) {
    const validatedData = createChatSchema.parse(req.body);
    const chat = await this.chatService.createChat(
      validatedData.type,
      validatedData.rideId,
      validatedData.participantIds
    );
    res.status(201).json(chat);
  }

  async getChat(req: Request, res: Response) {
    const chat = await this.chatService.getChat(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  }

  async getChatMessages(req: Request, res: Response) {
    const { limit, before } = getMessagesSchema.parse(req.query);
    const messages = await this.chatService.getChatMessages(
      req.params.id,
      limit,
      before ? new Date(before) : undefined
    );
    res.json(messages);
  }

  async getUserChats(req: Request, res: Response) {
    const chats = await this.chatService.getUserChats(req.params.userId);
    res.json(chats);
  }
} 