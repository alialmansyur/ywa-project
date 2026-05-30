import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Konfigurasi handler agar notifikasi muncul saat app sedang aktif (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const setupPushNotifications = async () => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0A8B61',
    });
  }

  if (Device.isDevice) {
    if (Constants.appOwnership === 'expo') {
      console.log('Skipping remote push token registration (Unsupported in Expo Go SDK 53+)');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      
      if (!projectId) {
        console.warn('Warning: No projectId found in app.json. Push token sync skipped.');
        return null;
      }
      
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Expo Push Token:', token);
    } catch (error) {
      console.warn('Failed to get Expo Push Token:', error.message);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
};

// Fungsi simulasi untuk mengirim notifikasi lokal
export const simulateIncomingWO = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🚨 Darurat: Breakdown PC-200",
      body: "Driver Ahmad melaporkan engine panas di Site A. Segera cek panel mekanik!",
      data: { route: '/mechanic' },
      sound: true,
    },
    trigger: null, // Send immediately
  });
};

export const sendLocalNotification = async (title, body, data = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null,
  });
};
