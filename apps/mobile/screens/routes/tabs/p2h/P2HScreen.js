import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../../../constants/AppTheme';
import { Card } from '../../../../components/common/Card';
import { Button } from '../../../../components/common/Button';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react-native';
import { useAlert } from '../../../../contexts/AlertContext';
import { p2hService } from '../../../../services/p2h.service';
import { useActiveAssetStore } from '../../../../stores/active-asset.store';
import { SearchFilterPanel } from '../../../../components/common/SearchFilterPanel';
import { getCurrentMonthRange, isSameDay } from '../../../../utils/dateRange';

export default function P2HScreen() {
  const { showAlert } = useAlert();
  const { activeAsset, loadCurrentAssignment } = useActiveAssetStore();
  const [activeTab, setActiveTab] = useState('form');
  const [formState, setFormState] = useState({});
  const [template, setTemplate] = useState(null);
  const [templateError, setTemplateError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const monthRange = getCurrentMonthRange();
  const [filters, setFilters] = useState({ search: '', from: monthRange.from, to: monthRange.to });
  const [todayLocked, setTodayLocked] = useState(false);

  const isSubmittedToday = useCallback((row) => isSameDay(row?.submission_date || row?.created_at, new Date()), []);

  const loadData = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setIsRefreshing(true);
    try {
      await loadCurrentAssignment();
    } catch (_e) {}

    if (!activeAsset?.id) {
      setTemplate(null);
      setTemplateError('');
      setHistory([]);
      setHistoryError('');
      setTodayLocked(false);
      if (!silent) setIsRefreshing(false);
      return;
    }

    const assetId = String(activeAsset.id);

    try {
      const tpl = await p2hService.getChecklistTemplate(assetId);
      const hasItems = Array.isArray(tpl?.items) && tpl.items.length > 0;
      setTemplate(hasItems ? tpl : null);
      setTemplateError(hasItems ? '' : 'Template P2H untuk unit ini tidak tersedia atau belum memiliki item checklist.');
    } catch (error) {
      setTemplate(null);
      setTemplateError(error?.message || 'Template P2H gagal dimuat. Silakan coba lagi.');
    }

    try {
      const hist = await p2hService.getHistory(assetId, 1, 10, filters.search, filters.from, filters.to);
      const rows = hist?.data || [];
      setHistory(rows);
      setHistoryError('');
    } catch (error) {
      setHistory([]);
      setHistoryError(error?.message || 'Riwayat P2H gagal dimuat.');
    } finally {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const todayHistory = await p2hService.getHistory(assetId, 1, 1, null, today, today);
        setTodayLocked((todayHistory?.data || []).some(isSubmittedToday));
      } catch (_lockError) {
        setTodayLocked(false);
      } finally {
        if (!silent) setIsRefreshing(false);
      }
    }
  }, [activeAsset?.id, filters, isSubmittedToday, loadCurrentAssignment]);

  useEffect(() => {
    loadData({ silent: false });
  }, [loadData]);

  const items = (template?.items || []).map((item, idx) => ({
    ...item,
    id: String(item.id || item.item_name || idx + 1),
  }));

  const handleCheck = (id, status) => {
    setFormState((prev) => ({ ...prev, [id]: status }));
  };

  const submit = async () => {
    if (!activeAsset?.id) {
      showAlert({ title: 'Aset Belum Dipilih', message: 'Silakan assign aset terlebih dahulu dari menu Aset Unit.', type: 'warning' });
      return;
    }
    if (!template?.id || items.length === 0) {
      showAlert({ title: 'Template Tidak Siap', message: templateError || 'Template P2H belum siap dipakai. Muat ulang data lalu coba lagi.', type: 'warning' });
      return;
    }
    if (todayLocked) {
      showAlert({ title: 'Sudah Diisi', message: 'Form P2H hari ini sudah diisi. Pengisian harian dikunci untuk mencegah data double.', type: 'warning' });
      return;
    }
    setIsLoading(true);
    try {
      const payloadItems = items.map((i) => ({ item_name: i.item_name || i.title, condition: formState[i.id] === 'danger' ? 'not_ok' : formState[i.id] === 'ok' ? 'ok' : 'na' }));
      await p2hService.submit({ asset_id: String(activeAsset.id), template_id: String(template.id), items: payloadItems });
      setFormState({});
      try {
        const hist = await p2hService.getHistory(String(activeAsset.id), 1, 10, filters.search, filters.from, filters.to);
        setHistory(hist?.data || []);
        setHistoryError('');
      } catch (_historyError) {
        // Keep existing history if reload fails.
      }
      setTodayLocked(true);
      setActiveTab('history');
      showAlert({ title: 'Laporan Terkirim', message: 'Data P2H berhasil disimpan dan diteruskan ke Dispatch Control.', type: 'success', buttonText: 'Selesai' });
    } catch (error) {
      showAlert({ title: 'Gagal', message: error?.message || 'Data P2H belum berhasil dikirim.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeAsset?.id) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <AlertTriangle size={80} color={theme.colors.warning} style={{ marginBottom: 24 }} />
        <Text style={{ ...theme.typography.h2, color: theme.colors.text, marginBottom: 8, textAlign: 'center' }}>Unit Belum Ditautkan</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center' }}>
          Silakan assign aset terlebih dahulu dari menu Aset Unit untuk mulai mengisi P2H.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}><TouchableOpacity style={[styles.tabBtn, activeTab === 'form' && styles.tabBtnActive]} onPress={() => setActiveTab('form')}><Text style={[styles.tabText, activeTab === 'form' && styles.tabTextActive]}>Form Harian</Text></TouchableOpacity><TouchableOpacity style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]} onPress={() => setActiveTab('history')}><Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>Riwayat Pengisian</Text></TouchableOpacity></View>
      <ScrollView style={styles.scrollArea}>{activeTab === 'form' ? <View style={styles.tabContent}><Card style={styles.infoCard}><Text style={styles.infoTitle}>P2H Shift Pagi (06:00 - 18:00)</Text><Text style={styles.infoDesc}>Unit: {activeAsset ? `${activeAsset.name} (${activeAsset.code})` : '-'}</Text>{todayLocked ? <Text style={[styles.infoDesc, { color: theme.colors.warning, marginTop: 8 }]}>Pengisian hari ini sudah dilakukan.</Text> : null}{templateError ? <Text style={[styles.infoDesc, { color: theme.colors.error, marginTop: 8 }]}>{templateError}</Text> : null}{isRefreshing ? <Text style={[styles.infoDesc, { marginTop: 8 }]}>Memuat data terbaru...</Text> : null}</Card>{templateError ? <Card style={styles.checkCard}><Text style={styles.checkTitle}>Template belum siap</Text><Text style={styles.infoDesc}>Template P2H untuk unit ini tidak dapat dipakai. Muat ulang untuk mencoba kembali.</Text><Button title="Muat Ulang Template" style={{ marginTop: theme.spacing.md }} onPress={() => loadData({ silent: false })} /></Card> : null}{items.map((item) => (<Card key={item.id} style={styles.checkCard}><Text style={styles.checkTitle}>{item.item_name || item.title}</Text><View style={styles.actionRow}><TouchableOpacity style={[styles.checkBtn, formState[item.id] === 'ok' && styles.checkBtnActiveOk]} onPress={() => handleCheck(item.id, 'ok')} activeOpacity={0.7}><CheckCircle size={20} color={formState[item.id] === 'ok' ? '#fff' : theme.colors.success} /><Text style={[styles.checkBtnText, formState[item.id] === 'ok' && { color: '#fff' }]}>Aman</Text></TouchableOpacity><TouchableOpacity style={[styles.checkBtn, formState[item.id] === 'warning' && styles.checkBtnActiveWarning]} onPress={() => handleCheck(item.id, 'warning')} activeOpacity={0.7}><AlertTriangle size={20} color={formState[item.id] === 'warning' ? '#fff' : theme.colors.warning} /><Text style={[styles.checkBtnText, formState[item.id] === 'warning' && { color: '#fff' }]}>Catatan</Text></TouchableOpacity><TouchableOpacity style={[styles.checkBtn, formState[item.id] === 'danger' && styles.checkBtnActiveDanger]} onPress={() => handleCheck(item.id, 'danger')} activeOpacity={0.7}><XCircle size={20} color={formState[item.id] === 'danger' ? '#fff' : theme.colors.error} /><Text style={[styles.checkBtnText, formState[item.id] === 'danger' && { color: '#fff' }]}>Rusak</Text></TouchableOpacity></View></Card>))}<Button title="Kirim Laporan P2H" style={{ marginTop: theme.spacing.lg }} onPress={submit} loading={isLoading} disabled={isLoading || todayLocked || !template?.id || items.length === 0} /></View> : <View style={styles.tabContent}><SearchFilterPanel placeholder="Cari laporan..." onFilter={(f) => setFilters((prev) => ({ ...prev, ...f }))} />{historyError ? <Card style={styles.historyCard}><Text style={[styles.historyDetail, { color: theme.colors.error }]}>{historyError}</Text><Button title="Muat Ulang Riwayat" style={{ marginTop: theme.spacing.md }} onPress={() => loadData({ silent: false })} /></Card> : null}{history.map((h) => <Card key={h.id} style={styles.historyCard}><View style={styles.historyHeader}><Text style={styles.historyDate}>{String(h.created_at || '').slice(0, 10)}</Text><View style={[styles.statusBadge, { backgroundColor: theme.colors.success + '20' }]}><Text style={[styles.statusText, { color: theme.colors.success }]}>{(h.status || 'submitted').toUpperCase()}</Text></View></View><Text style={styles.historyDetail}>Asset: {h?.asset?.name || '-'}</Text></Card>)}</View>}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.background }, tabContainer: { flexDirection: 'row', backgroundColor: theme.colors.primary, paddingTop: theme.spacing.sm }, tabBtn: { flex: 1, paddingVertical: theme.spacing.md, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' }, tabBtnActive: { borderBottomColor: '#fff' }, tabText: { ...theme.typography.body, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }, tabTextActive: { color: '#fff' }, scrollArea: { flex: 1 }, tabContent: { padding: theme.spacing.md }, infoCard: { padding: theme.spacing.md, marginBottom: theme.spacing.lg, backgroundColor: theme.colors.primary + '10' }, infoTitle: { ...theme.typography.body, fontWeight: 'bold', color: theme.colors.primaryDark }, infoDesc: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 4 }, checkCard: { padding: theme.spacing.md, marginBottom: theme.spacing.sm }, checkTitle: { ...theme.typography.body, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.md }, actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, checkBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.surface, gap: 6 }, checkBtnText: { ...theme.typography.caption, fontWeight: '600', color: theme.colors.textSecondary }, checkBtnActiveOk: { backgroundColor: theme.colors.success, borderColor: theme.colors.success }, checkBtnActiveWarning: { backgroundColor: theme.colors.warning, borderColor: theme.colors.warning }, checkBtnActiveDanger: { backgroundColor: theme.colors.error, borderColor: theme.colors.error }, historyCard: { padding: theme.spacing.md, marginBottom: theme.spacing.md }, historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }, historyDate: { ...theme.typography.body, fontWeight: 'bold', color: theme.colors.text }, statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }, statusText: { fontSize: 12, fontWeight: 'bold' }, historyDetail: { ...theme.typography.caption, color: theme.colors.textSecondary } });
