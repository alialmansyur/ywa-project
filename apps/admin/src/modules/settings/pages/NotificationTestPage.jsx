import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { apiRequest, ApiError } from '../../../services/api'

const swal = Swal.mixin({ width: 460, customClass: { popup: 'rounded-2xl' } })

const INITIAL_FORM = {
  mode: 'target',
  user_id: '',
  title: 'Test Notifikasi Sistem',
  body: 'Ini adalah notifikasi test dari halaman pengaturan.',
  route: '/notifications',
  priority: 'medium',
  send_push: true,
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-700/60 animate-pulse">
      <td className="py-2 px-2"><div className="h-3 w-36 rounded bg-slate-700/60" /></td>
      <td className="py-2 px-2"><div className="h-3 w-44 rounded bg-slate-700/60" /></td>
      <td className="py-2 px-2"><div className="h-3 w-24 rounded bg-slate-700/60" /></td>
      <td className="py-2 px-2"><div className="h-3 w-28 rounded bg-slate-700/60" /></td>
      <td className="py-2 px-2"><div className="h-3 w-20 rounded bg-slate-700/60" /></td>
    </tr>
  )
}

export function NotificationTestPage() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [sending, setSending] = useState(false)

  const activeTargets = useMemo(() => users.filter((u) => u.has_active_push_token), [users])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await apiRequest(`/settings/notification-test/active-users?q=${encodeURIComponent(query)}`)
      setUsers(response.data || [])
      if (form.mode === 'target' && form.user_id) {
        const exists = (response.data || []).some((row) => String(row.id) === String(form.user_id))
        if (!exists) setForm((prev) => ({ ...prev, user_id: '' }))
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal memuat user aktif.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const selectedUserMeta = useMemo(
    () => users.find((u) => String(u.id) === String(form.user_id)) || null,
    [users, form.user_id],
  )

  const submit = async () => {
    if (form.mode === 'target' && !form.user_id) {
      await swal.fire({ icon: 'warning', title: 'Target Belum Dipilih', text: 'Pilih target user aktif terlebih dahulu.' })
      return
    }

    setSending(true)
    try {
      const payload = {
        mode: form.mode,
        user_id: form.mode === 'target' ? Number(form.user_id) : null,
        title: form.title,
        body: form.body,
        route: form.route || null,
        priority: form.priority,
        send_push: form.send_push,
      }
      const response = await apiRequest('/settings/notification-test/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      await swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: `${response.message} In-app: ${response.in_app_count}, Push queued: ${response.push_queued_count}`,
      })
      await fetchUsers()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error.message || 'Gagal mengirim notifikasi test.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white">Notification Test Console</h2>
        <p className="text-sm text-slate-400 mt-1">Kirim notifikasi test ke target user aktif atau blast ke semua user aktif.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold">Konfigurasi Kirim</h3>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, mode: 'target' }))}
              className={`px-3 py-2 rounded-lg text-sm border ${form.mode === 'target' ? 'bg-blue-500/20 border-blue-500 text-blue-200' : 'border-slate-600 text-slate-300'}`}
            >
              Target User
            </button>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, mode: 'blast', user_id: '' }))}
              className={`px-3 py-2 rounded-lg text-sm border ${form.mode === 'blast' ? 'bg-amber-500/20 border-amber-500 text-amber-200' : 'border-slate-600 text-slate-300'}`}
            >
              Blasting All
            </button>
          </div>

          {form.mode === 'target' ? (
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Target User Aktif</label>
              <select
                value={form.user_id}
                onChange={(e) => setForm((prev) => ({ ...prev, user_id: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm"
              >
                <option value="">Pilih target...</option>
                {activeTargets.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {selectedUserMeta ? (
                <div className="text-xs text-emerald-300">Push token aktif: {selectedUserMeta.active_push_token_count}</div>
              ) : <div className="text-xs text-slate-500">Hanya user aktif dengan push token tampil di daftar target.</div>}
            </div>
          ) : (
            <div className="text-xs text-amber-300 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              Mode blasting akan kirim notifikasi ke semua user dengan status aktif.
            </div>
          )}

          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Judul notifikasi"
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm"
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            placeholder="Isi notifikasi"
            className="w-full min-h-24 bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.priority}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm"
            >
              <option value="low">Priority: Low</option>
              <option value="medium">Priority: Medium</option>
              <option value="high">Priority: High</option>
            </select>
            <input
              value={form.route}
              onChange={(e) => setForm((prev) => ({ ...prev, route: e.target.value }))}
              placeholder="Route payload"
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={form.send_push}
              onChange={(e) => setForm((prev) => ({ ...prev, send_push: e.target.checked }))}
            />
            Kirim juga ke push queue
          </label>

          <button
            type="button"
            onClick={submit}
            disabled={sending}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-sm font-medium"
          >
            {sending ? 'Mengirim...' : 'Kirim Notifikasi Test'}
          </button>
        </div>

        <div className="xl:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold mr-auto">Deteksi User Aktif</h3>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama/email"
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm"
            />
            <button onClick={fetchUsers} className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm">Refresh</button>
          </div>

          <div className="overflow-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-slate-300 border-b border-slate-700">
                  <th className="py-2 px-2">Nama</th>
                  <th className="py-2 px-2">Email</th>
                  <th className="py-2 px-2">Role</th>
                  <th className="py-2 px-2">Push Token</th>
                  <th className="py-2 px-2">Last Push Seen</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={`s-${i}`} />) : users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700/60 hover:bg-slate-700/20">
                    <td className="py-2 px-2 text-slate-100">{user.name}</td>
                    <td className="py-2 px-2 text-slate-300">{user.email}</td>
                    <td className="py-2 px-2 text-slate-300">{(user.roles || []).join(', ') || '-'}</td>
                    <td className="py-2 px-2">
                      {user.has_active_push_token ? (
                        <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">Aktif ({user.active_push_token_count})</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded bg-slate-600/40 text-slate-300">Tidak ada</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-slate-400">{user.last_push_seen_at || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
