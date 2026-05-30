import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../constants/AppTheme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { PulseBadge } from '../../components/common/PulseBadge';
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
} from 'lucide-react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { dashboardService } from '../../services/dashboard.service';
import { workOrdersService } from '../../services/work-orders.service';
import { workshopService } from '../../services/workshop.service';
import { useActiveAssetStore } from '../../stores/active-asset.store';

const MENU_MAP = {
  workshop: { id: 1, title: 'Workshop', icon: Wrench, color: '#3B82F6', route: '/(tabs)/workshop' },
  inventory: { id: 2, title: 'Inventory', icon: Package, color: '#F59E0B', route: '/inventory' },
  hm_tracking: { id: 3, title: 'HM Record', icon: Timer, color: '#8B5CF6', route: '/hm-tracking' },
  preventive: { id: 4, title: 'Preventive', icon: ShieldCheck, color: theme.colors.success, route: '/(tabs)/preventive' },
  schedule: { id: 5, title: 'Jadwal', icon: Calendar, color: '#8B5CF6', route: '/(tabs)/schedule' },
  findings: { id: 6, title: 'Temuan', icon: FileSearch, color: theme.colors.warning, route: '/(tabs)/findings' },
  guide: { id: 7, title: 'Panduan', icon: BookOpen, color: '#10B981', route: '/(tabs)/guide' },
  assets: { id: 8, title: 'Aset Unit', icon: Truck, color: '#6366F1', route: '/(tabs)/assets' },
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
  'WAITING_BAY',
  'CREATE_WO',
  'REPAIR',
  'QC',
  'READY_BAY_CLOSE',
  'HANDOVER',
];

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

export default function DashboardScreen() {
  const hasLoadedRef = useRef(false);
  const [overview, setOverview] = useState(null);
  const { activeAsset, loadCurrentAssignment } = useActiveAssetStore();

  const [greeting, setGreeting] = useState('Selamat datang');
  const [weatherInfo, setWeatherInfo] = useState({ title: 'Mencari lokasi...', desc: 'Mohon tunggu...', icon: CloudRain });
  const [menuKeys, setMenuKeys] = useState(DEFAULT_MENU_KEYS);
  const [todayWo, setTodayWo] = useState(null);
  const [loadingTodayWo, setLoadingTodayWo] = useState(false);

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

  const loadDashboard = React.useCallback(async () => {
    try {
      const [dashboard, woRes] = await Promise.all([
        dashboardService.overview(),
        workOrdersService.getAll(1, 30),
      ]);
      setOverview(dashboard);
      await loadCurrentAssignment();

      setLoadingTodayWo(true);
      const activeStatuses = ['registered', 'triage', 'pending', 'approved', 'in_progress', 'on_hold'];
      const todayKey = toDateKey(new Date());
      const woItems = woRes.items || [];

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

      const activeRows = resolvedRows.filter((x) => activeStatuses.includes(x.resolvedStatus));
      const activeToday = activeRows
        .filter((x) => toDateKey(x.created_at) === todayKey)
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      const fallbackActive = activeRows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setTodayWo(activeToday[0] || fallbackActive[0] || null);
    } catch (_e) {
      setOverview(null);
      setTodayWo(null);
    } finally {
      setLoadingTodayWo(false);
    }

    try {
      const menuAccessRes = await dashboardService.menuAccess();
      const dbMenus = Array.isArray(menuAccessRes?.data) ? menuAccessRes.data : [];
      const fromDb = dbMenus
        .map((x) => MENU_KEY_BY_DB_MENU_KEY[String(x?.menu_key || '').toLowerCase()] || null)
        .filter((x) => !!x && MENU_MAP[x]);

      if (fromDb.length > 0) {
        setMenuKeys(Array.from(new Set(fromDb)));
        return;
      }

      const settingRes = await dashboardService.systemSettings({ q: 'mobile.home_quick_menu', per_page: 50 });
      const rows = Array.isArray(settingRes?.data) ? settingRes.data : [];
      const row = rows.find((x) => String(x.key || '').toLowerCase() === 'mobile.home_quick_menu');
      const keys = Array.isArray(row?.value_json) ? row.value_json : [];
      if (keys.length > 0) {
        const normalized = keys.map((k) => String(k || '').toLowerCase()).filter((k) => MENU_MAP[k]);
        if (normalized.length > 0) {
          setMenuKeys(normalized);
          return;
        }
      }
    } catch (_e) {
      // fallback below
    }

    setMenuKeys(DEFAULT_MENU_KEYS);
  }, [loadCurrentAssignment]);

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

  const gridMenu = useMemo(() => menuKeys.map((k) => MENU_MAP[k]).filter(Boolean), [menuKeys]);
  const woActive = overview?.active_work_orders ?? 0;
  const safetyScore = overview?.p2h_today?.compliance_pct;
  const incidentFree = overview?.mttr_minutes_month;
  const priorityBadgeCount = Number(woActive || 0);
  const breakdownBadgeCount = Number(overview?.breakdown_today ?? 0);

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
        <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
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
              <TouchableOpacity style={styles.assetPrimaryAction} onPress={() => router.push('/(tabs)/assets')}>
                <Text style={styles.assetPrimaryActionText}>{activeAsset ? 'Kelola Aset' : 'Assign Aset'}</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: theme.colors.primary,
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
