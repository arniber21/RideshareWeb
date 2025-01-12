export interface Message {
  id: string;
  rideId: string;
  senderId: string;
  sender: {
    id: string;
    email: string;
  };
  content: string;
  createdAt: string;
}

export interface ChatRoom {
  rideId: string;
  messages: Message[];
  participants: {
    id: string;
    email: string;
    role: 'driver' | 'passenger';
  }[];
}

export interface SendMessageData {
  content: string;
} 