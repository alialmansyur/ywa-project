import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { theme } from '../../../../constants/AppTheme';
import { Card } from '../../../../components/common/Card';
import { Button } from '../../../../components/common/Button';
import { AlertTriangle, MapPin, Pencil, Trash2, Play, CheckCircle2 } from 'lucide-react-native';
import { Badge } from '../../../../components/common/Badge';
import { useAlert } from '../../../../contexts/AlertContext';
import { useActiveAssetStore } from '../../../../stores/active-asset.store';
import { useAuthStore } from '../../../../stores/auth.store';
import { breakdownReportService } from '../../../../services/breakdown-report.service';
import * as Location from 'expo-location';
import { SearchFilterPanel } from '../../../../components/common/SearchFilterPanel';
import { getCurrentMonthRange } from '../../../../utils/dateRange';
import { AssetPickerField } from '../../../../components/common/AssetPickerField';

export default function ReportScreen() {
  const { showAlert } = useAlert();
  const { activeAsset, loadCurrentAssignment } = useActiveAssetStore();
  const { user } = useAuthStore();
  const roleName = String(user?.role || '').toLowerCase();
  const requiresAssignedAssetRole = ['driver', 'operator'].includes(roleName);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeTab, setActiveTab] = useState('form');
  const [description, setDescription] = useState('');
  const [locationLabel, setLocationLabel] = useState('Mendeteksi lokasi otomatis...');
  const [editingId, setEditingId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const monthRange = getCurrentMonthRange();
  const [filters, setFilters] = useState({ search: '', from: monthRange.from, to: monthRange.to });

  const loadHistory = useCallback(async () => {
    try {
      const effectiveAsset = requiresAssignedAssetRole ? activeAsset : selectedAsset;
      const res = await breakdownReportService.list({ 
        assetId: effectiveAsset?.id,
        search: filters.search,
        from: filters.from,
        to: filters.to
      });
      setHistory(res?.data || []);
    } catch (_e) {
      setHistory([]);
    }
  }, [activeAsset, filters, requiresAssignedAssetRole, selectedAsset]);

  useEffect(() => {
    const load = async () => {
      try {
        await loadCurrentAssignment();
      } catch (_e) {}
    };
    load();
    
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationLabel('Izin lokasi ditolak');
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        setLocationLabel(`${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
      } catch (_e) {
        setLocationLabel('Gagal mendapat lokasi');
      }
    })();
  }, [loadCurrentAssignment]);

  useEffect(() => {
    if (activeAsset?.id) {
      setSelectedAsset(activeAsset);
    }
    loadHistory();
  }, [activeAsset, activeAsset?.id, loadHistory]);

  const resetForm = () => {
    setEditingId(null);
    setDescription('');
    setLocationLabel('Mendeteksi lokasi otomatis...');
  };

  const handleSubmit = async () => {
    const effectiveAsset = requiresAssignedAssetRole ? activeAsset : selectedAsset;
    const effectiveAssetId = effectiveAsset?.id ? String(effectiveAsset.id) : '';
    if (!effectiveAssetId) {
      showAlert({ title: 'Aset Belum Dipilih', message: 'Silakan assign aset terlebih dahulu dari menu Aset Unit.', type: 'warning' });
      return;
    }
    setIsLoading(true);
    try {
      if (editingId) {
        await breakdownReportService.update(editingId, { description, location_label: locationLabel });
        showAlert({ title: 'Laporan Diperbarui', message: 'Perubahan laporan breakdown berhasil disimpan.', type: 'success' });
      } else {
        await breakdownReportService.create({ assetId: effectiveAssetId, description, locationLabel });
        showAlert({ title: 'Laporan Terkirim', message: 'Breakdown report berhasil dikirim ke sistem.', type: 'success' });
      }
      resetForm();
      await loadHistory();
      setActiveTab('riwayat');
    } catch (_e) {
      showAlert({ title: 'Gagal Mengirim', message: 'Periksa data asset dan deskripsi.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const onEdit = (item) => {
    setEditingId(String(item.id));
    setDescription(item.description || '');
    setLocationLabel(item.location_label || 'Mendeteksi lokasi otomatis...');
    setActiveTab('form');
  };

  const onDelete = async (id) => {
    setIsLoading(true);
    try {
      await breakdownReportService.remove(id);
      showAlert({ title: 'Berhasil', message: 'Laporan berhasil dihapus.', type: 'success' });
      loadHistory();
    } catch (_e) {
      showAlert({ title: 'Gagal', message: 'Laporan tidak dapat dihapus.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const onProcess = async (id) => {
    setIsLoading(true);
    try {
      await breakdownReportService.process(id);
      showAlert({ title: 'Diproses', message: 'Laporan berhasil diproses menjadi Work Order.', type: 'success' });
      loadHistory();
    } catch (_e) {
      showAlert({ title: 'Gagal', message: 'Laporan belum bisa diproses.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => (
    <View style={styles.formArea}>
      <View style={styles.header}><AlertTriangle size={32} color={theme.colors.error} style={styles.icon} /><Text style={styles.title}>Lapor Breakdown Darurat</Text><Text style={styles.subtitle}>Gunakan form ini hanya untuk melaporkan kerusakan unit secara mendadak di lapangan.</Text></View>
      <Card style={styles.formCard}>
        <Text style={styles.label}>Detail Unit / Asset</Text>
        {requiresAssignedAssetRole ? (
          <View style={[styles.input, { backgroundColor: theme.colors.background }]}>
            <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>{activeAsset ? activeAsset.name : 'Belum ada aset'}</Text>
            <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>Kode: {activeAsset ? activeAsset.code : '-'}</Text>
            <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>No. Polisi: {activeAsset ? activeAsset.plate_number : '-'}</Text>
          </View>
        ) : (
          <AssetPickerField value={selectedAsset} onChange={setSelectedAsset} label="Pilih Unit (Searchable)" />
        )}
        <Text style={styles.label}>Lokasi Kejadian</Text>
        <View style={styles.locationBox}><MapPin size={20} color={theme.colors.textSecondary} /><Text style={styles.locationText}>{locationLabel}</Text></View>
        <Text style={styles.label}>Deskripsi Kerusakan</Text>
        <TextInput style={[styles.input, { minHeight: 100 }]} multiline value={description} onChangeText={setDescription} placeholder="Jelaskan kondisi kerusakan" placeholderTextColor={theme.colors.textSecondary} />
        <Button title={editingId ? 'Update Laporan' : 'Kirim Laporan Breakdown'} style={styles.submitBtn} onPress={handleSubmit} loading={isLoading} disabled={isLoading} />
      </Card>
    </View>
  );

  if (requiresAssignedAssetRole && !activeAsset?.id) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <AlertTriangle size={80} color={theme.colors.warning} style={{ marginBottom: 24 }} />
        <Text style={{ ...theme.typography.h2, color: theme.colors.text, marginBottom: 8, textAlign: 'center' }}>Unit Belum Ditautkan</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center' }}>
          Silakan assign aset terlebih dahulu untuk lapor breakdown.
        </Text>
      </View>
    );
  }

  const renderRiwayat = () => (
    <View style={styles.listContainer}>
      <SearchFilterPanel placeholder="Cari laporan breakdown..." onFilter={(f) => setFilters((prev) => ({ ...prev, ...f }))} />
      {history.map((item) => (
        <Card key={item.id} style={[styles.formCard, { margin: 0, marginBottom: theme.spacing.sm }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}><Text style={styles.labelHeader}>{item.report_no}</Text><Badge text={(item.status || 'submitted').toUpperCase()} variant={item.status === 'processed' ? 'success' : 'warning'} /></View>
          <Text style={{ ...theme.typography.body, color: theme.colors.text }}>{item.description}</Text>
          <Text style={{ ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 8 }}>{String(item.created_at || '').slice(0, 10)}</Text>
          <View style={{ flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12 }}>
            <TouchableOpacity onPress={() => onEdit(item)}><Pencil size={16} color={theme.colors.primary} /></TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item.id)} style={{ marginLeft: 14 }}><Trash2 size={16} color={theme.colors.error} /></TouchableOpacity>
            {item.status !== 'processed' ? <TouchableOpacity onPress={() => onProcess(item.id)} style={{ marginLeft: 14 }}><Play size={16} color={theme.colors.success} /></TouchableOpacity> : null}
          </View>
        </Card>
      ))}
      {history.length === 0 && <Card style={styles.formCard}><View style={{ alignItems: 'center' }}><CheckCircle2 size={24} color={theme.colors.textSecondary} /><Text style={[styles.historyDate, { marginLeft: 0, marginTop: 8 }]}>Belum ada riwayat lapor.</Text></View></Card>}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'form' && styles.tabBtnActive]} onPress={() => setActiveTab('form')}><Text style={[styles.tabText, activeTab === 'form' && styles.tabTextActive]}>Pengisian Form</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'riwayat' && styles.tabBtnActive]} onPress={() => setActiveTab('riwayat')}><Text style={[styles.tabText, activeTab === 'riwayat' && styles.tabTextActive]}>Riwayat Lapor</Text></TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {activeTab === 'form' ? renderForm() : renderRiwayat()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.surface }, header: { padding: theme.spacing.xl, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.border }, icon: { marginBottom: theme.spacing.sm }, title: { ...theme.typography.h2, color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.xs }, subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 }, tabContainer: { flexDirection: 'row', backgroundColor: theme.colors.primary, paddingTop: theme.spacing.sm }, tabBtn: { flex: 1, paddingVertical: theme.spacing.md, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' }, tabBtnActive: { borderBottomColor: '#fff' }, tabText: { ...theme.typography.body, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }, tabTextActive: { color: '#fff' }, content: { flex: 1 }, formArea: { padding: theme.spacing.md }, listContainer: { padding: theme.spacing.md }, formCard: { margin: theme.spacing.md, padding: theme.spacing.lg, marginBottom: 0 }, label: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.sm, marginTop: theme.spacing.md }, labelHeader: { ...theme.typography.h3, color: theme.colors.text }, input: { ...theme.typography.body, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, backgroundColor: theme.colors.background }, locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.xl }, locationText: { ...theme.typography.body, color: theme.colors.textSecondary, marginLeft: theme.spacing.sm }, submitBtn: { marginTop: theme.spacing.lg }, historyDate: { ...theme.typography.caption, color: theme.colors.textSecondary, flex: 1 } });
