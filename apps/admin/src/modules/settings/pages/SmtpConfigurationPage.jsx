import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { apiRequest, ApiError } from '../../../services/api'

const DEFAULT_FORM = {
  name: '', host: '', port: 587, username: '', password: '', encryption: 'tls', from_name: '', from_email: '', is_enabled: false, is_default: false,
}

const swal = Swal.mixin({ width: 420, customClass: { popup: 'rounded-2xl' } })
const SKELETON_ITEMS = Array.from({ length: 4 }, (_, i) => i)

function SkeletonBox({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-700/60 ${className}`} />
}

export function SmtpConfigurationPage() {
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [testEmail, setTestEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await apiRequest('/settings/smtp')
      setItems(res.data || [])
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal memuat konfigurasi SMTP.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const pickItem = (item) => {
    setSelectedId(item.id)
    setForm({ ...DEFAULT_FORM, ...item, password: '' })
  }

  const save = async () => {
    const payload = { ...form }
    try {
      if (selectedId) {
        await apiRequest(`/settings/smtp/${selectedId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      } else {
        await apiRequest('/settings/smtp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      }
      await swal.fire({ icon: 'success', title: 'Tersimpan', text: 'Konfigurasi SMTP berhasil disimpan.' })
      fetchItems()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error.message || 'Gagal simpan SMTP.' })
    }
  }

  const sendTest = async () => {
    if (!selectedId || !testEmail) return
    try {
      await apiRequest(`/settings/smtp/${selectedId}/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_email: testEmail }),
      })
      await swal.fire({ icon: 'success', title: 'Sukses', text: 'Test email berhasil dikirim.' })
      fetchItems()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error.message || 'Test email gagal.' })
    }
  }

  return (
    <div className="p-6 grid gap-6 lg:grid-cols-3">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Daftar SMTP</h2>
          <button onClick={() => { setSelectedId(null); setForm(DEFAULT_FORM) }} className="px-3 py-1.5 text-xs rounded-lg bg-slate-700">Baru</button>
        </div>
        <div className="space-y-2">
          {loading ? SKELETON_ITEMS.map((x) => (
            <div key={`smtp-skeleton-${x}`} className="px-3 py-2 rounded-lg border border-slate-700">
              <SkeletonBox className="h-4 w-36 mb-2" />
              <SkeletonBox className="h-3 w-28" />
            </div>
          )) : items.map((item) => (
            <button key={item.id} onClick={() => pickItem(item)} className={`w-full text-left px-3 py-2 rounded-lg border ${selectedId === item.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700'}`}>
              <div className="text-sm">{item.name}</div>
              <div className="text-xs text-slate-400">{item.host}:{item.port}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 lg:col-span-2 space-y-3">
        <h2 className="text-sm font-semibold">SMTP Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['name','host','port','username','from_name','from_email'].map((field) => (
            <input key={field} value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: field === 'port' ? Number(e.target.value) : e.target.value }))} placeholder={field} className="bg-slate-900/50 border border-slate-700 rounded-lg p-2" />
          ))}
          <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="password (kosongkan jika tidak diubah)" className="bg-slate-900/50 border border-slate-700 rounded-lg p-2" />
          <select value={form.encryption} onChange={(e) => setForm((p) => ({ ...p, encryption: e.target.value }))} className="bg-slate-900/50 border border-slate-700 rounded-lg p-2">
            <option value="none">none</option><option value="ssl">ssl</option><option value="tls">tls</option>
          </select>
        </div>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_enabled} onChange={(e) => setForm((p) => ({ ...p, is_enabled: e.target.checked }))} /> Enabled</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_default} onChange={(e) => setForm((p) => ({ ...p, is_default: e.target.checked }))} /> Default</label>
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Simpan</button>
          <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="test email" className="bg-slate-900/50 border border-slate-700 rounded-lg p-2 flex-1" />
          <button onClick={sendTest} disabled={!selectedId} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60">Send Test Email</button>
        </div>
      </div>
    </div>
  )
}
