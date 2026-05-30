import { EVENT_LABELS, STEP_SHORT_LABEL } from './constants'

export const ACTIVE_WO_STATUSES = ['registered', 'triage', 'pending', 'approved', 'in_progress', 'on_hold', 'draft']

export function fmtDate(v) {
  if (!v) return '-'
  return new Date(v).toLocaleString('id-ID')
}

export function statusClass(queue, est) {
  if (!est) return 'Normal'
  if (queue > est) return 'Over SLA'
  if (queue >= Math.floor(est * 0.8)) return 'Warning'
  return 'On Track'
}

export function elapsedSeconds(row, nowTs) {
  const startRaw = row?.process_started_at || row?.wo_created_at || row?.created_at
  if (!startRaw) return 0
  const start = new Date(startRaw).getTime()
  if (!Number.isFinite(start)) return 0
  const endRaw = row?.closed_at || row?.completed_at || row?.wo_closed_at
  const isClosedStatus = ['completed', 'closed', 'cancelled'].includes(String(row?.wo_status || '').toLowerCase())
  const end = endRaw ? new Date(endRaw).getTime() : (isClosedStatus ? nowTs : nowTs)
  const safeEnd = Number.isFinite(end) ? end : nowTs
  return Math.max(0, Math.floor((safeEnd - start) / 1000))
}

export function fmtElapsed(totalSec) {
  const sec = Math.max(0, Number(totalSec || 0))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function eventLabel(key) {
  if (!key) return '-'
  return EVENT_LABELS[key] || key.replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase())
}

export function resolveBoardColumn(row) {
  const code = String(row?.step_code || '').toUpperCase()
  if (code === 'REGISTRATION') return 'registration'
  if (code === 'APPROVAL') return 'approval'
  if (code === 'WASHING_BAY' || code === 'BAY_WASHING') return 'washing_bay'
  if (code === 'INSPECTION_PKB' || code === 'INSPECTION') return 'inspection_pkb'
  if (code === 'CHECKING' || code === 'UNIT_CHECK_PART_NEED') return 'checking'
  if (code === 'WAITING_BAY' || code === 'BAY_WAITING') return 'waiting_bay'
  if (code === 'CREATE_WO' || code === 'KRANI_WO_JOBCARD') return 'create_wo'
  if (code === 'REPAIR' || code === 'SERVICE_REPAIR' || code === 'PART_SUPPLY' || code === 'EXECUTION' || code === 'ACTION') return 'repair'
  if (code === 'QC' || code === 'QC_CHECK') return 'qc'
  if (code === 'READY_BAY_CLOSE' || code === 'CLOSE_WO' || code === 'CLOSE') return 'ready_bay_close'
  if (code === 'HANDOVER') return 'handover'
  return 'registration'
}

export function stepCompactLabel(row) {
  const code = String(row?.step_code || '').toUpperCase()
  const order = Number(row?.current_step_order || row?.step_order || 0)
  const stepNo = order > 0 ? Math.max(1, Math.floor(order / 10)) : 1
  return `S${stepNo} ${STEP_SHORT_LABEL[code] || 'REG'}`
}

export function isFinishedRow(row) {
  const woStatus = String(row?.wo_status || row?.status || '').toLowerCase()
  const instanceState = String(row?.instance_state || row?.state || '').toLowerCase()
  const stepCode = String(row?.step_code || '').toUpperCase()
  const stepStatus = String(row?.step_status || row?.status || '').toLowerCase()
  const currentStepOrder = Number(row?.current_step_order || 0)
  return (
    ['completed', 'cancelled'].includes(woStatus) ||
    instanceState === 'done' ||
    (currentStepOrder >= 110 && stepCode === 'HANDOVER' && stepStatus === 'done')
  )
}

export function isActiveWorkshopRow(row) {
  const status = String(row?.wo_status || row?.status || '').toLowerCase()
  return ACTIVE_WO_STATUSES.includes(status) && !isFinishedRow(row)
}

