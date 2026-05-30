import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { theme } from '../../constants/AppTheme';
import { HeaderBackButton } from '../../components/common/HeaderBackButton';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AlertTriangle } from 'lucide-react-native';
import { workOrdersService } from '../../services/work-orders.service';
import { useAlert } from '../../contexts/AlertContext';
import { useMechanicAccessGuard } from '../../hooks/useMechanicAccessGuard';

export default function MechanicApprovalScreen() {
  const { isRestrictedRole } = useMechanicAccessGuard();
  const { work_order_id } = useLocalSearchParams();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [woData, setWoData] = useState(null);
  const [triageType, setTriageType] = useState('corrective');
  const [triagePriority, setTriagePriority] = useState('medium');

  const load = useCallback(async () => {
    if (isRestrictedRole || !work_order_id) return;
    try {
      setLoading(true);
      const wo = await workOrdersService.getById(String(work_order_id));
      setWoData(wo);
    } catch (_e) {
      setWoData(null);
    } finally {
      setLoading(false);
    }
  }, [isRestrictedRole, work_order_id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async () => {
    if (isRestrictedRole || !work_order_id) return;
    try {
      setSaving(true);
      await workOrdersService.triage(String(work_order_id), {
        type: triageType,
        priority: triagePriority,
      });
      showAlert({ type: 'success', title: 'Berhasil', message: 'Triage berhasil disimpan.' });
      router.push(`/(tabs)/mechanic/process?work_order_id=${work_order_id}`);
    } catch (e) {
      showAlert({ type: 'error', title: 'Gagal', message: e?.message || 'Gagal menyimpan triage.' });
    } finally {
      setSaving(false);
    }
  };

  const status = String(woData?.status || '').toLowerCase();
  const canApprove = status === 'registered';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Approval Kedatangan', headerShown: true, headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: '#fff', headerBackVisible: false, headerBackTitleVisible: false, headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
        <Card style={styles.card}>
          <Text style={styles.code}>{woData?.code || '-'}</Text>
          <Text style={styles.title}>{woData?.title || (loading ? 'Memuat data...' : '-')}</Text>
          <Text style={styles.meta}>Unit: {woData?.asset?.name || woData?.asset?.code || '-'}</Text>
          <Text style={styles.meta}>Status: {(woData?.status || '-').toUpperCase()}</Text>
        </Card>

        {canApprove ? (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Tipe WO</Text>
            <View style={styles.segmentRow}>
              {['preventive', 'corrective', 'breakdown', 'inspection'].map((type) => (
                <TouchableOpacity key={type} style={[styles.segmentBtn, triageType === type && styles.segmentBtnActive]} onPress={() => setTriageType(type)}>
                  <Text style={[styles.segmentText, triageType === type && styles.segmentTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.sectionTitle}>Prioritas</Text>
            <View style={styles.segmentRow}>
              {['low', 'medium', 'high', 'critical'].map((prio) => (
                <TouchableOpacity key={prio} style={[styles.segmentBtn, triagePriority === prio && styles.segmentBtnActive]} onPress={() => setTriagePriority(prio)}>
                  <Text style={[styles.segmentText, triagePriority === prio && styles.segmentTextActive]}>{prio}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button title="Simpan Approval Triage" onPress={handleApprove} loading={saving} disabled={saving} style={{ marginTop: theme.spacing.sm }} />
          </Card>
        ) : (
          <Card style={styles.card}>
            <View style={{ alignItems: 'center' }}>
              <AlertTriangle size={28} color={theme.colors.warning} />
              <Text style={styles.warn}>WO ini tidak berada di status `registered`.</Text>
              <Button title="Buka Proses Station" onPress={() => router.push(`/(tabs)/mechanic/process?work_order_id=${work_order_id}`)} style={{ marginTop: theme.spacing.sm }} />
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  card: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
  code: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '700' },
  title: { ...theme.typography.h3, color: theme.colors.text, marginTop: 4 },
  meta: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 4 },
  sectionTitle: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.sm, marginBottom: 6 },
  segmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.sm },
  segmentBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
  segmentBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  segmentText: { ...theme.typography.caption, color: theme.colors.textSecondary, fontWeight: '600' },
  segmentTextActive: { color: '#fff' },
  warn: { ...theme.typography.caption, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8 },
});
