import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { theme } from '../../../../constants/AppTheme';
import { Card } from '../../../../components/common/Card';
import { Button } from '../../../../components/common/Button';
import { HeaderBackButton } from '../../../../components/common/HeaderBackButton';
import { CheckCircle, Timer, Truck, MapPin, Activity, FileText, AlertTriangle } from 'lucide-react-native';
import { useAlert } from '../../../../contexts/AlertContext';
import { assetsService } from '../../../../services/assets.service';
import { useActiveAssetStore } from '../../../../stores/active-asset.store';
import { useAuthStore } from '../../../../stores/auth.store';
import { SearchFilterPanel } from '../../../../components/common/SearchFilterPanel';
import { getCurrentMonthRange } from '../../../../utils/dateRange';
import { AssetPickerField } from '../../../../components/common/AssetPickerField';

export default function HMTrackingScreen() {
  const { showAlert } = useAlert();
  const { activeAsset, loadCurrentAssignment } = useActiveAssetStore();
  const { user } = useAuthStore();
  const roleName = String(user?.role || '').toLowerCase();
  const requiresAssignedAssetRole = ['driver', 'operator'].includes(roleName);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeTab, setActiveTab] = useState('form');
  const [hmStart, setHmStart] = useState('0');
  const [hmEnd, setHmEnd] = useState('');
  const [history, setHistory] = useState([]);
  const monthRange = getCurrentMonthRange();
  const [filters, setFilters] = useState({ search: '', from: monthRange.from, to: monthRange.to });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await loadCurrentAssignment();
      } catch (_e) {}
    };
    load();
  }, [loadCurrentAssignment]);

  useEffect(() => {
    setHmStart(String(activeAsset?.hm ?? '0'));
    if (activeAsset?.id) setSelectedAsset(activeAsset);
  }, [activeAsset]);

  const loadHistory = useCallback(async () => {
    const effectiveAsset = requiresAssignedAssetRole ? activeAsset : selectedAsset;
    if (!effectiveAsset?.id) return;
    try {
      const res = await assetsService.getHistory(effectiveAsset.id, 1, 50, filters.from, filters.to);
      setHistory(res?.data || (Array.isArray(res) ? res : []));
    } catch (_e) {
      setHistory([]);
    }
  }, [activeAsset, filters, requiresAssignedAssetRole, selectedAsset]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const diff = hmEnd ? Number(hmEnd) - Number(hmStart) : 0;

  const handleSubmit = async () => {
    if (!hmEnd) {
      showAlert({ title: 'Input Tidak Lengkap', message: 'Harap lengkapi angka HM Akhir sebelum menyimpan.', type: 'warning' });
      return;
    }
    const effectiveAsset = requiresAssignedAssetRole ? activeAsset : selectedAsset;
    if (!effectiveAsset?.id) {
      showAlert({ title: 'Aset Belum Dipilih', message: 'Silakan assign aset terlebih dahulu dari menu Aset Unit.', type: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      await assetsService.updateHM(effectiveAsset.id, Number(hmEnd));
      showAlert({ title: 'Berhasil Disimpan!', message: 'Data Hour Meter telah dicatat.', type: 'success' });
      setHmEnd('');
      await loadHistory();
      setActiveTab('riwayat');
    } catch (_e) {
      showAlert({ title: 'Gagal', message: 'HM tidak berhasil dikirim ke server.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => (
    <View style={styles.formArea}>
      {(() => {
        const effectiveAsset = requiresAssignedAssetRole ? activeAsset : selectedAsset;
        return (
      <View style={styles.assetInfoArea}>
        <Card style={styles.infoCard}>
          {!requiresAssignedAssetRole && <AssetPickerField value={selectedAsset} onChange={setSelectedAsset} label="Pilih Unit (Searchable)" />}
          <View style={styles.infoRow}><Truck size={18} color={theme.colors.textSecondary} /><Text style={styles.infoText}>Unit: {effectiveAsset ? `${effectiveAsset.name} (${effectiveAsset.code})` : '-'}</Text></View>
          <View style={styles.infoRow}><MapPin size={18} color={theme.colors.textSecondary} /><Text style={styles.infoText}>Lokasi: {effectiveAsset?.location || '-'}</Text></View>
          <View style={styles.infoRow}><Activity size={18} color={theme.colors.textSecondary} /><Text style={styles.infoText}>Status Aset: {effectiveAsset?.status || '-'}</Text></View>
        </Card>
      </View>
        );
      })()}
      <Card style={styles.card}>
        <Text style={styles.label}>HM Awal Shift (Otomatis dari shift lalu)</Text>
        <TextInput style={[styles.input, styles.inputDisabled]} value={hmStart} editable={false} />
        <Text style={styles.label}>HM Akhir Shift Saat Ini</Text>
        <TextInput style={styles.input} placeholder="Masukkan angka HM..." value={hmEnd} onChangeText={setHmEnd} keyboardType="number-pad" />
        {diff > 0 && <Text style={{ color: theme.colors.success, marginBottom: theme.spacing.sm, fontWeight: 'bold' }}>+ {diff} Jam / KM Operasional</Text>}
        <Button title="Simpan Log HM" onPress={handleSubmit} loading={isLoading} disabled={isLoading} style={{ marginTop: theme.spacing.lg }} />
      </Card>
    </View>
  );

  if (requiresAssignedAssetRole && !activeAsset?.id) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Stack.Screen options={{ title: 'HM Tracking', headerShown: true, headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: '#fff', headerBackVisible: false, headerBackTitleVisible: false, headerElevation: 0, headerLeft: () => <HeaderBackButton color="#fff" /> }} />
        <AlertTriangle size={80} color={theme.colors.warning} style={{ marginBottom: 24 }} />
        <Text style={{ ...theme.typography.h2, color: theme.colors.text, marginBottom: 8, textAlign: 'center' }}>Unit Belum Ditautkan</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center' }}>
          Silakan assign aset terlebih dahulu untuk mengisi HM record.
        </Text>
      </View>
    );
  }

  const renderRiwayat = () => (
    <View style={styles.listContainer}>
      <SearchFilterPanel placeholder="Filter Tanggal HM..." onFilter={(f) => setFilters((prev) => ({ ...prev, ...f }))} />
      {history.map((h, i) => (
        <Card key={i} style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Timer size={20} color={theme.colors.primary} />
            <Text style={styles.historyValue}>{h.hm_value || h.hm || h.value || '-'} HM</Text>
          </View>
          <View style={styles.historyFooter}>
            <FileText size={14} color={theme.colors.textSecondary} />
            <Text style={styles.historyDate}>{String(h.created_at || '').replace('T', ' ').slice(0, 16)}</Text>
          </View>
        </Card>
      ))}
      {history.length === 0 && <Card style={styles.historyCard}><View style={{ alignItems: 'center' }}><CheckCircle size={24} color={theme.colors.textSecondary} /><Text style={[styles.historyDate, { marginLeft: 0, marginTop: 8 }]}>Belum ada riwayat.</Text></View></Card>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'HM Tracking', headerShown: true, headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: '#fff', headerBackVisible: false, headerBackTitleVisible: false, headerElevation: 0, headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'form' && styles.tabBtnActive]} onPress={() => setActiveTab('form')}><Text style={[styles.tabText, activeTab === 'form' && styles.tabTextActive]}>Pengisian HM</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'riwayat' && styles.tabBtnActive]} onPress={() => setActiveTab('riwayat')}><Text style={[styles.tabText, activeTab === 'riwayat' && styles.tabTextActive]}>Riwayat HM</Text></TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {activeTab === 'form' ? renderForm() : renderRiwayat()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.surface }, tabContainer: { flexDirection: 'row', backgroundColor: theme.colors.primary, paddingTop: theme.spacing.sm }, tabBtn: { flex: 1, paddingVertical: theme.spacing.md, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' }, tabBtnActive: { borderBottomColor: '#fff' }, tabText: { ...theme.typography.body, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }, tabTextActive: { color: '#fff' }, content: { flex: 1 }, formArea: { padding: theme.spacing.md }, assetInfoArea: { marginBottom: theme.spacing.lg }, infoCard: { padding: theme.spacing.md, backgroundColor: theme.colors.primaryLight, borderWidth: 1, borderColor: theme.colors.primary + '30' }, infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 }, infoText: { ...theme.typography.body, fontSize: 14, color: theme.colors.text, marginLeft: theme.spacing.sm, fontWeight: '500' }, card: { padding: theme.spacing.lg }, label: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs, marginTop: theme.spacing.sm }, input: { ...theme.typography.body, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, backgroundColor: theme.colors.background, marginBottom: theme.spacing.sm }, inputDisabled: { backgroundColor: theme.colors.surface, color: theme.colors.textSecondary }, listContainer: { padding: theme.spacing.md }, historyCard: { padding: theme.spacing.md, marginBottom: theme.spacing.sm }, historyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }, historyValue: { ...theme.typography.h3, fontWeight: 'bold', color: theme.colors.primary, marginLeft: 8 }, historyFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm }, historyDate: { ...theme.typography.caption, color: theme.colors.textSecondary, marginLeft: 6, flex: 1 } });
