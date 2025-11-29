import { useState, useEffect, useRef } from "react";
import {
  Card,
  List,
  Tag,
  Button,
  Space,
  Empty,
  Spin,
  Popconfirm,
  Badge,
  Statistic,
  Row,
  Col,
  Tabs,
  Typography,
} from "antd";
import type { TabsProps } from "antd";
import {
  Bell,
  CheckCircle,
  Trash2,
  RefreshCw,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  getNotifications,
  getUnreadNotifications,
  getNotificationSummary,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
} from "../api/notification";
import type { Notification, NotificationSummary } from "../types/notification";
import toast from "react-hot-toast";
import { getErrorMessage } from "../utils/helpers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 20;

  const listRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchSummary = async () => {
    try {
      const res = await getNotificationSummary();
      if (res.isSuccess && res.data) {
        setSummary(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch summary:", e);
    }
  };

  const fetchNotifications = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let res;
      if (activeTab === "unread") {
        res = await getUnreadNotifications();
        setHasMore(false);
      } else {
        res = await getNotifications(page, pageSize);
        if (res.data && res.data.length < pageSize) {
          setHasMore(false);
        }
      }

      if (res.isSuccess && res.data) {
        if (append) {
          setNotifications((prev) => [...prev, ...res.data]);
        } else {
          setNotifications(res.data);
        }
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    setPageNumber(1);
    setHasMore(true);
    setNotifications([]);
    fetchNotifications(1, false);
  }, [activeTab]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || activeTab === "unread") return;

    const options = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loadingMore && hasMore) {
        const nextPage = pageNumber + 1;
        setPageNumber(nextPage);
        fetchNotifications(nextPage, true);
      }
    }, options);

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, pageNumber, activeTab]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const res = await markNotificationAsRead(notificationId);
      if (res.isSuccess) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === notificationId ? { ...n, isRead: true } : n
          )
        );
        fetchSummary();
        toast.success("Marked as read");
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllNotificationsAsRead();
      if (res.isSuccess) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        fetchSummary();
        toast.success("All notifications marked as read");
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      const res = await deleteNotification(notificationId);
      if (res.isSuccess) {
        setNotifications((prev) =>
          prev.filter((n) => n.notificationId !== notificationId)
        );
        fetchSummary();
        toast.success("Notification deleted");
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      const res = await deleteAllReadNotifications();
      if (res.isSuccess) {
        setNotifications((prev) => prev.filter((n) => !n.isRead));
        fetchSummary();
        toast.success("All read notifications deleted");
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "success":
        return "green";
      case "warning":
        return "orange";
      case "error":
        return "red";
      default:
        return "blue";
    }
  };

  const tabItems: TabsProps["items"] = [
    {
      key: "all",
      label: (
        <span className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          All Notifications
          <Badge count={summary?.totalNotifications || 0} showZero />
        </span>
      ),
    },
    {
      key: "unread",
      label: (
        <span className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Unread
          <Badge count={summary?.unreadCount || 0} showZero />
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Title level={2} className="!mb-0">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            <span>Notifications</span>
          </div>
        </Title>
      </div>

      {summary && (
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <Statistic
                title="Total Notifications"
                value={summary.totalNotifications}
                prefix={<Bell className="w-5 h-5" />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
              <Statistic
                title="Unread"
                value={summary.unreadCount}
                prefix={<AlertCircle className="w-5 h-5" />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <Statistic
                title="Read"
                value={summary.readCount}
                prefix={<CheckCircle className="w-5 h-5" />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card
        className="shadow-sm"
        extra={
          <Space>
            <Button
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => {
                fetchSummary();
                setPageNumber(1);
                setHasMore(true);
                fetchNotifications(1, false);
              }}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<CheckCircle className="w-4 h-4" />}
              onClick={handleMarkAllAsRead}
              disabled={!summary?.unreadCount}
            >
              Mark All as Read
            </Button>
            <Popconfirm
              title="Delete all read notifications?"
              description="This action cannot be undone"
              onConfirm={handleDeleteAllRead}
              okText="Delete"
              okButtonProps={{ danger: true }}
              disabled={!summary?.readCount}
            >
              <Button
                danger
                icon={<Trash2 className="w-4 h-4" />}
                disabled={!summary?.readCount}
              >
                Delete All Read
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        <Tabs
          activeKey={activeTab}
          items={tabItems}
          onChange={(key) => setActiveTab(key as "all" | "unread")}
        />

        <div ref={listRef} style={{ maxHeight: "calc(100vh - 500px)", overflowY: "auto" }}>
          {loading ? (
            <div className="text-center py-12">
              <Spin size="large" />
              <div className="mt-4 text-gray-500">Loading notifications...</div>
            </div>
          ) : notifications.length === 0 ? (
            <Empty
              description={
                activeTab === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              <List
                dataSource={notifications}
                renderItem={(item) => (
                  <List.Item
                    key={item.notificationId}
                    className={`${
                      !item.isRead ? "bg-blue-50" : "bg-white"
                    } hover:bg-gray-50 transition-colors`}
                    actions={[
                      !item.isRead && (
                        <Button
                          type="text"
                          size="small"
                          icon={<CheckCircle className="w-4 h-4" />}
                          onClick={() => handleMarkAsRead(item.notificationId)}
                        >
                          Mark Read
                        </Button>
                      ),
                      <Popconfirm
                        title="Delete this notification?"
                        onConfirm={() => handleDelete(item.notificationId)}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<Trash2 className="w-4 h-4" />}
                        >
                          Delete
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={getNotificationIcon(item.type)}
                      title={
                        <div className="flex items-center gap-2">
                          <span className={!item.isRead ? "font-semibold" : ""}>
                            {item.title}
                          </span>
                          <Tag color={getNotificationColor(item.type)}>
                            {item.type}
                          </Tag>
                          {!item.isRead && (
                            <Badge status="processing" text="New" />
                          )}
                        </div>
                      }
                      description={
                        <div className="space-y-1">
                          <Text>{item.message}</Text>
                          <div className="text-xs text-gray-500">
                            {dayjs.utc(item.createdAt).tz("Asia/Ho_Chi_Minh").fromNow()} • from {item.userName}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />

              {activeTab === "all" && hasMore && (
                <div ref={sentinelRef} className="text-center py-4">
                  {loadingMore && (
                    <>
                      <Spin />
                      <div className="mt-2 text-gray-500 text-sm">
                        Loading more...
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "all" && !hasMore && notifications.length > 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No more notifications
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
