import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../../../constants/AppTheme';
import { Card } from '../../../../components/common/Card';
import { Button } from '../../../../components/common/Button';
import { HeaderBackButton } from '../../../../components/common/HeaderBackButton';
import { Camera, CheckCircle2, ScanBarcode, Clock, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAlert } from '../../../../contexts/AlertContext';
import { workshopService } from '../../../../services/workshop.service';
import { inventoryService } from '../../../../services/inventory.service';
import { workOrdersService } from '../../../../services/work-orders.service';
import { sendLocalNotification } from '../../../../utils/notifications';
import { getMenuBarContentPadding } from '../../../../constants/menu-bar';
import { useMechanicAccessGuard } from '../../../../hooks/useMechanicAccessGuard';

const STEP_CODES = [
  'WASHING_BAY',
  'INSPECTION_PKB',
  'CHECKING',
  'CREATE_WO',
  'WAITING_BAY',
  'REPAIR',
  'QC',
  'READY_BAY_CLOSE',
  'HANDOVER',
];

const STEP_NAME_MAP = {
  REGISTRATION: 'Registrasi Kedatangan',
  APPROVAL: 'Approval Kedatangan',
  WASHING_BAY: 'Cuci Unit (Washing Bay)',
  INSPECTION_PKB: 'Create PKB',
  CHECKING: 'Pengecekan Unit',
  CREATE_WO: 'Pembuatan WO & Jobcard',
  WAITING_BAY: 'Antrian / Waiting Bay',
  REPAIR: 'Proses Perbaikan',
  QC: 'QC Perbaikan',
  READY_BAY_CLOSE: 'Parkir Unit Ready & Closing',
  HANDOVER: 'Serah Terima Unit',
};

const STATION_STEP_CODES = STEP_CODES;

