import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { apiRequest, API_BASE_URL, ApiError } from '../../../services/api'
import { getBearerToken } from '../../../services/auth'

const swal = Swal.mixin({ width: 420, customClass: { popup: 'rounded-2xl' } })

function formatBytes(size = 0) {
  if (!Number.isFinite(size) || size <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = size
  let idx = 0
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024
    idx += 1
  }
  return `${value.toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`
}

export function DatabaseBackupPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 8

  const totalSize = useMemo(() => items.reduce((sum, item) => sum + Number(item.size_bytes || 0), 0), [items])
  const lastPage = useMemo(() => Math.max(1, Math.ceil(items.length / perPage)), [items.length])
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * perPage
    return items.slice(start, start + perPage)
  }, [items, page])

  useEffect(() => {
    if (page > lastPage) setPage(lastPage)
  }, [page, lastPage])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await apiRequest('/settings/database-backups')
      setItems(res.data || [])
      setPage(1)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal memuat data backup database.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const createBackup = async () => {
    setCreating(true)
    try {
      await apiRequest('/settings/database-backups', { method: 'POST' })
      await swal.fire({ icon: 'success', title: 'Sukses', text: 'Backup database berhasil dibuat.' })
      fetchItems()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error.message || 'Gagal membuat backup database.' })
    } finally {
      setCreating(false)
    }
  }

  const downloadBackup = async (name) => {
    try {
      const token = getBearerToken()
      const response = await fetch(`${API_BASE_URL}/settings/database-backups/${encodeURIComponent(name)}/download`, {
        method: 'GET',
        headers: {
          Accept: 'application/octet-stream',
          ...(token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error(`Download gagal (${response.status})`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error.message || 'Gagal mengunduh file backup.' })
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 min-h-[360px] flex items-center justify-center">
        <div className="w-full max-w-xl flex flex-col items-center justify-center text-center gap-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Database Backup</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Buat dan unduh backup database secara aman.
              <br />
              Total file: {items.length} | Total ukuran: {formatBytes(totalSize)}
            </p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600/60 flex items-center justify-center">
            <svg className="w-9 h-9 text-slate-700 dark:text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <ellipse cx="12" cy="5.5" rx="7" ry="3" />
              <path d="M5 5.5v5c0 1.66 3.13 3 7 3s7-1.34 7-3v-5" />
              <path d="M5 10.5v5c0 1.66 3.13 3 7 3s7-1.34 7-3v-5" />
              <path d="M5 15.5v3c0 1.66 3.13 3 7 3s7-1.34 7-3v-3" />
            </svg>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchItems} disabled={loading} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-60">Refresh</button>
            <button onClick={createBackup} disabled={creating} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 inline-flex items-center gap-2">
              {creating ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : null}
              {creating ? 'Memproses...' : 'Buat Backup'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-5 overflow-auto shadow-[0_12px_30px_-18px_rgba(15,23,42,0.7)]">
        <table className="w-full text-sm min-w-[620px]">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-700">
              <th className="py-2 px-2">Nama File</th>
              <th className="py-2 px-2">Ukuran</th>
              <th className="py-2 px-2">Waktu</th>
              <th className="py-2 px-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.name} className="border-b border-slate-700/60">
                <td className="py-2 px-2">{item.name}</td>
                <td className="py-2 px-2">{formatBytes(Number(item.size_bytes || 0))}</td>
                <td className="py-2 px-2">{item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'}</td>
                <td className="py-2 px-2 text-right">
                  <button onClick={() => downloadBackup(item.name)} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500">Download</button>
                </td>
              </tr>
            ))}
            {!loading && paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">Belum ada file backup database.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <div>
          Menampilkan {items.length === 0 ? 0 : ((page - 1) * perPage) + 1}-{Math.min(page * perPage, items.length)} dari {items.length} data
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span>Hal {page} / {lastPage}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage || loading}
            className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
