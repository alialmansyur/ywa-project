import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../../../constants/AppTheme';
import { Card } from '../../../../components/common/Card';
import { HeaderBackButton } from '../../../../components/common/HeaderBackButton';
import { CheckCircle2, CircleDashed } from 'lucide-react-native';
import { workshopService } from '../../../../services/workshop.service';
import { workOrdersService } from '../../../../services/work-orders.service';
import { MENU_BAR_CONTENT_PADDING } from '../../../../constants/menu-bar';
import { useMechanicAccessGuard } from '../../../../hooks/useMechanicAccessGuard';

const STEP_LABELS = {
  10: 'Registrasi Kedatangan',
  20: 'Approval Kedatangan',
  30: 'Cuci Unit (Washing Bay)',
  40: 'Inspeksi Awal & PKB',
  50: 'Pengecekan Unit',
  60: 'Antrian / Waiting Bay',
  70: 'Pembuatan WO & Jobcard',
  80: 'Proses Perbaikan',
  90: 'QC Perbaikan',
  100: 'Ready Bay & Closing Admin',
  110: 'Serah Terima Unit',
};

const STEP_ORDERS = Object.keys(STEP_LABELS).map(Number);

const pretty = (key) =>
  String(key || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID');
};

export default function MechanicCompletedDetail() {
  const { isRestrictedRole } = useMechanicAccessGuard();
  const { work_order_id } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [header, setHeader] = useState({
    code: '-',
    status: '-',
    unit: '-',
    unitCode: '-',
    plateNo: '-',
    title: '-',
    registeredAt: '-',
    completedAt: '-',
  });
  const [steps, setSteps] = useState([]);

  const load = useCallback(async () => {
    if (isRestrictedRole || !work_order_id) return;
    try {
      const [wo, process, timeline] = await Promise.all([
        workOrdersService.getById(String(work_order_id)),
        workshopService.processData(String(work_order_id)),
        workshopService.processTimeline(String(work_order_id)),
      ]);

      setHeader({
        code: wo?.code || '-',
        status: String(wo?.status || '-').replaceAll('_', ' ').toUpperCase(),
        unit: wo?.asset?.name || '-',
        unitCode: wo?.asset?.code || '-',
        plateNo: wo?.asset?.veh_plate_no || wo?.asset?.plate_number || '-',
        title: wo?.title || '-',
        registeredAt: formatDateTime(wo?.created_at),
        completedAt: formatDateTime(wo?.actual_end || wo?.updated_at),
      });

      const instances = process?.instances || [];
      const latestInstance = instances[0] || null;
      const logs = (latestInstance?.step_logs || []).slice().sort((a, b) => a.step_order - b.step_order);

      const timelineRows = Array.isArray(timeline) ? timeline : timeline?.timeline || [];
      const stationDataByStep = {};

      timelineRows.forEach((row) => {
        if (row?.type !== 'process_event') return;
        if (row?.title !== 'STEP_OUT') return;
        const sourceStep = Number(row?.payload?.source_step_order ?? row?.payload?.sourceStepOrder ?? row?.source_step_order);
        if (!sourceStep) return;
        const stationData = row?.payload?.station_data || null;
        if (stationData && typeof stationData === 'object') {
          stationDataByStep[sourceStep] = stationData;
        }
      });

      const composed = STEP_ORDERS.map((stepOrder) => {
        const log = logs.find((x) => Number(x.step_order) === stepOrder);
        const stationData = stationDataByStep[stepOrder] || {};
        return {
          stepOrder,
          title: STEP_LABELS[stepOrder],
          status: log?.status || 'pending',
          startAt: formatDateTime(log?.process_in_at),
          endAt: formatDateTime(log?.process_out_at),
          notes: log?.notes || '-',
          stationData,
        };
      });

      setSteps(composed);
    } catch (_e) {
    } finally {
      setRefreshing(false);
    }
  }, [isRestrictedRole, work_order_id]);

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
          title: 'Detail Pengerjaan',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerLeft: () => <HeaderBackButton color="#fff" />,
        }}
      />

      <Card style={styles.headerCard}>
        <Text style={styles.woCode}>{header.code}</Text>
        <Text style={styles.title}>{header.title}</Text>
        <Text style={styles.meta}>Unit: {header.unit} ({header.unitCode})</Text>
        <Text style={styles.meta}>No Pol: {header.plateNo}</Text>
        <Text style={styles.meta}>Status: {header.status}</Text>
        <Text style={styles.meta}>Registrasi Masuk: {header.registeredAt}</Text>
        <Text style={styles.meta}>Selesai: {header.completedAt}</Text>
      </Card>

      <Card style={styles.timelineCard}>
        <Text style={styles.sectionTitle}>Timeline Detail Pengerjaan</Text>
        {steps.map((step, index) => {
          const isDone = step.status === 'done' || step.status === 'waiting_approval';
          const isLast = index === steps.length - 1;
          const stationEntries = Object.entries(step.stationData || {}).filter(([k, v]) => k !== 'step_code' && v !== null && v !== '');

          return (
            <View key={step.stepOrder} style={styles.itemRow}>
              <View style={styles.leftCol}>
                {isDone ? <CheckCircle2 size={22} color={theme.colors.success} /> : <CircleDashed size={22} color={theme.colors.border} />}
                {!isLast && <View style={[styles.line, { backgroundColor: isDone ? theme.colors.success : theme.colors.border }]} />}
              </View>

              <View style={styles.contentCol}>
                <Text style={[styles.stepTitle, isDone ? styles.stepDone : styles.stepPending]}>{step.title}</Text>
                <Text style={styles.timeText}>Start: {step.startAt}</Text>
                <Text style={styles.timeText}>End: {step.endAt}</Text>
                <Text style={styles.notesText}>Catatan: {step.notes}</Text>

                {stationEntries.length > 0 && (
                  <View style={styles.formBox}>
                    <Text style={styles.formTitle}>Isian Form</Text>
                    {stationEntries.map(([k, v]) => (
                      <Text key={`${step.stepOrder}-${k}`} style={styles.formItem}>
                        {pretty(k)}: {Array.isArray(v) ? JSON.stringify(v) : String(v)}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </Card>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  headerCard: { margin: theme.spacing.md },
  woCode: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '700' },
  title: { ...theme.typography.h3, color: theme.colors.text, marginTop: 4, marginBottom: 8 },
  meta: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 3 },
  timelineCard: { marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.md },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.md },
  itemRow: { flexDirection: 'row', minHeight: 72 },
  leftCol: { width: 24, alignItems: 'center', marginRight: theme.spacing.md },
  line: { width: 2, flex: 1, marginVertical: 4 },
  contentCol: { flex: 1, paddingBottom: theme.spacing.lg },
  stepTitle: { ...theme.typography.body, fontWeight: '700', marginBottom: 4 },
  stepDone: { color: theme.colors.text },
  stepPending: { color: theme.colors.textSecondary },
  timeText: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 2 },
  notesText: { ...theme.typography.caption, color: theme.colors.text, marginTop: 2 },
  formBox: { marginTop: 8, padding: 8, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, backgroundColor: theme.colors.background },
  formTitle: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '700', marginBottom: 6 },
  formItem: { ...theme.typography.caption, color: theme.colors.text, marginBottom: 2 },
});
