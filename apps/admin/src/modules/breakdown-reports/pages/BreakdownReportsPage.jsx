import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { apiRequest, ApiError } from '../../../services/api'
import { ModalPortal } from '../../shared/components/ModalPortal'

const swal = Swal.mixin({
  width: 420,
  customClass: {
    popup: 'rounded-2xl',
    confirmButton: 'rounded-lg',
    cancelButton: 'rounded-lg',
  },
  buttonsStyling: true,
})

function SkeletonBox({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-700/60 ${className}`} />
}

function StatusBadge({ status }) {
  const map = {
    submitted: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    in_review: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    processed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    done: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  }
  const cls = map[status?.toLowerCase()] || 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  return <span className={`px-2 py-0.5 rounded-full text-xs border ${cls}`}>{status?.toUpperCase() || 'UNKNOWN'}</span>
}

export function BreakdownReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)

  const [selectedReport, setSelectedReport] = useState(null)
  const [processModal, setProcessModal] = useState(false)
  const [actionType, setActionType] = useState('process')
  const [processNotes, setProcessNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('per_page', String(perPage))
      if (query) params.set('search', query)
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)

      const response = await apiRequest(`/breakdown-reports?${params.toString()}`)
      setReports(response.data || [])
      setTotal(response.total || 0)
      setLastPage(response.last_page || 1)
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal memuat laporan breakdown.' })
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [page, perPage, query, statusFilter, dateFrom, dateTo])

  const handleReload = async () => {
    setHasLoaded(false)
    await fetchReports()
  }

  const openProcessModal = (r) => {
    setSelectedReport(r)
    setActionType('process')
    setProcessNotes('')
    setProcessModal(true)
  }

  const handleProcess = async () => {
    if (!selectedReport) return
    if (actionType === 'done' && !processNotes.trim()) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Feedback wajib diisi untuk menutup laporan.' })
      return
    }

    setActionLoading(true)
    try {
      if (actionType === 'done') {
        await apiRequest(`/breakdown-reports/${selectedReport.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'done', description: `${selectedReport.description || ''}${processNotes?.trim() ? `\n\n[FEEDBACK] ${processNotes.trim()}` : ''}`.slice(0, 5000) }),
        })
        await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Feedback disimpan dan status laporan diubah ke DONE.' })
      } else {
        await apiRequest(`/breakdown-reports/${selectedReport.id}/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: processNotes }),
        })
        await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Laporan breakdown diproses menjadi Work Order.' })
      }
      
      setProcessModal(false)
      setSelectedReport(null)
      await fetchReports()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal memproses laporan.' })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Laporan Breakdown</h2>
          <p className="text-sm text-slate-500">Daftar laporan kerusakan unit (breakdown) dari lapangan.</p>
        </div>
        <button type="button" onClick={handleReload} disabled={loading} className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/50 disabled:opacity-60">
          Muat Ulang
        </button>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <input 
          value={query} 
          onChange={(e) => { setPage(1); setQuery(e.target.value) }} 
          placeholder="Cari aset atau lokasi..." 
          className="input flex-1 min-w-[200px] px-3 py-2 rounded-xl text-sm" 
        />
        <select 
          value={statusFilter} 
          onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }} 
          className="input px-3 py-2 rounded-xl text-sm min-w-[140px]"
        >
          <option value="ALL">Semua Status</option>
          <option value="submitted">Submitted</option>
          <option value="in_review">In Review</option>
          <option value="processed">Processed</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input 
          type="date"
          value={dateFrom}
          onChange={(e) => { setPage(1); setDateFrom(e.target.value) }}
          className="input px-3 py-2 rounded-xl text-sm"
          title="Tanggal Dari"
        />
        <span className="text-slate-500">-</span>
        <input 
          type="date"
          value={dateTo}
          onChange={(e) => { setPage(1); setDateTo(e.target.value) }}
          className="input px-3 py-2 rounded-xl text-sm"
          title="Tanggal Sampai"
        />
        <select 
          value={perPage} 
          onChange={(e) => { setPage(1); setPerPage(Number(e.target.value)) }} 
          className="input px-3 py-2 rounded-xl text-sm min-w-[120px]"
        >
          <option value={15}>15 / halaman</option>
          <option value={50}>50 / halaman</option>
          <option value={100}>100 / halaman</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aset</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Laporan</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dilaporkan Oleh</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Waktu Breakdown</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {!hasLoaded ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-32" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-48" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-24" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-24" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-20" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-400">Tidak ada laporan breakdown.</td></tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-700/20">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-blue-300">{r.asset?.code || '-'}</div>
                      <div className="text-xs text-slate-400">{r.asset?.name || '-'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs">
                      <div className="truncate font-medium">{r.location || '-'}</div>
                      <div className="truncate text-xs text-slate-400" title={r.description}>{r.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{r.reported_by?.name || '-'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{r.breakdown_time ? new Date(r.breakdown_time).toLocaleString() : '-'}</td>
                    <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 justify-end">
                        {(r.status === 'submitted' || r.status === 'in_review' || r.status === 'processed') && (
                          <button type="button" onClick={() => openProcessModal(r)} className="px-3 py-1.5 rounded-lg border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 text-xs font-medium">Tindak Lanjut</button>
                        )}
                        {r.status === 'processed' && r.work_order_id && (
                          <span className="text-xs text-slate-400 px-2 py-1">WO #{r.work_order_id}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <div>Menampilkan {reports.length === 0 ? 0 : ((page - 1) * perPage) + 1}-{Math.min(page * perPage, total)} dari {total} data</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Prev</button>
          <span>Hal {page} / {lastPage}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page >= lastPage || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Next</button>
        </div>
      </div>

      {processModal && selectedReport && (
        <ModalPortal>
          <div onClick={() => !actionLoading && setProcessModal(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-white mb-4">Tindak Lanjut Breakdown</h3>
              <div className="space-y-4">
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-500">Aset: <span className="text-slate-300">{selectedReport.asset?.code} - {selectedReport.asset?.name}</span></div>
                  <div className="text-xs text-slate-500 mt-1">Laporan: <span className="text-slate-300">{selectedReport.description}</span></div>
                </div>
                <label className="block">
                  <span className="text-xs text-slate-300 mb-1 block">Tindakan</span>
                  <select className="input w-full px-3 py-2 rounded-xl text-sm" value={actionType} onChange={(e) => setActionType(e.target.value)}>
                    <option value="process">Buat Work Order (Proses)</option>
                    <option value="done">Ubah Status ke DONE</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-slate-300 mb-1 block">Feedback {actionType === 'done' ? '(Wajib)' : '(Opsional)'}</span>
                  <textarea
                    rows={3}
                    className="input w-full px-3 py-2 rounded-xl text-sm"
                    value={processNotes}
                    onChange={(e) => setProcessNotes(e.target.value)}
                    placeholder="Tambahkan feedback tindak lanjut..."
                  />
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setProcessModal(false)} disabled={actionLoading} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm">Batal</button>
                <button type="button" onClick={handleProcess} disabled={actionLoading} className={`px-4 py-2 rounded-xl text-white text-sm ${actionType === 'process' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                  {actionLoading ? 'Menyimpan...' : 'Konfirmasi'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
