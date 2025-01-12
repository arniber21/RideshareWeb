'use client';

import { useEffect, useState } from 'react';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { getChatRoom, sendMessage, subscribeToChat } from '@/lib/api/chat';
import { ChatRoom as ChatRoomType, Message } from '@/lib/types/chat';
import { toast } from 'react-hot-toast';

interface ChatRoomProps {
  rideId: string;
  currentUserId: string;
}

export function ChatRoom({ rideId, currentUserId }: ChatRoomProps) {
  const [chatRoom, setChatRoom] = useState<ChatRoomType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatRoom = async () => {
      try {
        setLoading(true);
        const data = await getChatRoom(rideId);
        setChatRoom(data);
      } catch (error) {
        toast.error('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    fetchChatRoom();
  }, [rideId]);

  useEffect(() => {
    if (!chatRoom) return;

    const unsubscribe = subscribeToChat(rideId, (message: Message) => {
      setChatRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, message],
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [rideId, chatRoom]);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(rideId, { content });
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-800" />
      </div>
    );
  }

  if (!chatRoom) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <p className="text-gray-500">Failed to load chat</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px] bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          Chat ({chatRoom.participants.length} participants)
        </h3>
      </div>
      
      <MessageList
        messages={chatRoom.messages}
        currentUserId={currentUserId}
      />
      
      <MessageInput
        onSend={handleSendMessage}
      />
    </div>
  );
} 