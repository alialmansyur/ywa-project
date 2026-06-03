import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../../../constants/AppTheme';
import { Card } from '../../../../components/common/Card';
import { HeaderBackButton } from '../../../../components/common/HeaderBackButton';
import { Clock, Truck, CheckCircle2, CircleDashed } from 'lucide-react-native';
import { workshopService } from '../../../../services/workshop.service';
import { workOrdersService } from '../../../../services/work-orders.service';
import { MENU_BAR_CONTENT_PADDING } from '../../../../constants/menu-bar';

const STATION_STEP_CODES = ['WASHING_BAY', 'INSPECTION_PKB', 'CHECKING', 'WAITING_BAY', 'CREATE_WO', 'REPAIR', 'QC', 'READY_BAY_CLOSE', 'HANDOVER'];

const DEFAULT_STATIONS = [
  { id: 1, step_code: 'REGISTRATION', title: 'Registrasi Kedatangan', status: 'pending', start_time: '-', end_time: '-' },
  { id: 2, step_code: 'APPROVAL', title: 'Approval Kedatangan', status: 'pending', start_time: '-', end_time: '-' },
  { id: 3, step_code: 'WASHING_BAY', title: 'Cuci Unit (Washing Bay)', status: 'pending', start_time: '-', end_time: '-' },
  { id: 4, step_code: 'INSPECTION_PKB', title: 'Inspeksi Awal & PKB', status: 'pending', start_time: '-', end_time: '-' },
  { id: 5, step_code: 'CHECKING', title: 'Pengecekan Unit', status: 'pending', start_time: '-', end_time: '-' },
  { id: 6, step_code: 'WAITING_BAY', title: 'Antrian / Waiting Bay', status: 'pending', start_time: '-', end_time: '-' },
  { id: 7, step_code: 'CREATE_WO', title: 'Pembuatan WO & Jobcard', status: 'pending', start_time: '-', end_time: '-' },
  { id: 8, step_code: 'REPAIR', title: 'Proses Perbaikan (Service Bay)', status: 'pending', start_time: '-', end_time: '-' },
  { id: 9, step_code: 'QC', title: 'QC Perbaikan', status: 'pending', start_time: '-', end_time: '-' },
  { id: 10, step_code: 'READY_BAY_CLOSE', title: 'Parkir Unit Ready & Closing', status: 'pending', start_time: '-', end_time: '-' },
  { id: 11, step_code: 'HANDOVER', title: 'Serah Terima Unit', status: 'pending', start_time: '-', end_time: '-' },
];

