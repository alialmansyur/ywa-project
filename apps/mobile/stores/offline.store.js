import { create } from 'zustand';

export const useOfflineStore = create((set, get) => ({
  queue: [],

  addToQueue: (action) => {
    set((state) => ({
      queue: [...state.queue, action],
    }));
  },

  removeFromQueue: (actionId) => {
    set((state) => ({
      queue: state.queue.filter((a) => a.id !== actionId),
    }));
  },

  updateAction: (actionId, updates) => {
    set((state) => ({
      queue: state.queue.map((a) =>
        a.id === actionId ? { ...a, ...updates } : a
      ),
    }));
  },

  clearQueue: () => set({ queue: [] }),

  getQueue: () => get().queue,
}));
