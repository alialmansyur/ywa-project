import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { theme } from '../../../../constants/AppTheme';
import { Card } from '../../../../components/common/Card';
import { Badge } from '../../../../components/common/Badge';
import { HeaderBackButton } from '../../../../components/common/HeaderBackButton';
import { Truck, Clock, Wrench, ShieldCheck, FileText, Camera } from 'lucide-react-native';
import { assetsService } from '../../../../services/assets.service';

const TABS = [
  { key: 'overview', label: 'Informasi' },
  { key: 'photos', label: 'Foto' },
  { key: 'triggers', label: 'Trigger' },
  { key: 'schedule', label: 'Jadwal' },
  { key: 'documents', label: 'Dokumen' },
  { key: 'workshop', label: 'Workshop' },
];

function readStatusVariant(status) {
  if (status === 'active') return 'success';
  if (status === 'breakdown') return 'danger';
  if (status === 'maintenance') return 'warning';
  return 'primary';
}

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams();
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState({
    asset: null,
    photos: [],
    preventive: null,
    schedules: [],
    workshopHistory: [],
    documents: [],
    kpis: { breakdown_count: 0, findings_count: 0 },
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await assetsService.getDetailByRef(String(id));
        setBundle(data);
      } catch (_e) {
        setBundle({ asset: null, photos: [], preventive: null, schedules: [], workshopHistory: [], documents: [], kpis: { breakdown_count: 0, findings_count: 0 } });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const asset = useMemo(() => bundle.asset || {}, [bundle.asset]);
  const overviewRows = useMemo(
    () => [
      ['Brand', asset.brand || '-'],
      ['Model', asset.model || '-'],
      ['Company Code', asset.company_code || '-'],
      ['Plant', asset.plant || asset.plant_code || '-'],
      ['Tahun', asset.year || '-'],
      ['No Polisi', asset.veh_plate_no || asset.plate_number || '-'],
      ['Chasis No', asset.chasis_no || '-'],
      ['Engine No', asset.engine_no || asset.engine_number || '-'],
      ['Asset No.', asset.asset_no || asset.sap_asset_no || asset.code || '-'],
      ['QR Code', asset.qr_code || '-'],
      ['Catatan', asset.notes || '-'],
      ['Nomor Aset', asset.asset_no || asset.sap_asset_no || asset.code || '-'],
      ['Nama Aset', asset.name || '-'],
      ['Kode Unit', asset.code || '-'],
      ['Kategori', asset?.category?.name || '-'],
      ['HM Saat Ini', asset.current_hm ?? '-'],
      ['KM Saat Ini', asset.current_km ?? '-'],
      ['Serial Number', asset.serial_number || '-'],
      ['Public UUID', asset.public_uuid || '-'],
    ],
    [asset]
  );

  const totalDowntimeHours = bundle.workshopHistory.reduce((sum, x) => sum + Number(x.downtime_hours || 0), 0);
  const totalCost = bundle.workshopHistory.reduce((sum, x) => sum + Number(x.cost || 0), 0);

  const renderOverview = () => (
    <Card style={styles.card}>
      {overviewRows.map(([label, value]) => (
        <View key={label} style={styles.rowItem}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowValue}>{String(value)}</Text>
        </View>
      ))}
    </Card>
  );

  const renderPhotos = () => (
    <View style={styles.sectionWrap}>
      {bundle.photos.length === 0 ? <Card style={styles.card}><Text style={styles.empty}>Belum ada foto aset.</Text></Card> : bundle.photos.map((p) => (
        <Card key={p.id} style={styles.photoCard}>
          <Image source={{ uri: p.photo_path }} style={styles.photo} resizeMode="cover" />
          <Text style={styles.photoTitle}>{p.title || `Photo #${p.id}`}</Text>
        </Card>
      ))}
    </View>
  );

  const renderTriggers = () => (
    <Card style={styles.card}>
      <View style={styles.rowItem}><Text style={styles.rowLabel}>Trigger Type</Text><Text style={styles.rowValue}>{bundle.preventive?.trigger_type || '-'}</Text></View>
      <View style={styles.rowItem}><Text style={styles.rowLabel}>Alert Before</Text><Text style={styles.rowValue}>{bundle.preventive?.alert_before_value ?? '-'}</Text></View>
      <View style={styles.rowItem}><Text style={styles.rowLabel}>Escalation</Text><Text style={styles.rowValue}>{bundle.preventive?.escalation_target || '-'}</Text></View>
      <View style={styles.rowItem}><Text style={styles.rowLabel}>Auto Create WO</Text><Text style={styles.rowValue}>{bundle.preventive?.auto_create_work_order ? 'Enabled' : 'Disabled'}</Text></View>
      <View style={styles.rowItem}><Text style={styles.rowLabel}>Notes</Text><Text style={styles.rowValue}>{bundle.preventive?.notes || '-'}</Text></View>
    </Card>
  );

  const renderSchedule = () => (
    <View style={styles.sectionWrap}>
      {bundle.schedules.length === 0 ? <Card style={styles.card}><Text style={styles.empty}>Belum ada jadwal preventive.</Text></Card> : bundle.schedules.map((s) => (
        <Card key={s.id} style={styles.card}>
          <View style={styles.scheduleHead}><Text style={styles.scheduleTitle}>{s.name}</Text><Badge text={(s.status || '-').toUpperCase()} variant={s.status === 'completed' ? 'success' : s.status === 'overdue' ? 'danger' : 'warning'} /></View>
          <Text style={styles.scheduleMeta}>Type: {s.type || '-'}</Text>
          <Text style={styles.scheduleMeta}>Due Date: {s.next_due_at ? String(s.next_due_at).slice(0, 10) : '-'}</Text>
          <Text style={styles.scheduleMeta}>Interval HM/KM: {s.interval_hm || '-'} / {s.interval_km || '-'}</Text>
          <Text style={styles.scheduleMeta}>Notes: {s.notes || '-'}</Text>
        </Card>
      ))}
    </View>
  );

  const renderDocuments = () => (
    <View style={styles.sectionWrap}>
      {bundle.documents.length === 0 ? <Card style={styles.card}><Text style={styles.empty}>Belum ada dokumen unit.</Text></Card> : bundle.documents.map((d) => (
        <Card key={d.id} style={styles.card}>
          <Text style={styles.scheduleTitle}>{d.file_name || d.document_number || `Doc #${d.id}`}</Text>
          <Text style={styles.scheduleMeta}>Type: {d.type || '-'}</Text>
          <Text style={styles.scheduleMeta}>Issued: {d.issued_at ? String(d.issued_at).slice(0, 10) : '-'}</Text>
          <Text style={styles.scheduleMeta}>Expired: {d.expired_at ? String(d.expired_at).slice(0, 10) : '-'}</Text>
          <Text style={styles.scheduleMeta}>Notes: {d.notes || '-'}</Text>
        </Card>
      ))}
    </View>
  );

  const renderWorkshop = () => (
    <View style={styles.sectionWrap}>
      <Card style={styles.card}>
        <View style={styles.kpiRow}><Clock size={18} color={theme.colors.warning} /><Text style={styles.kpiText}>Downtime Total: {totalDowntimeHours} jam</Text></View>
        <View style={styles.kpiRow}><Wrench size={18} color={theme.colors.error} /><Text style={styles.kpiText}>Biaya Total: Rp {Number(totalCost).toLocaleString('id-ID')}</Text></View>
        <View style={styles.kpiRow}><FileText size={18} color={theme.colors.primary} /><Text style={styles.kpiText}>Total Breakdown: {Number(bundle.kpis?.breakdown_count || 0)}</Text></View>
        <View style={styles.kpiRow}><ShieldCheck size={18} color={theme.colors.success} /><Text style={styles.kpiText}>Total Temuan: {Number(bundle.kpis?.findings_count || 0)}</Text></View>
      </Card>
      {bundle.workshopHistory.length === 0 ? <Card style={styles.card}><Text style={styles.empty}>Belum ada history workshop.</Text></Card> : bundle.workshopHistory.map((h) => (
        <Card key={h.id} style={styles.card}>
          <View style={styles.scheduleHead}><Text style={styles.scheduleTitle}>{h.reference_no || `WH-${h.id}`}</Text><Badge text={(h.category || '-').toUpperCase()} variant={h.category === 'breakdown' ? 'danger' : 'primary'} /></View>
          <Text style={styles.scheduleMeta}>Issue: {h.issue || '-'}</Text>
          <Text style={styles.scheduleMeta}>Action: {h.action_taken || '-'}</Text>
          <Text style={styles.scheduleMeta}>Date In/Out: {h.date_in || '-'} / {h.date_out || '-'}</Text>
          <Text style={styles.scheduleMeta}>Cost: Rp {Number(h.cost || 0).toLocaleString('id-ID')}</Text>
          <Text style={styles.scheduleMeta}>Downtime: {h.downtime_hours || 0} jam</Text>
        </Card>
      ))}
    </View>
  );

  const renderTabContent = () => {
    if (loading) return <Card style={styles.card}><Text style={styles.empty}>Memuat data detail aset...</Text></Card>;
    if (tab === 'overview') return renderOverview();
    if (tab === 'photos') return renderPhotos();
    if (tab === 'triggers') return renderTriggers();
    if (tab === 'schedule') return renderSchedule();
    if (tab === 'documents') return renderDocuments();
    return renderWorkshop();
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: `Detail ${asset.code || '-'}`, headerShown: true, headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: '#fff',
          headerBackVisible: false, headerBackTitleVisible: false, headerLeft: () => <HeaderBackButton color="#fff" /> }} />

      <View style={styles.header}>
        <View style={styles.iconCircle}><Truck size={34} color={theme.colors.primary} /></View>
        <Text style={styles.mainTitle}>{asset.name || '-'}</Text>
        <Text style={styles.subTitle}>No. Aset: {asset.asset_no || asset.sap_asset_no || asset.code || '-'}</Text>
        <Text style={styles.subTitle}>No. Polisi: {asset.veh_plate_no || asset.plate_number || '-'}</Text>
        <Badge text={(asset.status || '-').toUpperCase()} variant={readStatusVariant(asset.status)} style={{ marginTop: 8 }} />
      </View>

      <View style={styles.quickGrid}>
        <Card style={styles.quickCard}><ShieldCheck size={18} color={theme.colors.primary} /><Text style={styles.quickLabel}>Kategori</Text><Text style={styles.quickValue}>{asset?.category?.name || '-'}</Text></Card>
        <Card style={styles.quickCard}><Clock size={18} color={theme.colors.warning} /><Text style={styles.quickLabel}>HM / KM</Text><Text style={styles.quickValue}>{asset.current_hm ?? '-'} / {asset.current_km ?? '-'}</Text></Card>
        <Card style={styles.quickCard}><FileText size={18} color={theme.colors.textSecondary} /><Text style={styles.quickLabel}>Dokumen</Text><Text style={styles.quickValue}>{bundle.documents.length}</Text></Card>
        <Card style={styles.quickCard}><Camera size={18} color={theme.colors.success} /><Text style={styles.quickLabel}>Foto</Text><Text style={styles.quickValue}>{bundle.photos.length}</Text></Card>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroller} contentContainerStyle={styles.tabWrap}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.content}>{renderTabContent()}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  header: { backgroundColor: '#fff', padding: theme.spacing.xl, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md },
  mainTitle: { ...theme.typography.h2, color: theme.colors.text, textAlign: 'center' },
  subTitle: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: theme.spacing.md, gap: theme.spacing.sm },
  quickCard: { width: '48%', padding: theme.spacing.md, alignItems: 'flex-start' },
  quickLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 8 },
  quickValue: { ...theme.typography.body, color: theme.colors.text, fontWeight: '600', marginTop: 4 },
  tabScroller: { maxHeight: 58 },
  tabWrap: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm },
  tabBtn: { paddingHorizontal: 14, paddingVertical: 10, marginRight: 8, borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.background },
  tabBtnActive: { backgroundColor: theme.colors.primary },
  tabText: { ...theme.typography.caption, color: theme.colors.textSecondary, fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  content: { padding: theme.spacing.md },
  card: { padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  rowItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  rowLabel: { ...theme.typography.caption, color: theme.colors.textSecondary },
  rowValue: { ...theme.typography.body, color: theme.colors.text, marginTop: 4, fontWeight: '600' },
  empty: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: 12 },
  sectionWrap: { gap: theme.spacing.sm },
  photoCard: { padding: theme.spacing.sm, marginBottom: theme.spacing.sm },
  photo: { width: '100%', height: 180, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.border },
  photoTitle: { ...theme.typography.caption, color: theme.colors.text, marginTop: 8, fontWeight: '700' },
  scheduleHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  scheduleTitle: { ...theme.typography.body, color: theme.colors.text, fontWeight: '700', flex: 1, paddingRight: 10 },
  scheduleMeta: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 4 },
  kpiRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  kpiText: { ...theme.typography.body, color: theme.colors.text, marginLeft: 8, fontWeight: '600' },
});