const STARTABLE_WO_STATUSES = ['triage', 'pending', 'approved', 'in_progress'];
const FINISH_FORM_STEPS = ['WASHING_BAY', 'INSPECTION_PKB', 'CHECKING', 'CREATE_WO', 'WAITING_BAY', 'REPAIR', 'QC', 'READY_BAY_CLOSE', 'HANDOVER'];
const DRAFT_PREFIX = '@mechanic_process_draft:';
const WASH_PRE_CONDITION_OPTIONS = [
  { label: 'Ringan', value: 'RINGAN' },
  { label: 'Sedang', value: 'SEDANG' },
  { label: 'Berat', value: 'BERAT' },
];
const WASH_POST_CONDITION_OPTIONS = [
  { label: 'OK', value: 'OK' },
  { label: 'Cuci Ulang', value: 'REWASH' },
];
const POST_WASH_ROUTE_OPTIONS = [
  { label: 'Lanjut Perbaikan', value: 'CONTINUE_REPAIR' },
  { label: 'Selesai', value: 'COMPLETE_AFTER_WASH' },
];
const INSPECTION_RESULT_OPTIONS = [
  { label: 'Normal', value: 'NORMAL' },
  { label: 'Abnormal', value: 'ABNORMAL' },
  { label: 'Follow Up', value: 'FOLLOW_UP' },
];
const WORK_PLAN_OPTIONS = [
  { label: 'Lanjut Checking', value: 'LANJUT_CHECKING' },
  { label: 'Lanjut Repair', value: 'LANJUT_REPAIR' },
  { label: 'Menunggu Approval', value: 'MENUNGGU_APPROVAL' },
];
const INSPECTION_CATEGORY_OPTIONS = ['Karoseri', 'Kaki-kaki', 'Ban', 'Sistem Rem', 'Engine', 'Hydraulic', 'Electrical', 'Safety', 'Body'];
const OK_NG_OPTIONS = [
  { label: 'OK', value: 'OK' },
  { label: 'NG', value: 'NG' },
];
const PROCEED_STATUS_OPTIONS = [
  { label: 'Lanjut Repair', value: 'LANJUT_REPAIR' },
  { label: 'Menunggu Part', value: 'MENUNGGU_PART' },
  { label: 'Tidak Lanjut', value: 'TIDAK_LANJUT' },
];
const WAITING_TYPE_OPTIONS = [
  { label: 'Part', value: 'PART' },
  { label: 'Slot Bay', value: 'SLOT_BAY' },
  { label: 'Approval', value: 'APPROVAL' },
  { label: 'Tool', value: 'TOOL' },
  { label: 'External', value: 'EXTERNAL' },
];
const JOBCARD_CONFIRMATION_OPTIONS = [
  { label: 'Sudah Cetak', value: 'SUDAH_CETAK' },
  { label: 'Belum Cetak', value: 'BELUM_CETAK' },
];
const REPAIR_TECH_ACTION_OPTIONS = [
  { label: 'Adjustment', value: 'ADJUSTMENT' },
  { label: 'Repair', value: 'REPAIR' },
  { label: 'Replace', value: 'REPLACE' },
  { label: 'Cleaning', value: 'CLEANING' },
];
const REPAIR_OBSTACLE_OPTIONS = [
  { label: 'Tidak Ada', value: 'TIDAK_ADA' },
  { label: 'Part', value: 'PART' },
  { label: 'Tool', value: 'TOOL' },
  { label: 'Approval', value: 'APPROVAL' },
  { label: 'Waktu', value: 'WAKTU' },
  { label: 'Lainnya', value: 'LAINNYA' },
];
const CLOSING_STATUS_OPTIONS = [
  { label: 'Ready Close', value: 'READY_CLOSE' },
  { label: 'Pending Close', value: 'PENDING_CLOSE' },
];
const DOCUMENT_COMPLETENESS_OPTIONS = [
  { label: 'Lengkap', value: 'LENGKAP' },
  { label: 'Belum Lengkap', value: 'BELUM_LENGKAP' },
];
const HANDOVER_CONFIRMATION_OPTIONS = [
  { label: 'Diserahterimakan', value: 'DISETERIMAKAN' },
  { label: 'Ditunda', value: 'DITUNDA' },
];
const WAITING_ETA_OPTIONS = ['15 menit', '30 menit', '1 jam', '2 jam', '>2 jam'];
const QC_PARAMETER_OPTIONS = ['Engine', 'Hydraulic', 'Electrical', 'Safety', 'Body'];
const STEP_HELPER_COPY = {
  WASHING_BAY: 'Isi hasil kondisi unit sebelum dan sesudah cuci. Gunakan catatan visual bila hasil cuci belum sesuai.',
  INSPECTION_PKB: 'Pilih hasil inspeksi dan rencana kerja, lalu tambahkan ringkasan temuan bila ada abnormality.',
  CHECKING: 'Gunakan hasil checkpoint dan status lanjut agar mekanik berikutnya tidak perlu menebak kondisi unit.',
  WAITING_BAY: 'Pilih jenis waiting yang paling dominan, lalu isi alasan singkat dan ETA bila tersedia.',
  CREATE_WO: 'Pastikan nomor SAP/WO terisi dan status jobcard sudah jelas sebelum step ditutup.',
  REPAIR: 'Tuliskan aksi perbaikan utama, lalu pilih tindakan teknis dan kendala bila proses terhambat.',
  QC: 'Pilih hasil QC secara tegas. Bila NG, jelaskan area rework agar proses balik lebih cepat.',
  READY_BAY_CLOSE: 'Tentukan apakah unit siap close dan pastikan status kelengkapan dokumen tercatat.',
  HANDOVER: 'Pilih status serah terima. Jika unit sudah diserahterimakan, isi nama penerimanya.',
};

const resolveErrorMessage = (error, fallback) => error?.message || error?.response?.data?.message || fallback;
const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

function LiveTimerText({ status, startAt, fallbackSeconds, style }) {
  const [elapsed, setElapsed] = useState(Math.max(0, Number(fallbackSeconds) || 0));

  useEffect(() => {
    if (status !== 'active' || !startAt) {
      setElapsed(Math.max(0, Number(fallbackSeconds) || 0));
      return undefined;
    }

    const syncElapsed = () => {
      const nextElapsed = Math.floor((Date.now() - new Date(startAt).getTime()) / 1000);
      setElapsed(Math.max(0, nextElapsed));
    };

    syncElapsed();
    const interval = setInterval(syncElapsed, 1000);
    return () => clearInterval(interval);
  }, [fallbackSeconds, startAt, status]);

  return <Text style={style}>{formatTime(elapsed)}</Text>;
}

function LiveDurationText({ status, startAt, fallbackMinutes, style }) {
  const [durationMinutes, setDurationMinutes] = useState(Math.max(0, Number(fallbackMinutes) || 0));

  useEffect(() => {
    if (status !== 'active' || !startAt) {
      setDurationMinutes(Math.max(0, Number(fallbackMinutes) || 0));
      return undefined;
    }

    const syncDuration = () => {
      const nextDuration = Math.floor((Date.now() - new Date(startAt).getTime()) / 60000);
      setDurationMinutes(Math.max(0, nextDuration));
    };

    syncDuration();
    const interval = setInterval(syncDuration, 1000);
    return () => clearInterval(interval);
  }, [fallbackMinutes, startAt, status]);

  return <Text style={style}>Durasi: {durationMinutes} menit</Text>;
}