export default function WorkshopDetail() {
  const { work_order_id } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [stations, setStations] = useState(DEFAULT_STATIONS);
  const [header, setHeader] = useState({ asset: '-', desc: '-', status: '-', timeIn: '-', downtime: '-' });
  const [progress, setProgress] = useState({ doneSteps: 0, totalSteps: 9, ratio: 0 });

  const load = useCallback(async () => {
    if (!work_order_id) return;
    try {
      const wo = await workOrdersService.getById(String(work_order_id));
      const createdAt = wo?.created_at ? String(wo.created_at).slice(11, 16) : '-';
      const updatedAt = wo?.updated_at ? new Date(wo.updated_at) : null;
      const created = wo?.created_at ? new Date(wo.created_at) : null;
      const downMinutes = created && updatedAt ? Math.max(0, Math.floor((updatedAt - created) / 60000)) : 0;
      setHeader({
        asset: wo?.asset?.name || wo?.asset?.code || '-',
        desc: `${wo?.asset?.code || '-'} • ${wo?.title || '-'}`,
        status: (wo?.status || '-').replaceAll('_', ' ').toUpperCase(),
        timeIn: createdAt,
        downtime: downMinutes > 0 ? `${downMinutes} mnt` : '-',
      });

      const process = await workshopService.processData(String(work_order_id));
      const instances = process?.instances || [];
      const activeInstance = instances.find((i) => i.state === 'running' || i.state === 'hold') || instances[0];
      const logs = Array.isArray(activeInstance?.step_logs) ? activeInstance.step_logs : [];
      const fmt = (value) => (value ? new Date(value).toLocaleString('id-ID') : '-');

      const mapped = DEFAULT_STATIONS.map((step) => {
        const log = logs.find((x) => x.step_code === step.step_code);
        return {
          ...step,
          status: log?.status === 'done' || log?.status === 'waiting_approval' ? 'done' : 'pending',
          start_time: fmt(log?.process_in_at),
          end_time: fmt(log?.process_out_at),
        };
      });

      setStations(mapped);
      const stationLogs = logs.filter((s) => STATION_STEP_CODES.includes(String(s.step_code || '').toUpperCase()));
      const done = stationLogs.filter((s) => String(s.status || '').toLowerCase() === 'done').length;
      const active = stationLogs.some((s) => ['in_progress', 'hold'].includes(String(s.status || '').toLowerCase()));
      const doneSteps = String(wo?.status || '').toLowerCase() === 'completed' ? 9 : Math.min(9, done + (active ? 1 : 0));
      setProgress({ doneSteps, totalSteps: 9, ratio: doneSteps / 9 });
    } catch (_e) {
    } finally {
      setRefreshing(false);
    }
  }, [work_order_id]);

  React.useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  return (
    <View style={styles.container}>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: MENU_BAR_CONTENT_PADDING }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}>
      <Stack.Screen
        options={{
          title: 'Progress Workshop',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerLeft: () => <HeaderBackButton color="#fff" />,
        }}
      />
      <View style={styles.topSection}><View style={styles.assetHeader}><Truck size={28} color="#fff" /><View style={styles.assetInfo}><Text style={styles.assetCode}>{header.asset}</Text><Text style={styles.assetDesc}>{header.desc}</Text></View></View><View style={styles.metricRow}><View style={styles.metricBox}><Text style={styles.metricLabel}>Waktu Masuk</Text><Text style={styles.metricValue}>{header.timeIn}</Text></View><View style={styles.metricDivider} /><View style={styles.metricBox}><Text style={styles.metricLabel}>Status</Text><Text style={[styles.metricValue, { color: theme.colors.warning }]}>{header.status}</Text></View><View style={styles.metricDivider} /><View style={styles.metricBox}><Text style={styles.metricLabel}>Downtime</Text><Text style={[styles.metricValue, { color: theme.colors.error }]}>{header.downtime}</Text></View></View><View style={styles.progressWrap}><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.round((progress.ratio || 0) * 100)}%` }]} /></View><Text style={styles.progressText}>{progress.doneSteps}/{progress.totalSteps} step</Text></View></View>
      <View style={styles.content}><Text style={styles.sectionTitle}>Timeline Pengerjaan</Text><Card style={styles.timelineCard}>{stations.map((station, index) => { const isLast = index === stations.length - 1; const isDone = station.status === 'done'; return (<View key={station.id} style={styles.timelineItem}><View style={styles.timelineLeft}>{isDone ? <View style={styles.doneDot}><CheckCircle2 size={14} color="#fff" /></View> : <CircleDashed size={24} color={theme.colors.border} />}{!isLast && <View style={[styles.timelineLine, { backgroundColor: isDone ? theme.colors.success : theme.colors.border }]} />}</View><View style={styles.timelineContent}><Text style={[styles.timelineTitle, isDone ? styles.timelineTitleDone : styles.timelineTitlePending]}>{station.title}</Text><View style={styles.timelineTimeRow}><Clock size={12} color={theme.colors.textSecondary} /><Text style={styles.timelineTime}>Start: {station.start_time}</Text></View><View style={styles.timelineTimeRow}><Clock size={12} color={theme.colors.textSecondary} /><Text style={styles.timelineTime}>End: {station.end_time}</Text></View></View>{isDone && <CheckCircle2 size={18} color={theme.colors.success} />}</View>); })}</Card></View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.surface }, topSection: { backgroundColor: theme.colors.primary, padding: theme.spacing.lg, paddingBottom: theme.spacing.xl }, assetHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.lg }, assetInfo: { flex: 1, minWidth: 0, marginLeft: theme.spacing.md, paddingRight: theme.spacing.xs }, assetCode: { ...theme.typography.h2, color: '#fff', flexShrink: 1, flexWrap: 'wrap' }, assetDesc: { ...theme.typography.caption, color: theme.colors.primaryLight, marginTop: 2, flexShrink: 1, flexWrap: 'wrap' }, metricRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginTop: theme.spacing.xs }, metricBox: { flex: 1, alignItems: 'center' }, metricDivider: { width: 1, backgroundColor: theme.colors.border }, metricLabel: { ...theme.typography.caption, marginBottom: 4 }, metricValue: { ...theme.typography.h3, color: theme.colors.text }, progressWrap: { marginTop: theme.spacing.md }, progressTrack: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 999, overflow: 'hidden' }, progressFill: { height: 8, backgroundColor: '#fff', borderRadius: 999 }, progressText: { ...theme.typography.caption, color: '#fff', marginTop: 4 }, content: { padding: theme.spacing.md, marginTop: -theme.spacing.sm }, sectionTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.md, marginTop: theme.spacing.sm }, timelineCard: { padding: theme.spacing.lg }, timelineItem: { flexDirection: 'row', minHeight: 74 }, timelineLeft: { alignItems: 'center', marginRight: theme.spacing.md, width: 24 }, doneDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.success, alignItems: 'center', justifyContent: 'center' }, timelineLine: { width: 2, flex: 1, marginVertical: 4 }, timelineContent: { flex: 1, paddingBottom: theme.spacing.lg }, timelineTitle: { ...theme.typography.body, fontWeight: '600', marginBottom: 4 }, timelineTitleDone: { color: theme.colors.text, fontWeight: '700' }, timelineTitlePending: { color: theme.colors.textSecondary }, timelineTimeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 }, timelineTime: { ...theme.typography.caption, fontSize: 12, marginLeft: 4 }, });
