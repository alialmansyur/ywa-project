import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../constants/AppTheme';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { HeaderBackButton } from '../../components/common/HeaderBackButton';
import { Truck, Clock, Wrench, CheckCircle2, AlertTriangle, WrenchIcon } from 'lucide-react-native';
import { Badge } from '../../components/common/Badge';
import { useAlert } from '../../contexts/AlertContext';
import { workOrdersService } from '../../services/work-orders.service';
import { workshopService } from '../../services/workshop.service';
import { useActiveAssetStore } from '../../stores/active-asset.store';
import { useAuthStore } from '../../stores/auth.store';
import { format } from 'date-fns';
import { SearchFilterPanel } from '../../components/common/SearchFilterPanel';
import { getCurrentMonthRange } from '../../utils/dateRange';
import { MENU_BAR_CONTENT_PADDING } from '../../constants/menu-bar';
import { AssetPickerField } from '../../components/common/AssetPickerField';

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

const getStepProgress = (logs = [], status = '') => {
  const normalized = (logs || []).filter((s) => STATION_STEP_CODES.includes(String(s.step_code || '').toUpperCase()));
  const done = normalized.filter((s) => String(s.status || '').toLowerCase() === 'done').length;
  const active = normalized.some((s) => ['in_progress', 'hold'].includes(String(s.status || '').toLowerCase()));
  const doneSteps = String(status || '').toLowerCase() === 'completed' ? 9 : Math.min(9, done + (active ? 1 : 0));
  return { doneSteps, totalSteps: 9, ratio: doneSteps / 9 };
};

const getStepProgressFromQueueRow = (row = {}, status = '') => {
  const stepCodeRaw = String(row?.step_code || '').toUpperCase();
  const stepStatusRaw = String(row?.step_status || '').toLowerCase();
  const currentStepOrder = Number(row?.current_step_order || 0);
  const stepCode = STATION_STEP_CODES.includes(stepCodeRaw)
    ? stepCodeRaw
    : STATION_STEP_ORDER_TO_CODE[currentStepOrder] || '';
  const idx = STATION_STEP_CODES.indexOf(stepCode);

  if (String(status || '').toLowerCase() === 'completed') {
    return { doneSteps: 9, totalSteps: 9, ratio: 1 };
  }
  if (idx < 0) {
    return { doneSteps: 0, totalSteps: 9, ratio: 0 };
  }

  let doneSteps = idx;
  if (stepStatusRaw === 'done') doneSteps = idx + 1;
  if (stepStatusRaw === 'in_progress' || stepStatusRaw === 'hold') doneSteps = idx + 1;
  if (currentStepOrder >= 110 && (stepStatusRaw === 'done' || stepCode === 'HANDOVER')) doneSteps = 9;
  doneSteps = Math.max(0, Math.min(9, doneSteps));
  return { doneSteps, totalSteps: 9, ratio: doneSteps / 9 };
};

