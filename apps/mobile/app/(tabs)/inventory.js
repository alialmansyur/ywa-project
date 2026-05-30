import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { theme } from '../../constants/AppTheme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Search, Package, MapPin, AlertCircle } from 'lucide-react-native';
import { inventoryService } from '../../services/inventory.service';

export default function InventoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [partsRes, stocksRes] = await Promise.all([
          inventoryService.spareParts(1, 200),
          inventoryService.inventoryStocks(1, 500),
        ]);

        const stocks = stocksRes?.data || [];
        const byPart = stocks.reduce((acc, row) => {
          const partId = String(row.part_id || row.spare_part?.id || '');
          if (!partId) return acc;
          if (!acc[partId]) acc[partId] = [];
          acc[partId].push(row);
          return acc;
        }, {});

        const merged = (partsRes?.data || []).map((part) => {
          const inv = byPart[String(part.id)] || part.inventory || [];
          const qtyAvailable = inv.reduce((sum, x) => sum + Number(x.qty_available || 0), 0);
          const locationLabel = inv[0]?.location || 'Gudang';
          return {
            ...part,
            inventory: inv,
            qty_available: qtyAvailable,
            location_label: locationLabel,
          };
        });

        setRows(merged);
      } catch (_e) {
        setRows([]);
      }
    };
    load();
  }, []);

  const filteredData = rows.filter((item) => (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (item.code || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}><View style={styles.searchBox}><Search size={20} color={theme.colors.textSecondary} /><TextInput style={styles.searchInput} placeholder="Cari nama komponen atau SKU..." placeholderTextColor={theme.colors.textSecondary} value={searchQuery} onChangeText={setSearchQuery} /></View></View>
      <ScrollView style={styles.listArea}><Text style={styles.resultText}>Menampilkan {filteredData.length} suku cadang</Text>
        {filteredData.map((item) => (<Card key={item.id} style={styles.itemCard}><View style={styles.itemHeader}><View style={styles.titleBox}><Package size={20} color={theme.colors.primary} /><View style={{ marginLeft: 12 }}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.itemSku}>{item.code} • {item.category || '-'}</Text></View></View><Badge text={item.is_active ? 'Tersedia' : 'Nonaktif'} variant={item.is_active ? 'success' : 'warning'} /></View><View style={styles.itemFooter}><View style={styles.footerInfo}><MapPin size={14} color={theme.colors.textSecondary} /><Text style={styles.footerText}>Lokasi: {item.location_label || 'Gudang'}</Text></View><Text style={[styles.stockText, Number(item?.qty_available || 0) === 0 && { color: theme.colors.error }]}>Stok: {item?.qty_available ?? 0} unit</Text></View></Card>))}
        {filteredData.length === 0 && (<View style={styles.emptyBox}><AlertCircle size={48} color={theme.colors.textSecondary} /><Text style={styles.emptyText}>Komponen tidak ditemukan di gudang ini.</Text></View>)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.background }, searchHeader: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border }, searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, paddingHorizontal: theme.spacing.md, height: 48 }, searchInput: { flex: 1, marginLeft: theme.spacing.sm, ...theme.typography.body, color: theme.colors.text }, listArea: { padding: theme.spacing.md }, resultText: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: theme.spacing.md }, itemCard: { padding: theme.spacing.md, marginBottom: theme.spacing.sm }, itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md }, titleBox: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: theme.spacing.sm }, itemName: { ...theme.typography.body, fontWeight: 'bold', color: theme.colors.text }, itemSku: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 }, itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm }, footerInfo: { flexDirection: 'row', alignItems: 'center' }, footerText: { ...theme.typography.caption, color: theme.colors.textSecondary, marginLeft: 4 }, stockText: { ...theme.typography.caption, fontWeight: 'bold', color: theme.colors.primary }, emptyBox: { alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, marginTop: theme.spacing.xl }, emptyText: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: theme.spacing.md } });
