import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, AlertTriangle, ClipboardList, History, User } from 'lucide-react-native';
import { theme } from '../../constants/AppTheme';
import { getMenuBarHeight, getMenuBarPaddingBottom, MENU_BAR_PADDING_TOP } from '../../constants/menu-bar';

const MENUS = [
  { key: 'home', label: 'Beranda', icon: Home, route: '/(tabs)' },
  { key: 'report', label: 'Lapor', icon: AlertTriangle, route: '/(tabs)/report' },
  { key: 'wo', label: 'WO', icon: ClipboardList, route: '/(tabs)/work-orders' },
  { key: 'history', label: 'Riwayat', icon: History, route: '/(tabs)/history' },
  { key: 'profile', label: 'Profil', icon: User, route: '/(tabs)/profile' },
];

export function FloatingMenuBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const menuBarHeight = getMenuBarHeight(insets.bottom);
  const menuBarPaddingBottom = getMenuBarPaddingBottom(insets.bottom);

  const isActive = (key) => {
    if (key === 'home') return pathname === '/(tabs)' || pathname === '/(tabs)/index';
    if (key === 'report') return pathname.includes('/report');
    if (key === 'wo') return pathname.includes('/work-orders') || pathname.includes('/workshop') || pathname.includes('/mechanic');
    if (key === 'history') return pathname.includes('/history');
    if (key === 'profile') return pathname.includes('/profile');
    return false;
  };

  return (
    <View style={[styles.wrap, { height: menuBarHeight, paddingBottom: menuBarPaddingBottom }]}>
      {MENUS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.key);
        const color = active ? theme.colors.primary : theme.colors.textSecondary;
        return (
          <TouchableOpacity key={item.key} style={styles.btn} onPress={() => router.replace(item.route)} activeOpacity={0.8}>
            <Icon size={24} color={color} />
            <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: MENU_BAR_PADDING_TOP,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  labelActive: {
    color: theme.colors.primary,
  },
});
