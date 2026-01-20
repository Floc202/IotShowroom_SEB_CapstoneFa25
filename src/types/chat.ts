export interface ChatRoom {
  _id: string;
  groupId: number;
  groupName: string;
  classId: number;
  className: string;
  createdAt: string;
  lastMessageAt: string;
  members?: ChatMember[];
}

export interface ChatMember {
  userId: number;
  email: string;
  fullName: string;
  avatarUrl: string;
  roleInGroup: 'Leader' | 'Member';
  joinedAt: string;
  lastReadAt?: string;
}

export interface ChatMessage {
  _id: string;
  roomId: string;
  groupId: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  senderAvatar: string;
  messageType: 'text' | 'file' | 'image';
  content: string;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  readBy?: Array<{
    userId: number;
    readAt: string;
  }>;
}

export interface OnlineUser {
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string;
}
