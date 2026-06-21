export const BAY_ORDER = ['registration', 'approval', 'washing_bay', 'inspection_pkb', 'checking', 'waiting_bay', 'create_wo', 'repair', 'qc', 'ready_bay_close', 'handover']

export const CONTROL_TOWER_BOARD_ORDER = ['approval', 'washing_bay', 'inspection_pkb', 'checking', 'create_wo', 'waiting_bay', 'repair', 'qc', 'ready_bay_close', 'handover']

export const BAY_LABEL = {
  registration: 'Registrasi',
  approval: 'Approval',
  washing_bay: 'Washing Bay',
  inspection_pkb: 'Create PKB',
  checking: 'Checking',
  create_wo: 'Create WO',
  waiting_bay: 'Waiting Bay',
  repair: 'Repair',
  qc: 'QC',
  ready_bay_close: 'Ready Bay & Close',
  handover: 'Handover',
}

export const STEP_SHORT_LABEL = {
  REGISTRATION: 'REG',
  APPROVAL: 'APP',
  WASHING_BAY: 'WASH',
  INSPECTION_PKB: 'INSP',
  CHECKING: 'CHK',
  WAITING_BAY: 'WAIT',
  CREATE_WO: 'WO',
  REPAIR: 'REPR',
  QC: 'QC',
  READY_BAY_CLOSE: 'READY',
  HANDOVER: 'HO',
}

export const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export const EVENT_LABELS = {
  PROCESS_STARTED: 'Process Dimulai',
  PROCESS_COMPLETED: 'Process Selesai',
  STEP_IN: 'Step Mulai',
  STEP_OUT: 'Step Selesai',
  STEP_HOLD: 'Step Di-hold',
  STEP_RESUME: 'Step Dilanjutkan',
  STEP_APPROVED: 'Step Disetujui',
  STEP_REJECTED: 'Step Ditolak',
  NEXT_STEP_READY: 'Step Berikutnya Siap',
  BAY_IN: 'Masuk Bay',
  BAY_OUT: 'Keluar Bay',
  QC_OK: 'QC OK',
  QC_NOT_OK: 'QC Tidak OK',
  ROUTE_TO_SERVICE_REWORK: 'Kembali ke Rework Service',
  PART_REQUIRED: 'Part Diperlukan',
  PART_NOT_REQUIRED: 'Part Tidak Diperlukan',
}

export const DEFAULT_SETTINGS = {
  headerTitle: 'YWA Workshop Operations Dashboard',
  headerSubtitle: 'Monitoring antrean, flow proses, dan preventive secara realtime.',
  sliderDurationSec: 20,
  slide1ScrollSpeed: 24,
  slide1ScrollDelaySec: 1,
  slide1ScrollLoopPauseMs: 1000,
  runningText: 'ALERT: UNIT OVER SLA MENJADI PRIORITAS PENANGANAN|PERHATIAN: UNIT ON HOLD WAJIB DITINDAKLANJUTI DENGAN ETA|INFO: MONITOR STEP BOTTLENECK SECARA BERKALA|SCHEDULE: PREVENTIVE DUE TODAY HARUS DITUNTASKAN',
  slide1Title: 'FIFO Workshop Board',
  slide1Desc: 'Antrian unit aktif dari registrasi hingga serah terima (auto-hide saat selesai).',
  slide2Title: 'Workshop Control Tower',
  slide2Desc: 'Paritas layout control tower admin, mode view-only.',
  slide3Title: 'Preventive & Operational KPI',
  slide3Desc: 'Fokus due schedule, bottleneck, dan performa harian workshop.',
  slide4Title: 'Dashboard Analyst',
  slide4Desc: 'Trend 30 hari: WO, downtime, dan bottleneck.',
}


