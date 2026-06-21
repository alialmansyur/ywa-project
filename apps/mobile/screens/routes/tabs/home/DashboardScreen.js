import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../../../constants/AppTheme';
import { Card } from '../../../../components/common/Card';
import { Badge } from '../../../../components/common/Badge';
import { PulseBadge } from '../../../../components/common/PulseBadge';
import {
  ChevronRight,
  Clock,
  Wrench,
  ShieldCheck,
  Calendar,
  FileSearch,
  BookOpen,
  Truck,
  Settings,
  CloudRain,
  Package,
  Timer,
  Star,
  ClipboardCheck,
  ClipboardList,
  Sun,
  QrCode,
  AlertTriangle,
  Activity,
  Workflow,
  Siren,
  Layers3,
} from 'lucide-react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { dashboardService } from '../../../../services/dashboard.service';
import { workOrdersService } from '../../../../services/work-orders.service';
import { workshopService } from '../../../../services/workshop.service';
import { useActiveAssetStore } from '../../../../stores/active-asset.store';
import { useAuthStore } from '../../../../stores/auth.store';

const MENU_MAP = {
  workshop: { id: 1, title: 'Workshop', icon: Wrench, color: '#3B82F6', route: '/(tabs)/workshop' },
  inventory: { id: 2, title: 'Inventory', icon: Package, color: '#F59E0B', route: '/inventory' },
  hm_tracking: { id: 3, title: 'HM Record', icon: Timer, color: '#8B5CF6', route: '/hm-tracking' },
  preventive: { id: 4, title: 'Preventive', icon: ShieldCheck, color: theme.colors.success, route: '/(tabs)/preventive' },
  schedule: { id: 5, title: 'Jadwal', icon: Calendar, color: '#8B5CF6', route: '/(tabs)/schedule' },
  findings: { id: 6, title: 'Temuan', icon: FileSearch, color: theme.colors.warning, route: '/(tabs)/findings' },
  guide: { id: 7, title: 'Panduan', icon: BookOpen, color: '#10B981', route: '/(tabs)/guide' },
  assets: { id: 8, title: 'Aset Unit', icon: Truck, color: '#6366F1', route: '/(tabs)/unit-assets' },
  p2h: { id: 9, title: 'Form P2H', icon: ClipboardCheck, color: '#14B8A6', route: '/p2h' },
  scan_qr: { id: 10, title: 'Scan QR', icon: QrCode, color: '#2563EB', route: '/scanner' },
  work_orders: { id: 11, title: 'WO', icon: ClipboardList, color: '#0EA5E9', route: '/work-orders' },
  breakdown_report: { id: 12, title: 'Lapor', icon: AlertTriangle, color: '#EF4444', route: '/(tabs)/report' },
};

const MENU_KEY_BY_DB_MENU_KEY = {
  'mobile-home': null,
  'mobile-workshop': 'workshop',
  'mobile-work-orders': 'work_orders',
  'mobile-report': 'breakdown_report',
  'mobile-findings': 'findings',
  'mobile-p2h': 'p2h',
  'mobile-hm-tracking': 'hm_tracking',
  'mobile-assets': 'assets',
  'mobile-guide': 'guide',
  'mobile-preventive': 'preventive',
  'mobile-schedule': 'schedule',
  'mobile-inventory': 'inventory',
  'mobile-scan-qr': 'scan_qr',
  'mobile-profile': null,
};

const DEFAULT_MENU_KEYS = [
  'workshop',
  'inventory',
  'hm_tracking',
  'preventive',
  'schedule',
  'findings',
  'breakdown_report',
  'guide',
  'assets',
  'p2h',
];
const STATION_STEP_CODES = [
  'WASHING_BAY',
  'INSPECTION_PKB',
  'CHECKING',
  'CREATE_WO',
  'WAITING_BAY',
  'REPAIR',
  'QC',
  'READY_BAY_CLOSE',
  'HANDOVER',
];

const flattenMenuTree = (menus = []) => menus.flatMap((menu) => [
  menu,
  ...flattenMenuTree(Array.isArray(menu?.children) ? menu.children : []),
]);

const toDisplayStatus = (raw) => String(raw || '').replaceAll('_', ' ').toUpperCase();
const toDateKey = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const toIso = (d) => {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};
const ACTIVE_WORK_ORDER_STATUSES = ['registered', 'triage', 'pending', 'approved', 'in_progress', 'on_hold'];

