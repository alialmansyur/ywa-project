import { useEffect, useMemo, useState } from 'react'
import AsyncSelect from 'react-select/async'
import Swal from 'sweetalert2'
import { apiRequest, ApiError } from '../../../services/api'
import { ModalPortal } from '../../shared/components/ModalPortal'

function SkeletonBox({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-700/60 ${className}`} />
}

const bayLabels = {
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

const eventLabels = {
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

export function WorkshopControlTowerPage() {
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState('')
  const [overview, setOverview] = useState(null)
  const [liveFeed, setLiveFeed] = useState([])
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [bay, setBay] = useState('all')
  const [woType, setWoType] = useState('all')
  const [woStatus, setWoStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [selectedWoId, setSelectedWoId] = useState(null)
  const [woDetail, setWoDetail] = useState(null)
  const [woProcess, setWoProcess] = useState(null)
  const [woTimeline, setWoTimeline] = useState([])
  const [woMetrics, setWoMetrics] = useState(null)
  const [completedCount, setCompletedCount] = useState(0)

  const [showRegModal, setShowRegModal] = useState(false)
  const [regForm, setRegForm] = useState({ asset: null, title: '', description: '' })
  const [regSubmitting, setRegSubmitting] = useState(false)

  const loadAssets = async (inputValue) => {
    try {
      const res = await apiRequest(`/assets?search=${encodeURIComponent(inputValue)}&per_page=1000`)
      const items = res?.data || []
      return items.map(a => ({
        label: `${a.code} - ${a.name} ${a.io_code ? `(${a.io_code})` : ''}`,
        value: a.id,
        asset: a,
      }))
    } catch (e) {
      return []
    }
  }

  const handleRegisterArrival = async (e) => {
    e.preventDefault()
    if (!regForm.asset) return
    setRegSubmitting(true)
    try {
      const asset = regForm.asset.asset
      const title = regForm.title || `Registrasi Kedatangan - ${asset.code}`
      await apiRequest('/work-orders/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_id: asset.id,
          title,
          description: regForm.description,
        })
      })
      setShowRegModal(false)
      setRegForm({ asset: null, title: '', description: '' })
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Registrasi kedatangan berhasil disimpan.',
        timer: 1500,
        showConfirmButton: false,
      })
      loadData(true)
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err instanceof ApiError ? err.message : 'Gagal registrasi kedatangan.',
      })
    } finally {
      setRegSubmitting(false)
    }
  }

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'rgb(30 41 59 / 0.5)',
      borderColor: state.isFocused ? '#3b82f6' : 'rgb(51 65 85)',
      color: 'white',
      borderRadius: '0.75rem',
      padding: '2px',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': { borderColor: '#3b82f6' },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'rgb(30 41 59)',
      border: '1px solid rgb(51 65 85)',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? 'rgb(51 65 85)' : 'transparent',
      color: 'white',
      cursor: 'pointer',
      '&:active': { backgroundColor: '#2563eb' },
    }),
    singleValue: (base) => ({ ...base, color: 'white', fontSize: '0.875rem' }),
    input: (base) => ({ ...base, color: 'white' }),
    placeholder: (base) => ({ ...base, color: 'rgb(148 163 184)', fontSize: '0.875rem' }),
    indicatorSeparator: (base) => ({ ...base, backgroundColor: 'rgb(51 65 85)' }),
    dropdownIndicator: (base) => ({ ...base, color: 'rgb(148 163 184)', '&:hover': { color: 'white' } }),
    clearIndicator: (base) => ({ ...base, color: 'rgb(148 163 184)', '&:hover': { color: 'white' } })
  }

  const isRowFinished = (row, byProcess = false) => {
    const woStatus = String(row?.wo_status || row?.status || '').toLowerCase()
    const instanceState = String(row?.instance_state || row?.state || '').toLowerCase()
    const stepCode = String(row?.step_code || '').toUpperCase()
    const stepStatus = String(row?.step_status || row?.status || '').toLowerCase()
    const currentStepOrder = Number(row?.current_step_order || 0)

    return (
      byProcess ||
      ['completed', 'cancelled'].includes(woStatus) ||
      instanceState === 'done' ||
      (currentStepOrder >= 110 && stepCode === 'HANDOVER' && stepStatus === 'done')
    )
  }

  const normalizeRow = (row, finishedByProcess = false) => {
    const finished = isRowFinished(row, finishedByProcess)
    return {
      ...row,
      wo_status: finished ? 'completed' : row.wo_status,
      is_finished: finished,
    }
  }

  const normalizeTitle = (v) => {
    const raw = String(v || '').trim()
    return raw.replace(/^Registrasi Kedatangan\s*-\s*/i, '').trim() || raw || '-'
  }

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('per_page', String(perPage))
      if (q.trim()) params.set('q', q.trim())
      if (bay !== 'all') params.set('bay', bay)
      if (woType !== 'all') params.set('wo_type', woType)
      if (woStatus !== 'all') params.set('status', woStatus)

      const [ov, lf, wo, woCompleted] = await Promise.all([
        apiRequest('/workshop-control-tower/overview'),
        apiRequest('/workshop-control-tower/live-feed?limit=20'),
        apiRequest(`/workshop-control-tower/work-orders?${params.toString()}`),
        apiRequest('/work-orders?status=completed&per_page=1'),
      ])

      const rowList = wo?.data || []
      const processSettles = await Promise.all(
        rowList.map(async (row) => {
          try {
            const proc = await apiRequest(`/work-orders/${row.wo_id}/process`)
            const latest = proc?.instances?.[0]
            const stepLogs = latest?.step_logs || []
            const handover = stepLogs.find((s) => Number(s.step_order) === 110 || String(s.step_code || '').toUpperCase() === 'HANDOVER')
            const doneByProcess =
              String(latest?.state || '').toLowerCase() === 'done' ||
              (handover && String(handover.status || '').toLowerCase() === 'done')
            return { woId: row.wo_id, doneByProcess: Boolean(doneByProcess) }
          } catch (_e) {
            return { woId: row.wo_id, doneByProcess: false }
          }
        }),
      )

      const finishedByProcessMap = new Map(processSettles.map((x) => [x.woId, x.doneByProcess]))
      const normalizedRows = rowList
        .map((row) => normalizeRow(row, finishedByProcessMap.get(row.wo_id) === true))
        .filter((row) => !row.is_finished)

      setOverview({
        ...(ov || {}),
        active_wo: normalizedRows.length,
      })
      setCompletedCount(Number(woCompleted?.total || 0))
      setLiveFeed(Array.isArray(lf) ? lf : [])
      setRows(normalizedRows)
      setTotal(wo?.total || 0)
      setLastPage(wo?.last_page || 1)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat Workshop Control.')
      setCompletedCount(0)
    } finally {
      if (!silent) {
        setLoading(false)
        setHasLoaded(true)
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [page, perPage, bay, woType, woStatus, q])

  useEffect(() => {
    const id = setInterval(() => {
      loadData(true).catch(() => {})
    }, 15000)
    return () => clearInterval(id)
  }, [page, perPage, bay, woType, woStatus, q])

  useEffect(() => {
    if (!selectedWoId) return
    Promise.all([
      apiRequest(`/work-orders/${selectedWoId}`),
      apiRequest(`/work-orders/${selectedWoId}/process`).catch(() => null),
      apiRequest(`/work-orders/${selectedWoId}/timeline`).catch(() => []),
      apiRequest(`/work-orders/${selectedWoId}/metrics`).catch(() => null),
    ])
      .then(([d, p, t, m]) => {
        setWoDetail(d)
        setWoProcess(p)
        setWoTimeline(Array.isArray(t) ? t : [])
        setWoMetrics(m)
      })
      .catch(() => {
        setWoDetail(null)
        setWoProcess(null)
        setWoTimeline([])
        setWoMetrics(null)
      })
  }, [selectedWoId])

  const boardOrder = useMemo(() => [
    'approval', 'washing_bay', 'inspection_pkb',
    'checking', 'create_wo', 'waiting_bay', 'repair', 'qc',
    'ready_bay_close', 'handover',
  ], [])
  const statusOptions = useMemo(() => ['registered', 'triage', 'draft', 'pending', 'approved', 'in_progress', 'on_hold', 'completed', 'cancelled'], [])
  const woTypeOptions = useMemo(() => ['preventive', 'corrective', 'breakdown', 'inspection'], [])

  const fmtTime = (v) => {
    if (!v) return '-'
    return new Date(v).toLocaleString('id-ID')
  }

  const slaClass = (row) => {
    const est = Number(row.est_minutes || 0)
    const queue = Number(row.queue_minutes_live || 0)
    if (!est) return 'text-slate-400'
    if (queue > est) return 'text-red-300'
    if (queue >= Math.floor(est * 0.8)) return 'text-yellow-300'
    return 'text-green-300'
  }

  const eventLabel = (key) => {
    if (!key) return '-'
    return eventLabels[key] || key.replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase())
  }

  const statusBadgeClass = (status) => {
    const s = String(status || '').toLowerCase()
    if (s === 'completed') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    if (s === 'on_hold') return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    if (s === 'in_progress') return 'bg-blue-500/15 text-blue-300 border-blue-500/30'
    if (s === 'approved') return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
    if (s === 'pending' || s === 'registered' || s === 'triage') return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
    if (s === 'cancelled') return 'bg-red-500/15 text-red-300 border-red-500/30'
    return 'bg-slate-500/15 text-slate-300 border-slate-500/30'
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

  const handleReload = async () => {
    setHasLoaded(false)
    await loadData()
  }

  const resolveBoardColumn = (row) => {
    const code = String(row?.step_code || '').toUpperCase()
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

    const currentBay = String(row?.current_bay || '')
    if (currentBay === 'washing_bay') return 'washing_bay'
    if (currentBay === 'waiting_bay') return 'waiting_bay'
    if (currentBay === 'service_bay') return 'repair'
    if (currentBay === 'qc_bay') return 'qc'
    if (currentBay === 'ready_bay') return 'ready_bay_close'
    return 'approval'
  }

  const boardBuckets = useMemo(() => {
    const base = Object.fromEntries(boardOrder.map((key) => [key, []]))
    for (const row of rows) {
      const key = resolveBoardColumn(row)
      if (!base[key]) base[key] = []
      base[key].push(row)
    }
    return base
  }, [rows, boardOrder])

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {!hasLoaded ? (
          <>
            <div className="space-y-2">
              <SkeletonBox className="h-6 w-64" />
              <SkeletonBox className="h-4 w-80" />
            </div>
            <SkeletonBox className="h-10 w-32" />
          </>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-bold">Workshop Control</h2>
              <p className="text-sm text-slate-400">Dashboard antrean step dan SLA gap realtime workshop.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowRegModal(true)} className="px-4 py-2 rounded-xl text-sm bg-blue-600 text-white font-medium hover:bg-blue-700">Input Kedatangan</button>
              <button onClick={handleReload} className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/50">Muat Ulang</button>
            </div>
          </>
        )}
      </div>

      <div className="card p-3">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap min-w-max pr-1">
            <input value={q} onChange={(e) => { setPage(1); setQ(e.target.value) }} placeholder="Cari code, SAP, asset code, io_code, nama, step..." className="input px-3 py-2 rounded-lg text-sm w-80 shrink-0" />
            <select value={bay} onChange={(e) => { setPage(1); setBay(e.target.value) }} className="input px-3 py-2 rounded-lg text-sm w-44 shrink-0">
              <option value="all">Semua Bay</option>
              {boardOrder.map((b) => <option key={b} value={b}>{bayLabels[b]}</option>)}
            </select>
            <select value={woType} onChange={(e) => { setPage(1); setWoType(e.target.value) }} className="input px-3 py-2 rounded-lg text-sm w-44 shrink-0">
              <option value="all">Semua Tipe WO</option>
              {woTypeOptions.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select value={woStatus} onChange={(e) => { setPage(1); setWoStatus(e.target.value) }} className="input px-3 py-2 rounded-lg text-sm w-44 shrink-0">
              <option value="all">Semua Status WO</option>
              {statusOptions.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select value={perPage} onChange={(e) => { setPage(1); setPerPage(Number(e.target.value)) }} className="input px-3 py-2 rounded-lg text-sm w-36 shrink-0">
              <option value={10}>10 / halaman</option>
              <option value={25}>25 / halaman</option>
              <option value={50}>50 / halaman</option>
            </select>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="card p-3"><div className="text-xs text-slate-400">Active WO</div><div className="text-xl font-semibold mt-1">{overview?.active_wo || 0}</div></div>
        <div className="card p-3"><div className="text-xs text-slate-400">WO Selesai</div><div className="text-xl font-semibold mt-1">{completedCount}</div></div>
        <div className="card p-3"><div className="text-xs text-slate-400">On Hold</div><div className="text-xl font-semibold mt-1">{overview?.hold_wo || 0}</div></div>
        <div className="card p-3"><div className="text-xs text-slate-400">Late Steps</div><div className="text-xl font-semibold mt-1">{overview?.late_steps || 0}</div></div>
        <div className="card p-3"><div className="text-xs text-slate-400">SLA Gap Today</div><div className="text-xl font-semibold mt-1">{overview?.total_sla_gap_today ?? overview?.total_downtime_today ?? 0}m</div></div>
      </div>

      {!hasLoaded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card p-3 space-y-2"><SkeletonBox className="h-4 w-24" /><SkeletonBox className="h-20 w-full" /></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {boardOrder.map((b) => (
            <div key={b} className="card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-300">{bayLabels[b]}</div>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">{(boardBuckets[b] || []).length}</span>
              </div>
              <div className="space-y-2 min-h-20 max-h-72 overflow-y-auto hide-scrollbar pr-1">
                {(boardBuckets[b] || []).map((row) => (
                  <button type="button" onClick={() => setSelectedWoId(row.wo_id)} key={`${b}-${row.wo_id}`} className="w-full text-left rounded-lg border border-slate-700 p-2 text-[10px] hover:bg-slate-800/40 space-y-1">
                    <div className="text-blue-300 font-semibold text-[10px]">{row.wo_code || '-'}</div>
                    <div className="text-slate-200 line-clamp-1 text-[10px]">{row.asset_code || '-'} | {row.asset_name || '-'}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span className="line-clamp-1">{row.asset_io_code || row.police_no || '-'}</span>
                      <span className={slaClass(row)}>{row.queue_minutes_live || 0}m</span>
                    </div>
                    <div className={`text-[10px] ${row.sap_reference_no ? 'text-cyan-300' : 'text-slate-500'}`}>{row.sap_reference_no ? `SAP: ${row.sap_reference_no}` : (row.step_name || '-')}</div>
                  </button>
                ))}
                {(boardBuckets[b] || []).length === 0 ? <div className="h-16 rounded border-2 border-dashed border-slate-700/60 flex items-center justify-center text-xs text-slate-500">Kosong</div> : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 text-sm font-semibold">Antrian WO Aktif</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/40">
                  <th className="text-left py-3 px-4">WO</th>
                  <th className="text-left py-3 px-4">Step</th>
                  <th className="text-left py-3 px-4">Asset</th>
                  <th className="text-left py-3 px-4">Queue</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.wo_id} className="border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer" onClick={() => setSelectedWoId(row.wo_id)}>
                    <td className="py-3 px-4">
                      <div className="text-blue-300 font-semibold">{row.wo_code}</div>
                      <div className="text-slate-400">{normalizeTitle(row.wo_title)}</div>
                    </td>
                    <td className="py-3 px-4">{row.step_name || '-'}</td>
                    <td className="py-3 px-4 text-xs">{row.asset_code || '-'} · {row.asset_name || '-'}</td>
                    <td className={`py-3 px-4 text-xs ${slaClass(row)}`}>{row.queue_minutes_live || 0}m / {row.est_minutes || 0}m</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] border uppercase ${statusBadgeClass(row.wo_status)}`}>
                        {row.wo_status || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && rows.length === 0 ? <tr><td colSpan="5" className="py-8 text-center text-slate-400">Tidak ada data antrean.</td></tr> : null}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 px-4 py-3 border-t border-slate-700">
            <div>Menampilkan {rows.length === 0 ? 0 : ((page - 1) * perPage) + 1}-{Math.min(page * perPage, total)} dari {total} data</div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Prev</button>
              <span>Hal {page} / {lastPage}</span>
              <button type="button" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page >= lastPage || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="text-sm font-semibold mb-3">Live Feed</div>
          <div className="space-y-2 max-h-[28rem] overflow-y-auto hide-scrollbar">
            {liveFeed.map((item) => (
              <div key={item.id} className="text-xs border-l-2 border-slate-700 pl-3 py-1">
                <div className="font-semibold text-slate-200">{eventLabel(item.event_key)} · {item.wo_code}</div>
                <div className="text-slate-400">{item.actor_name || '-'} · {fmtTime(item.triggered_at)}</div>
              </div>
            ))}
            {liveFeed.length === 0 ? <div className="text-sm text-slate-400">Belum ada event.</div> : null}
          </div>
        </div>
      </div>

      {selectedWoId ? (
        <ModalPortal>
          <div className="w-full h-full overflow-y-auto hide-scrollbar py-6 flex items-start justify-center" onClick={() => setSelectedWoId(null)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-6xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-700 flex items-start justify-between">
                <div>
                  <div className="text-xs text-blue-300 font-semibold">{woDetail?.code || '-'}</div>
                  {woDetail?.sap_reference_no ? <div className="text-xs text-cyan-300 mt-1">SAP: {woDetail.sap_reference_no}</div> : null}
                  <h3 className="text-lg font-bold mt-1">{normalizeTitle(woDetail?.title || 'Detail Work Order')}</h3>
                  <div className="text-xs text-slate-400 mt-1">{woDetail?.asset?.code || '-'} · {woDetail?.asset?.name || '-'}</div>
                </div>
                <button onClick={() => setSelectedWoId(null)} className="text-slate-400">Tutup</button>
              </div>
              <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4 max-h-[80vh] overflow-y-auto hide-scrollbar">
                <div className="lg:col-span-2 space-y-4">
                  <div className="card p-4">
                    <div className="text-sm font-semibold mb-2">Process Snapshot</div>
                    <div className="space-y-2">
                      {(woProcess?.instances?.[0]?.step_logs || []).map((s) => (
                        <div key={s.id} className="rounded-lg border border-slate-700 p-3 text-xs">
                          <div className="flex justify-between"><div className="font-semibold">{s.step_name}</div><span className={`px-2 py-0.5 rounded ${stepStatusBadge(s.status)}`}>{s.status}</span></div>
                          <div className="text-slate-400 mt-1">IN: {fmtTime(s.process_in_at)} | OUT: {fmtTime(s.process_out_at)}</div>
                          <div className="text-slate-400">EST {s.est_minutes || 0}m · ACT {s.actual_minutes || 0}m · GAP {(Number(s.actual_minutes || 0) - Number(s.est_minutes || 0))}m</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="card p-4">
                    <div className="text-sm font-semibold mb-2">Metrics</div>
                    {woMetrics ? (
                      <div className="text-sm space-y-1">
                        <div>Est: {woMetrics.total_est_minutes} menit</div>
                        <div>Actual: {woMetrics.total_actual_minutes} menit</div>
                        <div>SLA Gap: {woMetrics.total_sla_gap_minutes ?? woMetrics.variance_minutes ?? ((Number(woMetrics.total_actual_minutes || 0) - Number(woMetrics.total_est_minutes || 0)))} menit</div>
                        <div>Reported Downtime: {woMetrics.total_downtime_minutes} menit</div>
                        <div>Late Steps: {woMetrics.late_steps}</div>
                      </div>
                    ) : <div className="text-sm text-slate-400">Belum ada metrik.</div>}
                  </div>
                  <div className="card p-4">
                    <div className="text-sm font-semibold mb-2">Timeline</div>
                    <div className="space-y-2 max-h-80 overflow-y-auto hide-scrollbar">
                      {woTimeline.map((item, i) => (
                        <div key={`${item.type}-${i}`} className="text-xs border-l-2 border-slate-700 pl-3 py-1">
                          <div className="font-semibold text-slate-300">{item.title}</div>
                          <div className="text-slate-400">{fmtTime(item.time)}</div>
                        </div>
                      ))}
                      {woTimeline.length === 0 ? <div className="text-sm text-slate-400">Timeline kosong.</div> : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      ) : null}
      {showRegModal && (
        <ModalPortal>
          <div className="w-full h-full overflow-y-auto hide-scrollbar py-6 flex items-start justify-center" onClick={() => setShowRegModal(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-bold">Input Kedatangan</h3>
                <button onClick={() => setShowRegModal(false)} className="text-slate-400 hover:text-white">Tutup</button>
              </div>
              <form onSubmit={handleRegisterArrival} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Aset / Unit <span className="text-red-400">*</span></label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={loadAssets}
                    styles={selectStyles}
                    placeholder="Cari code, name, io_code..."
                    value={regForm.asset}
                    onChange={(val) => setRegForm({ ...regForm, asset: val, title: val ? `Registrasi Kedatangan - ${val.asset.code}` : '' })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Judul / Title <span className="text-red-400">*</span></label>
                  <input
                    required
                    type="text"
                    value={regForm.title}
                    onChange={(e) => setRegForm({ ...regForm, title: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="Contoh: Registrasi Kedatangan - DT001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Keluhan / Temuan Kerusakan <span className="text-red-400">*</span></label>
                  <textarea
                    required
                    rows={4}
                    value={regForm.description}
                    onChange={(e) => setRegForm({ ...regForm, description: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="Jelaskan detail masalah..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-700 mt-4 pt-4">
                  <button type="button" onClick={() => setShowRegModal(false)} className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/50">Batal</button>
                  <button type="submit" disabled={regSubmitting || !regForm.asset || !regForm.title || !regForm.description} className="px-4 py-2 rounded-xl text-sm bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50">
                    {regSubmitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
