import { router, Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useThemeContext } from '../contexts/ThemeContext';
import { AlertProvider } from '../contexts/AlertContext';
import { AppHeader } from '../components/common/AppHeader';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { resolveMobileNotificationRoute } from '../utils/notificationRoutes';

const queryClient = new QueryClient();

function RootNavigation() {
  useThemeContext();

  useEffect(() => {
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = resolveMobileNotificationRoute(response.notification.request.content.data);
      if (typeof route === 'string' && route.trim() !== '') {
        router.push(route);
      }
    });

    return () => {
      responseSub.remove();
    };
  }, []);

  return (
    <Stack
      key="light"
      screenOptions={{
        headerShown: false,
        header: (props) => <AppHeader {...props} />,
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(utility)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AlertProvider>
            <RootNavigation />
          </AlertProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
