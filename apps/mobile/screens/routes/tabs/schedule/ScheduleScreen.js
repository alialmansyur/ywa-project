import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../../constants/AppTheme';
import { Card } from '../../../../components/common/Card';
import { HeaderBackButton } from '../../../../components/common/HeaderBackButton';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react-native';
import { scheduleService } from '../../../../services/schedule.service';
import { getMenuBarContentPadding } from '../../../../constants/menu-bar';

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [calendar, setCalendar] = useState({ days: {} });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await scheduleService.calendar(year, month);
        setCalendar(data || { days: {} });
      } catch (_e) {
        setCalendar({ days: {} });
      }
    };
    load();
  }, [year, month]);

  const dates = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [year, month]);

  const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
  const selectedEvents = calendar.days?.[dateKey]?.count || 0;
  const selectedItems = calendar.events_by_day?.[dateKey] || [];
  const menuBarContentPadding = getMenuBarContentPadding(insets.bottom);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: menuBarContentPadding }}>
        <Stack.Screen
          options={{
            title: 'Jadwal & Kalender',
            headerShown: true,
            headerStyle: { backgroundColor: theme.colors.primary },
            headerTintColor: '#fff',
            headerBackVisible: false,
            headerBackTitleVisible: false,
            headerLeft: () => <HeaderBackButton color="#fff" />,
          }}
        />
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              setMonth((m) => {
                if (m === 1) {
                  setYear((y) => y - 1);
                  return 12;
                }
                return m - 1;
              });
            }}
          >
            <ChevronLeft color={theme.colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{`${month} / ${year}`}</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              setMonth((m) => {
                if (m === 12) {
                  setYear((y) => y + 1);
                  return 1;
                }
                return m + 1;
              });
            }}
          >
            <ChevronRight color={theme.colors.text} size={24} />
          </TouchableOpacity>
        </View>
        <Card style={styles.calendarCard}>
          <View style={styles.weekRow}>{DAYS.map((day) => <Text key={day} style={styles.dayText}>{day}</Text>)}</View>
          <View style={styles.datesGrid}>
            {dates.map((date) => {
              const isSelected = date === selectedDate;
              const key = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
              const hasEvent = !!calendar.days?.[key]?.count;
              return (
                <TouchableOpacity key={date} style={[styles.dateBox, isSelected && styles.dateBoxSelected]} onPress={() => setSelectedDate(date)}>
                  <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>{date}</Text>
                  {hasEvent && <View style={[styles.eventDot, isSelected && styles.eventDotSelected]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
        <View style={styles.eventSection}>
          <Text style={styles.sectionTitle}>Jadwal pada {selectedDate}/{month}/{year}</Text>
          {selectedEvents === 0 ? (
            <View style={styles.emptyBox}>
              <CalendarIcon size={40} color={theme.colors.border} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyText}>Tidak ada jadwal pada tanggal ini.</Text>
            </View>
          ) : (
            <>
              <Card style={styles.eventCard}>
                <View style={styles.eventTimeBox}>
                  <Clock size={16} color={theme.colors.primary} />
                  <Text style={styles.eventTime}>Ada</Text>
                </View>
                <View style={styles.eventDivider} />
                <Text style={styles.eventTitle}>{selectedEvents} jadwal maintenance</Text>
              </Card>
              {selectedItems.map((item) => (
                <Card key={item.id} style={styles.eventCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle}>{item.name}</Text>
                    <Text style={styles.eventMeta}>{item?.asset?.code || '-'} • {item?.asset?.name || '-'}</Text>
                    <Text style={styles.eventMeta}>Status: {item.status || '-'}</Text>
                  </View>
                </Card>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.surface }, calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: '#fff' }, iconBtn: { padding: theme.spacing.xs }, monthText: { ...theme.typography.h3, color: theme.colors.text }, calendarCard: { margin: theme.spacing.md, marginTop: 0, padding: theme.spacing.sm }, weekRow: { flexDirection: 'row', marginBottom: theme.spacing.sm }, dayText: { flex: 1, textAlign: 'center', ...theme.typography.caption, fontWeight: '600', color: theme.colors.textSecondary }, datesGrid: { flexDirection: 'row', flexWrap: 'wrap' }, dateBox: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.xs, borderRadius: theme.borderRadius.full }, dateBoxSelected: { backgroundColor: theme.colors.primary }, dateText: { ...theme.typography.body, color: theme.colors.text }, dateTextSelected: { color: '#fff', fontWeight: 'bold' }, eventDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.error, marginTop: 4 }, eventDotSelected: { backgroundColor: '#fff' }, eventSection: { padding: theme.spacing.md }, sectionTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.md }, eventCard: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, marginBottom: theme.spacing.sm }, eventTimeBox: { flexDirection: 'row', alignItems: 'center', width: 70 }, eventTime: { ...theme.typography.body, fontWeight: '600', color: theme.colors.primary, marginLeft: 4 }, eventDivider: { width: 1, height: 30, backgroundColor: theme.colors.border, marginHorizontal: theme.spacing.md }, eventTitle: { ...theme.typography.body, color: theme.colors.text }, eventMeta: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 4 }, emptyBox: { alignItems: 'center', padding: theme.spacing.lg }, emptyText: { ...theme.typography.body, color: theme.colors.textSecondary } });
