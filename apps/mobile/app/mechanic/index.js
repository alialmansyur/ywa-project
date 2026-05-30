import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../constants/AppTheme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { HeaderBackButton } from '../../components/common/HeaderBackButton';
import { Clock, Truck, Play, CheckCircle2, BookOpen } from 'lucide-react-native';
import { workshopService } from '../../services/workshop.service';
import { SearchFilterPanel } from '../../components/common/SearchFilterPanel';
import { getCurrentMonthRange } from '../../utils/dateRange';
import { workOrdersService } from '../../services/work-orders.service';
import { MENU_BAR_CONTENT_PADDING } from '../../constants/menu-bar';
import { useMechanicAccessGuard } from '../../hooks/useMechanicAccessGuard';

const STATION_STEP_CODES = ['WASHING_BAY', 'INSPECTION_PKB', 'CHECKING', 'WAITING_BAY', 'CREATE_WO', 'REPAIR', 'QC', 'READY_BAY_CLOSE', 'HANDOVER'];
const STATION_STEP_ORDER_TO_CODE = {
  30: 'WASHING_BAY',
  40: 'INSPECTION_PKB',
  50: 'CHECKING',
  60: 'WAITING_BAY',
  70: 'CREATE_WO',
  80: 'REPAIR',
  90: 'QC',
  100: 'READY_BAY_CLOSE',
  110: 'HANDOVER',
};

function deriveProgressFromQueueRow(row) {
  const stepCodeRaw = String(row?.step_code || '').toUpperCase();
  const stepStatusRaw = String(row?.step_status || '').toLowerCase();
  const currentStepOrder = Number(row?.current_step_order || 0);
  const stepCode = STATION_STEP_CODES.includes(stepCodeRaw)
    ? stepCodeRaw
    : STATION_STEP_ORDER_TO_CODE[currentStepOrder] || '';
  const idx = STATION_STEP_CODES.indexOf(stepCode);

  if (idx < 0) return { doneSteps: 0, totalSteps: 9, ratio: 0 };

  let doneSteps = idx;
  if (stepStatusRaw === 'done') doneSteps = idx + 1;
  if (stepStatusRaw === 'in_progress' || stepStatusRaw === 'hold') doneSteps = idx + 1;
  if (currentStepOrder >= 110 && (stepStatusRaw === 'done' || stepCode === 'HANDOVER')) doneSteps = 9;

  doneSteps = Math.max(0, Math.min(9, doneSteps));
  return { doneSteps, totalSteps: 9, ratio: doneSteps / 9 };
}

function pickBetterProgress(baseItem, candidateItem) {
  const baseDone = Number(baseItem?.doneSteps || 0);
  const candDone = Number(candidateItem?.doneSteps || 0);
  if (candDone > baseDone) return candidateItem;
  if (candDone < baseDone) return baseItem;

  const baseRatio = Number(baseItem?.ratio || 0);
  const candRatio = Number(candidateItem?.ratio || 0);
  if (candRatio > baseRatio) return candidateItem;
  return baseItem;
}