export default function WorkshopRegistration() {
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const loadSeqRef = useRef(0);
  const { activeAsset, loadCurrentAssignment } = useActiveAssetStore();
  const { user } = useAuthStore();
  const roleName = String(user?.role || '').toLowerCase();
  const requiresAssignedAssetRole = ['driver', 'operator'].includes(roleName);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeTab, setActiveTab] = useState('ajukan');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);
  const monthRange = getCurrentMonthRange();
  const [filters, setFilters] = useState({ search: '', from: monthRange.from, to: monthRange.to });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();

  const load = useCallback(async (silent = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    const loadSeq = ++loadSeqRef.current;

    try {
      if (!silent) setLoading(true);
      await loadCurrentAssignment();
    } catch (_e) {}
    try {
      const [res, queueSnapshot] = await Promise.all([
        workOrdersService.getAll(1, 20, undefined, undefined, filters.search, filters.from, filters.to),
        workshopService.controlTowerWorkOrders(),
      ]);
      const effectiveAsset = requiresAssignedAssetRole ? activeAsset : selectedAsset;
      const baseRows = (res.items || [])
        .filter((x) => ['registered', 'triage', 'pending', 'approved', 'in_progress', 'completed', 'on_hold'].includes(x.status))
        .filter((x) => !effectiveAsset?.id || String(x?.asset_id || x?.asset?.id || '') === String(effectiveAsset.id));
      const queueRows = Array.isArray(queueSnapshot) ? queueSnapshot : queueSnapshot?.data || queueSnapshot?.work_orders || [];
      const queueByWorkOrderId = new Map(queueRows.map((row) => [String(row?.wo_id || row?.id || ''), row]));
      const rows = baseRows.map((x) => {
        const queueRow = queueByWorkOrderId.get(String(x.id));
        const progress = queueRow
          ? getStepProgressFromQueueRow(queueRow, x.status)
          : getStepProgress([], x.status);
        return { ...x, ...progress };
      });
      if (loadSeq !== loadSeqRef.current) return;
      setHistory(rows);
    } catch (_e) {
      if (loadSeq !== loadSeqRef.current) return;
      setHistory([]);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeAsset?.id, filters, requiresAssignedAssetRole, loadCurrentAssignment, selectedAsset?.id]);

  React.useEffect(() => {
    hasLoadedRef.current = true;
    load();
  }, [load]);

  React.useEffect(() => {
    if (activeAsset?.id) setSelectedAsset(activeAsset);
  }, [activeAsset]);

  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedRef.current) return undefined;
      load(true);
      return undefined;
    }, [load]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  const hasOpenWorkshopForAsset = async (assetId) => {
    const res = await workOrdersService.getAll(1, 100);
    const rows = res.items || [];
    return rows.some((row) => {
      const sameAsset = String(row?.asset_id || row?.asset?.id || '') === String(assetId);
      const isWorkshopStatus = ['registered', 'triage', 'pending', 'approved', 'in_progress', 'on_hold'].includes(row?.status);
      return sameAsset && isWorkshopStatus;
    });
  };

  const handleSubmit = async () => {
    const effectiveAsset = requiresAssignedAssetRole ? activeAsset : selectedAsset;
    if (!effectiveAsset?.id) {
      showAlert({ title: 'Aset Belum Dipilih', message: 'Silakan assign aset terlebih dahulu dari menu Aset Unit.', type: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      const existsOpen = await hasOpenWorkshopForAsset(effectiveAsset.id);
      if (existsOpen) {
        showAlert({
          title: 'Registrasi Ditolak',
          message: 'Unit ini masih memiliki proses workshop yang belum selesai. Registrasi baru hanya bisa dibuat jika tidak ada proses aktif atau status sebelumnya sudah selesai.',
          type: 'warning',
        });
        return;
      }

      const wo = await workOrdersService.register({
        asset_id: String(effectiveAsset.id),
        title: 'Registrasi Kedatangan - ' + (effectiveAsset.name || effectiveAsset.code || 'Unit'),
        description: description || 'Registrasi workshop dari mobile',
      });
      setDescription('');
      setActiveTab('riwayat');
      setHistory((prev) => (wo?.id ? [wo, ...prev.filter((item) => String(item.id) !== String(wo.id))] : prev));
      showAlert({ title: 'Pendaftaran Berhasil', message: 'Unit telah terdaftar ke Workshop. Silakan cek progress secara berkala.', type: 'success' });
      setTimeout(() => router.push(`/(tabs)/workshop/detail?work_order_id=${wo?.id || ''}`), 1200);
    } catch (_e) {
      showAlert({ title: 'Gagal', message: 'Pendaftaran workshop belum berhasil dikirim.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (requiresAssignedAssetRole && !activeAsset?.id) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Stack.Screen options={{ title: 'Workshop', headerShown: true, headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: '#fff', headerBackVisible: false, headerBackTitleVisible: false, headerElevation: 0, headerLeft: () => <HeaderBackButton color="#fff" /> }} />
        <AlertTriangle size={80} color={theme.colors.warning} style={{ marginBottom: 24 }} />
        <Text style={{ ...theme.typography.h2, color: theme.colors.text, marginBottom: 8, textAlign: 'center' }}>Unit Belum Ditautkan</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center' }}>
          Silakan assign aset terlebih dahulu untuk melihat dan mengajukan workshop.
        </Text>
      </View>
    );
  }

  const renderAjukan = () => (
    <View style={styles.content}>
      <Card style={styles.heroCard}>
        <View style={styles.heroIcon}><WrenchIcon size={20} color={theme.colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Workshop Registration</Text>
          <Text style={styles.heroDesc}>Daftarkan kendala unit dan pantau progres penanganannya.</Text>
        </View>
      </Card>
      <Text style={styles.headerTitle}>Form Registrasi Kendala Unit</Text>
      <Text style={styles.headerSubtitle}>Harap isi formulir ini sesaat sebelum atau saat Anda tiba di Workshop.</Text>

      <Card style={styles.card}>
        {requiresAssignedAssetRole ? (
          <>
            <Text style={styles.label}>Pilih Aset (Sedang Digunakan)</Text>
            <View style={styles.inputBox}><Truck size={20} color={theme.colors.textSecondary} /><Text style={styles.inputText}>{activeAsset ? `${activeAsset.name} (${activeAsset.code})` : '-'}</Text></View>
          </>
        ) : (
          <AssetPickerField value={selectedAsset} onChange={setSelectedAsset} label="Pilih Unit (Searchable)" />
        )}

        <Text style={styles.label}>Jam Kedatangan (Estimasi)</Text>
        <View style={styles.inputBox}><Clock size={20} color={theme.colors.textSecondary} /><Text style={styles.inputText}>{format(new Date(), 'HH:mm')} WIB</Text></View>

        <Text style={styles.label}>Keluhan / Temuan Kerusakan</Text>
        <View style={styles.textAreaBox}><Wrench size={20} color={theme.colors.textSecondary} style={{ marginTop: 4, marginRight: 8 }} /><TextInput style={styles.textArea} placeholder="Jelaskan secara detail masalah yang dialami unit..." placeholderTextColor={theme.colors.textSecondary} multiline numberOfLines={4} value={description} onChangeText={setDescription} textAlignVertical="top" /></View>

        <Button title="Kirim Pendaftaran" onPress={handleSubmit} style={styles.submitBtn} loading={isSubmitting} disabled={isSubmitting} />
      </Card>
    </View>
  );

  const renderRiwayat = () => (
    <View style={styles.listContainer}>
      <SearchFilterPanel placeholder="Cari registrasi..." onFilter={(f) => setFilters((prev) => ({ ...prev, ...f }))} />
      {loading ? (
        <><Card style={styles.historyCard}><Skeleton height={80} width="100%" /></Card><Card style={styles.historyCard}><Skeleton height={80} width="100%" /></Card></>
      ) : (
        history.map((item) => (
          <Card key={item.id} style={styles.historyCard}>
            <View style={styles.historyHeader}><Text style={styles.historyId}>{item.code || item.id}</Text><Badge text={(item.status || '').toUpperCase()} variant={item.status === 'completed' ? 'success' : 'warning'} /></View>
            <Text style={styles.historyTitle}>{item.title}</Text>
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round((item.ratio || 0) * 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>{item.doneSteps || 0}/9 step</Text>
            </View>
            <View style={styles.historyFooter}>
              {item.status === 'completed' ? <CheckCircle2 size={14} color={theme.colors.textSecondary} /> : <Clock size={14} color={theme.colors.textSecondary} />}
              <Text style={styles.historyDate}>{String(item.created_at || '').slice(0, 10)}</Text>
              <TouchableOpacity style={styles.detailLink} onPress={() => router.push(`/(tabs)/workshop/detail?work_order_id=${item.id}`)}><Text style={styles.detailLinkText}>Lihat Progress</Text></TouchableOpacity>
            </View>
          </Card>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Workshop', headerShown: true, headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: '#fff', headerBackVisible: false, headerBackTitleVisible: false, headerElevation: 0, headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <View style={styles.tabContainer}><TouchableOpacity style={[styles.tabBtn, activeTab === 'ajukan' && styles.tabBtnActive]} onPress={() => setActiveTab('ajukan')}><Text style={[styles.tabText, activeTab === 'ajukan' && styles.tabTextActive]}>Ajukan Registrasi</Text></TouchableOpacity><TouchableOpacity style={[styles.tabBtn, activeTab === 'riwayat' && styles.tabBtnActive]} onPress={() => setActiveTab('riwayat')}><Text style={[styles.tabText, activeTab === 'riwayat' && styles.tabTextActive]}>Riwayat Pengajuan</Text></TouchableOpacity></View>
      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: MENU_BAR_CONTENT_PADDING }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}>
        {activeTab === 'ajukan' ? renderAjukan() : renderRiwayat()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface }, tabContainer: { flexDirection: 'row', backgroundColor: theme.colors.primary, paddingTop: theme.spacing.sm }, tabBtn: { flex: 1, paddingVertical: theme.spacing.md, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' }, tabBtnActive: { borderBottomColor: '#fff' }, tabText: { ...theme.typography.body, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }, tabTextActive: { color: '#fff' }, scrollArea: { flex: 1 }, content: { padding: theme.spacing.md }, heroCard: { padding: theme.spacing.md, marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center' }, heroIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 }, heroTitle: { ...theme.typography.body, fontWeight: '700', color: theme.colors.text }, heroDesc: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 }, headerTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: theme.spacing.xs }, headerSubtitle: { ...theme.typography.caption, marginBottom: theme.spacing.lg }, card: { padding: theme.spacing.lg }, label: { ...theme.typography.h3, fontSize: 16, color: theme.colors.text, marginBottom: theme.spacing.sm, marginTop: theme.spacing.sm }, inputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, backgroundColor: theme.colors.background, marginBottom: theme.spacing.md }, inputText: { ...theme.typography.body, marginLeft: theme.spacing.sm, color: theme.colors.text }, textAreaBox: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, backgroundColor: theme.colors.background, marginBottom: theme.spacing.xl, minHeight: 120 }, textArea: { flex: 1, ...theme.typography.body, color: theme.colors.text }, submitBtn: { marginTop: theme.spacing.sm }, listContainer: { padding: theme.spacing.md }, historyCard: { padding: theme.spacing.md, marginBottom: theme.spacing.sm }, historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }, historyId: { ...theme.typography.caption, fontWeight: 'bold', color: theme.colors.textSecondary }, historyTitle: { ...theme.typography.body, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.sm }, progressWrap: { marginBottom: theme.spacing.sm }, progressTrack: { width: '100%', height: 8, backgroundColor: theme.colors.border, borderRadius: 999, overflow: 'hidden' }, progressFill: { height: 8, backgroundColor: theme.colors.primary, borderRadius: 999 }, progressText: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 4 }, historyFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm }, historyDate: { ...theme.typography.caption, marginLeft: 6, flex: 1 }, detailLink: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.full }, detailLinkText: { ...theme.typography.caption, fontWeight: 'bold', color: theme.colors.primary },
});
