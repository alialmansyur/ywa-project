import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../constants/AppTheme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { Clock, ChevronRight, AlertTriangle, ClipboardList } from 'lucide-react-native';
import { workOrdersService } from '../../services/work-orders.service';
import { workshopService } from '../../services/workshop.service';
import { useActiveAssetStore } from '../../stores/active-asset.store';
import { getCurrentMonthRange } from '../../utils/dateRange';

const toDisplayStatus = (raw) => String(raw || '').replaceAll('_', ' ').toUpperCase();
const STATION_STEP_CODES = ['WASHING_BAY', 'INSPECTION_PKB', 'CHECKING', 'WAITING_BAY', 'CREATE_WO', 'REPAIR', 'QC', 'READY_BAY_CLOSE', 'HANDOVER'];

const resolveStatus = (wo, process) => {
  const base = String(wo?.status || '').toLowerCase();
  const latest = (process?.instances || [])[0] || null;
  const logs = latest?.step_logs || [];
  const handover = logs.find((x) => Number(x.step_order) === 110 || x.step_code === 'HANDOVER');

  const isCompletedByFlow =
    String(latest?.state || '').toLowerCase() === 'done' ||
    ['completed', 'cancelled'].includes(base) ||
    (handover && String(handover.status || '').toLowerCase() === 'done');

  if (isCompletedByFlow) return 'COMPLETED';
  return toDisplayStatus(base || 'unknown');
};

