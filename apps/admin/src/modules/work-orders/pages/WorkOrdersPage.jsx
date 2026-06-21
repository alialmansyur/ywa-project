import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { apiRequest, ApiError } from '../../../services/api'
import { mapMeResponse } from '../../../services/auth'
import { ModalPortal } from '../../shared/components/ModalPortal'

const swal = Swal.mixin({ width: 420, customClass: { popup: 'rounded-2xl' } })

const STATUS_COLUMNS = [
  'registered',
  'triage',
  'pending',
  'approved',
  'in_progress',
  'on_hold',
  'completed',
  'cancelled',
]

const statusConfig = {
  registered: { label: 'Registered', tone: 'bg-slate-500/20 text-slate-300' },
  triage: { label: 'Triage', tone: 'bg-blue-500/20 text-blue-300' },
  draft: { label: 'Draft', tone: 'bg-slate-500/20 text-slate-300' },
  pending: { label: 'Pending', tone: 'bg-yellow-500/20 text-yellow-300' },
  approved: { label: 'Approved', tone: 'bg-cyan-500/20 text-cyan-300' },
  in_progress: { label: 'In Progress', tone: 'bg-indigo-500/20 text-indigo-300' },
  on_hold: { label: 'On Hold', tone: 'bg-orange-500/20 text-orange-300' },
  completed: { label: 'Completed', tone: 'bg-green-500/20 text-green-300' },
  cancelled: { label: 'Cancelled', tone: 'bg-red-500/20 text-red-300' },
}

function fmt(v) {
  if (!v) return '-'
  return new Date(v).toLocaleString('id-ID')
}

function normalizeTitle(v) {
  const raw = String(v || '').trim()
  return raw.replace(/^Registrasi Kedatangan\s*-\s*/i, '').trim() || raw || '-'
}

function canDo(action, stepStatus, { canExecute, canApprove }) {
  if (action === 'start_process') return canExecute
  if (action === 'step_in') return canExecute && (stepStatus === 'ready' || stepStatus === 'hold')
  if (action === 'step_out') return canExecute && stepStatus === 'in_progress'
  if (action === 'step_hold') return canExecute && stepStatus === 'in_progress'
  if (action === 'step_resume') return canExecute && stepStatus === 'hold'
  if (action === 'step_complete') return canExecute
  if (action === 'step_approve') return canApprove && stepStatus === 'waiting_approval'
  if (action === 'step_reject') return canApprove && (stepStatus === 'waiting_approval' || stepStatus === 'in_progress')
  return false
}

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.draft
  return <span className={`px-2 py-0.5 rounded text-xs ${cfg.tone}`}>{cfg.label}</span>
}

