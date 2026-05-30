import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../constants/AppTheme';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { HeaderBackButton } from '../../components/common/HeaderBackButton';
import { Camera, CheckCircle2, ScanBarcode, Clock, Play, Pause, Square, RotateCcw, AlertTriangle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAlert } from '../../contexts/AlertContext';
import { workshopService } from '../../services/workshop.service';
import { inventoryService } from '../../services/inventory.service';
import { workOrdersService } from '../../services/work-orders.service';
import { sendLocalNotification } from '../../utils/notifications';
import { MENU_BAR_CONTENT_PADDING } from '../../constants/menu-bar';
import { useMechanicAccessGuard } from '../../hooks/useMechanicAccessGuard';

const STEP_CODES = [
  'WASHING_BAY',
  'INSPECTION_PKB',
  'CHECKING',
  'WAITING_BAY',
  'CREATE_WO',
  'REPAIR',
  'QC',
  'READY_BAY_CLOSE',
  'HANDOVER',
];

const STEP_NAME_MAP = {
  REGISTRATION: 'Registrasi Kedatangan',
  APPROVAL: 'Approval Kedatangan',
  WASHING_BAY: 'Cuci Unit (Washing Bay)',
  INSPECTION_PKB: 'Inspeksi Awal & PKB',
  CHECKING: 'Pengecekan Unit',
  WAITING_BAY: 'Antrian / Waiting Bay',
  CREATE_WO: 'Pembuatan WO & Jobcard',
  REPAIR: 'Proses Perbaikan',
  QC: 'QC Perbaikan',
  READY_BAY_CLOSE: 'Parkir Unit Ready & Closing',
  HANDOVER: 'Serah Terima Unit',
};

const STATION_STEP_CODES = STEP_CODES;

const STARTABLE_WO_STATUSES = ['triage', 'pending', 'approved', 'in_progress'];
const FINISH_FORM_STEPS = ['WASHING_BAY', 'INSPECTION_PKB', 'CHECKING', 'WAITING_BAY', 'CREATE_WO', 'REPAIR', 'QC', 'READY_BAY_CLOSE', 'HANDOVER'];
const DRAFT_PREFIX = '@mechanic_process_draft:';

