import { authApi, ridesApi } from '@/lib/api';
import { ChatRoom, Message, SendMessageData } from '@/lib/types/chat';

export const getChatRoom = async (rideId: string): Promise<ChatRoom> => {
  const response = await ridesApi.get(`/chat/rooms/${rideId}`);
  return response.data;
};

export const sendMessage = async (rideId: string, data: SendMessageData): Promise<Message> => {
  const response = await ridesApi.post(`/chat/rooms/${rideId}/messages`, data);
  return response.data;
};

export const subscribeToChat = (rideId: string, onMessage: (message: Message) => void) => {
  const eventSource = new EventSource(`${ridesApi.defaults.baseURL}/chat/rooms/${rideId}/subscribe`);
  
  eventSource.onmessage = (event) => {
    const message = JSON.parse(event.data);
    onMessage(message);
  };

  return () => {
    eventSource.close();
  };
}; 