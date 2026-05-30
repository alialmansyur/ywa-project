import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { theme } from '../../constants/AppTheme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { CheckCircle2, Clock, History as HistoryIcon } from 'lucide-react-native';
import { workOrdersService } from '../../services/work-orders.service';
import { p2hService } from '../../services/p2h.service';
import { workshopService } from '../../services/workshop.service';
import { SearchFilterPanel } from '../../components/common/SearchFilterPanel';
import { useActiveAssetStore } from '../../stores/active-asset.store';
import { getCurrentMonthRange } from '../../utils/dateRange';

const toDisplayStatus = (raw) => String(raw || '').replaceAll('_', ' ').toUpperCase();

const resolveWorkshopStatus = (wo, processData) => {
  const base = String(wo?.status || '').toLowerCase();
  const instances = processData?.instances || [];
  const latest = instances[0] || null;
  const logs = latest?.step_logs || [];

  const handover = logs.find((x) => Number(x.step_order) === 110 || x.step_code === 'HANDOVER');
  const finishedByProcess =
    String(latest?.state || '').toLowerCase() === 'done' ||
    ['completed', 'cancelled'].includes(base) ||
    (handover && String(handover.status).toLowerCase() === 'done');

  if (finishedByProcess) return 'COMPLETED';
  if (base) return toDisplayStatus(base);
  return 'UNKNOWN';
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

export default function HistoryScreen() {
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState([]);
  const monthRange = getCurrentMonthRange();
  const [filters, setFilters] = React.useState({ search: '', from: monthRange.from, to: monthRange.to });
  const { activeAsset, loadCurrentAssignment } = useActiveAssetStore();

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await loadCurrentAssignment().catch(() => {});
        const [wo, p2h] = await Promise.all([
          workOrdersService.getAll(1, 15, undefined, undefined, filters.search, filters.from, filters.to),
          p2hService.getHistory(activeAsset?.id, 1, 10, filters.search, filters.from, filters.to),
        ]);

        const woItems = (wo.items || []).filter((x) => !activeAsset?.id || String(x?.asset_id || x?.asset?.id || '') === String(activeAsset.id));
        const woWithProcess = await Promise.all(
          woItems.map(async (x) => {
            try {
              const process = await workshopService.processData(String(x.id));
              const status = resolveWorkshopStatus(x, process);
              return {
                id: `WO-${x.id}`,
                refId: x.id,
                type: 'WO',
                title: x.title || '-',
                code: x.code || `WO-${x.id}`,
                unitName: x?.asset?.name || '-',
                unitCode: x?.asset?.code || '-',
                plateNo: x?.asset?.veh_plate_no || x?.asset?.plate_number || '-',
                status,
                dateRaw: x.updated_at || x.created_at || null,
                date: String(x.updated_at || x.created_at || '').slice(0, 10),
                duration: getDuration(x.created_at, status === 'COMPLETED' ? x.actual_end || x.updated_at : null),
              };
            } catch (_err) {
              return {
                id: `WO-${x.id}`,
                refId: x.id,
                type: 'WO',
                title: x.title || '-',
                code: x.code || `WO-${x.id}`,
                unitName: x?.asset?.name || '-',
                unitCode: x?.asset?.code || '-',
                plateNo: x?.asset?.veh_plate_no || x?.asset?.plate_number || '-',
                status: toDisplayStatus(x.status),
                dateRaw: x.updated_at || x.created_at || null,
                date: String(x.updated_at || x.created_at || '').slice(0, 10),
                duration: getDuration(x.created_at),
              };
            }
          }),
        );

        const p2hRows = (p2h.data || []).map((x) => ({
          id: `P2H-${x.id}`,
          refId: x.id,
          type: 'P2H',
          title: `P2H - ${x?.asset?.name || '-'}`,
          code: `P2H-${x.id}`,
          unitName: x?.asset?.name || '-',
          unitCode: x?.asset?.code || '-',
          plateNo: x?.asset?.veh_plate_no || x?.asset?.plate_number || '-',
          status: toDisplayStatus(x.status || 'submitted'),
          dateRaw: x.created_at || null,
          date: String(x.created_at || '').slice(0, 10),
          duration: '-',
        }));

        const combined = [...woWithProcess, ...p2hRows].sort((a, b) => {
          const ta = a.dateRaw ? new Date(a.dateRaw).getTime() : 0;
          const tb = b.dateRaw ? new Date(b.dateRaw).getTime() : 0;
          return tb - ta;
        });

        setRows(combined.slice(0, 30));
      } catch (_e) {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeAsset?.id, filters, loadCurrentAssignment]);

  const renderItem = ({ item }) => {
    const statusVariant = item.status === 'COMPLETED' ? 'success' : item.status.includes('HOLD') || item.status.includes('PENDING') ? 'warning' : 'primary';
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <CheckCircle2 size={18} color={item.status === 'COMPLETED' ? theme.colors.success : theme.colors.textSecondary} style={styles.icon} />
            <Text style={styles.title}>{item.title}</Text>
          </View>
          <Badge text={item.status} variant={statusVariant} />
        </View>

        <Text style={styles.meta}>Ref: {item.code} • {item.type}</Text>
        <Text style={styles.meta}>Unit: {item.unitName} ({item.unitCode})</Text>
        <Text style={styles.meta}>No Pol: {item.plateNo}</Text>

        <View style={styles.footer}>
          <Text style={styles.idText}>{item.id}</Text>
          <View style={styles.durationBox}>
            <Clock size={12} color={theme.colors.textSecondary} />
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}><HistoryIcon size={20} color={theme.colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Riwayat Aktivitas</Text>
          <Text style={styles.heroDesc}>Gabungan history WO dan P2H berdasarkan unit aktif.</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md }}>
        <SearchFilterPanel placeholder="Cari riwayat (kode/unit/no pol...)" onFilter={(f) => setFilters((prev) => ({ ...prev, ...f }))} />
      </View>
      {loading ? (
        <View style={styles.list}>
          <Card style={styles.card}><Skeleton height={120} width="100%" /></Card>
          <Card style={styles.card}><Skeleton height={120} width="100%" /></Card>
          <Card style={styles.card}><Skeleton height={120} width="100%" /></Card>
        </View>
      ) : (
        <FlatList data={rows} keyExtractor={(item, index) => `${item.id}-${index}`} renderItem={renderItem} contentContainerStyle={styles.list} ListEmptyComponent={<View style={styles.emptyBox}><Text style={styles.emptyText}>Belum ada riwayat.</Text></View>} />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: theme.spacing.sm },
  icon: { marginRight: theme.spacing.sm },
  title: { ...theme.typography.body, fontWeight: '600', color: theme.colors.text, flexShrink: 1 },
  meta: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm, marginTop: theme.spacing.xs },
  idText: { ...theme.typography.caption, fontWeight: '700', color: theme.colors.primary, flex: 1 },
  durationBox: { flexDirection: 'row', alignItems: 'center' },
  durationText: { ...theme.typography.caption, marginLeft: 4, color: theme.colors.textSecondary, fontWeight: '600' },
  dateText: { ...theme.typography.caption, marginLeft: 8, color: theme.colors.textSecondary },
  emptyBox: { paddingVertical: theme.spacing.xl, alignItems: 'center' },
  emptyText: { ...theme.typography.body, color: theme.colors.textSecondary },
});
