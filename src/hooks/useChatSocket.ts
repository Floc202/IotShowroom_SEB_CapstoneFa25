import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from '../types/chat';

const SOCKET_URL = import.meta.env.VITE_CHAT_SOCKET_URL || 'http://localhost:3001';

interface UseChatSocketProps {
  roomId: string | null;
  userId: number | null;
  groupId: number | null;
  onNewMessage?: (message: ChatMessage) => void;
  onUserTyping?: (data: { userId: number; userName: string; isTyping: boolean }) => void;
  onMemberOnline?: (data: { userId: number; userName: string }) => void;
  onMemberOffline?: (data: { userId: number }) => void;
}

export const useChatSocket = ({
  roomId,
  userId,
  groupId,
  onNewMessage,
  onUserTyping,
  onMemberOnline,
  onMemberOffline,
}: UseChatSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

  // Connect socket
  useEffect(() => {
    if (!roomId || !userId || !groupId) return;

    // Create socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);

      // Join room
      socket.emit('join_room', {
        roomId,
        userId,
        groupId,
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Chat events
    socket.on('new_message', (message: ChatMessage) => {
      console.log('New message received:', message);
      if (onNewMessage) {
        onNewMessage(message);
      }
    });

    socket.on('user_typing', (data) => {
      if (onUserTyping) {
        onUserTyping(data);
      }
    });

    socket.on('member_online', (data) => {
      console.log('Member online:', data);
      if (onMemberOnline) {
        onMemberOnline(data);
      }
      setOnlineUsers((prev) => [...prev, data.userId]);
    });

    socket.on('member_offline', (data) => {
      console.log('Member offline:', data);
      if (onMemberOffline) {
        onMemberOffline(data);
      }
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    });

    socket.on('online_users', (users) => {
      console.log('Online users:', users);
      setOnlineUsers(users.map((u: any) => u.userId));
    });

    // Cleanup
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, userId, groupId]);

  // Send message
  const sendMessage = useCallback(
    (data: {
      messageType: 'text' | 'file' | 'image';
      content: string;
      senderName: string;
      senderEmail: string;
      senderAvatar?: string;
      fileId?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
    }) => {
      if (!socketRef.current || !roomId || !userId || !groupId) return;

      socketRef.current.emit('send_message', {
        roomId,
        groupId,
        senderId: userId,
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        senderAvatar: data.senderAvatar || '',
        messageType: data.messageType,
        content: data.content,
        fileId: data.fileId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
      });
    },
    [roomId, userId, groupId]
  );

  // Typing indicators
  const startTyping = useCallback(
    (userName: string) => {
      if (!socketRef.current || !roomId || !userId) return;
      socketRef.current.emit('typing_start', { roomId, userId, userName });
    },
    [roomId, userId]
  );

  const stopTyping = useCallback(() => {
    if (!socketRef.current || !roomId || !userId) return;
    socketRef.current.emit('typing_stop', { roomId, userId });
  }, [roomId, userId]);

  // Mark as read
  const markAsRead = useCallback(() => {
    if (!socketRef.current || !roomId || !userId) return;
    socketRef.current.emit('mark_read', { roomId, userId });
  }, [roomId, userId]);

  return {
    isConnected,
    onlineUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  };
};
