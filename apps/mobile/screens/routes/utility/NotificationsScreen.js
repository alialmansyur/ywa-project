import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { theme } from '../../../constants/AppTheme';
import { Card } from '../../../components/common/Card';
import { HeaderBackButton } from '../../../components/common/HeaderBackButton';
import { Bell } from 'lucide-react-native';
import { notificationsService } from '../../../services/notifications.service';
import { useNotificationStore } from '../../../stores/notification.store';
import { resolveMobileNotificationRoute } from '../../../utils/notificationRoutes';

export default function NotificationsScreen() {
  const { notifications, setNotifications, markAsRead, markAllAsRead, removeNotification } = useNotificationStore();
  const unreadNotifications = notifications.filter((n) => !(n.read || n.is_read));

  useEffect(() => {
    const load = async () => {
      try {
        const res = await notificationsService.getAll();
        const rows = res?.notifications?.data || [];
        setNotifications(rows);
      } catch (_e) {}
    };
    load();
  }, [setNotifications]);

  const markRead = async (id) => {
    try {
      await notificationsService.markRead(id);
      markAsRead(id);
      removeNotification(id);
    } catch (_e) {}
  };

  const readAll = async () => {
    try {
      await notificationsService.markAllRead();
      markAllAsRead();
    } catch (_e) {}
  };

  const openNotification = async (item) => {
    try {
      if (!item?.is_read) {
        await notificationsService.markRead(item.id);
        markAsRead(item.id);
        removeNotification(item.id);
      }
    } catch (_e) {}

    const route = resolveMobileNotificationRoute(item?.data);
    if (typeof route === 'string' && route.trim() !== '') {
      router.push(route);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <TouchableOpacity activeOpacity={0.75} onPress={() => openNotification(item)} style={styles.cardBody}>
      <View style={styles.iconContainer}>
        <Bell size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.body || item.message}</Text>
        <Text style={styles.date}>{item.created_at || '-'}</Text>
      </View>
      </TouchableOpacity>
      {!item.is_read && (
        <TouchableOpacity style={styles.readBtn} onPress={() => markRead(item.id)} activeOpacity={0.6}>
          <Text style={styles.readTxt}>Read</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Notifikasi',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
          headerBackVisible: false, headerBackTitleVisible: false,
          headerLeft: () => <HeaderBackButton color="#fff" />,
        }}
      />

      {unreadNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={48} color={theme.colors.border} />
          <Text style={styles.emptyText}>Tidak ada notifikasi baru.</Text>
        </View>
      ) : (
        <>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.readAllBtn} onPress={readAll} activeOpacity={0.7}>
              <Text style={styles.readAllTxt}>Read All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={unreadNotifications}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  list: { padding: theme.spacing.md },
  card: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.sm, padding: theme.spacing.md },
  cardBody: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  iconContainer: { backgroundColor: theme.colors.primaryLight, padding: 10, borderRadius: theme.borderRadius.full, marginRight: theme.spacing.md },
  content: { flex: 1, marginRight: theme.spacing.sm },
  title: { ...theme.typography.body, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
  message: { ...theme.typography.caption, lineHeight: 20, marginBottom: 6 },
  date: { ...theme.typography.caption, fontSize: 12, color: theme.colors.textSecondary },
  readBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: theme.colors.primaryLight, borderRadius: theme.borderRadius.md },
  readTxt: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: theme.spacing.md },
  actionRow: { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md, alignItems: 'flex-end' },
  readAllBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: theme.colors.primaryLight, borderRadius: theme.borderRadius.md },
  readAllTxt: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
});
