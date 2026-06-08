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

function normalizeReferenceTypeLabel(value) {
  const raw = String(value || '')
  return raw.includes('\\') ? raw.split('\\').pop() : raw
}

export function ApprovalInboxPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [actionModal, setActionModal] = useState(null)
  const [actionNotes, setActionNotes] = useState('')
  
  const [activeTab, setActiveTab] = useState('ALL')

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)

  const [search, setSearch] = useState('')

  const fetchInbox = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('per_page', String(perPage))
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      if (activeTab !== 'ALL') params.set('type', activeTab)
      if (search) params.set('search', search)

      const response = await apiRequest(`/approvals/inbox?${params.toString()}`)
      setRequests(Array.isArray(response?.data) ? response.data : [])
      setTotal(response.total || 0)
      setLastPage(response.last_page || 1)
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal memuat inbox approval.' })
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  useEffect(() => {
    fetchInbox()
  }, [page, perPage, dateFrom, dateTo, activeTab, search])

  const handleActionClick = (req, actionType) => {
    setSelectedRequest(req)
    setActionModal(actionType)
    setActionNotes('')
  }

  const submitAction = async () => {
    if (!actionNotes.trim()) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Catatan (feedback) wajib diisi untuk setiap keputusan (Approve/Reject).' })
      return
    }

    setActionLoading(true)
    try {
      await apiRequest(`/approvals/requests/${selectedRequest.id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: actionModal === 'approve' ? 'approved' : 'rejected',
          notes: actionNotes,
        }),
      })

      await swal.fire({ icon: 'success', title: 'Berhasil', text: `Approval berhasil di-${actionModal}.` })
      setActionModal(null)
      setSelectedRequest(null)
      await fetchInbox()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal memproses approval.' })
    } finally {
      setActionLoading(false)
    }
  }
  
  const defaultTabs = [
    { label: 'Work Order', value: 'App\\Models\\WorkOrder' },
    { label: 'Breakdown Report', value: 'App\\Models\\BreakdownReport' },
    { label: 'P2H', value: 'App\\Models\\P2hSubmission' },
  ]

  const filteredRequests = requests // No longer client side filtering

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Inbox Approval</h2>
          <p className="text-sm text-slate-500">Daftar permintaan yang menunggu persetujuan Anda.</p>
        </div>
        <button type="button" onClick={fetchInbox} disabled={loading} className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/50 disabled:opacity-60 shrink-0">
          Muat Ulang
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scroll border-b border-slate-700/50 mb-2">
        <button
          onClick={() => { setPage(1); setActiveTab('ALL') }}
          className={`px-4 py-2 text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'ALL' ? 'border-blue-500 text-blue-400 font-medium' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
        >
          Semua Dokumen
        </button>
        {defaultTabs.map((tab) => {
          return (
            <button
              key={tab.value}
              onClick={() => { setPage(1); setActiveTab(tab.value) }}
              className={`px-4 py-2 text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.value ? 'border-blue-500 text-blue-400 font-medium' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 items-center">
            <input 
            type="text"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value) }}
            className="input px-3 py-2 rounded-xl text-sm w-64"
            placeholder="Cari No. Dokumen / Route Key"
            />
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
        </div>
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
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipe / Referensi</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pemohon</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tahap</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {!hasLoaded ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4"><SkeletonBox className="h-9 w-40" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-24" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-24" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-24" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-8 w-40 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-slate-400">Tidak ada permintaan approval saat ini.</td></tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-700/20">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-blue-300">{req.reference_type_label || normalizeReferenceTypeLabel(req.reference_type)}</div>
                      <div className="text-xs text-slate-400">ID: {req.reference_id}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{req.requester?.name || '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{req.current_step?.name || req.current_step_name || '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{req.created_at ? new Date(req.created_at).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => handleActionClick(req, 'approve')} className="px-3 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs font-medium">Approve</button>
                        <button type="button" onClick={() => handleActionClick(req, 'reject')} className="px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-medium">Reject</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {actionModal && selectedRequest && (
        <ModalPortal>
          <div onClick={() => !actionLoading && setActionModal(null)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-white mb-4 capitalize">{actionModal} Request</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500">Referensi</div>
                  <div className="text-sm text-slate-200">{selectedRequest.reference_type_label || normalizeReferenceTypeLabel(selectedRequest.reference_type)} #{selectedRequest.reference_id}</div>
                </div>
                <label className="block">
                  <span className="text-xs text-slate-300 mb-1 block">Catatan/Feedback (Wajib)</span>
                  <textarea
                    rows={3}
                    className="input w-full px-3 py-2 rounded-xl text-sm"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Tambahkan catatan atau alasan keputusan..."
                  />
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setActionModal(null)} disabled={actionLoading} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm">Batal</button>
                <button type="button" onClick={submitAction} disabled={actionLoading} className={`px-4 py-2 rounded-xl text-white text-sm ${actionModal === 'approve' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                  {actionLoading ? 'Memproses...' : 'Konfirmasi'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
