import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    set((state) => {
      const updated = [notification, ...state.notifications];
      const isRead = notification.read || notification.is_read;
      return {
        notifications: updated,
        unreadCount: state.unreadCount + (isRead ? 0 : 1),
      };
    });
  },

  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      const isRead = notification && (notification.read || notification.is_read);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: state.unreadCount - (notification && !isRead ? 1 : 0),
      };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      const isRead = notification && (notification.read || notification.is_read);
      if (notification && !isRead) {
        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true, is_read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      }
      return state;
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true, is_read: true })),
      unreadCount: 0,
    }));
  },

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !(n.read || n.is_read)).length;
    set({ notifications, unreadCount });
  },

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
