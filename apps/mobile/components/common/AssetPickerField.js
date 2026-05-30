import React, { useCallback, useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList } from 'react-native';
import { Search, ChevronDown } from 'lucide-react-native';
import { theme } from '../../constants/AppTheme';
import { assetsService } from '../../services/assets.service';

export function AssetPickerField({ value, onChange, disabled = false, label = 'Pilih Unit' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAssets = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const res = await assetsService.getAll(1, 50, search || undefined);
      setRows(res?.items || []);
    } catch (_e) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    loadAssets(query);
  }, [open, query, loadAssets]);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => !disabled && setOpen(true)}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.triggerTitle, !value?.id && styles.placeholder]} numberOfLines={1}>
            {value?.id ? `${value.name} (${value.code})` : 'Pilih unit...'}
          </Text>
          <Text style={styles.triggerSub} numberOfLines={1}>{value?.id ? `No Pol: ${value.plateNo || '-'}` : 'Cari berdasarkan nama/kode unit'}</Text>
        </View>
        <ChevronDown size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Pilih Unit</Text>
            <View style={styles.searchBox}>
              <Search size={18} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Cari unit..."
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
            <FlatList
              data={rows}
              keyExtractor={(item) => String(item.id)}
              ListEmptyComponent={<Text style={styles.emptyText}>{loading ? 'Memuat unit...' : 'Unit tidak ditemukan.'}</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => {
                    onChange?.(item);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.rowTitle}>{item.name} ({item.code})</Text>
                  <Text style={styles.rowSub}>No Pol: {item.plateNo || '-'} | HM: {item.hm ?? '-'}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
              <Text style={styles.closeBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs, marginTop: theme.spacing.sm },
  trigger: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  triggerDisabled: { opacity: 0.65 },
  triggerTitle: { ...theme.typography.body, color: theme.colors.text, fontWeight: '600' },
  triggerSub: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
  placeholder: { color: theme.colors.textSecondary, fontWeight: '400' },
  overlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    maxHeight: '78%',
  },
  sheetTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.sm },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  searchInput: { ...theme.typography.body, color: theme.colors.text, flex: 1, minHeight: 42, marginLeft: 8 },
  row: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowTitle: { ...theme.typography.body, color: theme.colors.text, fontWeight: '600' },
  rowSub: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
  emptyText: { ...theme.typography.caption, color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: theme.spacing.lg },
  closeBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: theme.spacing.sm,
  },
  closeBtnText: { ...theme.typography.body, color: '#fff', fontWeight: '700' },
});

