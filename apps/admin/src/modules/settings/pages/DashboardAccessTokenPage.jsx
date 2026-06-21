import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { apiRequest, ApiError } from '../../../services/api'

const swal = Swal.mixin({ width: 420, customClass: { popup: 'rounded-2xl' } })

function fmtDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('id-ID')
}

export function DashboardAccessTokenPage() {
  const [loading, setLoading] = useState(false)
  const [rotating, setRotating] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [expiresInDays, setExpiresInDays] = useState(30)
  const [current, setCurrent] = useState(null)
  const [history, setHistory] = useState([])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await apiRequest('/settings/dashboard-access-token')
      setCurrent(res?.data?.current || null)
      setHistory(res?.data?.history || [])
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal memuat data token dashboard.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const rotateToken = async () => {
    setRotating(true)
    try {
      const res = await apiRequest('/settings/dashboard-access-token/rotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expires_in_days: Number(expiresInDays) || 30 }),
      })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'PIN dashboard baru berhasil dibuat.' })
      await fetchData()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error?.message || 'Gagal membuat token dashboard.' })
    } finally {
      setRotating(false)
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 min-h-[320px] flex items-center justify-center">
        <div className="w-full max-w-3xl space-y-5">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Token Akses Dashboard</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">PIN 6 digit untuk login dashboard web.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">Token Aktif</p>
            <div className="flex items-center justify-center gap-2">
              <p className="dashboard-access-token-value text-4xl md:text-5xl font-bold tracking-[0.2em]">
                {showToken ? (current?.plain_pin || current?.masked_pin || '-- ----') : '••••••'}
              </p>
              <button
                type="button"
                onClick={() => setShowToken((prev) => !prev)}
                className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 inline-flex items-center justify-center transition-colors"
                title={showToken ? 'Sembunyikan token' : 'Tampilkan token'}
                aria-label={showToken ? 'Sembunyikan token' : 'Tampilkan token'}
              >
                {showToken ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58a2 2 0 102.83 2.83" />
                    <path d="M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7-0.62 1.39-1.58 2.67-2.79 3.75" />
                    <path d="M6.61 6.61C4.62 7.87 3.06 9.75 2 12c1.73 3.89 6 7 10 7 1.61 0 3.16-0.38 4.54-1.07" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              User Admin: {current?.dashboard_user_name || '-'} ({current?.dashboard_user_email || '-'})
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Expired: {fmtDateTime(current?.expires_at)} | Last used: {fmtDateTime(current?.last_used_at)}
            </p>
            {showToken && !current?.plain_pin ? (
              <p className="text-xs text-amber-600 dark:text-amber-300 mt-3">
                PIN aktif lama belum tersimpan terenkripsi. Generate satu token baru agar 6 digit penuh bisa dilihat kembali.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-end justify-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-300">
              Expiry (hari)
              <input
                type="number"
                min={1}
                max={3650}
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                className="mt-1 w-36 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-sm"
              />
            </label>
            <button onClick={fetchData} disabled={loading} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-60 text-white text-sm">
              Refresh
            </button>
            <button onClick={rotateToken} disabled={rotating} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm inline-flex items-center gap-2">
              {rotating ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : null}
              {rotating ? 'Memproses...' : 'Buat Token Baru'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-5 overflow-auto shadow-[0_12px_30px_-18px_rgba(15,23,42,0.7)]">
        <h3 className="text-sm font-semibold text-white mb-3">Riwayat Token</h3>
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-700">
              <th className="py-2 px-2">PIN</th>
              <th className="py-2 px-2">User Admin</th>
              <th className="py-2 px-2">Dibuat Oleh</th>
              <th className="py-2 px-2">Dibuat</th>
              <th className="py-2 px-2">Expired</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="border-b border-slate-700/60">
                <td className="py-2 px-2 font-semibold tracking-[0.15em]">{item.masked_pin || '-- ----'}</td>
                <td className="py-2 px-2">{item.dashboard_user_name || '-'} ({item.dashboard_user_email || '-'})</td>
                <td className="py-2 px-2">{item.generated_by_name || '-'}</td>
                <td className="py-2 px-2">{fmtDateTime(item.created_at)}</td>
                <td className="py-2 px-2">{fmtDateTime(item.expires_at)}</td>
              </tr>
            ))}
            {!loading && history.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400">Belum ada riwayat token.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
