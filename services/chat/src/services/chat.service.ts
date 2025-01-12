import { Server, Socket } from 'socket.io';
import { AppDataSource } from '../data-source';
import { Chat, ChatType } from '../entities/chat.entity';
import { Message, MessageType } from '../entities/message.entity';

const chatRepository = AppDataSource.getRepository(Chat);
const messageRepository = AppDataSource.getRepository(Message);

export class ChatService {
  private io: Server;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(io: Server) {
    this.io = io;
  }

  async handleConnection(socket: Socket) {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      socket.disconnect();
      return;
    }

    // Store socket mapping
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socket.id);

    // Join user's chat rooms
    const chats = await chatRepository.find({
      where: [{ participantIds: [userId] }]
    });
    chats.forEach(chat => {
      socket.join(chat.id);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const userSocketIds = this.userSockets.get(userId);
      if (userSocketIds) {
        userSocketIds.delete(socket.id);
        if (userSocketIds.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    });

    // Handle message sending
    socket.on('send_message', async (data: {
      chatId: string;
      content: string;
      type?: MessageType;
      metadata?: any;
    }) => {
      try {
        const chat = await chatRepository.findOneBy({ id: data.chatId });
        if (!chat || !chat.participantIds.includes(userId)) {
          return;
        }

        const message = messageRepository.create({
          chatId: chat.id,
          senderId: userId,
          type: data.type || MessageType.TEXT,
          content: data.content,
          metadata: data.metadata,
          readBy: [userId]
        });

        await messageRepository.save(message);

        // Update chat metadata
        chat.metadata = {
          ...chat.metadata,
          lastMessageAt: new Date(),
          lastMessagePreview: data.content.substring(0, 50),
          unreadCounts: {
            ...chat.metadata?.unreadCounts,
            ...Object.fromEntries(
              chat.participantIds
                .filter(id => id !== userId)
                .map(id => [id, (chat.metadata?.unreadCounts?.[id] || 0) + 1])
            )
          }
        };
        await chatRepository.save(chat);

        // Broadcast to room
        this.io.to(chat.id).emit('new_message', {
          chatId: chat.id,
          message
        });
      } catch (err) {
        console.error('Error sending message:', err);
      }
    });

    // Handle message reading
    socket.on('mark_read', async (data: { chatId: string; messageIds: string[] }) => {
      try {
        const chat = await chatRepository.findOneBy({ id: data.chatId });
        if (!chat || !chat.participantIds.includes(userId)) {
          return;
        }

        await messageRepository
          .createQueryBuilder()
          .update(Message)
          .set({
            readBy: () => `array_append(read_by, '${userId}')`
          })
          .where('id IN (:...messageIds)', { messageIds: data.messageIds })
          .andWhere('chat_id = :chatId', { chatId: data.chatId })
          .execute();

        // Reset unread count for user
        if (chat.metadata?.unreadCounts) {
          chat.metadata.unreadCounts[userId] = 0;
          await chatRepository.save(chat);
        }

        // Notify other participants
        this.io.to(chat.id).emit('messages_read', {
          chatId: chat.id,
          userId,
          messageIds: data.messageIds
        });
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { chatId: string }) => {
      socket.to(data.chatId).emit('user_typing', {
        chatId: data.chatId,
        userId
      });
    });

    socket.on('typing_stop', (data: { chatId: string }) => {
      socket.to(data.chatId).emit('user_stopped_typing', {
        chatId: data.chatId,
        userId
      });
    });
  }

  async createChat(type: ChatType, rideId: string, participantIds: string[]): Promise<Chat> {
    const chat = chatRepository.create({
      type,
      rideId,
      participantIds,
      metadata: {
        unreadCounts: Object.fromEntries(participantIds.map(id => [id, 0]))
      }
    });

    await chatRepository.save(chat);

    // Notify participants
    participantIds.forEach(userId => {
      const userSocketIds = this.userSockets.get(userId);
      if (userSocketIds) {
        userSocketIds.forEach(socketId => {
          const socket = this.io.sockets.sockets.get(socketId);
          if (socket) {
            socket.join(chat.id);
          }
        });
      }
    });

    return chat;
  }

  async getChat(chatId: string): Promise<Chat | null> {
    return chatRepository.findOne({
      where: { id: chatId },
      relations: ['messages']
    });
  }

  async getChatMessages(chatId: string, limit: number = 50, before?: Date): Promise<Message[]> {
    const queryBuilder = messageRepository
      .createQueryBuilder('message')
      .where('message.chatId = :chatId', { chatId })
      .orderBy('message.createdAt', 'DESC')
      .take(limit);

    if (before) {
      queryBuilder.andWhere('message.createdAt < :before', { before });
    }

    return queryBuilder.getMany();
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    return chatRepository.find({
      where: [{ participantIds: [userId] }],
      order: { 'metadata->lastMessageAt': 'DESC' }
    });
  }
} 