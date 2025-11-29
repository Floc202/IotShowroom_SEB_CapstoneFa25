import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";
import type { Notification, NotificationSummary } from "../types/notification";

const BASE = "/Notifications";

export const getNotifications = (pageNumber: number = 1, pageSize: number = 20) =>
  api
    .get<ApiEnvelope<Notification[]>>(`${BASE}`, {
      params: { pageNumber, pageSize },
    })
    .then((r) => r.data);

export const getUnreadNotifications = () =>
  api
    .get<ApiEnvelope<Notification[]>>(`${BASE}/unread`)
    .then((r) => r.data);

export const getNotificationSummary = () =>
  api
    .get<ApiEnvelope<NotificationSummary>>(`${BASE}/summary`)
    .then((r) => r.data);

export const markNotificationAsRead = (notificationId: Id) =>
  api
    .put<ApiEnvelope<boolean>>(`${BASE}/${notificationId}/mark-read`)
    .then((r) => r.data);

export const markAllNotificationsAsRead = () =>
  api
    .put<ApiEnvelope<boolean>>(`${BASE}/mark-all-read`)
    .then((r) => r.data);

export const deleteNotification = (notificationId: Id) =>
  api
    .delete<ApiEnvelope<boolean>>(`${BASE}/${notificationId}`)
    .then((r) => r.data);

export const deleteAllReadNotifications = () =>
  api
    .delete<ApiEnvelope<boolean>>(`${BASE}/read`)
    .then((r) => r.data);
