import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { theme } from '../constants/AppTheme';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { HeaderBackButton } from '../components/common/HeaderBackButton';
import { Truck, CheckCircle2, Search, Info, QrCode } from 'lucide-react-native';
import { Badge } from '../components/common/Badge';
import { assetsService } from '../services/assets.service';
import { createHeaderOptions, createHeaderIconButton } from '../utils/header-options';
import { useActiveAssetStore } from '../stores/active-asset.store';
import { useAlert } from '../contexts/AlertContext';
import { useAuthStore } from '../stores/auth.store';
import { MENU_BAR_CONTENT_PADDING } from '../constants/menu-bar';

export default function AssetsScreen() {
  const { showAlert } = useAlert();
  const { user } = useAuthStore();
  const { activeAsset, assignAsset, unassignAsset, loadCurrentAssignment } = useActiveAssetStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [assigningAssetId, setAssigningAssetId] = useState(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await assetsService.getAll(1, 50);
        setAssets(res.items || []);
        await loadCurrentAssignment();
      } catch (_e) {
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loadCurrentAssignment]);

  const handleAssign = async (id) => {
    setAssigningAssetId(String(id));
    try {
      await assignAsset(String(id));
      showAlert({ title: 'Berhasil', message: 'Aset berhasil di-assign ke akun Anda.', type: 'success' });
      setTimeout(() => router.back(), 600);
    } catch (error) {
      showAlert({
        title: 'Gagal',
        message: `${error?.message || 'Aset sedang digunakan user lain atau tidak dapat di-assign.'}\nKode Error: ${error?.code || 'UNKNOWN_ERROR'}`,
        type: 'error',
      });
    } finally {
      setAssigningAssetId(null);
    }
  };

  const handleUnassign = async () => {
    setAssigningAssetId(String(activeAsset?.id || 'active'));
    try {
      await unassignAsset();
      showAlert({ title: 'Berhasil', message: 'Aset berhasil dilepas dari akun Anda.', type: 'success' });
    } catch (_error) {
      showAlert({ title: 'Gagal', message: 'Aset aktif tidak berhasil dilepas.', type: 'error' });
    } finally {
      setAssigningAssetId(null);
    }
  };

  const filteredAssets = assets.filter(
    (item) =>
      (item.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const isAssigned = String(item.id) === String(activeAsset?.id || '');
    const isActionLoading = assigningAssetId !== null && String(assigningAssetId) === String(item.id);
    const assignmentUserId = item.activeAssignment?.userId || null;
    const isUsedByOtherUser = !!assignmentUserId && String(assignmentUserId) !== String(user?.id || '');
    const isAvailable = item.status === 'active' && !isUsedByOtherUser;

    return (
      <Card style={[styles.card, isAssigned && styles.cardActive]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Truck size={24} color={isAssigned ? theme.colors.primary : theme.colors.textSecondary} />
            <View style={styles.titleText}>
              <Text style={styles.codeText}>No. Aset: {item.assetNo || '-'}</Text>
              <Text style={styles.nameText}>{item.name}</Text>
              <Text style={styles.nopolText}>No. Polisi: {item.plateNo || '-'}</Text>
            </View>
          </View>
          <Badge text={(item.status || '').toUpperCase()} variant={isAvailable ? 'success' : 'warning'} />
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <Text style={styles.typeText}>{item.type}</Text>
            <TouchableOpacity style={styles.detailLink} onPress={() => router.push(`/(tabs)/assets/${item.publicUuid || item.code || item.id}`)}>
              <Info size={14} color={theme.colors.primary} />
              <Text style={styles.detailLinkText}>Detail Aset</Text>
            </TouchableOpacity>
          </View>

          {isAvailable || isAssigned ? (
            <TouchableOpacity style={[styles.assignBtn, isAssigned && styles.assignedBtn]} onPress={() => (isAssigned ? handleUnassign() : handleAssign(item.id))} disabled={isActionLoading}>
              {isActionLoading ? (
                <ActivityIndicator size="small" color={isAssigned ? '#fff' : theme.colors.primary} />
              ) : (
                <>
                  {isAssigned && <CheckCircle2 size={16} color="#fff" style={{ marginRight: 6 }} />}
                  <Text style={[styles.assignBtnText, isAssigned && styles.assignedBtnText]}>{isAssigned ? 'Unassign Unit' : 'Assign Unit'}</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.disabledBtn}>
              <Text style={styles.disabledBtnText}>{isUsedByOtherUser ? `Dipakai ${item.activeAssignment?.user?.name || 'user lain'}` : 'Tidak Tersedia'}</Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={createHeaderOptions({
          title: 'Daftar Aset Unit',
          left: () => <HeaderBackButton color="#fff" />,
          right: () => createHeaderIconButton({ onPress: () => router.push('/scanner'), icon: <QrCode color="#fff" size={24} /> }),
        })}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput style={styles.searchInput} placeholder="Cari kode unit, nama, atau nopol..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={theme.colors.textSecondary} />
        </View>
      </View>

      {loading ? (
        <View style={styles.list}>
          <Card style={styles.card}><Skeleton height={140} width="100%" /></Card>
          <Card style={styles.card}><Skeleton height={140} width="100%" /></Card>
        </View>
      ) : (
        <FlatList data={filteredAssets} keyExtractor={(item) => String(item.id)} renderItem={renderItem} contentContainerStyle={[styles.list, { paddingBottom: MENU_BAR_CONTENT_PADDING }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.surface }, searchContainer: { padding: theme.spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.border }, searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.full, paddingHorizontal: theme.spacing.md, height: 44 }, searchInput: { flex: 1, marginLeft: theme.spacing.sm, ...theme.typography.body, color: theme.colors.text }, list: { padding: theme.spacing.md }, card: { marginBottom: theme.spacing.md }, cardActive: { borderColor: theme.colors.primary, borderWidth: 2 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md }, titleRow: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 }, titleText: { marginLeft: theme.spacing.md, flex: 1 }, codeText: { ...theme.typography.h3, color: theme.colors.text }, nameText: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: 2 }, nopolText: { ...theme.typography.caption, fontWeight: 'bold', marginTop: 4, color: theme.colors.text }, cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.md }, footerLeft: { flex: 1 }, typeText: { ...theme.typography.caption, fontWeight: '600', marginBottom: 6 }, detailLink: { flexDirection: 'row', alignItems: 'center' }, detailLinkText: { ...theme.typography.caption, fontWeight: 'bold', color: theme.colors.primary, marginLeft: 4 }, assignBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.primary }, assignedBtn: { backgroundColor: theme.colors.primary }, assignBtnText: { ...theme.typography.body, fontWeight: '600', color: theme.colors.primary, fontSize: 14 }, assignedBtnText: { color: '#fff' }, disabledBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.border }, disabledBtnText: { ...theme.typography.caption, fontWeight: '600', color: theme.colors.textSecondary } });
