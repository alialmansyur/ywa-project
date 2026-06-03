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

function EditIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

function StatusBadge({ status }) {
  const map = {
    submitted: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    in_review: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    resolved: 'bg-green-500/15 text-green-400 border-green-500/30',
  }
  const cls = map[status?.toLowerCase()] || 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  return <span className={`px-2 py-0.5 rounded-full text-xs border ${cls}`}>{status?.toUpperCase() || 'UNKNOWN'}</span>
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function FindingsPage() {
  const [findings, setFindings] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)

  const [selectedFinding, setSelectedFinding] = useState(null)
  const [statusModal, setStatusModal] = useState(false)
  const [updateStatus, setUpdateStatus] = useState('submitted')
  const [feedbackNotes, setFeedbackNotes] = useState('')

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchFindings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('per_page', String(perPage))
      if (query) params.set('search', query)
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)

      const response = await apiRequest(`/findings?${params.toString()}`)
      setFindings(response.data || [])
      setTotal(response.total || 0)
      setLastPage(response.last_page || 1)
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal memuat daftar temuan.' })
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  useEffect(() => {
    fetchFindings()
  }, [page, perPage, query, statusFilter, dateFrom, dateTo])

  const handleReload = async () => {
    setHasLoaded(false)
    await fetchFindings()
  }

  const openStatusUpdate = (f) => {
    setSelectedFinding(f)
    setUpdateStatus(f.status || 'submitted')
    setFeedbackNotes(f.resolution_notes || '')
    setStatusModal(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedFinding) return
    if (updateStatus === 'resolved' && !feedbackNotes.trim()) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Feedback penyelesaian wajib diisi saat status resolved.' })
      return
    }
    try {
      await apiRequest(`/findings/${selectedFinding.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          resolution_notes: feedbackNotes.trim() || null,
        }),
      })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Status temuan diperbarui.' })
      setStatusModal(false)
      setSelectedFinding(null)
      await fetchFindings()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal update status temuan.' })
    }
  }

  const handleDelete = async (f) => {
    const confirm = await swal.fire({
      title: 'Hapus temuan ini?',
      text: 'Tindakan ini tidak dapat dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    })
    if (!confirm.isConfirmed) return

    try {
      await apiRequest(`/findings/${f.id}`, { method: 'DELETE' })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Temuan dihapus.' })
      await fetchFindings()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal menghapus temuan.' })
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Temuan Inspeksi (Findings)</h2>
          <p className="text-sm text-slate-500">Daftar temuan hasil inspeksi dari P2H atau Pengecekan Mekanik.</p>
        </div>
        <button type="button" onClick={handleReload} disabled={loading} className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/50 disabled:opacity-60">
          Muat Ulang
        </button>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <input 
          value={query} 
          onChange={(e) => { setPage(1); setQuery(e.target.value) }} 
          placeholder="Cari aset atau temuan..." 
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
          <option value="resolved">Resolved</option>
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
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Asset / Section</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Temuan</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Section</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dilaporkan Oleh</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {!hasLoaded ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-32" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-48" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-16" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-20" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-24" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : findings.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-400">Tidak ada data temuan.</td></tr>
              ) : (
                findings.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-700/20">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-blue-300">{f.asset?.code || '-'}</div>
                      <div className="text-xs text-slate-400">{f.asset?.name || '-'} {f.asset?.plate_number ? `(${f.asset.plate_number})` : ''}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{f.section || '-'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={f.description}>{f.description}</td>
                    <td className="py-3 px-4 text-slate-300">{f.section || '-'}</td>
                    <td className="py-3 px-4"><StatusBadge status={f.status} /></td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-200">{f.reporter?.name || '-'}</div>
                      <div className="text-xs text-slate-500">{formatDate(f.created_at)}</div>
                      {f.resolution_notes ? (
                        <div className="text-xs text-slate-500 mt-1 line-clamp-2" title={f.resolution_notes}>
                          Feedback: {f.resolution_notes}
                        </div>
                      ) : null}
                      {f.photo_url ? (
                        <a href={f.photo_url} target="_blank" rel="noreferrer" className="text-xs text-blue-300 hover:text-blue-200 underline underline-offset-2 mt-1 inline-block">
                          Lihat Eviden
                        </a>
                      ) : null}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => openStatusUpdate(f)} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-blue-400 border border-slate-600/70 bg-slate-700/30 hover:bg-blue-500/10" title="Update Status">
                          <EditIcon />
                        </button>
                        <button type="button" onClick={() => handleDelete(f)} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-red-400 border border-slate-600/70 bg-slate-700/30 hover:bg-red-500/10" title="Hapus">
                          <TrashIcon />
                        </button>
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
        <div>Menampilkan {findings.length === 0 ? 0 : ((page - 1) * perPage) + 1}-{Math.min(page * perPage, total)} dari {total} data</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Prev</button>
          <span>Hal {page} / {lastPage}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page >= lastPage || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Next</button>
        </div>
      </div>

      {statusModal && selectedFinding && (
        <ModalPortal>
          <div onClick={() => setStatusModal(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 md:p-7" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-white mb-4">Update Status Temuan</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500">Temuan</div>
                  <div className="text-sm text-slate-200 mt-1">{selectedFinding.description}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Section</div>
                  <div className="text-sm text-slate-200 mt-1">{selectedFinding.section || '-'}</div>
                </div>
                {selectedFinding.photo_url ? (
                  <div>
                    <div className="text-xs text-slate-500">Eviden</div>
                    <a href={selectedFinding.photo_url} target="_blank" rel="noreferrer" className="text-sm text-blue-300 hover:text-blue-200 underline underline-offset-2 mt-1 inline-block">
                      Buka foto eviden
                    </a>
                  </div>
                ) : null}
                {selectedFinding.resolution_notes ? (
                  <div>
                    <div className="text-xs text-slate-500">Feedback Saat Ini</div>
                    <div className="text-sm text-slate-200 mt-1 whitespace-pre-wrap">{selectedFinding.resolution_notes}</div>
                  </div>
                ) : null}
                <label className="block">
                  <span className="text-xs text-slate-300 mb-1 block">Status Baru</span>
                  <select className="input w-full px-3 py-2 rounded-xl text-sm" value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
                    <option value="submitted">SUBMITTED</option>
                    <option value="in_review">IN REVIEW</option>
                    <option value="resolved">RESOLVED</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-slate-300 mb-1 block">Feedback</span>
                  <textarea
                    rows={3}
                    className="input w-full px-3 py-2 rounded-xl text-sm"
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="Tambahkan feedback penyelesaian temuan..."
                  />
                </label>
                {updateStatus === 'resolved' ? (
                  <div className="text-xs text-slate-500">Feedback wajib diisi saat mengubah status menjadi resolved.</div>
                ) : null}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setStatusModal(false)} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm">Batal</button>
                <button type="button" onClick={handleUpdateStatus} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm">Update</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
