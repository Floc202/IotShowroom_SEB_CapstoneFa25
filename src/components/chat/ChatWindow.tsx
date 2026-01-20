import React, { useState, useEffect, useRef } from 'react';
import { Input, Upload, Button, Avatar, Spin, message as antdMessage, Badge } from 'antd';
import { 
  Send, 
  Paperclip, 
  X, 
  File, 
  Download,
  Minus
} from 'lucide-react';
import type { ChatMessage, ChatRoom } from '../../types/chat';
import { useChatSocket } from '../../hooks/useChatSocket';
import { getMessages, uploadFile, getFileUrl, markMessagesAsRead } from '../../api/chat';
import { useAuth } from '../../providers/AuthProvider';
import dayjs from 'dayjs';

interface ChatWindowProps {
  open: boolean;
  onClose: () => void;
  room: ChatRoom | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ open, onClose, room }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const { isConnected, sendMessage, startTyping, stopTyping, markAsRead } = useChatSocket({
    roomId: room?._id || null,
    userId: user?.userId || null,
    groupId: room?.groupId || null,
    onNewMessage: (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
      
      if (open) {
        markAsRead();
      }
    },
    onUserTyping: (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName];
          }
          return prev;
        });
      } else {
        setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
      }
    },
  });

  useEffect(() => {
    if (open && room) {
      loadMessages();
    }
  }, [open, room]);

  useEffect(() => {
    if (open && room && user) {
      markAsRead();
      markMessagesAsRead(room._id, user.userId);
    }
  }, [open, room, user]);

  const loadMessages = async () => {
    if (!room) return;
    
    setLoading(true);
    try {
      const response = await getMessages(room._id, 1, 50);
      setMessages(response.messages);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
      antdMessage.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = () => {
    if (!inputValue.trim() || !user || !room) return;

    setSending(true);
    sendMessage({
      messageType: 'text',
      content: inputValue.trim(),
      senderName: user.fullName || user.email,
      senderEmail: user.email,
      senderAvatar: user.avatarUrl || '',
    });

    setInputValue('');
    setSending(false);
    stopTyping();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (user && e.target.value.trim()) {
      startTyping(user.fullName || user.email);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 2000);
    } else {
      stopTyping();
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user || !room) return;

    setUploading(true);
    try {
      const uploadResponse = await uploadFile(file);
      const { fileId, fileName, mimeType, fileSize } = uploadResponse.file;

      const isImage = mimeType.startsWith('image/');
      const messageType = isImage ? 'image' : 'file';

      sendMessage({
        messageType,
        content: fileName,
        senderName: user.fullName || user.email,
        senderEmail: user.email,
        senderAvatar: user.avatarUrl || '',
        fileId,
        fileName,
        fileSize,
        mimeType,
      });

      antdMessage.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      antdMessage.error('Failed to upload file');
    } finally {
      setUploading(false);
    }

    return false;
  };

  const renderMessage = (msg: ChatMessage) => {
    const isOwn = msg.senderId === user?.userId;
    const time = dayjs(msg.createdAt).format('HH:mm');

    return (
      <div
        key={msg._id}
        className={`flex gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      >
        <Avatar src={msg.senderAvatar || undefined} size={32}>
          {msg.senderName[0] || msg.senderEmail[0]}
        </Avatar>
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
          {!isOwn && (
            <span className="text-xs text-gray-600 mb-1">{msg.senderName}</span>
          )}
          
          {msg.messageType === 'text' && (
            <div
              className={`px-4 py-2 rounded-2xl ${
                isOwn
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap wrap-break-word !mb-0">{msg.content}</p>
            </div>
          )}

          {msg.messageType === 'image' && (
            <div className="relative">
              <img
                src={getFileUrl(msg.fileId!)}
                alt={msg.fileName}
                className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90"
                onClick={() => window.open(getFileUrl(msg.fileId!), '_blank')}
              />
              <a
                href={getFileUrl(msg.fileId!)}
                download={msg.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
              >
                <Download className="w-4 h-4 text-white" />
              </a>
            </div>
          )}

          {msg.messageType === 'file' && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${
                isOwn
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <File className="w-5 h-5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate !mb-0">{msg.fileName}</p>
                <p className="text-xs opacity-75 !mb-0">
                  {((msg.fileSize || 0) / 1024).toFixed(2)} KB
                </p>
              </div>
              <a
                href={getFileUrl(msg.fileId!)}
                download={msg.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className={isOwn ? 'text-white' : 'text-blue-600'}
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          )}

          <span className="text-xs text-gray-500 mt-1">{time}</span>
        </div>
      </div>
    );
  };

  if (!room || !open) return null;

  return (
    <div 
      className="fixed bottom-0 right-24 z-50 bg-white rounded-t-lg shadow-2xl border border-gray-200"
      style={{ 
        width: '328px',
        height: isMinimized ? '56px' : '450px',
        transition: 'height 0.2s ease'
      }}
    >
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg cursor-pointer">
        <div className="flex items-center gap-2 flex-1" onClick={() => setIsMinimized(!isMinimized)}>
          <Avatar size={32} src={undefined} className="bg-blue-800">
            {room.groupName[0]}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{room.groupName}</div>
            <div className="flex items-center gap-1 text-xs opacity-90">
              <Badge status={isConnected ? 'success' : 'error'} />
              <span className="truncate">{room.className}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-1.5 hover:bg-blue-800 rounded-full transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 hover:bg-blue-800 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div
            ref={messagesContainerRef}
            className="h-[340px] overflow-y-auto p-3 bg-white"
          >
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Spin size="large" />
              </div>
            ) : (
              <>
                {messages.map(renderMessage)}
                
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="p-2 bg-white border-t flex items-center gap-2">
            <Upload
              beforeUpload={handleFileUpload}
              showUploadList={false}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
            >
              <Button
                size="small"
                icon={<Paperclip className="w-4 h-4" />}
                loading={uploading}
                disabled={uploading}
              />
            </Upload>

            <Input
              size="small"
              value={inputValue}
              onChange={handleInputChange}
              onPressEnter={handleSend}
              placeholder="Type a message..."
              disabled={sending || !isConnected}
              className="flex-1"
            />

            <Button
              size="small"
              type="primary"
              icon={<Send className="w-4 h-4" />}
              onClick={handleSend}
              loading={sending}
              disabled={!inputValue.trim() || sending || !isConnected}
            />
          </div>
        </>
      )}
    </div>
  );
};
