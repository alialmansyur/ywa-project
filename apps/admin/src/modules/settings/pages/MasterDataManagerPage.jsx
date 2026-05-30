import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { apiRequest, ApiError } from '../../../services/api'

const swal = Swal.mixin({ width: 420, customClass: { popup: 'rounded-2xl' } })

const DEFAULT_FORM = { name: '', icon: '', description: '', is_active: true }

export function MasterDataManagerPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [editingId, setEditingId] = useState(null)

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await apiRequest('/assets/categories')
      setRows(Array.isArray(res) ? res : [])
    } catch (err) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: err instanceof ApiError ? err.message : 'Gagal memuat master data kategori.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const submit = async () => {
    if (!form.name.trim()) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Nama kategori wajib diisi.' })
      return
    }

    try {
      const payload = {
        name: form.name.trim(),
        icon: form.icon.trim() || null,
        description: form.description.trim() || null,
        is_active: Boolean(form.is_active),
      }

      if (editingId) {
        await apiRequest(`/assets/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await apiRequest('/assets/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      setForm(DEFAULT_FORM)
      setEditingId(null)
      await loadCategories()
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Master data kategori berhasil disimpan.' })
    } catch (err) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: err instanceof ApiError ? err.message : 'Gagal menyimpan master data.' })
    }
  }

  const remove = async (id) => {
    const confirm = await swal.fire({
      icon: 'warning',
      title: 'Hapus kategori?',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    })
    if (!confirm.isConfirmed) return

    try {
      await apiRequest(`/assets/categories/${id}`, { method: 'DELETE' })
      await loadCategories()
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Kategori berhasil dihapus.' })
    } catch (err) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: err instanceof ApiError ? err.message : 'Gagal menghapus kategori.' })
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold">Master Data Manager</h2>
        <p className="text-sm text-slate-400">Kelola master data kategori asset yang dipakai lintas modul.</p>
      </div>

      <div className="card p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="input px-3 py-2 rounded-xl text-sm" placeholder="Nama kategori" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
        <input className="input px-3 py-2 rounded-xl text-sm" placeholder="Icon (opsional)" value={form.icon} onChange={(e) => setForm((s) => ({ ...s, icon: e.target.value }))} />
        <textarea className="input px-3 py-2 rounded-xl text-sm md:col-span-2" rows={3} placeholder="Deskripsi (opsional)" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
        <label className="inline-flex items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked }))} />
          Aktif
        </label>
        <div className="md:col-span-2 flex gap-2 justify-end">
          <button type="button" onClick={() => { setForm(DEFAULT_FORM); setEditingId(null) }} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm">Reset</button>
          <button type="button" onClick={submit} className="btn-primary px-4 py-2 rounded-xl text-sm text-white">Simpan</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Icon</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? <tr><td className="py-6 px-4 text-slate-400" colSpan="4">Memuat...</td></tr> : null}
              {!loading && rows.length === 0 ? <tr><td className="py-6 px-4 text-slate-400" colSpan="4">Belum ada master data kategori.</td></tr> : null}
              {!loading && rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-700/20">
                  <td className="py-3 px-4 text-slate-200">{row.name}</td>
                  <td className="py-3 px-4 text-slate-400">{row.icon || '-'}</td>
                  <td className="py-3 px-4 text-slate-400">{row.is_active ? 'Aktif' : 'Non-aktif'}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => { setEditingId(row.id); setForm({ name: row.name || '', icon: row.icon || '', description: row.description || '', is_active: Boolean(row.is_active) }) }} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-200 text-xs">Edit</button>
                      <button type="button" onClick={() => remove(row.id)} className="px-3 py-1.5 rounded-lg border border-red-500/40 text-red-300 text-xs">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