export default function MechanicHub() {
  const params = useLocalSearchParams();
  const { isRestrictedRole } = useMechanicAccessGuard();
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const loadSeqRef = useRef(0);
  const [activeTab, setActiveTab] = useState('approval');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [queueData, setQueueData] = useState([]);
  const [approvalData, setApprovalData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const monthRange = getCurrentMonthRange();
  const [historyFilter, setHistoryFilter] = useState({ search: '', from: monthRange.from, to: monthRange.to });

  React.useEffect(() => {
    const tab = String(params?.tab || '').toLowerCase();
    if (tab === 'queue') setActiveTab('queue');
    if (tab === 'approval') setActiveTab('approval');
    if (tab === 'history') setActiveTab('history');
  }, [params?.tab]);

  const getDurationLabel = (dateValue) => {
    if (!dateValue) return '-';
    const start = new Date(dateValue);
    if (Number.isNaN(start.getTime())) return '-';
    const diffMin = Math.max(0, Math.floor((Date.now() - start.getTime()) / 60000));
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return h > 0 ? `${h}j ${m}m` : `${m}m`;
  };

  const load = useCallback(async (silent = false) => {
    if (isRestrictedRole) return;
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    const loadSeq = ++loadSeqRef.current;
    try {
      if (!silent) setLoading(true);
      const [resQueue, resApproval, resCompleted, resOpen] = await Promise.all([
        workshopService.controlTowerWorkOrders(),
        workshopService.controlTowerApprovalQueue(),
        workOrdersService.getAll(1, 200, 'completed'),
        workOrdersService.getAll(1, 200),
      ]);

      const queueRows = Array.isArray(resQueue) ? resQueue : resQueue?.data || resQueue?.work_orders || [];
      const approvalRows = Array.isArray(resApproval) ? resApproval : resApproval?.data || [];
      const queueRowByWoId = new Map(
        queueRows.map((row) => [String(row?.wo_id || row?.id || ''), row]),
      );

      const mappedQueue = queueRows.map((r, idx) => {
        const createdAt = r.wo_created_at || r.created_at || null;
        const woStatus = String(r.wo_status || r.status || '');
        const stepCode = String(r.step_code || '');
        const stepStatus = String(r.step_status || '');
        const currentStepOrder = Number(r.current_step_order || 0);
        const instanceState = String(r.instance_state || '');
        const isFinished =
          ['completed', 'cancelled'].includes(woStatus) ||
          instanceState === 'done' ||
          (currentStepOrder >= 110 && stepCode === 'HANDOVER' && stepStatus === 'done');
        const progress = deriveProgressFromQueueRow(r);
        return {
        id: String(r.wo_id || r.id || `temp-${idx}`),
        code: r.wo_code || r.code || `WO-${r.id || idx}`,
        unit: r.asset?.code || r.asset_code || '-',
        unitName: r.asset?.name || r.asset_name || '-',
        plateNo: r.asset?.veh_plate_no || r.asset?.plate_number || r.asset_plate_no || '-',
        issue: r.title || r.wo_title || r.issue || '-',
        timeIn: createdAt ? String(createdAt).slice(11, 16) : '-',
        createdAt,
        priority: (r.wo_priority || r.priority) === 'critical' ? 'Kritis' : 'Normal',
        status: woStatus,
        isFinished,
        sla: getDurationLabel(createdAt),
        slaUrgent: (r.wo_priority || r.priority) === 'critical',
        ...progress,
        };
      });

      const mappedApproval = approvalRows.map((r, idx) => {
        const createdAt = r.wo_created_at || r.created_at || null;
        const queueRow = queueRowByWoId.get(String(r?.wo_id || r?.id || ''));
        const progress = queueRow
          ? deriveProgressFromQueueRow(queueRow)
          : deriveProgressFromQueueRow({
              step_code: r?.step_code,
              step_status: r?.step_status,
              current_step_order: r?.current_step_order,
            });
        return {
        id: String(r.wo_id || r.id || `reg-${idx}`),
        code: r.wo_code || r.code || `REG-${idx}`,
        unit: r.asset_code || r.asset?.code || '-',
        unitName: r.asset_name || r.asset?.name || '-',
        plateNo: r.asset?.veh_plate_no || r.asset?.plate_number || r.asset_plate_no || '-',
        issue: r.wo_title || r.title || '-',
        timeIn: createdAt ? String(createdAt).slice(11, 16) : '-',
        createdAt,
        priority: (r.wo_priority || r.priority) === 'critical' ? 'Kritis' : 'Normal',
        status: r.wo_status || r.status || '',
        sla: getDurationLabel(createdAt),
        slaUrgent: true,
        ...progress,
        };
      });

      const fifoSort = (a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ta - tb;
      };

      const normalizeStatus = (value) => String(value || '').toLowerCase();
      const openStatuses = ['registered', 'triage', 'pending', 'approved', 'in_progress', 'on_hold'];
      const mappedHistory = mappedQueue.filter((x) => x.isFinished || ['completed', 'cancelled'].includes(String(x.status)));
      const completedRows = (resCompleted?.items || []).map((r, idx) => {
        const createdAt = r.created_at || r.updated_at || null;
        return {
          id: String(r.id || `c-${idx}`),
          code: r.code || `WO-${r.id || idx}`,
          unit: r.asset?.code || '-',
          unitName: r.asset?.name || '-',
          plateNo: r.asset?.veh_plate_no || r.asset?.plate_number || '-',
          issue: r.title || '-',
          timeIn: createdAt ? String(createdAt).slice(11, 16) : '-',
          createdAt,
          priority: (r.priority || '') === 'critical' ? 'Kritis' : 'Normal',
          status: 'completed',
          isFinished: true,
          sla: getDurationLabel(createdAt),
          slaUrgent: (r.priority || '') === 'critical',
          doneSteps: 9,
          totalSteps: 9,
          ratio: 1,
        };
      });
      const openRowsFromWorkOrders = (resOpen?.items || [])
        .filter((x) => openStatuses.includes(normalizeStatus(x?.status)))
        .map((r, idx) => ({
          id: String(r.id || `o-${idx}`),
          code: r.code || `WO-${r.id || idx}`,
          unit: r.asset?.code || '-',
          unitName: r.asset?.name || '-',
          plateNo: r.asset?.veh_plate_no || r.asset?.plate_number || '-',
          issue: r.title || '-',
          timeIn: r.created_at ? String(r.created_at).slice(11, 16) : '-',
          createdAt: r.created_at || r.updated_at || null,
          priority: (r.priority || '') === 'critical' ? 'Kritis' : 'Normal',
          status: r.status || '',
          isFinished: false,
          sla: getDurationLabel(r.created_at || r.updated_at || null),
          slaUrgent: (r.priority || '') === 'critical',
          doneSteps: 0,
          totalSteps: 9,
          ratio: 0,
        }));
      const queueFromApproval = mappedApproval
        .filter((x) => openStatuses.includes(normalizeStatus(x.status)))
        .map((x) => ({
          ...x,
          isFinished: false,
          doneSteps: 0,
          totalSteps: 9,
          ratio: 0,
        }));
      const queueCandidates = [...mappedQueue, ...queueFromApproval, ...openRowsFromWorkOrders];
      const queueMap = new Map();
      queueCandidates.forEach((item) => {
        const key = String(item.id);
        const current = queueMap.get(key);
        if (!current) {
          queueMap.set(key, item);
          return;
        }
        queueMap.set(key, pickBetterProgress(current, item));
      });
      const dedupedQueueCandidates = Array.from(queueMap.values());
      const filteredQueue = dedupedQueueCandidates.filter(
        (x) => !x.isFinished && openStatuses.includes(normalizeStatus(x.status)),
      );

      if (loadSeq !== loadSeqRef.current) return;
      setQueueData(filteredQueue.sort(fifoSort));
      setApprovalData(mappedApproval.sort(fifoSort));
      const historyMap = new Map();
      [...mappedHistory, ...completedRows].forEach((item) => {
        historyMap.set(String(item.id), item);
      });
      const mergedHistory = Array.from(historyMap.values());
      setHistoryData(mergedHistory.sort(fifoSort));
    } catch (_e) {
      if (loadSeq !== loadSeqRef.current) return;
      setQueueData([]);
      setApprovalData([]);
      setHistoryData([]);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [isRestrictedRole]);

  useFocusEffect(
    useCallback(() => {
      if (isRestrictedRole) return undefined;
      if (!hasLoadedRef.current) return undefined;
      load(true);
      return undefined;
    }, [load, isRestrictedRole]),
  );

  React.useEffect(() => {
    if (isRestrictedRole) return;
    hasLoadedRef.current = true;
    load();
  }, [load, isRestrictedRole]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  const avgTimeLabel = useMemo(() => {
    if (!queueData.length) return '-';
    const minutes = queueData
      .map((x) => (x.createdAt ? Math.max(0, Math.floor((Date.now() - new Date(x.createdAt).getTime()) / 60000)) : 0))
      .filter((x) => Number.isFinite(x));
    if (!minutes.length) return '-';
    const avg = Math.floor(minutes.reduce((a, b) => a + b, 0) / minutes.length);
    const h = Math.floor(avg / 60);
    const m = avg % 60;
    return h > 0 ? `${h}j ${m}m` : `${m}m`;
  }, [queueData]);

  const filteredQueue = queueData
    .filter((item) => (activeFilter === 'Semua' ? true : item.priority === activeFilter))
    .sort((a, b) => {
      if (a.priority === 'Kritis' && b.priority !== 'Kritis') return -1;
      if (a.priority !== 'Kritis' && b.priority === 'Kritis') return 1;
      return 0;
    });
  const filteredHistory = historyData.filter((item) => {
    const kw = String(historyFilter.search || '').toLowerCase();
    const dateValue = String(item.createdAt || '').slice(0, 10);
    const inSearch = !kw || [item.code, item.unit, item.unitName, item.plateNo, item.issue].some((x) => String(x || '').toLowerCase().includes(kw));
    const inFrom = !historyFilter.from || dateValue >= historyFilter.from;
    const inTo = !historyFilter.to || dateValue <= historyFilter.to;
    return inSearch && inFrom && inTo;
  });

  const renderQueueItem = ({ item }) => (
    <Card style={[styles.queueCard, item.priority === 'Kritis' && styles.queueCardUrgent]}>
      <View style={styles.qHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.qId}>{item.code}</Text>
          {item.priority === 'Kritis' && <Badge text="KRITIS" variant="error" style={{ marginLeft: 8 }} />}
        </View>
        <Text style={styles.qTime}>Masuk: {item.timeIn}</Text>
      </View>
      <View style={styles.qBody}>
        <Truck size={24} color={theme.colors.textSecondary} />
        <View style={styles.qInfo}>
          <Text style={styles.qUnit}>{item.unit}</Text>
          <Text style={styles.qMeta}>Unit: {item.unitName}</Text>
          <Text style={styles.qMeta}>No Pol: {item.plateNo}</Text>
          <Text style={styles.qIssue}>{item.issue}</Text>
        </View>
      </View>
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round((item.ratio || 0) * 100)}%` }]} />
        </View>
        <Text style={styles.progressText}>{item.doneSteps || 0}/9 step</Text>
      </View>
      <View style={styles.qFooter}>
        <View style={styles.slaBox}>
          <Clock size={14} color={item.slaUrgent ? theme.colors.warning : theme.colors.textSecondary} />
          <Text style={[styles.slaText, item.slaUrgent && { color: theme.colors.warning }]}>{item.sla}</Text>
        </View>
        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.bookBtn} onPress={() => router.push('/(tabs)/guide')}>
            <BookOpen size={16} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              activeTab === 'history'
                ? router.push(`/(tabs)/mechanic/completed-detail?work_order_id=${item.id}`)
                : activeTab === 'approval'
                  ? router.push(`/(tabs)/mechanic/approval?work_order_id=${item.id}`)
                  : router.push(`/(tabs)/mechanic/process?work_order_id=${item.id}`)
            }
          >
            <Play size={16} color="#fff" />
            <Text style={styles.actionText}>{activeTab === 'history' ? 'Detail Pengerjaan' : activeTab === 'approval' ? 'Approval' : 'Eksekusi'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Workstation Mekanik', headerShown: true, headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: '#fff', headerBackVisible: false, headerBackTitleVisible: false, headerLeft: () => <HeaderBackButton color="#fff" /> }} />

      <View style={styles.kpiContainer}>
        <View style={styles.kpiBox}><Text style={styles.kpiValue}>{queueData.length}</Text><Text style={styles.kpiLabel}>Unit Antri</Text></View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiBox}><Text style={styles.kpiValue}>{queueData.filter((x) => x.priority === 'Kritis').length}</Text><Text style={styles.kpiLabel}>Kritis</Text></View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiBox}><Text style={styles.kpiValue}>{avgTimeLabel}</Text><Text style={styles.kpiLabel}>Avg. Time</Text></View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'approval' && styles.tabBtnActive]} onPress={() => setActiveTab('approval')}><Text style={[styles.tabText, activeTab === 'approval' && styles.tabTextActive]}>Approval</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'queue' && styles.tabBtnActive]} onPress={() => setActiveTab('queue')}><Text style={[styles.tabText, activeTab === 'queue' && styles.tabTextActive]}>Antrean</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]} onPress={() => setActiveTab('history')}><Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>Riwayat</Text></TouchableOpacity>
      </View>

      {activeTab === 'queue' && (
        <View style={styles.filterContainer}>
          {['Semua', 'Kritis', 'Normal'].map((filter) => (
            <TouchableOpacity key={filter} style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]} onPress={() => setActiveFilter(filter)}>
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading ? (
        <View style={styles.list}>
          <Card style={styles.queueCard}><Skeleton height={120} width="100%" /></Card>
          <Card style={styles.queueCard}><Skeleton height={120} width="100%" /></Card>
        </View>
      ) : activeTab === 'queue' ? (
        <FlatList data={filteredQueue} keyExtractor={(item, index) => `${item.id}-${index}`} renderItem={renderQueueItem} contentContainerStyle={styles.list} refreshControl={refreshControl} />
      ) : activeTab === 'approval' ? (
        <FlatList
          data={approvalData}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderQueueItem}
          contentContainerStyle={styles.list}
          refreshControl={refreshControl}
          ListEmptyComponent={<View style={styles.emptyBox}><CheckCircle2 size={40} color={theme.colors.border} /><Text style={styles.emptyText}>Belum ada registrasi menunggu approval.</Text></View>}
        />
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderQueueItem}
          contentContainerStyle={styles.list}
          refreshControl={refreshControl}
          ListHeaderComponent={<SearchFilterPanel placeholder="Cari riwayat pekerjaan..." onFilter={(f) => setHistoryFilter((prev) => ({ ...prev, ...f }))} />}
          ListEmptyComponent={<View style={styles.emptyBox}><CheckCircle2 size={40} color={theme.colors.border} /><Text style={styles.emptyText}>Belum ada riwayat pengerjaan hari ini.</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.surface }, kpiContainer: { flexDirection: 'row', backgroundColor: theme.colors.primary, padding: theme.spacing.md, paddingBottom: theme.spacing.xl }, kpiBox: { flex: 1, alignItems: 'center' }, kpiValue: { ...theme.typography.h2, color: '#fff', marginBottom: 4 }, kpiLabel: { ...theme.typography.caption, color: 'rgba(255,255,255,0.85)' }, kpiDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: theme.spacing.xs }, tabContainer: { flexDirection: 'row', backgroundColor: '#fff', marginTop: -theme.spacing.md, borderTopLeftRadius: theme.borderRadius.lg, borderTopRightRadius: theme.borderRadius.lg, elevation: 2 }, tabBtn: { flex: 1, paddingVertical: theme.spacing.md, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' }, tabBtnActive: { borderBottomColor: theme.colors.primary }, tabText: { ...theme.typography.body, fontWeight: '600', color: theme.colors.textSecondary }, tabTextActive: { color: theme.colors.primary }, list: { padding: theme.spacing.md, paddingBottom: MENU_BAR_CONTENT_PADDING }, filterContainer: { flexDirection: 'row', paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md, backgroundColor: theme.colors.surface }, filterChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, marginRight: 8 }, filterChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }, filterText: { ...theme.typography.caption, color: theme.colors.textSecondary, fontWeight: '600' }, filterTextActive: { color: '#fff' }, queueCard: { marginBottom: theme.spacing.md }, queueCardUrgent: { borderLeftWidth: 4, borderLeftColor: theme.colors.error }, qHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.md }, qId: { ...theme.typography.caption, fontWeight: 'bold', color: theme.colors.primary }, qTime: { ...theme.typography.caption }, qBody: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.sm }, qInfo: { marginLeft: theme.spacing.md, flex: 1, minWidth: 0 }, qUnit: { ...theme.typography.body, fontWeight: 'bold', color: theme.colors.text, flexShrink: 1, flexWrap: 'wrap' }, qMeta: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 }, qIssue: { ...theme.typography.caption, marginTop: 4, flexShrink: 1, flexWrap: 'wrap' }, progressWrap: { marginBottom: theme.spacing.sm }, progressTrack: { width: '100%', height: 8, backgroundColor: theme.colors.border, borderRadius: 999, overflow: 'hidden' }, progressFill: { height: 8, backgroundColor: theme.colors.primary, borderRadius: 999 }, progressText: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 4 }, qFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm }, slaBox: { flexDirection: 'row', alignItems: 'center' }, slaText: { ...theme.typography.caption, color: theme.colors.textSecondary, marginLeft: 4, fontWeight: 'bold' }, actionGroup: { flexDirection: 'row', alignItems: 'center' }, bookBtn: { padding: 8, backgroundColor: theme.colors.primaryLight, borderRadius: theme.borderRadius.full, marginRight: 8 }, actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.borderRadius.full }, actionText: { ...theme.typography.body, color: '#fff', fontWeight: '600', marginLeft: 6, fontSize: 14 }, emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl }, emptyText: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: theme.spacing.md } });
