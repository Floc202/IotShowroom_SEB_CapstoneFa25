import React, { useState, useEffect } from 'react';
import { Button, Badge, message as antdMessage } from 'antd';
import { MessageCircle } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import type { ChatRoom } from '../../types/chat';
import { getChatRoom, getUnreadCount, getOrCreateChatRoom } from '../../api/chat';
import { useAuth } from '../../providers/AuthProvider';

interface ChatButtonProps {
  groupId: number;
  className?: string;
}

export const ChatButton: React.FC<ChatButtonProps> = ({ groupId, className }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && groupId) {
      loadRoomAndFetchUnread();
    }
  }, [groupId, user]);

  useEffect(() => {
    if (!open && room && user) {
      fetchUnreadCount();
      
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [open, room, user]);

  const loadRoomAndFetchUnread = async () => {
    try {
      const response = await getChatRoom(groupId);
      if (response.success) {
        setRoom(response.room);
        if (user) {
          const unreadResponse = await getUnreadCount(response.room._id, user.userId);
          setUnreadCount(unreadResponse.unreadCount);
        }
      }
    } catch (error) {
      console.error('Error loading room:', error);
    }
  };

  const fetchUnreadCount = async () => {
    if (!room || !user) return;
    
    try {
      const response = await getUnreadCount(room._id, user.userId);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleOpenChat = async () => {
    if (room) {
      setOpen(true);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await getOrCreateChatRoom(groupId);
      if (response.success) {
        setRoom(response.room);
        setOpen(true);
        setUnreadCount(0);
      }
    } catch (error: any) {
      console.error('Error opening chat:', error);
      antdMessage.error(error.response?.data?.message || 'Failed to open chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Badge count={unreadCount} offset={[-5, 5]}>
        <Button
          type="primary"
          icon={<MessageCircle className="w-4 h-4" />}
          onClick={handleOpenChat}
          loading={loading}
          className={className}
        >
          Group Chat
        </Button>
      </Badge>

      <ChatWindow
        open={open}
        onClose={() => setOpen(false)}
        room={room}
      />
    </>
  );
};
