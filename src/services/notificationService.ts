import * as signalR from "@microsoft/signalr";
import { STORAGE_KEYS } from "../utils/constants";
import type { Notification } from "../types/notification";

class NotificationService {
  private connection: signalR.HubConnection | null = null;
  private listeners: ((notification: Notification) => void)[] = [];
  private reconnectAttempts = 0;
  private reconnectDelay = 3000;

  async connect(email: string): Promise<void> {
    if (this.connection) {
      await this.disconnect();
    }

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      console.error("No access token found");
      return;
    }

    const hubUrl = `${import.meta.env.VITE_API_NOTIFICATION_HUB}/notificationHub`;
    const hubName = `notifications_email_${email}`;

    console.log(`[NotificationService] Connecting to hub: ${hubUrl}`);
    console.log(`[NotificationService] Hub name: ${hubName}`);

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        withCredentials: true,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: () => this.reconnectDelay,
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.connection.onreconnected(() => {
      console.log("[NotificationService] Reconnected");
      this.reconnectAttempts = 0;
    });

    this.connection.onreconnecting(() => {
      this.reconnectAttempts++;
      console.log(`[NotificationService] Reconnecting... attempt ${this.reconnectAttempts}`);
    });

    this.connection.onclose(() => {
      console.log("[NotificationService] Disconnected");
    });

    this.connection.on(hubName, (notification: Notification) => {
      console.log(`[NotificationService] Received from ${hubName}:`, notification);
      this.notifyListeners(notification);
    });

    this.connection.on("ReceiveNotification", (notification: Notification) => {
      console.log("[NotificationService] Received from ReceiveNotification:", notification);
      this.notifyListeners(notification);
    });

    try {
      await this.connection.start();
      console.log("[NotificationService] Connected successfully");
    } catch (error) {
      console.error("[NotificationService] Connection error:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.connection = null;
        this.listeners = [];
        console.log("[NotificationService] Disconnected successfully");
      } catch (error) {
        console.error("[NotificationService] Error disconnecting:", error);
      }
    }
  }

  subscribe(callback: (notification: Notification) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners(notification: Notification): void {
    this.listeners.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error("[NotificationService] Error in listener:", error);
      }
    });
  }

  isConnected(): boolean {
    return (
      this.connection !== null &&
      this.connection.state === signalR.HubConnectionState.Connected
    );
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null;
  }
}

export const notificationService = new NotificationService();