const getDuration = (startValue, endValue = null) => {
  if (!startValue) return '-';
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) return '-';
  const end = endValue ? new Date(endValue) : new Date();
  const mins = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}j ${m}m` : `${m}m`;
};

export default function WorkOrdersScreen() {
  const [loading, setLoading] = React.useState(true);
  const [workOrders, setWorkOrders] = React.useState([]);
  const { activeAsset, loadCurrentAssignment } = useActiveAssetStore();
  const monthRange = getCurrentMonthRange();

  React.useEffect(() => {
    const load = async () => {
      try {
        await loadCurrentAssignment().catch(() => {});
        const res = await workOrdersService.getAll(1, 50, undefined, undefined, undefined, monthRange.from, monthRange.to);
        const items = (res.items || []).filter((x) => !activeAsset?.id || String(x?.asset_id || x?.asset?.id || '') === String(activeAsset.id));

        const enriched = await Promise.all(
          items.map(async (item) => {
            try {
              const process = await workshopService.processData(String(item.id));
              const status = resolveStatus(item, process);
              const latest = (process?.instances || [])[0] || null;
              const stepLogs = latest?.step_logs || [];
              const stationLogs = stepLogs.filter((x) => STATION_STEP_CODES.includes(String(x.step_code || '').toUpperCase()));
              const doneCountRaw = stationLogs.filter((x) => String(x.status).toLowerCase() === 'done').length;
              const activeCount = stationLogs.some((x) => ['in_progress', 'hold'].includes(String(x.status).toLowerCase())) ? 1 : 0;
              const doneCount = status === 'COMPLETED' ? 9 : Math.min(9, doneCountRaw + activeCount);
              const totalCount = 9;

              return {
                ...item,
                resolved_status: status,
                done_steps: doneCount,
                total_steps: totalCount,
              };
            } catch (_e) {
              return {
                ...item,
                resolved_status: toDisplayStatus(item.status),
                done_steps: 0,
                total_steps: 9,
              };
            }
          }),
        );

        setWorkOrders(enriched);
      } catch (_e) {
        setWorkOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeAsset?.id, loadCurrentAssignment, monthRange.from, monthRange.to]);

  if (!activeAsset?.id) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <AlertTriangle size={80} color={theme.colors.warning} style={{ marginBottom: 24 }} />
        <Text style={{ ...theme.typography.h2, color: theme.colors.text, marginBottom: 8, textAlign: 'center' }}>Unit Belum Ditautkan</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center' }}>
          Silakan assign aset terlebih dahulu untuk melihat WO.
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const status = item.resolved_status || toDisplayStatus(item.status);
    const badgeVariant = status === 'COMPLETED' ? 'success' : status.includes('PENDING') || status.includes('HOLD') ? 'warning' : 'primary';

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/(tabs)/workshop/detail?work_order_id=${item.id}`)}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.id}>[{item.code || item.id}]</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>Unit: {item?.asset?.name || '-'} ({item?.asset?.code || '-'})</Text>
              <Text style={styles.meta}>No Pol: {item?.asset?.veh_plate_no || item?.asset?.plate_number || '-'}</Text>
            </View>
            <Badge text={status} variant={badgeVariant} />
          </View>

          <View style={styles.footer}>
            <View style={styles.detailBox}>
              <Clock size={14} color={theme.colors.textSecondary} />
              <Text style={styles.date}>{String(item.created_at || '').slice(0, 10)}</Text>
              <Text style={styles.divider}>|</Text>
              <Text style={[styles.priority, item.priority === 'high' || item.priority === 'critical' ? styles.priorityHigh : null]}>
                Priority: {item.priority || '-'}
              </Text>
            </View>
            <ChevronRight size={20} color={theme.colors.primary} />
          </View>

          <View style={styles.extraRow}>
            <Text style={styles.extraText}>Progress: {item.done_steps}/{item.total_steps} step</Text>
            <Text style={styles.extraText}>Durasi: {getDuration(item.created_at, status === 'COMPLETED' ? item.actual_end || item.updated_at : null)}</Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}><ClipboardList size={20} color={theme.colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Work Order Bulan Ini</Text>
          <Text style={styles.heroDesc}>Pantau seluruh WO unit aktif Anda dalam satu tampilan.</Text>
        </View>
      </View>
      {loading ? (
        <View style={styles.list}>
          <Card style={styles.card}><Skeleton height={120} width="100%" /></Card>
          <Card style={styles.card}><Skeleton height={120} width="100%" /></Card>
        </View>
      ) : (
        <FlatList
          data={workOrders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<View style={styles.emptyBox}><Text style={styles.emptyText}>Belum ada data tersedia.</Text><TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/workshop')}><Text style={styles.emptyBtnText}>Buka Workshop</Text></TouchableOpacity></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  hero: { margin: theme.spacing.md, marginBottom: 0, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center' },
  heroIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  heroTitle: { ...theme.typography.body, fontWeight: '700', color: theme.colors.text },
  heroDesc: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
  list: { padding: theme.spacing.md },
  card: { marginBottom: theme.spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md },
  headerInfo: { flex: 1, marginRight: theme.spacing.sm, minWidth: 0 },
  id: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '700' },
  title: { ...theme.typography.body, fontWeight: '700', color: theme.colors.text, marginTop: 2, flexShrink: 1, flexWrap: 'wrap' },
  meta: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2, flexShrink: 1, flexWrap: 'wrap' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm },
  detailBox: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0, paddingRight: 8 },
  date: { ...theme.typography.caption, marginLeft: theme.spacing.xs, color: theme.colors.textSecondary },
  divider: { ...theme.typography.caption, marginHorizontal: 6, color: theme.colors.textSecondary },
  priority: { ...theme.typography.caption, fontWeight: '600', color: theme.colors.textSecondary, flexShrink: 1, flexWrap: 'wrap' },
  priorityHigh: { color: theme.colors.error },
  extraRow: { marginTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 8, minWidth: 0 },
  extraText: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 2, flexShrink: 1, flexWrap: 'wrap' },
  emptyBox: { paddingVertical: theme.spacing.xl, alignItems: 'center' },
  emptyText: { ...theme.typography.body, color: theme.colors.textSecondary },
  emptyBtn: { marginTop: 10, backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.full, paddingHorizontal: 14, paddingVertical: 8 },
  emptyBtnText: { ...theme.typography.caption, color: '#fff', fontWeight: '700' },
});