function SkeletonBox({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-700/60 ${className}`} />
}

export function WorkOrdersPage() {
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState('')
  const [permissions, setPermissions] = useState([])

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(12)
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [view, setView] = useState('kanban')

  const [rows, setRows] = useState([])

  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [proc, setProc] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [metrics, setMetrics] = useState(null)

  const [note, setNote] = useState('')
  const [sapReferenceNo, setSapReferenceNo] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const canExecute = permissions.includes('execute work-orders')
  const canApprove = permissions.includes('approve work-orders')

  const loadDetail = async (id) => {
    const [wo, p, t, m] = await Promise.all([
      apiRequest(`/work-orders/${id}`),
      apiRequest(`/work-orders/${id}/process`).catch(() => null),
      apiRequest(`/work-orders/${id}/timeline`).catch(() => []),
      apiRequest(`/work-orders/${id}/metrics`).catch(() => null),
    ])

    setDetail(wo)
    setProc(p)
    setTimeline(Array.isArray(t) ? t : [])
    setMetrics(m)
    setSapReferenceNo(wo?.sap_reference_no || '')
  }

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('per_page', String(perPage))
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (priorityFilter !== 'all') params.set('priority', priorityFilter)
      if (search.trim()) params.set('q', search.trim())

      const listRes = await apiRequest(`/work-orders?${params.toString()}`)

      setRows(listRes?.data || [])
      setTotal(listRes?.total || 0)
      setLastPage(listRes?.last_page || 1)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat work orders.')
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  const handleReload = async () => {
    setHasLoaded(false)
    setPage(1)
    await loadData()
  }

  useEffect(() => {
    loadData()
  }, [page, perPage, statusFilter, typeFilter, priorityFilter])

  useEffect(() => {
    apiRequest('/auth/me')
      .then((me) => setPermissions(mapMeResponse(me)?.permissions || []))
      .catch(() => setPermissions([]))
  }, [])

  useEffect(() => {
    if (!selected?.id) return
    loadDetail(selected.id).catch((e) => setError(e instanceof ApiError ? e.message : 'Gagal memuat detail WO.'))
  }, [selected?.id])

  const typeOptions = useMemo(() => Array.from(new Set(rows.map((x) => x.type).filter(Boolean))), [rows])
  const priorityOptions = useMemo(() => Array.from(new Set(rows.map((x) => x.priority).filter(Boolean))), [rows])

  const grouped = useMemo(() => {
    const bucket = STATUS_COLUMNS.reduce((acc, key) => ({ ...acc, [key]: [] }), {})
    for (const row of rows) {
      if (!bucket[row.status]) continue
      bucket[row.status].push(row)
    }
    return bucket
  }, [rows])

  const steps = proc?.instances?.[0]?.step_logs || []
  const currentStepOrder = useMemo(() => {
    const inProgress = steps.find((s) => s.status === 'in_progress')
    if (inProgress) return String(inProgress.step_order)
    const hold = steps.find((s) => s.status === 'hold')
    if (hold) return String(hold.step_order)
    const waitingApproval = steps.find((s) => s.status === 'waiting_approval')
    if (waitingApproval) return String(waitingApproval.step_order)
    const ready = steps.find((s) => s.status === 'ready')
    return ready ? String(ready.step_order) : ''
  }, [steps])
  const activeStep = currentStepOrder ? steps.find((s) => String(s.step_order) === String(currentStepOrder)) : null
  const activeStatus = activeStep?.status || null
  const isCreateWoStep = activeStep?.step_code === 'CREATE_WO'

  const runAction = async (path, payload = null, successMessage = 'Aksi berhasil.', method = 'POST') => {
    if (!selected?.id) return
    setActionLoading(true)
    try {
      await apiRequest(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: payload ? JSON.stringify(payload) : undefined,
      })
      await loadData()
      await loadDetail(selected.id)
      setNote('')
      await swal.fire({ icon: 'success', title: 'Berhasil', text: successMessage })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Aksi gagal.'
      setError(message)
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    } finally {
      setActionLoading(false)
    }
  }

  const timelineLabel = (item) => {
    const enrichedLabel = String(item?.event_label || '').trim()
    if (enrichedLabel) return enrichedLabel

    const raw = String(item?.title || '')
    if (!raw) return '-'
    if (item?.type === 'status') return raw

    if (raw === 'PROCESS_STARTED') return 'Process Dimulai'
    if (raw === 'PROCESS_COMPLETED') return 'Process Selesai'
    if (raw === 'STEP_IN') return 'Step Dimulai'
    if (raw === 'STEP_OUT') return 'Step Selesai'
    if (raw === 'STEP_HOLD') return 'Step Ditahan'
    if (raw === 'STEP_RESUME') return 'Step Dilanjutkan'
    if (raw === 'STEP_APPROVED') return 'Step Disetujui'
    if (raw === 'STEP_REJECTED') return 'Step Ditolak'
    if (raw === 'NEXT_STEP_READY') return 'Step Berikutnya Siap'
    if (raw === 'SAP_REFERENCE_SET') return 'SAP Reference Diisi'
    if (raw === 'STEP_OUT_REJECTED_MISSING_SAP') return 'Step Out Ditolak (SAP wajib)'

    return raw.replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase())
  }

  const timelineTone = (item) => {
    const explicitState = String(item?.state || '').toLowerCase()
    if (explicitState === 'completed') return { line: 'border-green-500/40', text: 'text-green-300' }
    if (explicitState === 'in_progress') return { line: 'border-yellow-500/40', text: 'text-yellow-300' }
    if (explicitState === 'hold') return { line: 'border-orange-500/40', text: 'text-orange-300' }
    if (explicitState === 'rejected') return { line: 'border-red-500/40', text: 'text-red-300' }

    const key = String(item?.title || '')
    if (['PROCESS_COMPLETED', 'STEP_OUT', 'STEP_APPROVED'].includes(key)) {
      return { line: 'border-green-500/40', text: 'text-green-300' }
    }
    if (['PROCESS_STARTED', 'STEP_IN', 'STEP_RESUME'].includes(key)) {
      return { line: 'border-yellow-500/40', text: 'text-yellow-300' }
    }
    return { line: 'border-slate-700', text: 'text-slate-300' }
  }

  const timelineState = (item) => {
    const explicitState = String(item?.state || '').toLowerCase()
    if (explicitState) return explicitState

    const key = String(item?.title || '')
    if (['PROCESS_COMPLETED', 'STEP_OUT', 'STEP_APPROVED'].includes(key)) return 'done'
    if (['PROCESS_STARTED', 'STEP_IN', 'STEP_RESUME'].includes(key)) return 'in_progress'
    if (['NEXT_STEP_READY'].includes(key)) return 'ready'
    return null
  }

  const timelineStateBadge = (state) => {
    if (!state) return null
    if (state === 'done') return <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/20 text-green-300">done</span>
    if (state === 'in_progress') return <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-300">in_progress</span>
    if (state === 'ready') return <span className="px-2 py-0.5 rounded text-[10px] bg-slate-500/20 text-slate-300">ready</span>
    return null
  }

  const stepStatusBadge = (status) => {
    const s = String(status || '').toLowerCase()
    if (s === 'done') return 'bg-green-500/20 text-green-300'
    if (s === 'in_progress') return 'bg-yellow-500/20 text-yellow-300'
    if (s === 'ready') return 'bg-slate-500/20 text-slate-300'
    if (s === 'hold') return 'bg-orange-500/20 text-orange-300'
    if (s === 'waiting_approval') return 'bg-blue-500/20 text-blue-300'
    if (s === 'rejected') return 'bg-red-500/20 text-red-300'
    return 'bg-slate-700/40 text-slate-300'
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Work Orders</h2>
          <p className="text-sm text-slate-400">WO-centric monitoring dengan mode Kanban dan List.</p>
        </div>
        <button onClick={handleReload} disabled={loading} className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/50 disabled:opacity-60">Muat Ulang</button>
      </div>

      {error ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

      <div className="card p-3">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap min-w-max pr-1">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari code, SAP, asset code, io_code, nama unit..." className="input px-3 py-2 rounded-lg text-sm w-80 shrink-0" />
            <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }} className="input px-3 py-2 rounded-lg text-sm w-44 shrink-0">
              <option value="all">Semua Status</option>
              {Object.keys(statusConfig).map((x) => <option key={x} value={x}>{statusConfig[x].label}</option>)}
            </select>
            <select value={typeFilter} onChange={(e) => { setPage(1); setTypeFilter(e.target.value) }} className="input px-3 py-2 rounded-lg text-sm w-44 shrink-0">
              <option value="all">Semua Tipe</option>
              {typeOptions.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select value={priorityFilter} onChange={(e) => { setPage(1); setPriorityFilter(e.target.value) }} className="input px-3 py-2 rounded-lg text-sm w-44 shrink-0">
              <option value="all">Semua Priority</option>
              {priorityOptions.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <button
              onClick={() => { setPage(1); loadData() }}
              className="px-3 py-2 rounded-lg text-sm bg-blue-500/20 text-blue-300 border border-blue-500/30"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">WO Board</h3>
        <div className="inline-flex rounded-xl border border-slate-700 overflow-hidden">
          <button
            type="button"
            onClick={() => setView('kanban')}
            className={`px-4 py-2 text-sm ${view === 'kanban' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:bg-slate-700/40'}`}
          >
            Kanban
          </button>
          <button
            type="button"
            onClick={() => setView('table')}
            className={`px-4 py-2 text-sm ${view === 'table' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:bg-slate-700/40'}`}
          >
            List
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">Total {total} data</div>
        </div>

        {!hasLoaded ? (
          view === 'kanban' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {STATUS_COLUMNS.map((status) => (
                <div key={`sk-${status}`} className="card p-3 space-y-2 min-h-72">
                  <div className="flex items-center justify-between">
                    <SkeletonBox className="h-4 w-24" />
                    <SkeletonBox className="h-5 w-8 rounded" />
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => <SkeletonBox key={`sk-card-${status}-${i}`} className="h-16 w-full" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/40">
                      <th className="text-left py-3 px-4">WO</th>
                      <th className="text-left py-3 px-4">Asset</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Priority</th>
                      <th className="text-left py-3 px-4">SAP</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <tr key={`sk-row-${i}`} className="border-b border-slate-800">
                        <td className="py-3 px-4"><SkeletonBox className="h-8 w-36" /></td>
                        <td className="py-3 px-4"><SkeletonBox className="h-4 w-44" /></td>
                        <td className="py-3 px-4"><SkeletonBox className="h-4 w-16" /></td>
                        <td className="py-3 px-4"><SkeletonBox className="h-4 w-16" /></td>
                        <td className="py-3 px-4"><SkeletonBox className="h-4 w-20" /></td>
                        <td className="py-3 px-4"><SkeletonBox className="h-5 w-20" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : view === 'kanban' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {STATUS_COLUMNS.map((status) => (
              <div key={status} className="card p-3 space-y-2 min-h-72">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-300">{statusConfig[status].label}</div>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">{grouped[status]?.length || 0}</span>
                </div>

                <div className="space-y-2 max-h-[28rem] overflow-y-auto hide-scrollbar pr-1">
                  {(grouped[status] || []).map((wo) => (
                    <button key={wo.id} type="button" onClick={() => setSelected(wo)} className="w-full text-left rounded-lg border border-slate-700 p-2 text-[11px] hover:bg-slate-800/40 space-y-1">
                      <div className="text-blue-300 font-semibold text-[11px]">{wo.code || '-'}</div>
                      <div className="text-slate-200 line-clamp-1 text-[11px]">{wo.asset?.code || '-'} | {wo.asset?.name || '-'}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                        <span className="uppercase">{wo.type || '-'}</span>
                        <span className="line-clamp-1">{wo.asset?.io_code || wo.asset?.plate_number || '-'}</span>
                      </div>
                      <div className={`text-[10px] ${wo.sap_reference_no ? 'text-cyan-300' : 'text-slate-500'}`}>{wo.sap_reference_no ? `SAP: ${wo.sap_reference_no}` : (wo.priority || '-').toUpperCase()}</div>
                    </button>
                  ))}
                  {(grouped[status] || []).length === 0 ? <div className="h-20 rounded border-2 border-dashed border-slate-700/60 flex items-center justify-center text-xs text-slate-500">Kosong</div> : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/40">
                    <th className="text-left py-3 px-4">WO</th>
                    <th className="text-left py-3 px-4">Asset</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Priority</th>
                    <th className="text-left py-3 px-4">SAP</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((wo) => (
                    <tr key={wo.id} className="border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer" onClick={() => setSelected(wo)}>
                      <td className="py-3 px-4">
                        <div className="text-blue-300 font-semibold">{wo.code}</div>
                        <div className="text-slate-400">{normalizeTitle(wo.title)}</div>
                      </td>
                      <td className="py-3 px-4">{wo.asset?.code || '-'} · {wo.asset?.name || '-'}</td>
                      <td className="py-3 px-4 uppercase">{wo.type || '-'}</td>
                      <td className="py-3 px-4 uppercase">{wo.priority || '-'}</td>
                      <td className="py-3 px-4 text-cyan-300">{wo.sap_reference_no || '-'}</td>
                      <td className="py-3 px-4"><StatusBadge status={wo.status} /></td>
                    </tr>
                  ))}
                  {!loading && rows.length === 0 ? <tr><td colSpan="6" className="py-8 text-center text-slate-400">Tidak ada data.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div>Menampilkan {rows.length === 0 ? 0 : ((page - 1) * perPage) + 1}-{Math.min(page * perPage, total)} dari {total}</div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Prev</button>
            <span>Hal {page} / {lastPage}</span>
            <button type="button" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page >= lastPage || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {selected ? (
        <ModalPortal>
          <div className="w-full h-full overflow-y-auto hide-scrollbar py-6 flex items-start justify-center" onClick={() => setSelected(null)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-6xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-700 flex items-start justify-between">
                <div>
                  <div className="text-xs text-blue-300 font-semibold">{detail?.code || selected?.code || '-'}</div>
                  {detail?.sap_reference_no ? <div className="text-xs text-cyan-300 mt-1">SAP: {detail.sap_reference_no}</div> : null}
                  <h3 className="text-lg font-bold mt-1">{normalizeTitle(detail?.title || selected?.title || 'Detail Work Order')}</h3>
                  <div className="text-xs text-slate-400 mt-1">{detail?.asset?.code || selected?.asset?.code || '-'} · {detail?.asset?.name || selected?.asset?.name || '-'}</div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400">Tutup</button>
              </div>

              <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4 max-h-[80vh] overflow-y-auto hide-scrollbar">
                <div className="lg:col-span-2 space-y-4">
                  <div className="card p-4">
                    <div className="text-sm font-semibold mb-3">Process Snapshot</div>
                    <div className="space-y-2">
                      {steps.map((s) => (
                        <div key={s.id} className={`rounded-lg border p-3 text-xs ${String(s.step_order) === String(currentStepOrder) ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700'}`}>
                          <div className="flex justify-between gap-2">
                            <div className="font-semibold">{s.step_name}</div>
                            <span className={`px-2 py-0.5 rounded ${stepStatusBadge(s.status)}`}>{s.status}</span>
                          </div>
                          <div className="text-slate-400 mt-1">IN: {fmt(s.process_in_at)} | OUT: {fmt(s.process_out_at)}</div>
                          <div className="text-slate-400">EST {s.est_minutes || 0}m · ACT {s.actual_minutes || 0}m · DT {s.downtime_minutes || 0}m</div>
                        </div>
                      ))}
                      {steps.length === 0 ? <div className="text-sm text-slate-400">Process belum dimulai.</div> : null}
                    </div>
                  </div>

                  <div className="card p-4">
                    <div className="text-sm font-semibold mb-2">Action Panel</div>
                    {['completed', 'cancelled'].includes(detail?.status) ? (
                      <div className="text-xs text-slate-400">WO sudah selesai/dibatalkan. Panel action read-only.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input value={note} onChange={(e) => setNote(e.target.value)} className="input px-3 py-2 rounded-lg text-sm md:col-span-2" placeholder="Catatan / reason" />

                        {isCreateWoStep ? (
                          <div className="md:col-span-2 rounded-lg border border-slate-700 p-3 bg-blue-500/5">
                            <div className="text-xs text-blue-300 font-semibold mb-2">SAP Reference No (wajib saat Step Out CREATE_WO)</div>
                            <input value={sapReferenceNo} onChange={(e) => setSapReferenceNo(e.target.value)} className="input px-3 py-2 rounded-lg text-sm w-full" placeholder="Masukkan SAP Reference No" />
                          </div>
                        ) : null}

                        <div className="md:col-span-2 overflow-x-auto hide-scrollbar">
                          <div className="flex items-center gap-2 min-w-max">
                            {canDo('start_process', activeStatus, { canExecute, canApprove }) && <button disabled={actionLoading} onClick={() => runAction(`/work-orders/${selected.id}/process/start`, null, 'Process WO dimulai.')} className="btn-primary px-3 py-2 rounded-lg text-sm whitespace-nowrap">Start Process</button>}
                            {detail?.status === 'draft' && <button disabled={actionLoading} onClick={() => runAction(`/work-orders/${selected.id}/status`, { status: 'pending', notes: note || 'Diajukan untuk approval' }, 'WO diajukan ke pending.', 'PATCH')} className="btn-secondary px-3 py-2 rounded-lg text-sm whitespace-nowrap">Ajukan Approval</button>}
                            {canApprove && detail?.status === 'pending' && <button disabled={actionLoading} onClick={() => runAction(`/work-orders/${selected.id}/approve`, null, 'WO disetujui.')} className="btn-primary px-3 py-2 rounded-lg text-sm whitespace-nowrap">Approve WO</button>}
                            {canDo('step_in', activeStatus, { canExecute, canApprove }) && <button disabled={actionLoading || !currentStepOrder} onClick={() => runAction(`/work-orders/${selected.id}/process/steps/${currentStepOrder}/in`, { notes: note || null }, 'Step dimulai.')} className="btn-secondary px-3 py-2 rounded-lg text-sm whitespace-nowrap">Step In</button>}
                            {canDo('step_out', activeStatus, { canExecute, canApprove }) && <button disabled={actionLoading || !currentStepOrder} onClick={() => runAction(`/work-orders/${selected.id}/process/steps/${currentStepOrder}/out`, { notes: note || null, sap_reference_no: isCreateWoStep ? sapReferenceNo.trim() : undefined }, 'Step selesai.')} className="btn-secondary px-3 py-2 rounded-lg text-sm whitespace-nowrap">Step Out</button>}
                            {canDo('step_hold', activeStatus, { canExecute, canApprove }) && <button disabled={actionLoading || !currentStepOrder} onClick={() => runAction(`/work-orders/${selected.id}/process/steps/${currentStepOrder}/hold`, { reason: note || 'Hold sementara' }, 'Step di-hold.')} className="btn-secondary px-3 py-2 rounded-lg text-sm whitespace-nowrap">Hold</button>}
                            {canDo('step_resume', activeStatus, { canExecute, canApprove }) && <button disabled={actionLoading || !currentStepOrder} onClick={() => runAction(`/work-orders/${selected.id}/process/steps/${currentStepOrder}/resume`, { notes: note || null }, 'Step dilanjutkan.')} className="btn-secondary px-3 py-2 rounded-lg text-sm whitespace-nowrap">Resume</button>}
                            {canDo('step_complete', activeStatus, { canExecute, canApprove }) && <button disabled={actionLoading} onClick={() => runAction(`/work-orders/${selected.id}/process/complete`, { notes: note || null }, 'Process WO selesai.')} className="btn-primary px-3 py-2 rounded-lg text-sm whitespace-nowrap">Complete</button>}
                            {canDo('step_approve', activeStatus, { canExecute, canApprove }) && <button disabled={actionLoading || !currentStepOrder} onClick={() => runAction(`/work-orders/${selected.id}/process/steps/${currentStepOrder}/approve`, { notes: note || null }, 'Step disetujui.')} className="btn-secondary px-3 py-2 rounded-lg text-sm whitespace-nowrap">Approve Step</button>}
                            {canDo('step_reject', activeStatus, { canExecute, canApprove }) && <button disabled={actionLoading || !currentStepOrder} onClick={() => runAction(`/work-orders/${selected.id}/process/steps/${currentStepOrder}/reject`, { reason: note || 'Perlu revisi' }, 'Step direject.')} className="btn-secondary px-3 py-2 rounded-lg text-sm whitespace-nowrap">Reject Step</button>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="card p-4">
                    <div className="text-sm font-semibold mb-2">Metrics</div>
                    {metrics ? (
                      <div className="text-sm space-y-1">
                        <div>Est: {metrics.total_est_minutes} menit</div>
                        <div>Actual: {metrics.total_actual_minutes} menit</div>
                        <div>Downtime: {metrics.total_downtime_minutes} menit</div>
                        <div>Late Steps: {metrics.late_steps}</div>
                        <div>Variance: {metrics.variance_minutes}</div>
                      </div>
                    ) : <div className="text-sm text-slate-400">Belum ada metrik.</div>}
                  </div>

                  <div className="card p-4">
                    <div className="text-sm font-semibold mb-2">Timeline & Audit</div>
                    <div className="space-y-2 max-h-80 overflow-y-auto hide-scrollbar">
                      {timeline.map((item, i) => (
                        <div key={`${item.type}-${i}`} className={`text-xs border-l-2 pl-3 py-1 ${timelineTone(item).line}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className={`font-semibold ${timelineTone(item).text}`}>{timelineLabel(item)}</div>
                            {timelineStateBadge(timelineState(item))}
                          </div>
                          <div className="text-slate-400">{fmt(item.time)}</div>
                        </div>
                      ))}
                      {timeline.length === 0 ? <div className="text-sm text-slate-400">Timeline kosong.</div> : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      ) : null}
    </div>
  )
}
