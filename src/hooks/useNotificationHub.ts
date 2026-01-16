import { useEffect, useCallback, useRef } from "react";
import { notificationService } from "../services/notificationService";
import { useAuth } from "../providers/AuthProvider";
import type { Notification } from "../types/notification";

interface UseNotificationHubOptions {
  onNotification?: (notification: Notification) => void;
  autoConnect?: boolean;
}

export const useNotificationHub = ({
  onNotification,
  autoConnect = true,
}: UseNotificationHubOptions = {}) => {
  const { user } = useAuth();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const connect = useCallback(async () => {
    if (!user?.email) {
      console.warn("[useNotificationHub] User email not available");
      return;
    }

    try {
      await notificationService.connect(user.email);
      console.log("[useNotificationHub] Connected");
    } catch (error) {
      console.error("[useNotificationHub] Connection failed:", error);
    }
  }, [user?.email]);

  const disconnect = useCallback(async () => {
    await notificationService.disconnect();
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!autoConnect) return;

    connect();

    if (onNotification) {
      unsubscribeRef.current = notificationService.subscribe(onNotification);
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect, onNotification]);

  const isConnected = notificationService.isConnected();
  const connectionState = notificationService.getConnectionState();

  return {
    isConnected,
    connectionState,
    connect,
    disconnect,
  };
};
