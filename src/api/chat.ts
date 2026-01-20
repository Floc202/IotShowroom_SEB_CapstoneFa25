import axios from 'axios';

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:3001/api';

const chatAxios = axios.create({
  baseURL: CHAT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getUserChatRooms = async (userId: number) => {
  const response = await chatAxios.get(`/chat/user/${userId}`);
  return response.data;
};

export const createChatRoom = async (data: {
  groupId: number;
  groupName: string;
  classId: number;
  className: string;
  members: Array<{
    userId: number;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    roleInGroup?: string;
  }>;
}) => {
  const response = await chatAxios.post('/chat/create', data);
  return response.data;
};

export const getChatRoom = async (groupId: number) => {
  const response = await chatAxios.get(`/chat/room/${groupId}`);
  return response.data;
};

export const syncMembers = async (groupId: number, members: Array<{
  userId: number;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  roleInGroup?: string;
}>) => {
  const response = await chatAxios.post('/chat/sync-members', {
    groupId,
    members
  });
  return response.data;
};

export const getMessages = async (roomId: string, page: number = 1, limit: number = 50, before?: string) => {
  const params: any = { page, limit };
  if (before) {
    params.before = before;
  }
  const response = await chatAxios.get(`/message/${roomId}`, { params });
  return response.data;
};

export const sendMessage = async (data: {
  roomId: string;
  groupId: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  messageType: 'text' | 'file' | 'image';
  content: string;
}) => {
  const response = await chatAxios.post('/message/send', data);
  return response.data;
};

export const markMessagesAsRead = async (roomId: string, userId: number) => {
  const response = await chatAxios.post('/message/mark-read', {
    roomId,
    userId
  });
  return response.data;
};

export const getUnreadCount = async (roomId: string, userId: number) => {
  const response = await chatAxios.get(`/message/unread/${roomId}/${userId}`);
  return response.data;
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await chatAxios.post('/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getFileUrl = (fileId: string) => {
  return `${CHAT_API_URL}/upload/file/${fileId}`;
};

export const deleteFile = async (fileId: string) => {
  const response = await chatAxios.delete(`/upload/file/${fileId}`);
  return response.data;
};
