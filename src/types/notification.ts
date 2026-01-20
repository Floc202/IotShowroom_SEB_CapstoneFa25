import type { Id } from "./base";

export interface Notification {
  notificationId: Id;
  userId: Id;
  userName: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data: string | null;
}

export interface NotificationSummary {
  totalNotifications: number;
  unreadCount: number;
  readCount: number;
  latestNotificationAt: string | null;
}

export interface MarkNotificationReadRequest {
  notificationId: Id;
}
