import axios from 'axios';
import { getGroupById } from './group';
import { getClassById } from './classes';
import { getStudentClasses } from './student';

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

export const getOrCreateChatRoom = async (groupId: number) => {
  try {
    const response = await getChatRoom(groupId);
    return response;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '';
    
    if (errorMessage.includes('Chat room not found') || errorMessage.includes('not found')) {
      try {
        const groupDetail = await getGroupById(groupId);
        
        if (!groupDetail || !groupDetail.members || groupDetail.members.length === 0) {
          throw new Error('Group has no members');
        }

        const classInfo = await getClassById(groupDetail.classId);
        const className = classInfo.data?.className || 'Unknown Class';

        const members = groupDetail.members.map(member => ({
          userId: member.userId,
          email: member.email,
          fullName: member.fullName,
          avatarUrl: member.avatarUrl || undefined,
          roleInGroup: member.roleInGroup
        }));

        const createResponse = await createChatRoom({
          groupId: groupDetail.groupId,
          groupName: groupDetail.groupName,
          classId: groupDetail.classId,
          className: className,
          members
        });

        if (createResponse.success) {
          const newRoomResponse = await getChatRoom(groupId);
          return newRoomResponse;
        }

        throw new Error('Failed to create chat room');
      } catch (createError: any) {
        console.error('Error creating chat room:', createError);
        throw createError;
      }
    }
    
    throw error;
  }
};

export const ensureAllChatRooms = async () => {
  try {
    const studentClassesRes = await getStudentClasses();
    
    if (!studentClassesRes.isSuccess || !studentClassesRes.data) {
      return;
    }

    const classesWithGroups = studentClassesRes.data.filter(cls => cls.myGroup);

    for (const cls of classesWithGroups) {
      if (!cls.myGroup) continue;

      try {
        await getChatRoom(cls.myGroup.groupId);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || '';
        
        if (errorMessage.includes('Chat room not found') || errorMessage.includes('not found')) {
          try {
            const groupDetail = await getGroupById(cls.myGroup.groupId);
            
            if (!groupDetail || !groupDetail.members || groupDetail.members.length === 0) {
              continue;
            }

            const classInfo = await getClassById(groupDetail.classId);
            const className = classInfo.data?.className || cls.className || 'Unknown Class';

            const members = groupDetail.members.map(member => ({
              userId: member.userId,
              email: member.email,
              fullName: member.fullName,
              avatarUrl: member.avatarUrl || undefined,
              roleInGroup: member.roleInGroup
            }));

            await createChatRoom({
              groupId: groupDetail.groupId,
              groupName: groupDetail.groupName,
              classId: groupDetail.classId,
              className: className,
              members
            });
          } catch (createError) {
            console.error(`Failed to create room for group ${cls.myGroup.groupId}:`, createError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring chat rooms:', error);
  }
};
