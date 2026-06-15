import { Tabs, router } from 'expo-router';
import { theme } from '../../constants/AppTheme';
import { Home, ClipboardList, User, AlertTriangle, History, Bell } from 'lucide-react-native';
import { HeaderBackButton } from '../../components/common/HeaderBackButton';
import { AppHeader } from '../../components/common/AppHeader';
import { createHeaderIconButton } from '../../utils/header-options';
import { useAuthStore } from '../../stores/auth.store';
import { useNotificationStore } from '../../stores/notification.store';
import { notificationsService } from '../../services/notifications.service';
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMenuBarHeight, getMenuBarPaddingBottom, MENU_BAR_PADDING_TOP } from '../../constants/menu-bar';

function NotificationIcon() {
  const { unreadCount } = useNotificationStore();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (unreadCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.5, duration: 600, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scale.setValue(1);
    }
  }, [scale, unreadCount]);

  return (
    <View>
      <Bell color="#fff" size={24} />
      {unreadCount > 0 && (
        <View style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, justifyContent: 'center', alignItems: 'center' }}>
          <Animated.View style={{ position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.error, transform: [{ scale }], opacity: 0.5 }} />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.error, borderWidth: 1, borderColor: theme.colors.primary }} />
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  const { setNotifications } = useNotificationStore();
  const insets = useSafeAreaInsets();
  const menuBarHeight = getMenuBarHeight(insets.bottom);
  const menuBarPaddingBottom = getMenuBarPaddingBottom(insets.bottom);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else {
      notificationsService.getAll()
        .then(res => setNotifications(res?.notifications?.data || []))
        .catch(() => {});
    }
  }, [isAuthenticated, setNotifications]);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: (props) => <AppHeader {...props} />,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          height: menuBarHeight,
          paddingBottom: menuBarPaddingBottom,
          paddingTop: MENU_BAR_PADDING_TOP,
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerRight: () => createHeaderIconButton({ onPress: () => router.push('/notifications'), icon: <NotificationIcon /> }),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Lapor',
          tabBarIcon: ({ color, size }) => <AlertTriangle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="work-orders"
        options={{
          title: 'WO',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          href: null,
          title: 'Live Inventory',
          headerLeft: () => <HeaderBackButton color="#fff" />,
        }}
      />
      <Tabs.Screen
        name="hm-tracking"
        options={{
          href: null,
          title: 'Pencatatan HM Shift',
          headerLeft: () => <HeaderBackButton color="#fff" />,
        }}
      />
      <Tabs.Screen
        name="p2h"
        options={{
          href: null,
          title: 'Form P2H',
          headerLeft: () => <HeaderBackButton color="#fff" />,
        }}
      />
      <Tabs.Screen name="findings" options={{ href: null, title: 'Temuan Aset', headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <Tabs.Screen name="schedule" options={{ href: null, title: 'Jadwal & Kalender', headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <Tabs.Screen name="preventive" options={{ href: null, title: 'Cek Preventive', headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <Tabs.Screen name="guide" options={{ href: null, title: 'Panduan Operasional', headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <Tabs.Screen name="unit-assets" options={{ href: null, title: 'Daftar Aset Unit', headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <Tabs.Screen name="workshop/index" options={{ href: null, title: 'Workshop', headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <Tabs.Screen name="workshop/detail" options={{ href: null, title: 'Progress Workshop', headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <Tabs.Screen name="mechanic/index" options={{ href: null, title: 'Workstation Mekanik', headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <Tabs.Screen name="mechanic/approval" options={{ href: null, title: 'Approval Kedatangan', headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <Tabs.Screen name="mechanic/process" options={{ href: null, title: 'Station Control', headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <Tabs.Screen name="mechanic/completed-detail" options={{ href: null, title: 'Detail Pengerjaan', headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <Tabs.Screen name="unit-assets/[id]" options={{ href: null, title: 'Detail Aset', headerLeft: () => <HeaderBackButton color="#fff" /> }} />
    </Tabs>
  );
}