export default function DashboardScreen() {
  const hasLoadedRef = useRef(false);
  const [overview, setOverview] = useState(null);
  const [workshopPanel, setWorkshopPanel] = useState(null);
  const [nonOperatorInsights, setNonOperatorInsights] = useState(null);
  const { activeAsset, loadCurrentAssignment } = useActiveAssetStore();
  const { user } = useAuthStore();

  const [greeting, setGreeting] = useState('Selamat datang');
  const [weatherInfo, setWeatherInfo] = useState({ title: 'Mencari lokasi...', desc: 'Mohon tunggu...', icon: CloudRain });
  const [menuKeys, setMenuKeys] = useState(DEFAULT_MENU_KEYS);
  const [todayWo, setTodayWo] = useState(null);
  const [loadingTodayWo, setLoadingTodayWo] = useState(false);
  const [menuWorkOrderBadgeCount, setMenuWorkOrderBadgeCount] = useState(0);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const assetAnim = useRef(new Animated.Value(0)).current;
  const gridAnim = useRef(new Animated.Value(0)).current;
  const sectionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setGreeting('Selamat pagi');
    else if (hour < 15) setGreeting('Selamat siang');
    else if (hour < 18) setGreeting('Selamat sore');
    else setGreeting('Selamat malam');
  }, []);

  useEffect(() => {
    Animated.stagger(80, [
      Animated.timing(headerAnim, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(assetAnim, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(gridAnim, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(sectionAnim, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [assetAnim, gridAnim, headerAnim, sectionAnim]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setWeatherInfo({ title: 'Akses Lokasi Ditolak', desc: 'Lokasi tidak tersedia', icon: CloudRain });
          return;
        }
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        const city = geocode[0]?.city || geocode[0]?.subregion || geocode[0]?.region || 'Lokasi Saat Ini';
        setWeatherInfo({ title: city, desc: 'Lokasi aktif terdeteksi', icon: Sun });
      } catch (_e) {
        setWeatherInfo({ title: 'Lokasi tidak tersedia', desc: 'GPS belum akurat', icon: CloudRain });
      }
    })();
  }, []);

  const normalizedRole = String(user?.role || '').toLowerCase();
  const isOperatorRole = normalizedRole.includes('operator');
  const headerBackground = theme.colors.primary;
  const workshopHomeRoute = isOperatorRole ? '/(tabs)/workshop' : '/(tabs)/mechanic';

  const loadDashboard = React.useCallback(async () => {
    try {
      const assignment = await loadCurrentAssignment().catch(() => null);
      const assignedAssetId = String(assignment?.asset?.id || activeAsset?.id || '');
      const baseRequests = [
        dashboardService.overview(),
        workOrdersService.getAll(1, 100),
      ];
      const extraRequests = isOperatorRole
        ? []
        : [
            dashboardService.workshopOperationalSummary(),
            workshopService.controlTowerApprovalQueue({ per_page: 100 }),
            workshopService.controlTowerStepQueues(),
            workshopService.controlTowerWorkOrders({ per_page: 100 }),
            workshopService.controlTowerBottlenecks(),
          ];
      const [dashboard, woRes, workshopSummary, approvalQueue, stepQueues, controlTowerRows, bottlenecks] = await Promise.all([
        ...baseRequests,
        ...extraRequests,
      ]);
      setOverview(dashboard);
      if (!isOperatorRole) {
        const approvalItems = Array.isArray(approvalQueue?.data) ? approvalQueue.data : Array.isArray(approvalQueue?.items) ? approvalQueue.items : [];
        const approvalCount = Number(approvalQueue?.total ?? approvalItems.length ?? 0);
        const queueGroups = stepQueues && typeof stepQueues === 'object' ? Object.values(stepQueues) : [];
        const queueItems = queueGroups.reduce((sum, rows) => sum + (Array.isArray(rows) ? rows.length : 0), 0);
        const workOrderRows = Array.isArray(controlTowerRows) ? controlTowerRows : Array.isArray(controlTowerRows?.data) ? controlTowerRows.data : Array.isArray(controlTowerRows?.items) ? controlTowerRows.items : [];
        const bayCounts = workOrderRows.reduce((acc, row) => {
          const key = String(row?.current_bay || 'waiting_bay');
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        const workloadDistribution = Object.entries(bayCounts)
          .map(([bay, total]) => ({
            bay,
            label: String(bay).replaceAll('_', ' ').replace(/\b\w/g, (x) => x.toUpperCase()),
            total: Number(total || 0),
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 3);
        const warningItems = [
          approvalCount > 0 ? `${approvalCount} approval menunggu triage.` : null,
          Number(workshopSummary?.wo_hold_total || 0) > 0 ? `${workshopSummary.wo_hold_total} WO masih hold.` : null,
          Number(workshopSummary?.late_steps_total || 0) > 0 ? `${workshopSummary.late_steps_total} step melewati SLA hari ini.` : null,
          Number(dashboard?.overdue_work_orders || 0) > 0 ? `${dashboard.overdue_work_orders} WO overdue perlu follow-up.` : null,
          Number(queueItems || 0) >= 10 ? `Antrian step aktif mencapai ${queueItems} item.` : null,
        ].filter(Boolean).slice(0, 3);
        const quickLinks = [
          { key: 'approval', label: 'Approval', value: approvalCount, route: '/(tabs)/mechanic?tab=approval', color: theme.colors.warning },
          { key: 'queue', label: 'WO Aktif', value: Number(workshopSummary?.wo_active_total ?? 0), route: '/(tabs)/mechanic?tab=queue', color: theme.colors.primary },
          { key: 'hold', label: 'WO Hold', value: Number(workshopSummary?.wo_hold_total ?? 0), route: '/(tabs)/mechanic?tab=queue', color: theme.colors.error },
          { key: 'history', label: 'Riwayat', value: Number(workshopSummary?.wo_completed_today ?? 0), route: '/(tabs)/mechanic?tab=history', color: theme.colors.success },
        ];
        const bottleneckStep = String(bottlenecks?.step || bottlenecks?.summary?.step || '-');
        const topBay = Array.isArray(bottlenecks?.top_bay_by_queue) ? bottlenecks.top_bay_by_queue[0] : null;
        setWorkshopPanel({
          activeWo: Number(workshopSummary?.wo_active_total ?? dashboard?.active_work_orders ?? 0),
          holdWo: Number(workshopSummary?.wo_hold_total ?? 0),
          completedToday: Number(workshopSummary?.wo_completed_today ?? 0),
          approvalCount,
          queueCount: queueItems,
          attentionCount: Number(workshopSummary?.late_steps_total ?? workshopSummary?.downtime_today_minutes ?? 0),
          attentionLabel: Number(workshopSummary?.late_steps_total ?? 0) > 0 ? 'Late Step Hari Ini' : 'Downtime Hari Ini',
        });
        setNonOperatorInsights({
          approvalCount,
          warningItems,
          quickLinks,
          bottleneckStep,
          bottleneckLate: Number(bottlenecks?.late ?? bottlenecks?.summary?.late ?? 0),
          bottleneckHold: Number(bottlenecks?.hold ?? bottlenecks?.summary?.hold ?? 0),
          topBayLabel: topBay?.bay_in ? String(topBay.bay_in).replaceAll('_', ' ').replace(/\b\w/g, (x) => x.toUpperCase()) : '-',
          topBayQueueMinutes: Number(topBay?.avg_queue_minutes ?? 0),
          workloadDistribution,
        });
      } else {
        setWorkshopPanel(null);
        setNonOperatorInsights(null);
      }

      setLoadingTodayWo(true);
      const todayKey = toDateKey(new Date());
      const woItems = woRes.items || [];
      const badgeCount = isOperatorRole
        ? woItems.filter((x) => {
            if (!assignedAssetId) return false;
            const workOrderAssetId = String(x?.asset_id || x?.asset?.id || '');
            return workOrderAssetId === assignedAssetId && ACTIVE_WORK_ORDER_STATUSES.includes(String(x?.status || '').toLowerCase());
          }).length
        : Number(dashboard?.active_work_orders ?? 0);
      setMenuWorkOrderBadgeCount(badgeCount);

      const resolvedRows = await Promise.all(
        woItems.map(async (x) => {
          try {
            const process = await workshopService.processData(String(x.id));
            const latest = process?.instances?.[0];
            const logs = latest?.step_logs || [];
            const stationLogs = logs.filter((s) => STATION_STEP_CODES.includes(String(s.step_code || '').toUpperCase()));
            const doneStationSteps = stationLogs.filter((s) => String(s.status || '').toLowerCase() === 'done').length;
            const activeStationStep = stationLogs.some((s) => ['in_progress', 'hold'].includes(String(s.status || '').toLowerCase()));
            const traversedStationSteps = Math.min(9, doneStationSteps + (activeStationStep ? 1 : 0));
            const handover = logs.find((s) => Number(s.step_order) === 110 || String(s.step_code || '').toUpperCase() === 'HANDOVER');
            const isCompletedByFlow =
              String(latest?.state || '').toLowerCase() === 'done' ||
              (handover && String(handover.status || '').toLowerCase() === 'done');
            const totalEstMinutes = logs.reduce((sum, row) => sum + Number(row?.est_minutes || 0), 0);
            const baseStart = x?.created_at ? new Date(x.created_at) : null;
            const estimatedDueAt = baseStart && totalEstMinutes > 0
              ? toIso(new Date(baseStart.getTime() + totalEstMinutes * 60000))
              : null;
            const resolvedStatus = isCompletedByFlow ? 'completed' : String(x.status || '').toLowerCase();
            return {
              ...x,
              resolvedStatus,
              estimated_due_at: estimatedDueAt,
              done_steps: isCompletedByFlow ? 9 : traversedStationSteps,
              total_steps: 9,
            };
          } catch (_e) {
            return { ...x, resolvedStatus: String(x.status || '').toLowerCase(), done_steps: 0, total_steps: 9 };
          }
        }),
      );

      const activeRows = resolvedRows.filter((x) => ACTIVE_WORK_ORDER_STATUSES.includes(x.resolvedStatus));
      const scopedActiveRows = isOperatorRole && assignedAssetId
        ? activeRows.filter((x) => String(x?.asset_id || x?.asset?.id || '') === assignedAssetId)
        : activeRows;
      const activeToday = activeRows
        .filter((x) => !isOperatorRole || !assignedAssetId || String(x?.asset_id || x?.asset?.id || '') === assignedAssetId)
        .filter((x) => toDateKey(x.created_at) === todayKey)
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      const fallbackActive = scopedActiveRows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setTodayWo(activeToday[0] || fallbackActive[0] || null);
    } catch (_e) {
      setOverview(null);
      setWorkshopPanel(null);
      setNonOperatorInsights(null);
      setTodayWo(null);
      setMenuWorkOrderBadgeCount(0);
    } finally {
      setLoadingTodayWo(false);
    }

    try {
      const menuAccessRes = await dashboardService.menuAccess();
      const dbMenus = flattenMenuTree(Array.isArray(menuAccessRes?.data) ? menuAccessRes.data : []);
      const fromDb = dbMenus
        .map((x) => MENU_KEY_BY_DB_MENU_KEY[String(x?.menu_key || '').toLowerCase()] || null)
        .filter((x) => !!x && MENU_MAP[x]);
      setMenuKeys(Array.from(new Set(fromDb)));
      return;
    } catch (_e) {
      // fallback below
    }

    setMenuKeys(DEFAULT_MENU_KEYS);
  }, [activeAsset?.id, isOperatorRole, loadCurrentAssignment]);

  useEffect(() => {
    hasLoadedRef.current = true;
    loadDashboard();
  }, [loadDashboard]);

  useFocusEffect(
    React.useCallback(() => {
      if (!hasLoadedRef.current) return undefined;
      loadDashboard();
      return undefined;
    }, [loadDashboard]),
  );

  const gridMenu = useMemo(
    () => menuKeys
      .map((k) => {
        const menu = MENU_MAP[k];
        if (!menu) return null;
        if (k === 'workshop') {
          return { ...menu, route: workshopHomeRoute };
        }
        return menu;
      })
      .filter(Boolean),
    [menuKeys, workshopHomeRoute],
  );
  const woActive = overview?.active_work_orders ?? 0;
  const safetyScore = overview?.p2h_today?.compliance_pct;
  const incidentFree = overview?.mttr_minutes_month;
  const priorityBadgeCount = Number(menuWorkOrderBadgeCount || 0);
  const breakdownBadgeCount = Number(overview?.breakdown_today ?? 0);
  const workshopAttentionValue = workshopPanel?.attentionCount ?? 0;
  const workshopAttentionSuffix = workshopPanel?.attentionLabel === 'Downtime Hari Ini' ? ' mnt' : '';
  const nonOperatorWarnings = nonOperatorInsights?.warningItems || [];

  const dueText = todayWo?.scheduled_end
    ? new Date(todayWo.scheduled_end).toLocaleString('id-ID')
    : todayWo?.estimated_due_at
      ? `${new Date(todayWo.estimated_due_at).toLocaleString('id-ID')} (estimasi)`
      : todayWo?.created_at
        ? `${new Date(todayWo.created_at).toLocaleString('id-ID')} (mulai)`
        : '-';

  const progressRatio = todayWo?.done_steps && todayWo?.total_steps ? Math.min(1, todayWo.done_steps / todayWo.total_steps) : 0;

  const MenuBadge = ({ count }) => {
    if (!count || count <= 0) return null;
    return (
      <View style={styles.menuBadge}>
        <Text style={styles.menuBadgeText}>{count > 99 ? '99+' : String(count)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollArea}>
        <Animated.View style={[styles.header, { backgroundColor: headerBackground, opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
          <View style={styles.headerOrbA} />
          <View style={styles.headerOrbB} />
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <View style={styles.statusRow}>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>On Duty</Text>
            </View>
            <View style={styles.statusPillGhost}>
              <Text style={styles.statusPillGhostText}>Shift Aktif</Text>
            </View>
          </View>
          <View style={styles.weatherWidget}>
            <weatherInfo.icon color="#fff" size={22} />
            <View style={styles.weatherTextContainer}>
              <Text style={styles.weatherTitle}>{weatherInfo.title}</Text>
              <Text style={styles.weatherDesc}>{weatherInfo.desc}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.assetContainer, { opacity: assetAnim, transform: [{ translateY: assetAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
          <Card style={styles.assetCard}>
            {isOperatorRole ? (
              <>
                <View style={styles.assetHeader}>
                  <View style={styles.assetHeaderLeft}>
                    <Settings color={theme.colors.error} size={24} />
                    <Text style={styles.assetTitle}>Aset Digunakan</Text>
                  </View>
                  <PulseBadge text={activeAsset ? (activeAsset.status || 'ACTIVE').toUpperCase() : 'UNASSIGNED'} />
                </View>
                <Text style={styles.assetMetaText}>No. Polisi: {activeAsset?.plateNo || '-'}</Text>
                <Text style={styles.assetNameText}>
                  {activeAsset ? `${activeAsset.name} (${activeAsset.code})` : 'Belum ada aset di-assign'}
                </Text>
                <View style={styles.hmRow}>
                  <View>
                    <Text style={styles.hmHeroLabel}>HM Saat Ini</Text>
                    <Text style={styles.hmHeroValue}>{activeAsset?.hm ?? '-'}</Text>
                  </View>
                  <TouchableOpacity style={styles.assetPrimaryAction} onPress={() => router.push('/(tabs)/unit-assets')}>
                    <Text style={styles.assetPrimaryActionText}>{activeAsset ? 'Kelola Aset' : 'Assign Aset'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.assetHeader}>
                  <View style={styles.assetHeaderLeft}>
                    <Wrench color={theme.colors.primary} size={24} />
                    <Text style={styles.assetTitle}>Panel Workshop</Text>
                  </View>
                  <PulseBadge text={`${workshopPanel?.approvalCount ?? 0} Approval`} />
                </View>
                <View style={styles.workshopSummaryGrid}>
                  <View style={styles.workshopSummaryItem}>
                    <Text style={styles.assetMetaText}>WO Aktif</Text>
                    <Text style={styles.workshopSummaryValue}>{workshopPanel?.activeWo ?? 0}</Text>
                  </View>
                  <View style={styles.workshopSummaryItem}>
                    <Text style={styles.assetMetaText}>WO Hold</Text>
                    <Text style={styles.workshopSummaryValue}>{workshopPanel?.holdWo ?? 0}</Text>
                  </View>
                  <View style={styles.workshopSummaryItem}>
                    <Text style={styles.assetMetaText}>Selesai Hari Ini</Text>
                    <Text style={styles.workshopSummaryValue}>{workshopPanel?.completedToday ?? 0}</Text>
                  </View>
                  <View style={styles.workshopSummaryItem}>
                    <Text style={styles.assetMetaText}>Queue Step Aktif</Text>
                    <Text style={styles.workshopSummaryValue}>{workshopPanel?.queueCount ?? 0}</Text>
                  </View>
                </View>
                <View style={styles.hmRow}>
                  <View>
                    <Text style={styles.hmHeroLabel}>{workshopPanel?.attentionLabel || 'Late Step Hari Ini'}</Text>
                    <Text style={styles.hmHeroValue}>{`${workshopAttentionValue}${workshopAttentionSuffix}`}</Text>
                  </View>
                  <TouchableOpacity style={styles.assetPrimaryAction} onPress={() => router.push(workshopHomeRoute)}>
                    <Text style={styles.assetPrimaryActionText}>Buka Workshop</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Card>
        </Animated.View>

        <Animated.View style={[styles.gridContainer, { opacity: gridAnim, transform: [{ translateY: gridAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
          {gridMenu.map((menu) => {
            const showWoBadge = menu.id === MENU_MAP.workshop.id || menu.id === MENU_MAP.work_orders.id;
            const showBreakdownBadge = menu.id === MENU_MAP.breakdown_report.id;
            return (
              <TouchableOpacity key={menu.id} style={styles.gridItem} activeOpacity={0.8} onPress={() => menu.route && router.push(menu.route)}>
                <View style={[styles.iconContainer, { backgroundColor: menu.color + '15' }]}>
                  <menu.icon size={26} color={menu.color} />
                  {showWoBadge ? <MenuBadge count={priorityBadgeCount} /> : null}
                  {showBreakdownBadge ? <MenuBadge count={breakdownBadgeCount} /> : null}
                </View>
                <Text style={styles.gridTitle}>{menu.title}</Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        <Animated.View style={{ opacity: sectionAnim, transform: [{ translateY: sectionAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
          {!isOperatorRole ? (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Navigation</Text>
                <View style={styles.quickLinkRow}>
                  {(nonOperatorInsights?.quickLinks || []).map((item) => (
                    <TouchableOpacity key={item.key} style={styles.quickLinkItem} activeOpacity={0.85} onPress={() => router.push(item.route)}>
                      <View style={[styles.quickLinkIcon, { backgroundColor: `${item.color}15` }]}>
                        <Text style={[styles.quickLinkValue, { color: item.color }]}>{item.value}</Text>
                      </View>
                      <Text style={styles.quickLinkLabel}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Approval Spotlight</Text>
                <Card style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <View style={styles.insightHeaderLeft}>
                      <Siren size={20} color={theme.colors.warning} />
                      <Text style={styles.insightTitle}>Menunggu Approval</Text>
                    </View>
                    <PulseBadge text={`${nonOperatorInsights?.approvalCount ?? 0} Pending`} />
                  </View>
                  <Text style={styles.insightPrimaryValue}>{nonOperatorInsights?.approvalCount ?? 0}</Text>
                  <Text style={styles.insightDescription}>
                    {Number(nonOperatorInsights?.approvalCount || 0) > 0
                      ? 'Ada work order baru yang menunggu triage untuk diproses.'
                      : 'Saat ini tidak ada approval yang tertahan.'}
                  </Text>
                  <TouchableOpacity style={styles.inlineAction} onPress={() => router.push('/(tabs)/mechanic?tab=approval')}>
                    <Text style={styles.inlineActionText}>Buka Approval Queue</Text>
                  </TouchableOpacity>
                </Card>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Warning & Exceptions</Text>
                <Card style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <View style={styles.insightHeaderLeft}>
                      <AlertTriangle size={20} color={theme.colors.error} />
                      <Text style={styles.insightTitle}>Butuh Perhatian</Text>
                    </View>
                    <Badge text={`${nonOperatorWarnings.length} item`} variant={nonOperatorWarnings.length > 0 ? 'warning' : 'success'} />
                  </View>
                  {nonOperatorWarnings.length > 0 ? nonOperatorWarnings.map((item) => (
                    <View key={item} style={styles.warningRow}>
                      <View style={styles.warningDot} />
                      <Text style={styles.warningText}>{item}</Text>
                    </View>
                  )) : <Text style={styles.insightDescription}>Tidak ada exception utama yang perlu diangkat saat ini.</Text>}
                </Card>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bottleneck Workshop</Text>
                <View style={styles.dualCardRow}>
                  <Card style={styles.dualInsightCard}>
                    <View style={styles.insightHeaderLeft}>
                      <Workflow size={18} color={theme.colors.primary} />
                      <Text style={styles.insightMiniTitle}>Step Terpadat</Text>
                    </View>
                    <Text style={styles.dualInsightValue}>{nonOperatorInsights?.bottleneckStep ? String(nonOperatorInsights.bottleneckStep).replaceAll('_', ' ') : '-'}</Text>
                    <Text style={styles.dualInsightMeta}>{nonOperatorInsights?.bottleneckLate ?? 0} late step</Text>
                  </Card>
                  <Card style={styles.dualInsightCard}>
                    <View style={styles.insightHeaderLeft}>
                      <Activity size={18} color={theme.colors.warning} />
                      <Text style={styles.insightMiniTitle}>Bay Terpadat</Text>
                    </View>
                    <Text style={styles.dualInsightValue}>{nonOperatorInsights?.topBayLabel || '-'}</Text>
                    <Text style={styles.dualInsightMeta}>{Math.round(nonOperatorInsights?.topBayQueueMinutes ?? 0)} menit avg queue</Text>
                  </Card>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Distribusi Workload</Text>
                <Card style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <View style={styles.insightHeaderLeft}>
                      <Layers3 size={20} color={theme.colors.primary} />
                      <Text style={styles.insightTitle}>Top Bay Aktif</Text>
                    </View>
                    <Badge text={`${nonOperatorInsights?.bottleneckHold ?? 0} Hold`} variant={nonOperatorInsights?.bottleneckHold ? 'warning' : 'success'} />
                  </View>
                  {(nonOperatorInsights?.workloadDistribution || []).map((row) => (
                    <View key={row.bay} style={styles.workloadRow}>
                      <Text style={styles.workloadLabel}>{row.label}</Text>
                      <View style={styles.workloadBarTrack}>
                        <View
                          style={[
                            styles.workloadBarFill,
                            {
                              width: `${Math.max(12, Math.min(100, ((row.total || 0) / Math.max(1, nonOperatorInsights.workloadDistribution[0]?.total || 1)) * 100))}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.workloadValue}>{row.total}</Text>
                    </View>
                  ))}
                </Card>
              </View>
            </>
          ) : null}

          <Text style={[styles.sectionTitle, { paddingHorizontal: theme.spacing.md }]}>My Performance & Stats</Text>
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <View style={[styles.iconContainer, styles.statIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                <ClipboardList size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.statValue}>{woActive}</Text>
              <Text style={styles.statLabel}>WO Aktif</Text>
            </Card>
            <Card style={styles.statCard}>
              <View style={[styles.iconContainer, styles.statIcon, { backgroundColor: theme.colors.success + '15' }]}>
                <ShieldCheck size={20} color={theme.colors.success} />
              </View>
              <Text style={styles.statValue}>{safetyScore ?? '-'}</Text>
              <Text style={styles.statLabel}>P2H Compliance %</Text>
            </Card>
            <Card style={styles.statCard}>
              <View style={[styles.iconContainer, styles.statIcon, { backgroundColor: '#F59E0B15' }]}>
                <Star size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{incidentFree ?? '-'}</Text>
              <Text style={styles.statLabel}>MTTR (Menit)</Text>
            </Card>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Order Hari Ini</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push(todayWo ? `/(tabs)/workshop/detail?work_order_id=${todayWo.id}` : '/(tabs)/workshop')}>
              <Card style={styles.woCard}>
                <View style={styles.woHeader}>
                  <View style={styles.woHeaderInfo}>
                    <Text style={styles.woId}>[{todayWo?.code || 'WO'}]</Text>
                    <Text style={styles.woTitle}>{todayWo?.title || (loadingTodayWo ? 'Memuat work order...' : 'Belum ada WO aktif')}</Text>
                  </View>
                  <Badge
                    text={toDisplayStatus(todayWo?.resolvedStatus || todayWo?.status || 'normal')}
                    variant={(todayWo?.resolvedStatus || todayWo?.status) === 'completed' ? 'success' : todayWo?.priority === 'critical' ? 'error' : todayWo?.priority === 'high' ? 'warning' : 'primary'}
                  />
                </View>

                <View style={styles.progressWrap}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.round(progressRatio * 100)}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{Math.round(progressRatio * 100)}% progress</Text>
                </View>

                <View style={styles.woFooter}>
                  <View style={styles.woDetail}>
                    <Clock size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.woDetailText}>Due: {dueText}</Text>
                  </View>
                  <ChevronRight size={20} color={theme.colors.primary} />
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  scrollArea: { flex: 1 },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: 48,
    overflow: 'hidden',
  },
  headerOrbA: {
    position: 'absolute',
    top: -38,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerOrbB: {
    position: 'absolute',
    top: 26,
    right: 62,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  greeting: { ...theme.typography.h2, color: '#fff' },
  date: { ...theme.typography.body, color: theme.colors.primaryLight, marginTop: theme.spacing.xs },
  statusRow: { flexDirection: 'row', marginTop: theme.spacing.md, gap: 8 },
  statusPill: { backgroundColor: '#ffffff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusPillText: { ...theme.typography.caption, color: theme.colors.primaryDark, fontWeight: '700', fontSize: 11 },
  statusPillGhost: { backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusPillGhostText: { ...theme.typography.caption, color: '#fff', fontWeight: '600', fontSize: 11 },
  weatherWidget: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  weatherTextContainer: { marginLeft: theme.spacing.sm },
  weatherTitle: { ...theme.typography.caption, color: '#fff', fontWeight: 'bold' },
  weatherDesc: { fontSize: 11, color: 'rgba(255,255,255,0.9)' },
  assetContainer: { marginTop: -theme.spacing.lg, paddingHorizontal: theme.spacing.md, zIndex: 10 },
  assetCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.xs },
  assetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  assetHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  assetTitle: { ...theme.typography.h3, color: theme.colors.text, marginLeft: theme.spacing.sm },
  assetMetaText: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 2 },
  assetNameText: { ...theme.typography.body, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.xs },
  hmRow: { marginTop: 8, marginBottom: 6, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  hmHeroLabel: { ...theme.typography.caption, color: theme.colors.textSecondary },
  hmHeroValue: { ...theme.typography.h1, color: theme.colors.primaryDark, marginTop: 2, fontSize: 30 },
  assetPrimaryAction: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  assetPrimaryActionText: { ...theme.typography.caption, color: '#fff', fontWeight: '700' },
  workshopSummaryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.spacing.xs },
  workshopSummaryItem: { width: '50%', marginBottom: theme.spacing.sm },
  workshopSummaryValue: { ...theme.typography.h3, color: theme.colors.primaryDark, marginTop: 2 },
  quickLinkRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  quickLinkItem: { width: '23%', alignItems: 'center' },
  quickLinkIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickLinkValue: { ...theme.typography.caption, fontWeight: '700' },
  quickLinkLabel: { ...theme.typography.caption, color: theme.colors.text, textAlign: 'center', fontWeight: '600' },
  insightCard: { padding: theme.spacing.md },
  insightHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  insightHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightTitle: { ...theme.typography.body, color: theme.colors.text, fontWeight: '700' },
  insightMiniTitle: { ...theme.typography.caption, color: theme.colors.textSecondary, fontWeight: '700', marginLeft: 6 },
  insightPrimaryValue: { ...theme.typography.h1, color: theme.colors.primaryDark, fontSize: 32 },
  insightDescription: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 4 },
  inlineAction: { marginTop: theme.spacing.md, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: `${theme.colors.primary}15`, borderRadius: theme.borderRadius.full },
  inlineActionText: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '700' },
  warningRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  warningDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.warning, marginTop: 5, marginRight: 8 },
  warningText: { ...theme.typography.caption, color: theme.colors.textSecondary, flex: 1 },
  dualCardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dualInsightCard: { flex: 1, padding: theme.spacing.md, marginRight: 8 },
  dualInsightValue: { ...theme.typography.h3, color: theme.colors.text, marginTop: theme.spacing.sm, textTransform: 'capitalize' },
  dualInsightMeta: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 4 },
  workloadRow: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm },
  workloadLabel: { ...theme.typography.caption, color: theme.colors.text, width: 104 },
  workloadBarTrack: { flex: 1, height: 10, backgroundColor: theme.colors.border, borderRadius: 999, overflow: 'hidden', marginHorizontal: 8 },
  workloadBarFill: { height: 10, backgroundColor: theme.colors.primary, borderRadius: 999 },
  workloadValue: { ...theme.typography.caption, color: theme.colors.textSecondary, fontWeight: '700', width: 24, textAlign: 'right' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.md, justifyContent: 'flex-start' },
  gridItem: { width: '25%', alignItems: 'center', marginBottom: theme.spacing.lg },
  iconContainer: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.sm },
  gridTitle: { ...theme.typography.caption, color: theme.colors.text, textAlign: 'center', fontWeight: '600' },
  menuBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  menuBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  section: { padding: theme.spacing.md },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.md },
  statsContainer: { flexDirection: 'row', paddingHorizontal: theme.spacing.md, justifyContent: 'space-between', marginBottom: theme.spacing.md },
  statCard: { flex: 1, marginHorizontal: 4, alignItems: 'center', paddingVertical: theme.spacing.md },
  statIcon: { width: 40, height: 40 },
  statValue: { ...theme.typography.h2, color: theme.colors.text, marginTop: 8 },
  statLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, textAlign: 'center' },
  woCard: { padding: theme.spacing.md },
  woHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  woHeaderInfo: { flex: 1, minWidth: 0, marginRight: 8 },
  woId: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '600', flexShrink: 1, flexWrap: 'wrap' },
  woTitle: { ...theme.typography.body, fontWeight: '600', marginTop: 2, flexShrink: 1, flexWrap: 'wrap' },
  progressWrap: { marginTop: theme.spacing.sm, marginBottom: 4 },
  progressTrack: { width: '100%', height: 8, backgroundColor: theme.colors.border, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: theme.colors.primary, borderRadius: 999 },
  progressText: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 4 },
  woFooter: {
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  woDetail: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0, paddingRight: 8 },
  woDetailText: { ...theme.typography.caption, marginLeft: 6, color: theme.colors.textSecondary, flexShrink: 1, flexWrap: 'wrap' },
});
