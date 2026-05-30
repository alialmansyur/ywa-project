import { useEffect, useMemo, useState } from 'react'
import { apiRequest, ApiError } from '../../../services/api'
import { getAuthSession } from '../../../services/auth'
import { ModalPortal } from '../../shared/components/ModalPortal'

const STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_COLORS = {
  draft: 'bg-slate-500/20 text-slate-300',
  pending: 'bg-yellow-500/20 text-yellow-300',
  approved: 'bg-blue-500/20 text-blue-300',
  in_progress: 'bg-indigo-500/20 text-indigo-300',
  on_hold: 'bg-orange-500/20 text-orange-300',
  completed: 'bg-green-500/20 text-green-300',
  cancelled: 'bg-red-500/20 text-red-300',
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID')
}

export function WorkOrdersPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [workOrders, setWorkOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [processData, setProcessData] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedStepOrder, setSelectedStepOrder] = useState('')
  const [note, setNote] = useState('')
  const [downtime, setDowntime] = useState('')

  const user = getAuthSession()?.user || null
  const roles = user?.roles || []
  const canApprove = roles.includes('supervisor') || roles.includes('admin') || roles.includes('super_admin')

  const loadList = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiRequest('/work-orders?per_page=50')
      setWorkOrders(res.data || [])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat work orders.')
    } finally {
      setLoading(false)
    }
  }

  const loadDetail = async (woId) => {
    const [wo, proc, line, metric] = await Promise.all([
      apiRequest(`/work-orders/${woId}`),
      apiRequest(`/work-orders/${woId}/process`).catch(() => null),
      apiRequest(`/work-orders/${woId}/timeline`).catch(() => []),
      apiRequest(`/work-orders/${woId}/metrics`).catch(() => null),
    ])

    setDetail(wo)
    setProcessData(proc)
    setTimeline(Array.isArray(line) ? line : [])
    setMetrics(metric)

    const firstReady = proc?.instances?.[0]?.step_logs?.find((s) => ['ready', 'in_progress', 'hold', 'waiting_approval'].includes(s.status))
    setSelectedStepOrder(firstReady?.step_order ? String(firstReady.step_order) : '')
  }

  useEffect(() => {
    loadList()
  }, [])

  useEffect(() => {
    if (!selected?.id) return
    loadDetail(selected.id).catch((err) => setError(err instanceof ApiError ? err.message : 'Gagal memuat detail WO.'))
  }, [selected?.id])

  const statusCount = useMemo(() => {
    return workOrders.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1
      return acc
    }, {})
  }, [workOrders])

  const currentInstance = processData?.instances?.[0]
  const stepLogs = currentInstance?.step_logs || []

  const callAction = async (path, payload = null) => {
    if (!selected?.id) return
    setActionLoading(true)
    setError('')
    try {
      await apiRequest(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload ? JSON.stringify(payload) : undefined,
      })
      await loadList()
      await loadDetail(selected.id)
      setNote('')
      setDowntime('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Aksi gagal diproses.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Work Orders</h2>
          <p className="text-sm text-slate-400">API-centric flow untuk admin dan mobile operator.</p>
        </div>
        <button className="btn-secondary px-3 py-2 rounded-lg text-sm" onClick={loadList} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
      </div>

      {error ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.keys(STATUS_LABELS).map((status) => (
          <div key={status} className="card p-3">
            <div className="text-xs text-slate-400">{STATUS_LABELS[status]}</div>
            <div className="text-xl font-semibold mt-1">{statusCount[status] || 0}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/40">
                <th className="text-left py-3 px-4">Code</th>
                <th className="text-left py-3 px-4">Unit</th>
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Priority</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((wo) => (
                <tr key={wo.id} onClick={() => setSelected(wo)} className="border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer">
                  <td className="py-3 px-4 font-mono text-xs text-blue-300">{wo.code}</td>
                  <td className="py-3 px-4">{wo.asset?.code || '-'}</td>
                  <td className="py-3 px-4">{wo.title}</td>
                  <td className="py-3 px-4 uppercase text-xs">{wo.type}</td>
                  <td className="py-3 px-4 uppercase text-xs">{wo.priority}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[wo.status] || STATUS_COLORS.draft}`}>{STATUS_LABELS[wo.status] || wo.status}</span></td>
                </tr>
              ))}
              {!loading && workOrders.length === 0 ? <tr><td colSpan="6" className="py-8 px-4 text-center text-slate-400">Tidak ada work order.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>

      {selected && detail && (
        <ModalPortal>
          <div onClick={() => setSelected(null)}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-blue-300 font-mono">{detail.code}</div>
                    <h3 className="text-lg font-bold mt-1">{detail.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{detail.asset?.code} · {detail.asset?.name}</p>
                  </div>
                  <button className="text-slate-400" onClick={() => setSelected(null)}>Tutup</button>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className="card p-4">
                    <div className="text-sm font-semibold mb-3">Process Tracker</div>
                    {!currentInstance ? <div className="text-sm text-slate-400">Belum ada process instance.</div> : (
                      <div className="space-y-2">
                        {stepLogs.map((step) => (
                          <div key={step.id} className="rounded-lg border border-slate-700 p-2 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold">{step.step_order}. {step.step_name}</div>
                              <span className="px-2 py-0.5 rounded bg-slate-800">{step.status}</span>
                            </div>
                            <div className="text-slate-400 mt-1">IN: {formatDate(step.process_in_at)} | OUT: {formatDate(step.process_out_at)}</div>
                            <div className="text-slate-400">EST: {step.est_minutes || 0}m | ACT: {step.actual_minutes || 0}m | DT: {step.downtime_minutes || 0}m</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="card p-4">
                    <div className="text-sm font-semibold mb-2">Actions</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <select value={selectedStepOrder} onChange={(e) => setSelectedStepOrder(e.target.value)} className="input px-3 py-2 rounded-lg text-sm md:col-span-2">
                        <option value="">Pilih step</option>
                        {stepLogs.map((step) => <option key={step.id} value={step.step_order}>{step.step_order} - {step.step_name}</option>)}
                      </select>
                      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan (opsional)" className="input px-3 py-2 rounded-lg text-sm md:col-span-2" />
                      <input value={downtime} onChange={(e) => setDowntime(e.target.value)} placeholder="Downtime menit (untuk Step Out)" className="input px-3 py-2 rounded-lg text-sm md:col-span-2" />

                      <button disabled={actionLoading} className="btn-primary px-3 py-2 rounded-lg text-sm" onClick={() => callAction(`/work-orders/${selected.id}/process/start`)}>Start Process</button>
                      <button disabled={actionLoading || !selectedStepOrder} className="btn-secondary px-3 py-2 rounded-lg text-sm" onClick={() => callAction(`/work-orders/${selected.id}/process/steps/${selectedStepOrder}/in`, { notes: note || null })}>Step In</button>
                      <button disabled={actionLoading || !selectedStepOrder} className="btn-secondary px-3 py-2 rounded-lg text-sm" onClick={() => callAction(`/work-orders/${selected.id}/process/steps/${selectedStepOrder}/out`, { notes: note || null, downtime_minutes: downtime ? Number(downtime) : null })}>Step Out</button>
                      <button disabled={actionLoading || !selectedStepOrder} className="btn-secondary px-3 py-2 rounded-lg text-sm" onClick={() => callAction(`/work-orders/${selected.id}/process/steps/${selectedStepOrder}/hold`, { reason: note || 'Hold sementara' })}>Hold</button>
                      <button disabled={actionLoading || !selectedStepOrder} className="btn-secondary px-3 py-2 rounded-lg text-sm" onClick={() => callAction(`/work-orders/${selected.id}/process/steps/${selectedStepOrder}/resume`, { notes: note || null })}>Resume</button>
                      <button disabled={actionLoading} className="btn-primary px-3 py-2 rounded-lg text-sm" onClick={() => callAction(`/work-orders/${selected.id}/process/complete`, { notes: note || null })}>Complete Process</button>

                      {canApprove && (
                        <>
                          <button disabled={actionLoading || !selectedStepOrder} className="btn-secondary px-3 py-2 rounded-lg text-sm" onClick={() => callAction(`/work-orders/${selected.id}/process/steps/${selectedStepOrder}/approve`, { notes: note || null })}>Approve Step</button>
                          <button disabled={actionLoading || !selectedStepOrder} className="btn-secondary px-3 py-2 rounded-lg text-sm" onClick={() => callAction(`/work-orders/${selected.id}/process/steps/${selectedStepOrder}/reject`, { reason: note || 'Perlu perbaikan ulang' })}>Reject Step</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="card p-4">
                    <div className="text-sm font-semibold mb-3">Metrics</div>
                    {metrics ? (
                      <div className="space-y-1 text-sm">
                        <div>Total Estimasi: {metrics.total_est_minutes} menit</div>
                        <div>Total Aktual: {metrics.total_actual_minutes} menit</div>
                        <div>Total Downtime: {metrics.total_downtime_minutes} menit</div>
                        <div>Late Steps: {metrics.late_steps}</div>
                        <div>Variance: {metrics.variance_minutes} menit</div>
                      </div>
                    ) : <div className="text-sm text-slate-400">Belum ada metrik.</div>}
                  </div>

                  <div className="card p-4">
                    <div className="text-sm font-semibold mb-3">Timeline</div>
                    <div className="space-y-2 max-h-80 overflow-auto">
                      {timeline.map((item, idx) => (
                        <div key={`${item.type}-${idx}`} className="text-xs border-l-2 border-slate-700 pl-3 py-1">
                          <div className="text-slate-300 font-semibold">{item.title}</div>
                          <div className="text-slate-400">{formatDate(item.time)}</div>
                        </div>
                      ))}
                      {timeline.length === 0 ? <div className="text-sm text-slate-400">Belum ada timeline.</div> : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
