import { Card, Button, Space, Tag, Empty } from "antd";
import { useNotificationHub } from "../hooks/useNotificationHub";
import { Bell, RefreshCw } from "lucide-react";
import type { Notification } from "../types/notification";
import { useState } from "react";

/**
 * Example component showing how to use the useNotificationHub hook
 * This component demonstrates:
 * 1. Connecting to SignalR notifications
 * 2. Receiving real-time notifications
 * 3. Displaying connection status
 */
export function NotificationHubExample() {
  const [receivedNotifications, setReceivedNotifications] = useState<
    Notification[]
  >([]);

  const { isConnected, connectionState } = useNotificationHub({
    onNotification: (notification) => {
      console.log("New notification received in example:", notification);
      setReceivedNotifications((prev) => [notification, ...prev]);
    },
    autoConnect: true,
  });

  const handleClear = () => {
    setReceivedNotifications([]);
  };

  return (
    <Card
      title="SignalR Notification Hub Status"
      extra={
        <Space>
          <Button
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => {
              /* Force reconnect */
            }}
          >
            Reconnect
          </Button>
        </Space>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Connection Status:</p>
          <Tag color={isConnected ? "green" : "red"}>
            {isConnected ? "Connected" : "Disconnected"} ({connectionState})
          </Tag>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">
              Received Notifications ({receivedNotifications.length})
            </p>
            {receivedNotifications.length > 0 && (
              <Button size="small" danger onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>

          {receivedNotifications.length === 0 ? (
            <Empty
              description="No notifications received yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {receivedNotifications.map((notif) => (
                <Card
                  key={notif.notificationId}
                  size="small"
                  className="bg-blue-50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      <span className="font-semibold">{notif.title}</span>
                      <Tag color="blue">{notif.type}</Tag>
                    </div>
                    <p className="text-sm text-gray-700">{notif.message}</p>
                    <p className="text-xs text-gray-500">
                      From: {notif.userName}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