export default function MechanicProcessScreen() {
  const { isRestrictedRole } = useMechanicAccessGuard();
  const { work_order_id } = useLocalSearchParams();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [woData, setWoData] = useState(null);
  const [processData, setProcessData] = useState(null);
  const [stepLogs, setStepLogs] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState('pending'); // pending, active, hold
  const [timer, setTimer] = useState(0);
  const [partItems, setPartItems] = useState([]);
  const [note, setNote] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [finishForm, setFinishForm] = useState({
    pre_wash_condition: '',
    post_wash_condition: '',
    visual_note: '',
    inspection_result: '',
    work_plan: '',
    main_findings: '',
    action_estimate: '',
    checkpoint_result: '',
    checking_summary: '',
    proceed_status: '',
    waiting_reason: '',
    waiting_type: '',
    waiting_eta: '',
    sap_reference_no: '',
    admin_note: '',
    jobcard_confirmation: '',
    repair_action: '',
    technical_action: '',
    obstacle: '',
    hold_reason: '',
    qc_result: '',
    qc_parameter: '',
    rework_note: '',
    closing_status: '',
    work_summary: '',
    document_completeness: '',
    handover_confirmation: '',
    receiver: '',
    final_note: '',
  });

  // Timer
  useEffect(() => {
    let interval = null;
    if (status === 'active') {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [status]);

  const loadData = useCallback(async () => {
    if (isRestrictedRole || !work_order_id) return;
    try {
      // Load WO details
      const wo = await workOrdersService.getById(String(work_order_id));
      setWoData(wo);

      // Load process data
      const proc = await workshopService.processData(String(work_order_id));
      setProcessData(proc);

      const instances = proc?.instances || [];
      const activeInstance = instances.find((i) => i.state === 'running' || i.state === 'hold') || instances[0];

      if (activeInstance?.step_logs?.length > 0) {
        const logs = activeInstance.step_logs.sort((a, b) => a.step_order - b.step_order);
        setStepLogs(logs);

        // Find active or next-ready step
        const stationLogs = logs.filter((s) => STATION_STEP_CODES.includes(s.step_code));
        const handoverDone = stationLogs.some((s) => s.step_code === 'HANDOVER' && s.status === 'done');
        const activeStep = stationLogs.find((s) => s.status === 'in_progress');
        const holdStep = stationLogs.find((s) => s.status === 'hold');
        const nextReady = stationLogs.find((s) => s.status === 'ready');

        if (activeStep) {
          const idx = STEP_CODES.indexOf(activeStep.step_code);
          setCurrentStepIndex(idx >= 0 ? idx : 0);
          setStatus('active');
          // Calculate elapsed time
          if (activeStep.process_in_at) {
            const elapsed = Math.floor((Date.now() - new Date(activeStep.process_in_at).getTime()) / 1000);
            setTimer(Math.max(0, elapsed));
          }
        } else if (holdStep) {
          const idx = STEP_CODES.indexOf(holdStep.step_code);
          setCurrentStepIndex(idx >= 0 ? idx : 0);
          setStatus('hold');
        } else if (nextReady) {
          const idx = STEP_CODES.indexOf(nextReady.step_code);
          setCurrentStepIndex(idx >= 0 ? idx : 0);
          setStatus('pending');
          setTimer(0);
        } else if (handoverDone || String(wo?.status || '').toLowerCase() === 'completed') {
          // All done
          setCurrentStepIndex(STEP_CODES.length - 1);
          setStatus('done');
        } else {
          setCurrentStepIndex(0);
          setStatus('pending');
        }
      } else {
        // No process started yet
        setStepLogs([]);
        setCurrentStepIndex(0);
        setStatus('not_started');
      }
    } catch (e) {
      console.error('Load process data error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isRestrictedRole, work_order_id]);

  useEffect(() => {
    if (isRestrictedRole) return;
    loadData();
  }, [loadData, isRestrictedRole]);

  useEffect(() => {
    let mounted = true;
    const restoreDraft = async () => {
      if (isRestrictedRole || !work_order_id) return;
      try {
        const raw = await AsyncStorage.getItem(`${DRAFT_PREFIX}${work_order_id}`);
        if (!raw || !mounted) return;
        const draft = JSON.parse(raw);
        if (draft?.note) setNote(String(draft.note));
        if (draft?.holdReason) setHoldReason(String(draft.holdReason));
        if (Array.isArray(draft?.partItems)) setPartItems(draft.partItems);
        if (draft?.proofFile?.uri) setProofFile(draft.proofFile);
        if (draft?.finishForm && typeof draft.finishForm === 'object') {
          setFinishForm((prev) => ({ ...prev, ...draft.finishForm }));
        }
      } catch (_e) {}
    };
    restoreDraft();
    return () => { mounted = false; };
  }, [isRestrictedRole, work_order_id]);

  useEffect(() => {
    if (isRestrictedRole || !work_order_id) return;
    const saveDraft = async () => {
      try {
        await AsyncStorage.setItem(
          `${DRAFT_PREFIX}${work_order_id}`,
          JSON.stringify({
            note,
            holdReason,
            partItems,
            proofFile: proofFile?.uri ? proofFile : null,
            finishForm,
          }),
        );
      } catch (_e) {}
    };
    saveDraft();
  }, [finishForm, holdReason, isRestrictedRole, note, partItems, proofFile, work_order_id]);

  useFocusEffect(
    useCallback(() => {
      if (isRestrictedRole) return undefined;
      loadData();
      return undefined;
    }, [loadData, isRestrictedRole]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Resolve the step_order for current step from the API data
  const getCurrentStepOrder = () => {
    const code = STEP_CODES[currentStepIndex];
    const byCode = stepLogs.find((s) => s.step_code === code);
    if (byCode?.step_order) return byCode.step_order;

      const byStatus = stepLogs.find((s) => STATION_STEP_CODES.includes(s.step_code) && ['in_progress', 'hold', 'ready'].includes(s.status));
    if (byStatus?.step_order) return byStatus.step_order;

    return null;
  };

  const resetFinishForm = () => {
    setFinishForm({
      pre_wash_condition: '',
      post_wash_condition: '',
      visual_note: '',
      inspection_result: '',
      work_plan: '',
      main_findings: '',
      action_estimate: '',
      checkpoint_result: '',
      checking_summary: '',
      proceed_status: '',
      waiting_reason: '',
      waiting_type: '',
      waiting_eta: '',
      sap_reference_no: '',
      admin_note: '',
      jobcard_confirmation: '',
      repair_action: '',
      technical_action: '',
      obstacle: '',
      hold_reason: '',
      qc_result: '',
      qc_parameter: '',
      rework_note: '',
      closing_status: '',
      work_summary: '',
      document_completeness: '',
      handover_confirmation: '',
      receiver: '',
      final_note: '',
    });
  };

  const buildStationData = (stepCode) => {
    switch (stepCode) {
      case 'WASHING_BAY':
        return { step_code: stepCode, pre_wash_condition: finishForm.pre_wash_condition, post_wash_condition: finishForm.post_wash_condition, visual_note: finishForm.visual_note || null };
      case 'INSPECTION_PKB':
        return { step_code: stepCode, inspection_result: finishForm.inspection_result, work_plan: finishForm.work_plan, main_findings: finishForm.main_findings || null, action_estimate: finishForm.action_estimate || null };
      case 'CHECKING':
        return { step_code: stepCode, checkpoint_result: finishForm.checkpoint_result, checking_summary: finishForm.checking_summary || null, proceed_status: finishForm.proceed_status || null };
      case 'WAITING_BAY':
        return { step_code: stepCode, waiting_reason: finishForm.waiting_reason, waiting_type: finishForm.waiting_type || null, waiting_eta: finishForm.waiting_eta || null };
      case 'CREATE_WO':
        return { step_code: stepCode, sap_reference_no: finishForm.sap_reference_no, admin_note: finishForm.admin_note || null, jobcard_confirmation: finishForm.jobcard_confirmation || null };
      case 'REPAIR':
        return { step_code: stepCode, repair_action: finishForm.repair_action, technical_action: finishForm.technical_action || null, obstacle: finishForm.obstacle || null, hold_reason: finishForm.hold_reason || null };
      case 'QC':
        return { step_code: stepCode, qc_result: finishForm.qc_result, qc_parameter: finishForm.qc_parameter || null, rework_note: finishForm.rework_note || null };
      case 'READY_BAY_CLOSE':
        return { step_code: stepCode, closing_status: finishForm.closing_status, work_summary: finishForm.work_summary || null, document_completeness: finishForm.document_completeness || null };
      case 'HANDOVER':
        return { step_code: stepCode, handover_confirmation: finishForm.handover_confirmation, receiver: finishForm.receiver || null, final_note: finishForm.final_note || null };
      default:
        return { step_code: stepCode, feedback: note || null };
    }
  };

  const validateFinishForm = (stepCode) => {
    const requiredMap = {
      WASHING_BAY: ['pre_wash_condition', 'post_wash_condition'],
      INSPECTION_PKB: ['inspection_result', 'work_plan'],
      CHECKING: ['checkpoint_result'],
      WAITING_BAY: ['waiting_reason'],
      CREATE_WO: ['sap_reference_no'],
      REPAIR: ['repair_action'],
      QC: ['qc_result'],
      READY_BAY_CLOSE: ['closing_status'],
      HANDOVER: ['handover_confirmation'],
    };
    const requiredFields = requiredMap[stepCode] || [];
    const missing = requiredFields.find((key) => !String(finishForm[key] || '').trim());
    if (missing) {
      showAlert({ type: 'warning', title: 'Perhatian', message: 'Field wajib pada form Finish belum lengkap.' });
      return false;
    }
    if (stepCode === 'QC' && !['OK', 'NOT_OK'].includes(String(finishForm.qc_result || '').toUpperCase())) {
      showAlert({ type: 'warning', title: 'Perhatian', message: 'Hasil QC wajib diisi OK atau NOT_OK.' });
      return false;
    }
    return true;
  };

  const handleStartProcess = async () => {
    try {
      setActionLoading(true);
      await workshopService.startProcess(String(work_order_id));
      showAlert({ type: 'success', title: 'Berhasil', message: 'Process dimulai. Step logs terbuat.' });
      await loadData();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Gagal memulai process.';
      showAlert({ type: 'error', title: 'Gagal', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (action) => {
    try {
      if (!work_order_id) return;
      setActionLoading(true);

      const stepOrder = getCurrentStepOrder();
      if (!stepOrder) {
        showAlert({ type: 'warning', title: 'Perhatian', message: 'Step aktif tidak ditemukan. Silakan muat ulang data.' });
        setActionLoading(false);
        return;
      }

      if (action === 'start') {
        await workshopService.stepIn(String(work_order_id), stepOrder, note || null);
        setStatus('active');
        setTimer(0);
        showAlert({ type: 'success', title: 'Berhasil', message: `Tahap ${STEP_NAME_MAP[STEP_CODES[currentStepIndex]] || STEP_CODES[currentStepIndex]} dimulai.` });
      } else if (action === 'hold') {
        if (!holdReason.trim()) {
          showAlert({ type: 'warning', title: 'Perhatian', message: 'Alasan hold wajib diisi.' });
          setActionLoading(false);
          return;
        }
        await workshopService.holdStep(String(work_order_id), stepOrder, holdReason);
        setStatus('hold');
        showAlert({ type: 'warning', title: 'Ditahan', message: 'Proses dihentikan sementara.' });
        setHoldReason('');
      } else if (action === 'resume') {
        await workshopService.resumeStep(String(work_order_id), stepOrder, note || null);
        setStatus('active');
        showAlert({ type: 'success', title: 'Dilanjutkan', message: 'Proses dilanjutkan kembali.' });
      } else if (action === 'finish') {
        let payload = { notes: note };
        const stepCode = STEP_CODES[currentStepIndex];
        const stationData = buildStationData(stepCode);
        if (stepCode === 'CREATE_WO' && finishForm.sap_reference_no.trim()) {
          payload.sap_reference_no = finishForm.sap_reference_no.trim();
        }

        // For REPAIR step, include part items
        if (currentStepIndex === 7 && partItems.length > 0) {
          payload.part_items = partItems.map((p) => ({ part_id: p.part_id, qty: p.qty, location: 'main' }));
          payload.part_required = true;
          stationData.parts_count = partItems.length;
        }
        payload.station_data = stationData;

        // Upload proof photo if exists
        if (proofFile?.uri) {
          try {
            await workOrdersService.uploadAttachment(String(work_order_id), {
              uri: proofFile.uri,
              name: proofFile.name || `proof-${Date.now()}.jpg`,
              type: proofFile.type || 'image/jpeg',
            });
          } catch (_uploadErr) {
            // Non-blocking
          }
        }

        await workshopService.stepOut(String(work_order_id), stepOrder, payload);

        showAlert({
          type: 'success',
          title: 'Selesai',
          message: `Tahap ${STEP_NAME_MAP[STEP_CODES[currentStepIndex]] || STEP_CODES[currentStepIndex]} berhasil diselesaikan.`,
        });
        await sendLocalNotification(
          'Tahap Workshop Selesai',
          `${STEP_NAME_MAP[STEP_CODES[currentStepIndex]] || STEP_CODES[currentStepIndex]} selesai untuk WO ${woData?.code || work_order_id}.`,
          { route: `/(tabs)/workshop/detail?work_order_id=${work_order_id}` },
        );

        // Reset form state
        setNote('');
        setProofFile(null);
        setPartItems([]);
        setHoldReason('');
        resetFinishForm();
        setTimer(0);

        // If last step, complete process
        if (STEP_CODES[currentStepIndex] === 'HANDOVER') {
          try {
            await workshopService.complete(String(work_order_id), note);
            showAlert({ type: 'success', title: 'Selesai', message: 'Seluruh proses workshop selesai!' });
            setTimeout(() => router.replace('/(tabs)/mechanic?tab=queue'), 1500);
          } catch (_completeErr) {
            // May fail if close gates not met - just reload
          }
        }

        // Reload to get updated state
        await loadData();
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Aksi gagal dilakukan.';
      showAlert({ type: 'error', title: 'Gagal', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const simulateScan = async () => {
    try {
      const data = await inventoryService.spareParts(1, 1);
      const first = data?.data?.[0];
      if (first) {
        setPartItems((prev) => [...prev, { part_id: first.id, qty: 1, name: first.name, code: first.code }]);
        showAlert({ type: 'success', title: 'Scan Berhasil', message: `1x ${first.name} berhasil ditambahkan.` });
      }
    } catch (_e) {}
  };

  const openFinishModal = () => {
    const stepCode = STEP_CODES[currentStepIndex];
    if (!FINISH_FORM_STEPS.includes(stepCode)) {
      handleAction('finish');
      return;
    }
    setFinishModalVisible(true);
  };

  const submitFinishWithForm = async () => {
    const stepCode = STEP_CODES[currentStepIndex];
    if (!validateFinishForm(stepCode)) return;
    setFinishModalVisible(false);
    await handleAction('finish');
  };

  const renderFinishFormContent = () => {
    const stepCode = STEP_CODES[currentStepIndex];
    if (stepCode === 'WASHING_BAY') {
      return (
        <>
          <TextInput style={styles.modalInput} placeholder="Kondisi sebelum cuci (wajib)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.pre_wash_condition} onChangeText={(v) => setFinishForm((p) => ({ ...p, pre_wash_condition: v }))} />
          <TextInput style={styles.modalInput} placeholder="Kondisi sesudah cuci (wajib)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.post_wash_condition} onChangeText={(v) => setFinishForm((p) => ({ ...p, post_wash_condition: v }))} />
          <TextInput style={[styles.modalInput, styles.modalTextArea]} placeholder="Catatan visual (opsional)" placeholderTextColor={theme.colors.textSecondary} multiline value={finishForm.visual_note} onChangeText={(v) => setFinishForm((p) => ({ ...p, visual_note: v }))} />
        </>
      );
    }
    if (stepCode === 'INSPECTION_PKB') {
      return (
        <>
          <TextInput style={styles.modalInput} placeholder="Hasil inspeksi (wajib)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.inspection_result} onChangeText={(v) => setFinishForm((p) => ({ ...p, inspection_result: v }))} />
          <TextInput style={styles.modalInput} placeholder="Rencana pekerjaan (wajib)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.work_plan} onChangeText={(v) => setFinishForm((p) => ({ ...p, work_plan: v }))} />
          <TextInput style={styles.modalInput} placeholder="Temuan utama (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.main_findings} onChangeText={(v) => setFinishForm((p) => ({ ...p, main_findings: v }))} />
          <TextInput style={styles.modalInput} placeholder="Estimasi tindakan (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.action_estimate} onChangeText={(v) => setFinishForm((p) => ({ ...p, action_estimate: v }))} />
        </>
      );
    }
    if (stepCode === 'CHECKING') {
      return (
        <>
          <TextInput style={styles.modalInput} placeholder="Checkpoint hasil cek (wajib)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.checkpoint_result} onChangeText={(v) => setFinishForm((p) => ({ ...p, checkpoint_result: v }))} />
          <TextInput style={styles.modalInput} placeholder="Summary engine/hydraulic/body/safety (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.checking_summary} onChangeText={(v) => setFinishForm((p) => ({ ...p, checking_summary: v }))} />
          <TextInput style={styles.modalInput} placeholder="Status layak lanjut (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.proceed_status} onChangeText={(v) => setFinishForm((p) => ({ ...p, proceed_status: v }))} />
        </>
      );
    }
    if (stepCode === 'WAITING_BAY') {
      return (
        <>
          <TextInput style={styles.modalInput} placeholder="Alasan menunggu (wajib)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.waiting_reason} onChangeText={(v) => setFinishForm((p) => ({ ...p, waiting_reason: v }))} />
          <TextInput style={styles.modalInput} placeholder="Menunggu part/slot/approval (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.waiting_type} onChangeText={(v) => setFinishForm((p) => ({ ...p, waiting_type: v }))} />
          <TextInput style={styles.modalInput} placeholder="ETA (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.waiting_eta} onChangeText={(v) => setFinishForm((p) => ({ ...p, waiting_eta: v }))} />
        </>
      );
    }
    if (stepCode === 'CREATE_WO') {
      return (
        <>
          <TextInput style={styles.modalInput} placeholder="SAP Reference No / WO No (wajib)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.sap_reference_no} onChangeText={(v) => setFinishForm((p) => ({ ...p, sap_reference_no: v }))} />
          <TextInput style={styles.modalInput} placeholder="Catatan administrasi (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.admin_note} onChangeText={(v) => setFinishForm((p) => ({ ...p, admin_note: v }))} />
          <TextInput style={styles.modalInput} placeholder="Konfirmasi jobcard (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.jobcard_confirmation} onChangeText={(v) => setFinishForm((p) => ({ ...p, jobcard_confirmation: v }))} />
        </>
      );
    }
    if (stepCode === 'REPAIR') {
      return (
        <>
          <TextInput style={styles.modalInput} placeholder="Aksi perbaikan (wajib)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.repair_action} onChangeText={(v) => setFinishForm((p) => ({ ...p, repair_action: v }))} />
          <TextInput style={styles.modalInput} placeholder="Tindakan teknis (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.technical_action} onChangeText={(v) => setFinishForm((p) => ({ ...p, technical_action: v }))} />
          <TextInput style={styles.modalInput} placeholder="Kendala (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.obstacle} onChangeText={(v) => setFinishForm((p) => ({ ...p, obstacle: v }))} />
          <TextInput style={styles.modalInput} placeholder="Hold reason bila ada (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.hold_reason} onChangeText={(v) => setFinishForm((p) => ({ ...p, hold_reason: v }))} />
        </>
      );
    }
    if (stepCode === 'QC') {
      return (
        <>
          <TextInput style={styles.modalInput} placeholder="Hasil QC: OK / NOT_OK (wajib)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.qc_result} onChangeText={(v) => setFinishForm((p) => ({ ...p, qc_result: v }))} />
          <TextInput style={styles.modalInput} placeholder="Parameter QC (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.qc_parameter} onChangeText={(v) => setFinishForm((p) => ({ ...p, qc_parameter: v }))} />
          <TextInput style={styles.modalInput} placeholder="Catatan rework jika NOT_OK (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.rework_note} onChangeText={(v) => setFinishForm((p) => ({ ...p, rework_note: v }))} />
        </>
      );
    }
    if (stepCode === 'READY_BAY_CLOSE') {
      return (
        <>
          <TextInput style={styles.modalInput} placeholder="Status closing (wajib)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.closing_status} onChangeText={(v) => setFinishForm((p) => ({ ...p, closing_status: v }))} />
          <TextInput style={styles.modalInput} placeholder="Ringkasan pekerjaan (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.work_summary} onChangeText={(v) => setFinishForm((p) => ({ ...p, work_summary: v }))} />
          <TextInput style={styles.modalInput} placeholder="Kelengkapan dokumen (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.document_completeness} onChangeText={(v) => setFinishForm((p) => ({ ...p, document_completeness: v }))} />
        </>
      );
    }
    if (stepCode === 'HANDOVER') {
      return (
        <>
          <TextInput style={styles.modalInput} placeholder="Konfirmasi serah terima (wajib)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.handover_confirmation} onChangeText={(v) => setFinishForm((p) => ({ ...p, handover_confirmation: v }))} />
          <TextInput style={styles.modalInput} placeholder="Penerima (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.receiver} onChangeText={(v) => setFinishForm((p) => ({ ...p, receiver: v }))} />
          <TextInput style={styles.modalInput} placeholder="Catatan akhir (opsional)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.final_note} onChangeText={(v) => setFinishForm((p) => ({ ...p, final_note: v }))} />
        </>
      );
    }
    return null;
  };

  const pickProof = async () => {
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!result.canceled && result.assets?.[0]) {
      setProofFile({ uri: result.assets[0].uri, name: `proof-${Date.now()}.jpg`, type: 'image/jpeg' });
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderStepTimeline = () => (
    <Card style={styles.timelineCard}>
      <Text style={styles.timelineTitle}>Progress Station (9 Step)</Text>
      <View style={styles.stepsRow}>
        {STATION_STEP_CODES.map((code, idx) => {
          const log = stepLogs.find((s) => s.step_code === code);
          const isDone = log?.status === 'done';
          const isActive = log?.status === 'in_progress';
          const isHold = log?.status === 'hold';
          const currentCode = STEP_CODES[currentStepIndex];
          const isCurrent = code === currentCode;
          return (
            <TouchableOpacity
              key={`step-${idx}`}
              style={[
                styles.stepDot,
                isDone && styles.stepDotDone,
                isActive && styles.stepDotActive,
                isHold && styles.stepDotHold,
                isCurrent && !isDone && styles.stepDotCurrent,
              ]}
              onPress={() => {
                // Allow jumping to view only
              }}
            >
              <Text style={[styles.stepNum, (isDone || isActive) && { color: '#fff' }]}>{idx + 1}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {(() => {
        const currentCode = STEP_CODES[currentStepIndex];
        const displayCode = STATION_STEP_CODES.includes(currentCode) ? currentCode : STATION_STEP_CODES[0];
        return (
      <Text style={styles.stepLabel}>
        {STEP_NAME_MAP[displayCode]}
      </Text>
        );
      })()}
    </Card>
  );

  const renderDynamicForm = () => {
    const stepCode = STEP_CODES[currentStepIndex];

    // Inspeksi Awal & PKB (Step 4)
    if (stepCode === 'INSPECTION_PKB') {
      return (
        <View style={styles.formSection}>
          <Text style={styles.label}>Detail Inspeksi / Pembuatan PKB</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detail inspeksi awal dan perkiraan kerusakan..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            textAlignVertical="top"
            value={note}
            onChangeText={setNote}
          />
        </View>
      );
    }

    // Proses Perbaikan (Step 8)
    if (stepCode === 'REPAIR') {
      return (
        <View style={styles.formSection}>
          <Text style={styles.label}>Penggunaan Sparepart</Text>
          <TouchableOpacity style={styles.scanBox} onPress={simulateScan} activeOpacity={0.7}>
            <ScanBarcode color={theme.colors.primary} size={24} style={{ marginRight: 12 }} />
            <Text style={styles.scanText}>Scan Barcode Sparepart</Text>
          </TouchableOpacity>
          {partItems.map((p, i) => (
            <Text key={`part-${p.part_id}-${i}`} style={[styles.input, { padding: 8, marginBottom: 4, minHeight: 0 }]}>
              • {p.qty}x {p.name} ({p.code})
            </Text>
          ))}

          <Text style={styles.label}>Catatan Perbaikan</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detail perbaikan yang dilakukan..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            textAlignVertical="top"
            value={note}
            onChangeText={setNote}
          />
        </View>
      );
    }

    // QC (Step 9) - Koordinator
    if (stepCode === 'QC') {
      return (
        <View style={styles.formSection}>
          <Text style={styles.label}>Catatan Quality Control</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Hasil pengecekan QC, apakah unit layak atau perlu rework..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            textAlignVertical="top"
            value={note}
            onChangeText={setNote}
          />
        </View>
      );
    }

    // Serah Terima (Step 11) - Koordinator
    if (stepCode === 'HANDOVER') {
      return (
        <View style={styles.formSection}>
          <Text style={styles.label}>Catatan Serah Terima</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Catatan serah terima unit ke driver..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            textAlignVertical="top"
            value={note}
            onChangeText={setNote}
          />
        </View>
      );
    }

    // Default form for other steps
    return (
      <View style={styles.formSection}>
        <Text style={styles.label}>Catatan Tambahan</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ketik catatan di sini..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          textAlignVertical="top"
          value={note}
          onChangeText={setNote}
        />
      </View>
    );
  };

  const renderActionButtons = () => {
    const currentLog = stepLogs.find((s) => s.step_code === STEP_CODES[currentStepIndex]);
    const startAt = currentLog?.process_in_at ? new Date(currentLog.process_in_at).toLocaleString('id-ID') : '-';
    const endAt = currentLog?.process_out_at ? new Date(currentLog.process_out_at).toLocaleString('id-ID') : '-';
    const durationMinutes = currentLog?.actual_minutes ?? (status === 'active' ? Math.floor(timer / 60) : 0);

    if (woData?.status === 'registered') {
      return (
        <View style={styles.notStartedBox}>
          <AlertTriangle size={32} color={theme.colors.warning} style={{ marginBottom: 12 }} />
          <Text style={styles.notStartedText}>
            WO masih status REGISTERED. {'\n'}Lakukan approval kedatangan di halaman Approval.
          </Text>
          <Button
            title="Buka Halaman Approval"
            onPress={() => router.replace(`/(tabs)/mechanic/approval?work_order_id=${work_order_id}`)}
            style={{ marginTop: 8, width: '100%' }}
          />
        </View>
      );
    }

    if (status === 'not_started') {
      return (
        <View style={styles.notStartedBox}>
          <AlertTriangle size={32} color={theme.colors.warning} style={{ marginBottom: 12 }} />
          <Text style={styles.notStartedText}>
            Process belum dimulai. {'\n'}Status WO: {woData?.status?.toUpperCase() || '-'}
          </Text>
          {STARTABLE_WO_STATUSES.includes(woData?.status) && (
            <Button
              title="Mulai Process"
              icon={Play}
              onPress={handleStartProcess}
              loading={actionLoading}
              disabled={actionLoading}
              style={{ marginTop: 16, width: '100%' }}
            />
          )}
          {woData?.status === 'triage' && (
            <Text style={styles.hintText}>
              WO ini masih status Triage. Lanjutkan sesuai alur 11 step proses workshop.
            </Text>
          )}
        </View>
      );
    }

    if (status === 'done') {
      return (
        <View style={styles.notStartedBox}>
          <CheckCircle2 size={40} color={theme.colors.success} style={{ marginBottom: 12 }} />
          <Text style={[styles.notStartedText, { color: theme.colors.success }]}>Seluruh proses telah selesai!</Text>
        </View>
      );
    }

    return (
      <Card style={styles.widgetCard}>
        <View style={styles.timerHeader}>
          <Clock size={24} color={status === 'active' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.timerText, status === 'active' && { color: theme.colors.primary }]}>
            {formatTime(timer)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              status === 'active' ? styles.statusActive : status === 'hold' ? styles.statusHold : styles.statusPending,
            ]}
          >
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.timeMeta}>
          <Text style={styles.timeMetaText}>Start: {startAt}</Text>
          <Text style={styles.timeMetaText}>End: {endAt}</Text>
          <Text style={styles.timeMetaText}>Durasi: {durationMinutes || 0} menit</Text>
        </View>

        {/* Hold reason input - show when active */}
        {status === 'active' && (
          <View style={{ marginBottom: 12, width: '100%' }}>
            <TextInput
              style={[styles.input, { minHeight: 40, marginBottom: 0 }]}
              placeholder="Alasan hold (wajib jika ingin hold)..."
              placeholderTextColor={theme.colors.textSecondary}
              value={holdReason}
              onChangeText={setHoldReason}
            />
          </View>
        )}

        <View style={styles.actionGrid}>
          {status === 'pending' && (
            <Button
              title="Start"
              icon={Play}
              onPress={() => handleAction('start')}
              loading={actionLoading}
              disabled={actionLoading}
              style={styles.btnFull}
            />
          )}
          {status === 'active' && (
            <>
              <Button
                title="Hold"
                icon={Pause}
                variant="outline"
                onPress={() => handleAction('hold')}
                loading={actionLoading}
                disabled={actionLoading}
                style={[styles.btnHalf, { borderColor: theme.colors.warning }]}
                textStyle={{ color: theme.colors.warning }}
              />
              <Button
                title="Finish"
                icon={CheckCircle2}
                onPress={openFinishModal}
                loading={actionLoading}
                disabled={actionLoading}
                style={styles.btnHalf}
              />
            </>
          )}
          {status === 'hold' && (
            <Button
              title="Resume"
              icon={RotateCcw}
              onPress={() => handleAction('resume')}
              loading={actionLoading}
              disabled={actionLoading}
              style={styles.btnFull}
            />
          )}
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Stack.Screen
          options={{
            title: 'Station Control',
            headerShown: true,
            headerStyle: { backgroundColor: theme.colors.primary },
            headerTintColor: '#fff',
            headerBackVisible: false,
            headerBackTitleVisible: false,
            headerLeft: () => <HeaderBackButton color="#fff" />,
          }}
        />
        <Text style={{ color: theme.colors.textSecondary }}>Memuat data proses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: MENU_BAR_CONTENT_PADDING }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
    >
      <Stack.Screen
        options={{
          title: 'Station Control',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerLeft: () => <HeaderBackButton color="#fff" />,
        }}
      />

      {/* WO Info Header */}
      <View style={styles.headerBox}>
        <Text style={styles.woCode}>{woData?.code || '-'}</Text>
        <Text style={styles.woTitle}>{woData?.title || '-'}</Text>
        <Text style={styles.woAsset}>Unit: {woData?.asset?.name || woData?.asset?.code || '-'}</Text>
        <Text style={styles.woAsset}>No Polisi: {woData?.asset?.veh_plate_no || woData?.asset?.plate_number || '-'}</Text>
      </View>

      {/* Step Timeline */}
      {woData?.status !== 'registered' && renderStepTimeline()}

      {/* Action Buttons */}
      {renderActionButtons()}

      {/* Dynamic Form (only when process is running) */}
      {woData?.status !== 'registered' && (status === 'pending' || status === 'active' || status === 'hold') && (
        <Card style={styles.formCard}>
          {renderDynamicForm()}

          <Text style={styles.label}>Upload Bukti (Opsional)</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickProof}>
            <Camera color={theme.colors.primary} size={24} style={{ marginBottom: 8 }} />
            <Text style={styles.uploadText}>{proofFile?.uri ? 'Foto Bukti Terpilih ✓' : 'Ambil Foto'}</Text>
          </TouchableOpacity>
        </Card>
      )}

      <Modal visible={finishModalVisible} transparent animationType="slide" onRequestClose={() => setFinishModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.finishModalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        >
          <View style={styles.finishModalContainer}>
            <Text style={styles.finishModalTitle}>Form Finish Step</Text>
            <Text style={styles.finishModalSubTitle}>{STEP_NAME_MAP[STEP_CODES[currentStepIndex]] || '-'}</Text>
            <ScrollView
              style={{ width: '100%' }}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {renderFinishFormContent()}
            </ScrollView>
            <View style={styles.finishModalActions}>
              <Button title="Batal" variant="outline" onPress={() => setFinishModalVisible(false)} style={styles.btnHalf} />
              <Button title="Simpan & Finish" onPress={submitFinishWithForm} style={styles.btnHalf} loading={actionLoading} disabled={actionLoading} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  headerBox: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  woCode: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  woTitle: {
    ...theme.typography.h3,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  woAsset: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  timelineCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
  },
  timelineTitle: {
    ...theme.typography.caption,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: theme.colors.success },
  stepDotActive: { backgroundColor: theme.colors.primary },
  stepDotHold: { backgroundColor: theme.colors.warning },
  stepDotCurrent: { borderWidth: 2, borderColor: theme.colors.primary },
  stepNum: { fontSize: 11, fontWeight: 'bold', color: theme.colors.textSecondary },
  stepLabel: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  widgetCard: { margin: theme.spacing.md, padding: theme.spacing.xl, alignItems: 'center' },
  timerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.lg },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.md,
    fontVariant: ['tabular-nums'],
  },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusActive: { backgroundColor: theme.colors.primaryLight },
  statusHold: { backgroundColor: '#fef08a' },
  statusPending: { backgroundColor: theme.colors.border },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 12 },
  timeMeta: {
    width: '100%',
    marginBottom: 12,
  },
  timeMetaText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  btnFull: { flex: 1 },
  btnHalf: { flex: 1 },
  formCard: { margin: theme.spacing.md, padding: theme.spacing.lg, marginTop: 0 },
  formSection: { marginBottom: theme.spacing.md },
  label: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.md,
    minHeight: 48,
  },
  textArea: { minHeight: 100 },
  uploadBox: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
  },
  uploadText: { ...theme.typography.body, fontWeight: '600', color: theme.colors.primary },
  scanBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  scanText: { ...theme.typography.body, color: theme.colors.primary, fontWeight: 'bold' },
  notStartedBox: {
    margin: theme.spacing.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notStartedText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  hintText: {
    ...theme.typography.caption,
    color: theme.colors.warning,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  triageBox: {
    width: '100%',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  triageTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  triageHint: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  segmentBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: theme.colors.background,
  },
  segmentBtnActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  segmentText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: theme.colors.primary,
  },
  finishModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  finishModalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    maxHeight: '80%',
  },
  finishModalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    textAlign: 'center',
  },
  finishModalSubTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    minHeight: 48,
    marginBottom: 10,
    color: theme.colors.text,
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  finishModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: theme.spacing.sm,
  },
});

