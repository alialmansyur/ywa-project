import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../../constants/AppTheme';
import { Card } from '../../../../components/common/Card';
import { HeaderBackButton } from '../../../../components/common/HeaderBackButton';
import { ShieldCheck } from 'lucide-react-native';
import { scheduleService } from '../../../../services/schedule.service';
import { getMenuBarContentPadding } from '../../../../constants/menu-bar';

export default function PreventiveScreen() {
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState([]);
  const menuBarContentPadding = getMenuBarContentPadding(insets.bottom);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await scheduleService.upcoming(30);
        setRows(res?.schedules || res?.data || []);
      } catch (_e) {
        setRows([]);
      }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: menuBarContentPadding }}>
      <Stack.Screen options={{ title: 'Cek Preventive', headerShown: true, headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: '#fff', headerBackVisible: false, headerBackTitleVisible: false, headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <View style={styles.header}><ShieldCheck size={48} color={theme.colors.primary} style={{ marginBottom: 16 }} /><Text style={styles.title}>Preventive Maintenance</Text><Text style={styles.subtitle}>Jadwal preventive 30 hari ke depan berdasarkan data sistem.</Text></View>
      <View style={styles.content}>
        {rows.map((item) => (
          <Card style={styles.card} key={item.id}>
            <Text style={styles.sectionTitle}>{item.name || 'Jadwal Preventive'}</Text>
            <Text style={styles.listText}>Unit: {item?.asset?.name || '-'} ({item?.asset?.code || '-'})</Text>
            <Text style={styles.listText}>Due Date: {String(item.next_due_at || '-').slice(0, 10)}</Text>
            <Text style={styles.listText}>Status: {item.status || '-'}</Text>
          </Card>
        ))}
        {rows.length === 0 && <Card style={styles.card}><Text style={styles.listText}>Belum ada jadwal preventive mendatang.</Text></Card>}
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.surface }, header: { padding: theme.spacing.xl, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.border }, title: { ...theme.typography.h2, color: theme.colors.text, marginBottom: theme.spacing.xs }, subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 }, content: { padding: theme.spacing.md }, card: { padding: theme.spacing.lg, marginBottom: theme.spacing.md }, sectionTitle: { ...theme.typography.h3, color: theme.colors.primary, marginBottom: theme.spacing.md }, listText: { ...theme.typography.body, color: theme.colors.text, marginBottom: 4 } });