const formatStepTitle = (title) => String(title || '').replace(/\s*(\([^)]*\))$/, '\n$1');

export default function MechanicProcessScreen() {
  const insets = useSafeAreaInsets();
  const { isRestrictedRole } = useMechanicAccessGuard();
  const { work_order_id } = useLocalSearchParams();
  const { showAlert } = useAlert();
  const menuBarContentPadding = getMenuBarContentPadding(insets.bottom);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [woData, setWoData] = useState(null);
  const [stepLogs, setStepLogs] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState('pending'); // pending, active, hold
  const [partItems, setPartItems] = useState([]);
  const [note, setNote] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const draftSaveTimeoutRef = useRef(null);
  const [finishForm, setFinishForm] = useState({
    pre_wash_condition: '',
    post_wash_condition: '',
    post_wash_route: '',
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
    inspection_categories: [],
    technical_action: [],
    obstacle: '',
    hold_reason: '',
    qc_result: '',
    qc_parameter: [],
    rework_note: '',
    closing_status: '',
    work_summary: '',
    document_completeness: '',
    handover_confirmation: '',
    receiver: '',
    final_note: '',
  });

  const loadData = useCallback(async () => {
    if (isRestrictedRole || !work_order_id) return;
    try {
      // Load WO details
      const wo = await workOrdersService.getById(String(work_order_id));
      setWoData(wo);

      // Load process data
      const proc = await workshopService.processData(String(work_order_id));

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
        } else if (holdStep) {
          const idx = STEP_CODES.indexOf(holdStep.step_code);
          setCurrentStepIndex(idx >= 0 ? idx : 0);
          setStatus('hold');
        } else if (nextReady) {
          const idx = STEP_CODES.indexOf(nextReady.step_code);
          setCurrentStepIndex(idx >= 0 ? idx : 0);
          setStatus('pending');
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
          const nextFinishForm = { ...draft.finishForm };
          nextFinishForm.inspection_categories = normalizeMultiValue(draft.finishForm.inspection_categories);
          nextFinishForm.technical_action = normalizeMultiValue(draft.finishForm.technical_action);
          nextFinishForm.qc_parameter = normalizeMultiValue(draft.finishForm.qc_parameter);
          setFinishForm((prev) => ({ ...prev, ...nextFinishForm }));
        }
      } catch (_e) {}
    };
    restoreDraft();
    return () => { mounted = false; };
  }, [isRestrictedRole, work_order_id]);

  useEffect(() => {
    if (isRestrictedRole || !work_order_id) return;
    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
    }
    draftSaveTimeoutRef.current = setTimeout(async () => {
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
    }, 500);

    return () => {
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current);
      }
    };
  }, [draftSaveTimeoutRef, finishForm, holdReason, isRestrictedRole, note, partItems, proofFile, work_order_id]);

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
      post_wash_route: '',
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
      inspection_categories: [],
      technical_action: [],
      obstacle: '',
      hold_reason: '',
      qc_result: '',
      qc_parameter: [],
      rework_note: '',
      closing_status: '',
      work_summary: '',
      document_completeness: '',
      handover_confirmation: '',
      receiver: '',
      final_note: '',
    });
  };

  const buildStationData = (stepCode, formValues = finishForm) => {
    switch (stepCode) {
      case 'WASHING_BAY':
        return {
          step_code: stepCode,
          pre_wash_condition: formValues.pre_wash_condition,
          post_wash_condition: formValues.post_wash_condition,
          post_wash_route: formValues.post_wash_route,
          visual_note: formValues.visual_note || null,
        };
      case 'INSPECTION_PKB':
        return {
          step_code: stepCode,
          inspection_result: formValues.inspection_result,
          work_plan: formValues.work_plan,
          inspection_categories: normalizeMultiValue(formValues.inspection_categories),
          main_findings: formValues.main_findings || null,
          action_estimate: formValues.action_estimate || null,
        };
      case 'CHECKING':
        return { step_code: stepCode, checkpoint_result: formValues.checkpoint_result, checking_summary: formValues.checking_summary || null, proceed_status: formValues.proceed_status || null };
      case 'WAITING_BAY':
        return { step_code: stepCode, waiting_reason: formValues.waiting_reason, waiting_type: formValues.waiting_type || null, waiting_eta: formValues.waiting_eta || null };
      case 'CREATE_WO':
        return { step_code: stepCode, sap_reference_no: formValues.sap_reference_no, admin_note: formValues.admin_note || null, jobcard_confirmation: formValues.jobcard_confirmation || null };
      case 'REPAIR':
        return {
          step_code: stepCode,
          repair_action: formValues.repair_action,
          technical_actions: normalizeMultiValue(formValues.technical_action),
          obstacle: formValues.obstacle || null,
          hold_reason: formValues.hold_reason || null,
        };
      case 'QC':
        return {
          step_code: stepCode,
          qc_result: formValues.qc_result,
          qc_parameters: normalizeMultiValue(formValues.qc_parameter),
          rework_note: formValues.rework_note || null,
        };
      case 'READY_BAY_CLOSE':
        return { step_code: stepCode, closing_status: formValues.closing_status, work_summary: formValues.work_summary || null, document_completeness: formValues.document_completeness || null };
      case 'HANDOVER':
        return { step_code: stepCode, handover_confirmation: formValues.handover_confirmation, receiver: formValues.receiver || null, final_note: formValues.final_note || null };
      default:
        return { step_code: stepCode, feedback: note || null };
    }
  };

  const validateFinishForm = (stepCode, formValues = finishForm) => {
    const requiredMap = {
      WASHING_BAY: ['pre_wash_condition', 'post_wash_condition', 'post_wash_route'],
      INSPECTION_PKB: ['inspection_result', 'work_plan', 'inspection_categories'],
      CHECKING: ['checkpoint_result', 'proceed_status'],
      WAITING_BAY: ['waiting_reason', 'waiting_type'],
      CREATE_WO: ['sap_reference_no', 'jobcard_confirmation'],
      REPAIR: ['repair_action', 'technical_action'],
      QC: ['qc_result', 'qc_parameter'],
      READY_BAY_CLOSE: ['closing_status', 'document_completeness'],
      HANDOVER: ['handover_confirmation'],
    };
    const enumMap = {
      pre_wash_condition: WASH_PRE_CONDITION_OPTIONS.map((x) => x.value),
      post_wash_condition: WASH_POST_CONDITION_OPTIONS.map((x) => x.value),
      post_wash_route: POST_WASH_ROUTE_OPTIONS.map((x) => x.value),
      inspection_result: INSPECTION_RESULT_OPTIONS.map((x) => x.value),
      work_plan: WORK_PLAN_OPTIONS.map((x) => x.value),
      inspection_categories: INSPECTION_CATEGORY_OPTIONS,
      checkpoint_result: OK_NG_OPTIONS.map((x) => x.value),
      proceed_status: PROCEED_STATUS_OPTIONS.map((x) => x.value),
      waiting_type: WAITING_TYPE_OPTIONS.map((x) => x.value),
      jobcard_confirmation: JOBCARD_CONFIRMATION_OPTIONS.map((x) => x.value),
      technical_action: REPAIR_TECH_ACTION_OPTIONS.map((x) => x.value),
      obstacle: REPAIR_OBSTACLE_OPTIONS.map((x) => x.value),
      qc_result: OK_NG_OPTIONS.map((x) => x.value),
      qc_parameter: QC_PARAMETER_OPTIONS,
      closing_status: CLOSING_STATUS_OPTIONS.map((x) => x.value),
      document_completeness: DOCUMENT_COMPLETENESS_OPTIONS.map((x) => x.value),
      handover_confirmation: HANDOVER_CONFIRMATION_OPTIONS.map((x) => x.value),
    };
    const requiredFields = requiredMap[stepCode] || [];
    const missing = requiredFields.find((key) => {
      const currentValue = formValues[key];
      if (Array.isArray(currentValue)) return currentValue.length === 0;
      return !String(currentValue || '').trim();
    });
    if (missing) {
      showAlert({ type: 'warning', title: 'Perhatian', message: 'Field wajib pada form Finish belum lengkap.' });
      return false;
    }
    for (const [field, allowedValues] of Object.entries(enumMap)) {
      const currentValue = formValues[field];
      const values = Array.isArray(currentValue)
        ? currentValue.map((item) => String(item || '').trim()).filter(Boolean)
        : [String(currentValue || '').trim()].filter(Boolean);
      if (values.length === 0) continue;
      if (values.some((value) => !allowedValues.includes(value))) {
        showAlert({ type: 'warning', title: 'Perhatian', message: 'Ada pilihan form yang tidak valid. Silakan pilih dari opsi yang tersedia.' });
        return false;
      }
    }
    if (stepCode === 'WASHING_BAY' && formValues.post_wash_condition === 'REWASH' && !String(formValues.visual_note || '').trim()) {
      showAlert({ type: 'warning', title: 'Perhatian', message: 'Catatan visual wajib diisi bila hasil cuci perlu diulang.' });
      return false;
    }
    if (stepCode === 'CHECKING' && formValues.checkpoint_result === 'NG' && !String(formValues.checking_summary || '').trim()) {
      showAlert({ type: 'warning', title: 'Perhatian', message: 'Ringkasan temuan wajib diisi bila hasil checking NG.' });
      return false;
    }
    if (stepCode === 'REPAIR' && ['PART', 'TOOL', 'APPROVAL', 'WAKTU', 'LAINNYA'].includes(String(formValues.obstacle || '')) && !String(formValues.hold_reason || '').trim()) {
      showAlert({ type: 'warning', title: 'Perhatian', message: 'Detail kendala wajib diisi bila ada obstacle pada proses repair.' });
      return false;
    }
    if (stepCode === 'QC' && String(formValues.qc_result || '').toUpperCase() === 'NG' && !String(formValues.rework_note || '').trim()) {
      showAlert({ type: 'warning', title: 'Perhatian', message: 'Catatan rework wajib diisi bila hasil QC adalah NG.' });
      return false;
    }
    if (stepCode === 'HANDOVER' && String(formValues.handover_confirmation || '') === 'DISETERIMAKAN' && !String(formValues.receiver || '').trim()) {
      showAlert({ type: 'warning', title: 'Perhatian', message: 'Nama penerima wajib diisi saat unit diserahterimakan.' });
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
      const msg = resolveErrorMessage(e, 'Gagal memulai process.');
      showAlert({ type: 'error', title: 'Gagal', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (action, options = {}) => {
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
        const finishFormData = options.finishFormData || finishForm;
        let payload = { notes: note };
        const stepCode = STEP_CODES[currentStepIndex];
        const stationData = buildStationData(stepCode, finishFormData);
        const completesAfterWashing = stepCode === 'WASHING_BAY' && finishFormData.post_wash_route === 'COMPLETE_AFTER_WASH';
        if (stepCode === 'CREATE_WO' && String(finishFormData.sap_reference_no || '').trim()) {
          payload.sap_reference_no = String(finishFormData.sap_reference_no || '').trim();
        }

        if (stepCode === 'REPAIR' && partItems.length > 0) {
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

        if (completesAfterWashing) {
          showAlert({ type: 'success', title: 'Selesai', message: 'Proses workshop selesai otomatis setelah washing bay.' });
          await loadData();
          setTimeout(() => router.replace('/(tabs)/mechanic?tab=history'), 1200);
          return;
        }

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
      const msg = resolveErrorMessage(e, 'Aksi gagal dilakukan.');
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
    const finishFormSnapshot = { ...finishForm };
    if (!validateFinishForm(stepCode, finishFormSnapshot)) return;
    setFinishModalVisible(false);
    await handleAction('finish', { finishFormData: finishFormSnapshot });
  };

  const renderChoiceField = (label, value, options, onChange, hint = null) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      <View style={styles.segmentRow}>
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <TouchableOpacity
              key={`${label}-${option.value}`}
              style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderQuickPickField = (label, value, options, onChange, hint = null) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      <View style={styles.segmentRow}>
        {options.map((option) => {
          const isActive = value === option;
          return (
            <TouchableOpacity
              key={`${label}-${option}`}
              style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
              onPress={() => onChange(option)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderMultiSelectField = (label, values, options, onChange, hint = null) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      <View style={styles.segmentRow}>
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          const isActive = values.includes(optionValue);
          return (
            <TouchableOpacity
              key={`${label}-${optionValue}`}
              style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
              onPress={() => onChange(optionValue)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{optionLabel}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderFinishFormContent = () => {
    const stepCode = STEP_CODES[currentStepIndex];
    if (stepCode === 'WASHING_BAY') {
      return (
        <>
          <Text style={styles.modalHelperText}>{STEP_HELPER_COPY[stepCode]}</Text>
          {renderChoiceField('Kondisi sebelum cuci', finishForm.pre_wash_condition, WASH_PRE_CONDITION_OPTIONS, (v) => setFinishForm((p) => ({ ...p, pre_wash_condition: v })), 'Pilih tingkat kekotoran unit sebelum masuk washing bay.')}
          {renderChoiceField('Kondisi sesudah cuci', finishForm.post_wash_condition, WASH_POST_CONDITION_OPTIONS, (v) => setFinishForm((p) => ({ ...p, post_wash_condition: v })), 'Gunakan Cuci Ulang bila hasil belum memenuhi standar.')}
          {renderChoiceField('Rute setelah washing', finishForm.post_wash_route, POST_WASH_ROUTE_OPTIONS, (v) => setFinishForm((p) => ({ ...p, post_wash_route: v })), 'Pilih lanjut perbaikan atau selesaikan work order langsung setelah washing bay.')}
          <TextInput style={[styles.modalInput, styles.modalTextArea]} placeholder="Catatan visual / temuan cucian" placeholderTextColor={theme.colors.textSecondary} multiline value={finishForm.visual_note} onChangeText={(v) => setFinishForm((p) => ({ ...p, visual_note: v }))} />
        </>
      );
    }
    if (stepCode === 'INSPECTION_PKB') {
      return (
        <>
          <Text style={styles.modalHelperText}>{STEP_HELPER_COPY[stepCode]}</Text>
          {renderChoiceField('Hasil inspeksi', finishForm.inspection_result, INSPECTION_RESULT_OPTIONS, (v) => setFinishForm((p) => ({ ...p, inspection_result: v })), 'Gunakan hasil inspeksi terstruktur agar mudah dianalisis.')}
          {renderChoiceField('Rencana pekerjaan', finishForm.work_plan, WORK_PLAN_OPTIONS, (v) => setFinishForm((p) => ({ ...p, work_plan: v })))}
          {renderMultiSelectField('Kategori pekerjaan', finishForm.inspection_categories, INSPECTION_CATEGORY_OPTIONS, (v) => setFinishForm((p) => {
            const nextValues = p.inspection_categories.includes(v)
              ? p.inspection_categories.filter((item) => item !== v)
              : [...p.inspection_categories, v];
            return { ...p, inspection_categories: nextValues };
          }), 'Pilih minimal satu kategori pekerjaan yang ditemukan saat create PKB.')}
          <TextInput style={[styles.modalInput, styles.modalTextArea]} placeholder="Temuan utama / ringkasan abnormality" placeholderTextColor={theme.colors.textSecondary} multiline value={finishForm.main_findings} onChangeText={(v) => setFinishForm((p) => ({ ...p, main_findings: v }))} />
          <TextInput style={styles.modalInput} placeholder="Estimasi tindakan / SLA" placeholderTextColor={theme.colors.textSecondary} value={finishForm.action_estimate} onChangeText={(v) => setFinishForm((p) => ({ ...p, action_estimate: v }))} />
        </>
      );
    }
    if (stepCode === 'CHECKING') {
      return (
        <>
          <Text style={styles.modalHelperText}>{STEP_HELPER_COPY[stepCode]}</Text>
          {renderChoiceField('Hasil checkpoint', finishForm.checkpoint_result, OK_NG_OPTIONS, (v) => setFinishForm((p) => ({ ...p, checkpoint_result: v })), 'Pilih OK jika unit lolos checkpoint, NG jika ada temuan lanjut.')}
          {renderChoiceField('Status lanjut', finishForm.proceed_status, PROCEED_STATUS_OPTIONS, (v) => setFinishForm((p) => ({ ...p, proceed_status: v })))}
          <TextInput style={[styles.modalInput, styles.modalTextArea]} placeholder="Ringkasan temuan checking" placeholderTextColor={theme.colors.textSecondary} multiline value={finishForm.checking_summary} onChangeText={(v) => setFinishForm((p) => ({ ...p, checking_summary: v }))} />
        </>
      );
    }
    if (stepCode === 'WAITING_BAY') {
      return (
        <>
          <Text style={styles.modalHelperText}>{STEP_HELPER_COPY[stepCode]}</Text>
          {renderChoiceField('Jenis waiting', finishForm.waiting_type, WAITING_TYPE_OPTIONS, (v) => setFinishForm((p) => ({ ...p, waiting_type: v })), 'Pilih penyebab utama mengapa unit masuk waiting bay.')}
          <TextInput style={[styles.modalInput, styles.modalTextArea]} placeholder="Alasan menunggu / detail kendala" placeholderTextColor={theme.colors.textSecondary} multiline value={finishForm.waiting_reason} onChangeText={(v) => setFinishForm((p) => ({ ...p, waiting_reason: v }))} />
          {renderQuickPickField('ETA cepat', finishForm.waiting_eta, WAITING_ETA_OPTIONS, (v) => setFinishForm((p) => ({ ...p, waiting_eta: v })), 'Pilih ETA umum untuk mempercepat input.')}
          <TextInput style={styles.modalInput} placeholder="ETA (contoh: 30 menit / 1 jam)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.waiting_eta} onChangeText={(v) => setFinishForm((p) => ({ ...p, waiting_eta: v }))} />
        </>
      );
    }
    if (stepCode === 'CREATE_WO') {
      return (
        <>
          <Text style={styles.modalHelperText}>{STEP_HELPER_COPY[stepCode]}</Text>
          <TextInput style={styles.modalInput} placeholder="SAP Reference No / WO No (wajib)" placeholderTextColor={theme.colors.textSecondary} value={finishForm.sap_reference_no} onChangeText={(v) => setFinishForm((p) => ({ ...p, sap_reference_no: v }))} />
          {renderChoiceField('Konfirmasi jobcard', finishForm.jobcard_confirmation, JOBCARD_CONFIRMATION_OPTIONS, (v) => setFinishForm((p) => ({ ...p, jobcard_confirmation: v })))}
          <TextInput style={[styles.modalInput, styles.modalTextArea]} placeholder="Catatan administrasi" placeholderTextColor={theme.colors.textSecondary} multiline value={finishForm.admin_note} onChangeText={(v) => setFinishForm((p) => ({ ...p, admin_note: v }))} />
        </>
      );
    }
    if (stepCode === 'REPAIR') {
      return (
        <>
          <Text style={styles.modalHelperText}>{STEP_HELPER_COPY[stepCode]}</Text>
          <TextInput style={[styles.modalInput, styles.modalTextArea]} placeholder="Aksi perbaikan (wajib)" placeholderTextColor={theme.colors.textSecondary} multiline value={finishForm.repair_action} onChangeText={(v) => setFinishForm((p) => ({ ...p, repair_action: v }))} />
          {renderMultiSelectField('Tindakan teknis', finishForm.technical_action, REPAIR_TECH_ACTION_OPTIONS, (v) => setFinishForm((p) => {
            const nextValues = p.technical_action.includes(v)
              ? p.technical_action.filter((item) => item !== v)
              : [...p.technical_action, v];
            return { ...p, technical_action: nextValues };
          }))}
          {renderChoiceField('Kendala perbaikan', finishForm.obstacle, REPAIR_OBSTACLE_OPTIONS, (v) => setFinishForm((p) => ({ ...p, obstacle: v })))}
          {['PART', 'TOOL', 'APPROVAL', 'WAKTU', 'LAINNYA'].includes(String(finishForm.obstacle || '').toUpperCase()) ? (
            <TextInput style={[styles.modalInput, styles.modalTextArea]} placeholder="Detail kendala / hold reason" placeholderTextColor={theme.colors.textSecondary} multiline value={finishForm.hold_reason} onChangeText={(v) => setFinishForm((p) => ({ ...p, hold_reason: v }))} />
          ) : null}
        </>
      );
    }
    if (stepCode === 'QC') {
      return (
        <>
          <Text style={styles.modalHelperText}>{STEP_HELPER_COPY[stepCode]}</Text>
          {renderChoiceField('Hasil QC', finishForm.qc_result, OK_NG_OPTIONS, (v) => setFinishForm((p) => ({ ...p, qc_result: v })), 'Pilih NG bila unit harus rework.')}
          {renderMultiSelectField('Parameter QC cepat', finishForm.qc_parameter, QC_PARAMETER_OPTIONS, (v) => setFinishForm((p) => {
            const nextValues = p.qc_parameter.includes(v)
              ? p.qc_parameter.filter((item) => item !== v)
              : [...p.qc_parameter, v];
            return { ...p, qc_parameter: nextValues };
          }), 'Pilih minimal satu area QC yang diperiksa.')}
          {String(finishForm.qc_result || '').toUpperCase() === 'NG' ? (
            <TextInput style={[styles.modalInput, styles.modalTextArea]} placeholder="Catatan rework (wajib bila NG)" placeholderTextColor={theme.colors.textSecondary} multiline value={finishForm.rework_note} onChangeText={(v) => setFinishForm((p) => ({ ...p, rework_note: v }))} />
          ) : null}
        </>
      );
    }
    if (stepCode === 'READY_BAY_CLOSE') {
      return (
        <>
          <Text style={styles.modalHelperText}>{STEP_HELPER_COPY[stepCode]}</Text>
          {renderChoiceField('Status closing', finishForm.closing_status, CLOSING_STATUS_OPTIONS, (v) => setFinishForm((p) => ({ ...p, closing_status: v })))}
          {renderChoiceField('Kelengkapan dokumen', finishForm.document_completeness, DOCUMENT_COMPLETENESS_OPTIONS, (v) => setFinishForm((p) => ({ ...p, document_completeness: v })))}
          <TextInput style={[styles.modalInput, styles.modalTextArea]} placeholder="Ringkasan pekerjaan / closing note" placeholderTextColor={theme.colors.textSecondary} multiline value={finishForm.work_summary} onChangeText={(v) => setFinishForm((p) => ({ ...p, work_summary: v }))} />
        </>
      );
    }
    if (stepCode === 'HANDOVER') {
      return (
        <>
          <Text style={styles.modalHelperText}>{STEP_HELPER_COPY[stepCode]}</Text>
          {renderChoiceField('Konfirmasi serah terima', finishForm.handover_confirmation, HANDOVER_CONFIRMATION_OPTIONS, (v) => setFinishForm((p) => ({ ...p, handover_confirmation: v })))}
          <TextInput style={styles.modalInput} placeholder="Penerima" placeholderTextColor={theme.colors.textSecondary} value={finishForm.receiver} onChangeText={(v) => setFinishForm((p) => ({ ...p, receiver: v }))} />
          <TextInput style={[styles.modalInput, styles.modalTextArea]} placeholder="Catatan akhir / handover note" placeholderTextColor={theme.colors.textSecondary} multiline value={finishForm.final_note} onChangeText={(v) => setFinishForm((p) => ({ ...p, final_note: v }))} />
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

  const renderStepTimeline = () => (
    <Card style={styles.timelineCard}>
      <Text style={styles.timelineTitle}>Progress Station (9 Step)</Text>
      <View style={styles.stepsRow}>
        <View style={styles.stepsLine} />
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
    const processInAt = currentLog?.process_in_at || null;
    const fallbackElapsedSeconds = currentLog?.process_in_at
      ? Math.floor((Date.now() - new Date(currentLog.process_in_at).getTime()) / 1000)
      : 0;
    const durationMinutes = currentLog?.actual_minutes ?? (fallbackElapsedSeconds > 0 ? Math.floor(fallbackElapsedSeconds / 60) : 0);

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
        <Text style={styles.currentStepTitle}>
          {formatStepTitle(STEP_NAME_MAP[STEP_CODES[currentStepIndex]] || STEP_CODES[currentStepIndex])}
        </Text>
        <View style={styles.timerHeader}>
          <Clock size={24} color={status === 'active' ? theme.colors.primary : theme.colors.textSecondary} />
          <LiveTimerText
            status={status}
            startAt={processInAt}
            fallbackSeconds={fallbackElapsedSeconds}
            style={[styles.timerText, status === 'active' && { color: theme.colors.primary }]}
          />
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
          <LiveDurationText
            status={status}
            startAt={processInAt}
            fallbackMinutes={durationMinutes}
            style={styles.timeMetaText}
          />
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
      contentContainerStyle={{ paddingBottom: menuBarContentPadding }}
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
        <Text style={styles.woAsset}>
          Unit: {woData?.asset?.name || woData?.asset?.code || '-'}{woData?.field?.code ? ` (${woData.field.code})` : ''}
        </Text>
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
    marginBottom: theme.spacing.sm,
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
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  stepsLine: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 13,
    height: 2,
    backgroundColor: theme.colors.border,
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
  widgetCard: { margin: theme.spacing.md, marginTop: theme.spacing.xs, padding: theme.spacing.xl, alignItems: 'center' },
  currentStepTitle: {
    ...theme.typography.h1,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontSize: 30,
    lineHeight: 36,
  },
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
  fieldBlock: {
    marginBottom: 10,
  },
  fieldLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: 6,
  },
  fieldHint: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  modalHelperText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
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
  const normalizeMultiValue = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item || '').trim()).filter(Boolean);
    }
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
    return [];
  };
