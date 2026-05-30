import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { apiRequest, ApiError } from '../../../services/api'

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
    pending: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    approved: 'bg-green-500/15 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
    returned: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  }
  const cls = map[status?.toLowerCase()] || 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  return <span className={`px-2 py-0.5 rounded-full text-xs border ${cls}`}>{status || 'Unknown'}</span>
}

export function ApprovalHistoryPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('per_page', String(perPage))
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)

      const response = await apiRequest(`/settings/approvals/requests?${params.toString()}`)
      setRequests(response.data || [])
      setTotal(response.total || 0)
      setLastPage(response.last_page || 1)
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal memuat riwayat approval.' })
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [page, perPage, statusFilter, dateFrom, dateTo])

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Riwayat Approval</h2>
          <p className="text-sm text-slate-500">Memantau seluruh siklus request approval di sistem.</p>
        </div>
        <button type="button" onClick={fetchHistory} disabled={loading} className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/50 disabled:opacity-60">
          Muat Ulang
        </button>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <select 
          value={statusFilter} 
          onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }} 
          className="input px-3 py-2 rounded-xl text-sm min-w-[140px]"
        >
          <option value="ALL">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="returned">Returned</option>
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
          className="input px-3 py-2 rounded-xl text-sm min-w-[120px] ml-auto"
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
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Referensi</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pemohon</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tahap Aktif</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {!hasLoaded ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-32" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-24" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-20" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-24" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-24" /></td>
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-slate-400">Tidak ada riwayat approval.</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-700/20">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-blue-300">{req.reference_type}</div>
                      <div className="text-xs text-slate-400">ID: {req.reference_id}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{req.requester?.name || '-'}</td>
                    <td className="py-3 px-4"><StatusBadge status={req.status} /></td>
                    <td className="py-3 px-4 text-slate-300">{req.current_step?.name || '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{req.created_at ? new Date(req.created_at).toLocaleDateString() : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <div>Menampilkan {requests.length === 0 ? 0 : ((page - 1) * perPage) + 1}-{Math.min(page * perPage, total)} dari {total} data</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Prev</button>
          <span>Hal {page} / {lastPage}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page >= lastPage || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  )
}
