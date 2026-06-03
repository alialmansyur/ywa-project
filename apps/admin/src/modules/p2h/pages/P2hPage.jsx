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

function statusBadge(status) {
  const map = {
    submitted: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
    approved: 'bg-green-500/15 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
  }
  const normalized = String(status || '').toLowerCase()
  const cls = map[normalized] || 'bg-slate-500/15 text-slate-300 border-slate-500/20'
  return <span className={`px-2 py-0.5 rounded-full text-xs border ${cls}`}>{normalized ? normalized.toUpperCase() : 'UNKNOWN'}</span>
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function countFindings(items = []) {
  return items.filter((item) => String(item?.condition || '').toLowerCase() === 'not_ok').length
}

export function P2hPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)

  const [status, setStatus] = useState('ALL')
  const [query, setQuery] = useState('')
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])

  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  const [showCompliance, setShowCompliance] = useState(false)
  const [compliance, setCompliance] = useState(null)
  const [complianceLoading, setComplianceLoading] = useState(false)

  const fetchRows = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('per_page', String(perPage))
      if (query.trim()) params.set('search', query.trim())
      if (status !== 'ALL') params.set('status', status)
      if (dateFilter) params.set('date', dateFilter)

      const response = await apiRequest(`/p2h?${params.toString()}`)
      setRows(response?.data || [])
      setTotal(response?.total || 0)
      setLastPage(response?.last_page || 1)
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal memuat data P2H.' })
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  const fetchCompliance = async () => {
    setComplianceLoading(true)
    try {
      const from = dateFilter || new Date().toISOString().split('T')[0]
      const response = await apiRequest(`/p2h/compliance?from=${encodeURIComponent(from)}&to=${encodeURIComponent(from)}`)
      setCompliance(response)
    } catch (error) {
      setCompliance(null)
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal memuat compliance P2H.' })
    } finally {
      setComplianceLoading(false)
    }
  }

  useEffect(() => {
    fetchRows()
  }, [page, perPage, status, query, dateFilter])

  useEffect(() => {
    fetchCompliance().catch(() => {})
  }, [dateFilter])

  const handleReload = async () => {
    setHasLoaded(false)
    await Promise.all([fetchRows(), fetchCompliance()])
  }

  const openDetail = async (row) => {
    setSelected(row)
    setDetailLoading(true)
    setReviewNotes('')
    try {
      const detail = await apiRequest(`/p2h/${row.id}`)
      setSelected(detail)
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal memuat detail P2H.' })
      setSelected(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleReview = async (statusValue) => {
    if (!selected?.id || reviewLoading) return
    if (statusValue === 'rejected' && !reviewNotes.trim()) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Catatan review wajib diisi saat menolak P2H.' })
      return
    }

    setReviewLoading(true)
    try {
      await apiRequest(`/p2h/${selected.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusValue,
          review_notes: reviewNotes.trim() || null,
        }),
      })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: `P2H berhasil ${statusValue}.` })
      setSelected(null)
      await Promise.all([fetchRows(), fetchCompliance()])
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal mereview P2H.' })
    } finally {
      setReviewLoading(false)
    }
  }

  const selectedItems = selected?.items || []
  const selectedFindings = selectedItems.filter((item) => String(item?.condition || '').toLowerCase() === 'not_ok')
  const complianceRate = Number(compliance?.compliance_rate || 0)
  const complianceWidth = `${Math.max(0, Math.min(100, complianceRate))}%`

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">P2H - Pre-Use Inspection</h2>
          <p className="text-sm text-slate-500">Pemeriksaan harian sebelum pengoperasian unit</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCompliance(true)}
          disabled={complianceLoading}
          className="btn-primary px-4 py-2 rounded-xl text-sm text-white disabled:opacity-60"
        >
          {complianceLoading ? 'Memuat...' : 'Laporan Compliance'}
        </button>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold text-white">Compliance Hari Ini</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {complianceLoading
                ? 'Memuat ringkasan compliance...'
                : `${Number(compliance?.approved || 0)} approved, ${Number(compliance?.pending || 0)} pending, ${Number(compliance?.rejected || 0)} rejected`}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">{complianceLoading ? '--' : `${complianceRate}%`}</div>
            <div className="text-xs text-slate-500">compliance rate</div>
          </div>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: complianceLoading ? '0%' : complianceWidth }} />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>Total submission: {complianceLoading ? '--' : Number(compliance?.total || 0)}</span>
          <span className="text-yellow-400">Pending review: {complianceLoading ? '--' : Number(compliance?.pending || 0)}</span>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setPage(1)
            setDateFilter(e.target.value)
          }}
          className="input px-3 py-2 rounded-xl text-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1)
            setStatus(e.target.value)
          }}
          className="input px-3 py-2 rounded-xl text-sm min-w-36"
        >
          <option value="ALL">Semua Status</option>
          <option value="submitted">SUBMITTED</option>
          <option value="approved">APPROVED</option>
          <option value="rejected">REJECTED</option>
        </select>
        <select
          value={perPage}
          onChange={(e) => {
            setPage(1)
            setPerPage(Number(e.target.value))
          }}
          className="input px-3 py-2 rounded-xl text-sm min-w-36"
        >
          <option value={15}>15 / halaman</option>
          <option value={50}>50 / halaman</option>
          <option value={100}>100 / halaman</option>
        </select>
        <div className="relative flex-1 min-w-48">
          <input
            value={query}
            onChange={(e) => {
              setPage(1)
              setQuery(e.target.value)
            }}
            type="text"
            placeholder="Cari unit, operator..."
            className="input w-full pl-3 pr-4 py-2 rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">No. P2H</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Unit</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Operator</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Waktu</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Temuan</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {!hasLoaded ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`p2h-skeleton-${index}`}>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-28" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-36" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-28" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-24" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-20" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-20" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">Tidak ada data P2H.</td>
                </tr>
              ) : (
                rows.map((row) => {
                  const findingsCount = Array.isArray(row.items) ? countFindings(row.items) : null
                  return (
                    <tr key={row.id} className="cursor-pointer hover:bg-slate-700/20" onClick={() => openDetail(row)}>
                      <td className="py-3 px-4 font-mono text-blue-400 text-xs">{row.code || `P2H-${row.id}`}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200 text-xs">{row.asset?.code || '-'}</div>
                        <div className="text-xs text-slate-500">{row.asset?.name || '-'}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs">{row.operator?.name || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-slate-300">{formatDateTime(row.submitted_at || row.created_at)}</div>
                        <div className="text-xs text-slate-500">{row.submission_date || '-'}</div>
                      </td>
                      <td className="py-3 px-4">
                        {findingsCount === null ? (
                          <span className="text-xs text-slate-500">Detail</span>
                        ) : findingsCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/15 text-red-400 border border-red-500/20">{findingsCount} temuan</span>
                        ) : (
                          <span className="text-xs text-green-400">Tidak ada</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{statusBadge(row.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              openDetail(row)
                            }}
                            className="px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                          >
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <div>Menampilkan {rows.length === 0 ? 0 : ((page - 1) * perPage) + 1}-{Math.min(page * perPage, total)} dari {total} data</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1 || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Prev</button>
          <span>Hal {page} / {lastPage}</span>
          <button type="button" onClick={() => setPage((value) => Math.min(lastPage, value + 1))} disabled={page >= lastPage || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Next</button>
        </div>
      </div>

      {selected ? (
        <ModalPortal>
          <div onClick={() => !reviewLoading && setSelected(null)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-slate-700">
                <div>
                  <div className="text-xs text-blue-400 font-mono">{selected.code || `P2H-${selected.id}`}</div>
                  <div className="font-bold text-white">{selected.asset?.code || '-'} - {selected.asset?.name || '-'}</div>
                  <div className="text-xs text-slate-500">{selected.operator?.name || '-'} - {formatDateTime(selected.submitted_at || selected.created_at)}</div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">X</button>
              </div>

              {detailLoading ? (
                <div className="p-5 space-y-3">
                  <SkeletonBox className="h-16 w-full" />
                  <SkeletonBox className="h-24 w-full" />
                  <SkeletonBox className="h-24 w-full" />
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between bg-slate-900/50 rounded-xl p-3 border border-slate-700/60">
                    <div>
                      <div className="text-xs text-slate-500">Status</div>
                      <div className="mt-1">{statusBadge(selected.status)}</div>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <div>Submission Date: {selected.submission_date || '-'}</div>
                      <div>Template: {selected.template?.name || '-'}</div>
                      <div>Reviewed At: {formatDateTime(selected.reviewed_at)}</div>
                    </div>
                  </div>

                  {selected.review_notes ? (
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/60">
                      <div className="text-xs text-slate-500 mb-1">Catatan Review</div>
                      <div className="text-sm text-slate-200 whitespace-pre-wrap">{selected.review_notes}</div>
                    </div>
                  ) : null}

                  <div className="bg-slate-900/50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-2">Temuan Not OK</div>
                    {selectedFindings.length === 0 ? (
                      <div className="text-sm text-green-400">Tidak ada temuan not_ok.</div>
                    ) : (
                      <div className="space-y-2">
                        {selectedFindings.map((item) => (
                          <div key={item.id} className="flex gap-3 text-xs">
                            <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">{item.group || 'General'}</span>
                            <span className="text-slate-300 flex-1">{item.item_name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{item.notes || 'NOT OK'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Checklist</div>
                    <div className="space-y-1.5">
                      {selectedItems.map((item) => {
                        const condition = String(item?.condition || '').toLowerCase()
                        const badgeClass = condition === 'ok'
                          ? 'bg-green-500/15 text-green-400'
                          : condition === 'not_ok'
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-slate-500/15 text-slate-300'

                        return (
                          <div key={item.id} className="flex items-center gap-3 p-2.5 bg-slate-900/50 rounded-lg text-xs">
                            <span className="flex-1 text-slate-300">{item.item_name}</span>
                            <span className="text-slate-500">{item.group || '-'}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${badgeClass}`}>{condition ? condition.toUpperCase() : 'N/A'}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {String(selected.status || '').toLowerCase() === 'submitted' ? (
                    <div className="border-t border-slate-700 pt-4 space-y-3">
                      <div className="text-sm font-semibold text-white">Review P2H</div>
                      <label className="block">
                        <span className="text-xs text-slate-300 mb-1 block">Catatan Review</span>
                        <textarea
                          rows={3}
                          className="input w-full px-3 py-2 rounded-xl text-sm"
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Tambahkan catatan review..."
                        />
                      </label>
                      <div className="text-xs text-slate-500">
                        Catatan wajib diisi jika P2H ditolak.
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleReview('rejected')}
                          disabled={reviewLoading}
                          className="px-4 py-2 rounded-xl text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors disabled:opacity-60"
                        >
                          {reviewLoading ? 'Memproses...' : 'Tolak'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReview('approved')}
                          disabled={reviewLoading}
                          className="btn-primary flex-1 py-2 rounded-xl text-sm text-white disabled:opacity-60"
                        >
                          {reviewLoading ? 'Memproses...' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </ModalPortal>
      ) : null}

      {showCompliance ? (
        <ModalPortal>
          <div onClick={() => setShowCompliance(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl p-5" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold mb-3">Laporan Compliance P2H</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-slate-900/50 border border-slate-700 p-4">
                  <div className="text-xs text-slate-500">Periode</div>
                  <div className="text-sm text-slate-200 mt-1">{compliance?.period?.from || '-'} s/d {compliance?.period?.to || '-'}</div>
                </div>
                <div className="rounded-xl bg-slate-900/50 border border-slate-700 p-4">
                  <div className="text-xs text-slate-500">Total</div>
                  <div className="text-2xl font-bold text-white mt-1">{Number(compliance?.total || 0)}</div>
                </div>
                <div className="rounded-xl bg-slate-900/50 border border-slate-700 p-4">
                  <div className="text-xs text-slate-500">Approved</div>
                  <div className="text-2xl font-bold text-green-400 mt-1">{Number(compliance?.approved || 0)}</div>
                </div>
                <div className="rounded-xl bg-slate-900/50 border border-slate-700 p-4">
                  <div className="text-xs text-slate-500">Rejected</div>
                  <div className="text-2xl font-bold text-red-400 mt-1">{Number(compliance?.rejected || 0)}</div>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-slate-900/50 border border-slate-700 p-4">
                <div className="text-xs text-slate-500">Pending</div>
                <div className="text-sm text-slate-200 mt-1">{Number(compliance?.pending || 0)} submission masih menunggu review.</div>
              </div>
            </div>
          </div>
        </ModalPortal>
      ) : null}
    </div>
  )
}
