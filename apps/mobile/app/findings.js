import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../constants/AppTheme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { HeaderBackButton } from '../components/common/HeaderBackButton';
import { Camera, FileText, CheckCircle2, Trash2, Pencil, AlertTriangle, FileSearch } from 'lucide-react-native';
import { Badge } from '../components/common/Badge';
import { useAlert } from '../contexts/AlertContext';
import { findingsService } from '../services/findings.service';
import { useActiveAssetStore } from '../stores/active-asset.store';
import { useAuthStore } from '../stores/auth.store';
import { SearchFilterPanel } from '../components/common/SearchFilterPanel';
import { getCurrentMonthRange } from '../utils/dateRange';
import { MENU_BAR_CONTENT_PADDING } from '../constants/menu-bar';
import { AssetPickerField } from '../components/common/AssetPickerField';

const ASSET_PARTS = [
  'Mesin / Engine',
  'Roda / Ban',
  'Hidrolik',
  'Kelistrikan / Lampu',
  'Kabin / Interior',
  'Bodi / Eksterior',
  'Sistem Rem',
  'Sistem Pendingin',
  'Transmisi',
  'Lainnya'
];

export default function FindingsScreen() {
  const { showAlert } = useAlert();
  const { activeAsset, loadCurrentAssignment } = useActiveAssetStore();
  const { user } = useAuthStore();
  const roleName = String(user?.role || '').toLowerCase();
  const requiresAssignedAssetRole = ['driver', 'operator'].includes(roleName);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeTab, setActiveTab] = useState('ajukan');
  const [rows, setRows] = useState([]);
  const [section, setSection] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const loadSeqRef = useRef(0);
  const lastFetchAtRef = useRef(0);
  const monthRange = getCurrentMonthRange();
  const [filters, setFilters] = useState({ search: '', from: monthRange.from, to: monthRange.to });

  const load = useCallback(async () => {
    const now = Date.now();
    if (isFetchingRef.current) return;
    if (now - lastFetchAtRef.current < 1200) return;

    const effectiveAsset = requiresAssignedAssetRole ? activeAsset : selectedAsset;
    if (!effectiveAsset?.id) return;

    isFetchingRef.current = true;
    lastFetchAtRef.current = now;
    const loadSeq = ++loadSeqRef.current;
    try {
      const res = await findingsService.list({ 
        assetId: effectiveAsset.id,
        search: filters.search,
        from: filters.from,
        to: filters.to
      });
      if (loadSeq !== loadSeqRef.current) return;
      setRows(res?.data || []);
    } catch (_e) {
      if (loadSeq !== loadSeqRef.current) return;
      setRows([]);
    } finally {
      isFetchingRef.current = false;
    }
  }, [activeAsset?.id, filters.from, filters.search, filters.to, requiresAssignedAssetRole, selectedAsset?.id]);

  useEffect(() => {
    loadCurrentAssignment().catch(() => {});
  }, [loadCurrentAssignment]);

  useEffect(() => {
    if (activeTab === 'riwayat') {
      load();
    }
  }, [activeTab, load]);

  useEffect(() => {
    if (activeAsset?.id) setSelectedAsset(activeAsset);
  }, [activeAsset]);

  if (requiresAssignedAssetRole && !activeAsset?.id) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Stack.Screen options={{ title: 'Temuan Aset', headerShown: true, headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: '#fff', headerBackVisible: false, headerBackTitleVisible: false, headerElevation: 0, headerLeft: () => <HeaderBackButton color="#fff" /> }} />
        <AlertTriangle size={80} color={theme.colors.warning} style={{ marginBottom: 24 }} />
        <Text style={{ ...theme.typography.h2, color: theme.colors.text, marginBottom: 8, textAlign: 'center' }}>Unit Belum Ditautkan</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center' }}>
          Silakan assign aset terlebih dahulu untuk membuat temuan.
        </Text>
      </View>
    );
  }

  const pickPhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      showAlert({
        title: 'Izin Kamera Diperlukan',
        message: 'Silakan izinkan akses kamera agar bisa mengambil foto temuan.',
        type: 'warning',
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setPhoto({ uri: asset.uri, name: `temuan-${Date.now()}.jpg`, type: 'image/jpeg' });
    }
  };

  const resetForm = () => {
    setSection('');
    setDescription('');
    setPhoto(null);
    setEditingId(null);
  };

  const submit = async () => {
    const effectiveAsset = requiresAssignedAssetRole ? activeAsset : selectedAsset;
    if (!effectiveAsset?.id) {
      showAlert({ title: 'Aset Belum Dipilih', message: 'Silakan assign aset terlebih dahulu dari menu Aset Unit.', type: 'warning' });
      return;
    }
    if (!section || !description) {
      showAlert({ title: 'Input Tidak Lengkap', message: 'Bagian aset dan deskripsi wajib diisi.', type: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        await findingsService.update(editingId, { section, description, photo });
      } else {
        await findingsService.create({ assetId: effectiveAsset.id, section, description, photo });
      }
      showAlert({ title: 'Berhasil', message: 'Laporan temuan berhasil disimpan.', type: 'success' });
      resetForm();
      await load();
      setActiveTab('riwayat');
    } catch (_e) {
      showAlert({ title: 'Gagal', message: 'Laporan temuan belum berhasil dikirim.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const onEdit = (item) => {
    setEditingId(String(item.id));
    setSection(item.section || '');
    setDescription(item.description || '');
    setPhoto(null);
    setActiveTab('ajukan');
  };

  const onDelete = async (id) => {
    setIsLoading(true);
    try {
      await findingsService.remove(id);
      showAlert({ title: 'Berhasil', message: 'Temuan berhasil dihapus.', type: 'success' });
      load();
    } catch (_e) {
      showAlert({ title: 'Gagal', message: 'Temuan tidak dapat dihapus.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderAjukan = () => (
    <View>
      <Card style={styles.heroCard}>
        <View style={styles.heroIcon}><FileSearch size={20} color={theme.colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Temuan Aset</Text>
          <Text style={styles.heroDesc}>Laporkan ketidaknormalan unit dengan foto dan deskripsi yang jelas.</Text>
        </View>
      </Card>
      <Card style={styles.formCard}>
      {!requiresAssignedAssetRole && <AssetPickerField value={selectedAsset} onChange={setSelectedAsset} label="Pilih Unit (Searchable)" />}
      <Text style={styles.label}>Pilih Bagian Aset</Text>
      <View style={styles.chipContainer}>
        {ASSET_PARTS.map((part) => (
          <TouchableOpacity
            key={part}
            style={[styles.chip, section === part && styles.chipActive]}
            onPress={() => setSection(part)}
          >
            <Text style={[styles.chipText, section === part && styles.chipTextActive]}>{part}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Deskripsi Temuan</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Jelaskan detail ketidaknormalan yang ditemukan..." placeholderTextColor={theme.colors.textSecondary} multiline numberOfLines={4} textAlignVertical="top" value={description} onChangeText={setDescription} />

      <Text style={styles.label}>Bukti Foto</Text>
      <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7} onPress={pickPhoto}>
        {photo?.uri ? <Image source={{ uri: photo.uri }} style={{ width: '100%', height: 140, borderRadius: 8 }} /> : <><Camera size={32} color={theme.colors.primary} style={{ marginBottom: 8 }} /><Text style={styles.uploadText}>Ambil Foto Temuan</Text></>}
      </TouchableOpacity>

      <Button title={editingId ? 'Update Temuan' : 'Kirim Laporan Temuan'} style={{ marginTop: theme.spacing.md }} onPress={submit} loading={isLoading} disabled={isLoading} />
      </Card>
    </View>
  );

  const renderRiwayat = () => (
    <View style={styles.listContainer}>
      <SearchFilterPanel placeholder="Cari temuan..." onFilter={(f) => setFilters((prev) => ({ ...prev, ...f }))} />
      {rows.map((item) => (
        <Card style={styles.historyCard} key={item.id}>
          <View style={styles.historyHeader}><Text style={styles.historyId}>{item.code}</Text><Badge text={(item.status || 'submitted').toUpperCase()} variant={item.status === 'resolved' ? 'success' : 'warning'} /></View>
          <Text style={styles.historyTitle}>{item.section}</Text>
          <Text style={styles.historyDesc}>{item.description}</Text>
          <View style={styles.historyFooter}><FileText size={14} color={theme.colors.textSecondary} /><Text style={styles.historyDate}>{String(item.created_at || '').slice(0, 10)}</Text><TouchableOpacity onPress={() => onEdit(item)}><Pencil size={16} color={theme.colors.primary} /></TouchableOpacity><TouchableOpacity onPress={() => onDelete(item.id)} style={{ marginLeft: 12 }}><Trash2 size={16} color={theme.colors.error} /></TouchableOpacity></View>
        </Card>
      ))}
      {rows.length === 0 && <Card style={styles.historyCard}><View style={{ alignItems: 'center' }}><CheckCircle2 size={24} color={theme.colors.textSecondary} /><Text style={[styles.historyDate, { marginLeft: 0, marginTop: 8 }]}>Belum ada temuan.</Text><TouchableOpacity style={styles.emptyBtn} onPress={() => setActiveTab('ajukan')}><Text style={styles.emptyBtnText}>Buat Temuan</Text></TouchableOpacity></View></Card>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Temuan Aset', headerShown: true, headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: '#fff', headerBackVisible: false, headerBackTitleVisible: false, headerElevation: 0, headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <View style={styles.tabContainer}><TouchableOpacity style={[styles.tabBtn, activeTab === 'ajukan' && styles.tabBtnActive]} onPress={() => setActiveTab('ajukan')}><Text style={[styles.tabText, activeTab === 'ajukan' && styles.tabTextActive]}>Ajukan Temuan</Text></TouchableOpacity><TouchableOpacity style={[styles.tabBtn, activeTab === 'riwayat' && styles.tabBtnActive]} onPress={() => setActiveTab('riwayat')}><Text style={[styles.tabText, activeTab === 'riwayat' && styles.tabTextActive]}>Riwayat Pengajuan</Text></TouchableOpacity></View>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: MENU_BAR_CONTENT_PADDING }}>{activeTab === 'ajukan' ? renderAjukan() : renderRiwayat()}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.surface }, tabContainer: { flexDirection: 'row', backgroundColor: theme.colors.primary, paddingTop: theme.spacing.sm }, tabBtn: { flex: 1, paddingVertical: theme.spacing.md, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' }, tabBtnActive: { borderBottomColor: '#fff' }, tabText: { ...theme.typography.body, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }, tabTextActive: { color: '#fff' }, content: { flex: 1 }, heroCard: { margin: theme.spacing.md, marginBottom: 0, padding: theme.spacing.md, flexDirection: 'row', alignItems: 'center' }, heroIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 }, heroTitle: { ...theme.typography.body, fontWeight: '700', color: theme.colors.text }, heroDesc: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 }, formCard: { margin: theme.spacing.md, padding: theme.spacing.lg }, label: { ...theme.typography.caption, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.xs, marginTop: theme.spacing.sm }, input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, ...theme.typography.body, backgroundColor: theme.colors.background, marginBottom: theme.spacing.md }, textArea: { minHeight: 100 }, uploadBox: { borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed', borderRadius: theme.borderRadius.md, padding: theme.spacing.xl, alignItems: 'center', backgroundColor: theme.colors.primaryLight, marginBottom: theme.spacing.lg }, uploadText: { ...theme.typography.body, fontWeight: '600', color: theme.colors.primary }, listContainer: { padding: theme.spacing.md }, historyCard: { padding: theme.spacing.md, marginBottom: theme.spacing.sm }, historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }, historyId: { ...theme.typography.caption, fontWeight: 'bold', color: theme.colors.textSecondary }, historyTitle: { ...theme.typography.body, fontWeight: '600', color: theme.colors.text, marginBottom: 6 }, historyDesc: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: theme.spacing.md }, historyFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm }, historyDate: { ...theme.typography.caption, marginLeft: 6, flex: 1 }, chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.md }, chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background }, chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }, chipText: { ...theme.typography.caption, color: theme.colors.textSecondary }, chipTextActive: { color: '#fff', fontWeight: '600' }, emptyBtn: { marginTop: 10, backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.full, paddingHorizontal: 14, paddingVertical: 8 }, emptyBtnText: { ...theme.typography.caption, color: '#fff', fontWeight: '700' } });
