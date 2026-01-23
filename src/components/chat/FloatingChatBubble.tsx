import React, { useState, useEffect } from 'react';
import { Badge, Popover, List, Avatar, Empty } from 'antd';
import { MessageCircle, X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import type { ChatRoom } from '../../types/chat';
import { getUserChatRooms, getUnreadCount, ensureAllChatRooms } from '../../api/chat';
import { useAuth } from '../../providers/AuthProvider';

interface RoomWithUnread extends ChatRoom {
  unreadCount: number;
  memberCount: number;
}

export const FloatingChatBubble: React.FC = () => {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [rooms, setRooms] = useState<RoomWithUnread[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (user) {
      loadRooms();
      const interval = setInterval(loadRooms, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadRooms = async () => {
    if (!user) return;

    try {
      await ensureAllChatRooms();
      
      const response = await getUserChatRooms(user.userId);
      if (response.success) {
        const roomsWithUnread = await Promise.all(
          response.rooms.map(async (room: ChatRoom & { memberCount: number }) => {
            try {
              const unreadResponse = await getUnreadCount(room._id, user.userId);
              return {
                ...room,
                unreadCount: unreadResponse.unreadCount
              };
            } catch {
              return {
                ...room,
                unreadCount: 0
              };
            }
          })
        );

        setRooms(roomsWithUnread);
        const total = roomsWithUnread.reduce((sum, room) => sum + room.unreadCount, 0);
        setTotalUnread(total);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const handleRoomClick = (room: ChatRoom) => {
    setSelectedRoom(room);
    setChatOpen(true);
    setVisible(false);
  };

  const handleChatClose = () => {
    setChatOpen(false);
    setSelectedRoom(null);
    loadRooms();
  };

  const content = (
    <div className="w-80">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-lg font-semibold mb-0">Chat Groups</h3>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {!user ? (
        <Empty
          description="Please login to view chat groups"
          className="py-8"
        />
      ) : rooms.length === 0 ? (
        <Empty
          description="No chat groups yet"
          className="py-8"
        />
      ) : (
        <List
          dataSource={rooms}
          className="max-h-96 overflow-y-auto"
          renderItem={(room) => (
            <List.Item
              className="cursor-pointer hover:bg-gray-50 px-4 py-3"
              onClick={() => handleRoomClick(room)}
            >
              <List.Item.Meta
                avatar={
                  <Badge count={room.unreadCount} offset={[-5, 5]}>
                    <Avatar className="bg-blue-500">
                      {room.groupName[0]}
                    </Avatar>
                  </Badge>
                }
                title={
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{room.groupName}</span>
                  </div>
                }
                description={
                  <div className="text-xs text-gray-500">
                    {room.className} • {room.memberCount} members
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <>
      <Popover
        content={content}
        trigger="click"
        open={visible}
        onOpenChange={setVisible}
        placement="topRight"
        overlayClassName="chat-bubble-popover"
      >
        <div className="fixed bottom-6 right-6 z-50">
          <Badge count={totalUnread} offset={[-5, 5]}>
            <button
              className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
              onClick={() => setVisible(!visible)}
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          </Badge>
        </div>
      </Popover>

      {user && (
        <ChatWindow
          open={chatOpen}
          onClose={handleChatClose}
          room={selectedRoom}
        />
      )}
    </>
  );
};
