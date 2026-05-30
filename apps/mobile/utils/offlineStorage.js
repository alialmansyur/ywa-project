import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_QUEUE_KEY = '@pending_offline_queue';

export const offlineStorage = {
  // Simpan data (misal registrasi WO) ke antrian lokal jika offline
  saveToQueue: async (actionType, payload) => {
    try {
      const currentQueueStr = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
      const currentQueue = currentQueueStr ? JSON.parse(currentQueueStr) : [];
      
      const newItem = {
        id: Date.now().toString(),
        type: actionType,
        payload,
        timestamp: new Date().toISOString()
      };
      
      currentQueue.push(newItem);
      await AsyncStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(currentQueue));
      console.log('Saved to offline queue:', newItem);
      return true;
    } catch (e) {
      console.error('Failed to save offline queue', e);
      return false;
    }
  },

  // Mendapatkan semua antrian
  getQueue: async () => {
    try {
      const queueStr = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
      return queueStr ? JSON.parse(queueStr) : [];
    } catch (e) {
      return [];
    }
  },

  // Menjalankan proses sync ke backend (simulasi)
  syncData: async () => {
    try {
      const queue = await offlineStorage.getQueue();
      if (queue.length === 0) return;

      console.log('Syncing offline data to server...', queue.length, 'items');
      
      // Simulasi HTTP request ke Backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Jika berhasil, bersihkan memori lokal
      await AsyncStorage.removeItem(PENDING_QUEUE_KEY);
      console.log('Sync complete!');
      return true;
    } catch (e) {
      console.error('Sync failed', e);
      return false;
    }
  }
};
