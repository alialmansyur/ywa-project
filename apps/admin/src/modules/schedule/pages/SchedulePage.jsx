import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'
import { apiRequest, ApiError } from '../../../services/api'
import { mapMeResponse } from '../../../services/auth'
import { SearchableSelect } from '../../shared/components/SearchableSelect'

const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const severityColor = { danger: 'red', warning: 'yellow', info: 'blue', success: 'green' }

const DEFAULT_FORM = {
  asset_id: '',
  type: 'preventive',
  name: '',
  interval_hm: '',
  interval_km: '',
  next_due_at: '',
  next_due_hm: '',
  next_due_km: '',
  status: 'scheduled',
  notes: '',
}

function SkeletonBox({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-700/60 ${className}`} />
}

function toDateInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function formatDateId(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function SchedulePage() {
  const [curDate, setCurDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  const [assets, setAssets] = useState([])
  const [me, setMe] = useState(null)
  const [calendarDays, setCalendarDays] = useState({})
  const [schedules, setSchedules] = useState([])

  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedDay, setSelectedDay] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)

  const swal = Swal.mixin({
    width: 420,
    buttonsStyling: false,
    customClass: {
      popup: 'rounded-2xl',
      confirmButton: 'px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium',
      cancelButton: 'px-4 py-2 rounded-xl border border-slate-500 text-slate-200 text-sm font-medium ml-2',
    },
  })

  const loadMaster = async () => {
    const [assetRes, meRes] = await Promise.all([
      apiRequest('/assets?per_page=200'),
      apiRequest('/auth/me'),
    ])
    setAssets(assetRes?.data || [])
    setMe(mapMeResponse(meRes || null))
  }

  const loadCalendar = async (year, month) => {
    const data = await apiRequest(`/schedules/calendar?year=${year}&month=${month}`)
    setCalendarDays(data?.days || {})
  }

  const loadSchedules = async () => {
    const params = new URLSearchParams({ per_page: '200' })
    if (q.trim()) params.set('q', q.trim())
    if (statusFilter) params.set('status', statusFilter)
    if (typeFilter) params.set('type', typeFilter)

    const res = await apiRequest(`/schedules?${params.toString()}`)
    setSchedules(res?.data || [])
  }

  const reloadAll = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadMaster(),
        loadCalendar(curDate.getFullYear(), curDate.getMonth() + 1),
        loadSchedules(),
      ])
    } catch (err) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: err instanceof ApiError ? err.message : 'Gagal memuat data jadwal.' })
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  const handleReload = async () => {
    setHasLoaded(false)
    await reloadAll()
  }

  useEffect(() => {
    reloadAll()
  }, [])

  useEffect(() => {
    loadSchedules().catch(() => {})
  }, [q, statusFilter, typeFilter])

  useEffect(() => {
    loadCalendar(curDate.getFullYear(), curDate.getMonth() + 1).catch(() => {})
  }, [curDate])

  const filteredByDay = useMemo(() => {
    if (!selectedDay) return schedules
    return schedules.filter((s) => toDateInput(s.next_due_at) === selectedDay)
  }, [schedules, selectedDay])

  const dueNow = useMemo(() => {
    return filteredByDay.filter((s) => s.is_due_today_or_overdue || s.severity === 'danger')
  }, [filteredByDay])

  const { cells } = useMemo(() => {
    const y = curDate.getFullYear()
    const m = curDate.getMonth()
    const first = new Date(y, m, 1).getDay()
    const total = new Date(y, m + 1, 0).getDate()
    const today = new Date()

    const c = []
    for (let i = 0; i < first; i += 1) c.push({ empty: true })
    for (let d = 1; d <= total; d += 1) {
      const dateObj = new Date(y, m, d)
      const key = dateObj.toISOString().slice(0, 10)
      const meta = calendarDays[key] || { count: 0, severity: [] }
      const isToday = y === today.getFullYear() && m === today.getMonth() && d === today.getDate()
      c.push({ d, key, isToday, severity: meta.severity || [], count: meta.count || 0 })
    }
    return { cells: c }
  }, [curDate, calendarDays])

  const openCreateModal = () => {
    setEditing(null)
    setForm(DEFAULT_FORM)
    setShowModal(true)
  }

  const openEditModal = (row) => {
    setEditing(row)
    setForm({
      asset_id: String(row.asset_id || ''),
      type: row.type || 'preventive',
      name: row.name || '',
      interval_hm: row.interval_hm || '',
      interval_km: row.interval_km || '',
      next_due_at: toDateInput(row.next_due_at),
      next_due_hm: row.next_due_hm || '',
      next_due_km: row.next_due_km || '',
      status: row.status || 'scheduled',
      notes: row.notes || '',
    })
    setShowModal(true)
  }

  const handleSaveSchedule = async () => {
    if (!form.asset_id || !form.name.trim()) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Asset dan nama jadwal wajib diisi.' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        asset_id: Number(form.asset_id),
        type: form.type,
        name: form.name.trim(),
        interval_hm: form.interval_hm ? Number(form.interval_hm) : null,
        interval_km: form.interval_km ? Number(form.interval_km) : null,
        next_due_at: form.next_due_at || null,
        next_due_hm: form.next_due_hm ? Number(form.next_due_hm) : null,
        next_due_km: form.next_due_km ? Number(form.next_due_km) : null,
        status: form.status,
        notes: form.notes || null,
      }

      if (editing?.id) {
        await apiRequest(`/schedules/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await apiRequest('/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      setShowModal(false)
      await Promise.all([
        loadSchedules(),
        loadCalendar(curDate.getFullYear(), curDate.getMonth() + 1),
      ])

      await swal.fire({ icon: 'success', title: 'Berhasil', text: editing?.id ? 'Jadwal diperbarui.' : 'Jadwal ditambahkan.' })
    } catch (err) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: err instanceof ApiError ? err.message : 'Gagal menyimpan jadwal.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const confirm = await swal.fire({
      icon: 'warning',
      title: 'Hapus jadwal ini?',
      text: 'Data jadwal akan dihapus permanen.',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    })
    if (!confirm.isConfirmed) return

    try {
      await apiRequest(`/schedules/${id}`, { method: 'DELETE' })
      await Promise.all([
        loadSchedules(),
        loadCalendar(curDate.getFullYear(), curDate.getMonth() + 1),
      ])
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Jadwal dihapus.' })
    } catch (err) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: err instanceof ApiError ? err.message : 'Gagal menghapus jadwal.' })
    }
  }

  const handleCreateWo = async (row) => {
    try {
      await apiRequest(`/schedules/${row.id}/create-work-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supervisor_id: me?.id || null, priority: 'medium' }),
      })
      await loadSchedules()
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'WO berhasil dibuat dari jadwal.' })
    } catch (err) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: err instanceof ApiError ? err.message : 'Gagal membuat WO.' })
    }
  }

  const handleExportXlsx = async () => {
    try {
      const allRows = []
      let exportPage = 1
      let exportLastPage = 1

      do {
        const params = new URLSearchParams()
        params.set('per_page', '200')
        params.set('page', String(exportPage))
        if (q.trim()) params.set('q', q.trim())
        if (statusFilter) params.set('status', statusFilter)
        if (typeFilter) params.set('type', typeFilter)

        const response = await apiRequest(`/schedules?${params.toString()}`)
        allRows.push(...(response.data || []))
        exportLastPage = response.last_page || 1
        exportPage += 1
      } while (exportPage <= exportLastPage)

      const exportFiltered = selectedDay
        ? allRows.filter((s) => toDateInput(s.next_due_at) === selectedDay)
        : allRows

      const rows = exportFiltered.map((s) => ({
        id: s.id,
        asset_code: s.asset?.code || '',
        asset_name: s.asset?.name || '',
        type: s.type || '',
        name: s.name || '',
        interval_hm: s.interval_hm || '',
        interval_km: s.interval_km || '',
        next_due_at: s.next_due_at || '',
        next_due_hm: s.next_due_hm || '',
        next_due_km: s.next_due_km || '',
        status: s.status || '',
        severity: s.severity || '',
        notes: s.notes || '',
      }))

      if (rows.length === 0) {
        await swal.fire({ icon: 'info', title: 'Info', text: 'Tidak ada data jadwal untuk diexport.' })
        return
      }

      const sheet = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, sheet, 'Schedules')
      XLSX.writeFile(wb, `schedules_export_${new Date().toISOString().slice(0, 10)}.xlsx`)
      await swal.fire({ icon: 'success', title: 'Berhasil', text: `Data jadwal berhasil diexport (${rows.length} baris).` })
    } catch {
      await swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal export jadwal ke .xlsx.' })
    }
  }

  const rowList = filteredByDay
  const assetOptions = useMemo(() => assets.map((a) => ({ value: String(a.id), label: `${a.code} - ${a.name}` })), [assets])

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!hasLoaded ? (
          <>
            <div className="space-y-2">
              <SkeletonBox className="h-6 w-52" />
              <SkeletonBox className="h-4 w-80" />
            </div>
            <div className="flex gap-2">
              <SkeletonBox className="h-10 w-28" />
              <SkeletonBox className="h-10 w-32" />
              <SkeletonBox className="h-10 w-32" />
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-bold">Jadwal Maintenance</h2>
              <p className="text-sm text-slate-500">Kalender dan daftar jadwal maintenance semua unit</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleReload} className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/40">{loading ? 'Memuat...' : 'Muat Ulang'}</button>
              <button onClick={openCreateModal} className="btn-primary px-4 py-2 rounded-xl text-sm text-white">Tambah Jadwal</button>
              <button onClick={handleExportXlsx} className="px-4 py-2 rounded-xl text-sm border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10">Export .xlsx</button>
            </div>
          </>
        )}
      </div>

      {!hasLoaded ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="card p-5 space-y-3">
              <SkeletonBox className="h-5 w-44" />
              <SkeletonBox className="h-64 w-full" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="card p-4"><SkeletonBox className="h-10 w-full" /></div>
              <div className="card p-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <SkeletonBox key={i} className="h-14 w-full" />)}
              </div>
              <div className="card p-5 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonBox key={i} className="h-12 w-full" />)}
              </div>
            </div>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-1.5 hover:bg-slate-700 rounded-lg">◀</button>
            <span className="text-sm font-semibold text-white">{months[curDate.getMonth()]} {curDate.getFullYear()}</span>
            <button onClick={() => setCurDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-1.5 hover:bg-slate-700 rounded-lg">▶</button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {days.map((d) => <div key={d} className="py-2 text-xs font-semibold text-slate-500">{d}</div>)}
            {cells.map((c, i) => (
              <button
                type="button"
                key={i}
                disabled={c.empty}
                onClick={() => !c.empty && setSelectedDay((prev) => (prev === c.key ? '' : c.key))}
                className={`flex flex-col items-center py-1.5 rounded-xl hover:bg-slate-700/50 transition-colors ${c.isToday ? 'bg-blue-500/20' : ''} ${selectedDay === c.key ? 'ring-1 ring-blue-500' : ''}`}
              >
                {!c.empty && (
                  <>
                    <span className={`text-sm ${c.isToday ? 'text-blue-400 font-bold' : 'text-slate-300'}`}>{c.d}</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {c.severity.slice(0, 3).map((s, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full bg-${severityColor[s] || 'blue'}-400`} />
                      ))}
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-400">
            {selectedDay ? `Filter tanggal: ${formatDateId(selectedDay)}` : 'Klik tanggal untuk filter daftar'}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card p-4 flex flex-wrap gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari asset / jadwal..." className="input px-3 py-2 rounded-lg text-sm w-full md:w-64" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input px-3 py-2 rounded-lg text-sm">
              <option value="">Semua status</option>
              <option value="scheduled">scheduled</option>
              <option value="due">due</option>
              <option value="overdue">overdue</option>
              <option value="completed">completed</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input px-3 py-2 rounded-lg text-sm">
              <option value="">Semua tipe</option>
              <option value="preventive">preventive</option>
              <option value="periodic">periodic</option>
              <option value="conditional">conditional</option>
            </select>
          </div>

          <div className="card border border-red-500/20 p-4">
            <div className="text-sm font-semibold text-red-400 mb-3">Overdue & Jatuh Tempo Hari Ini</div>
            <div className="space-y-2">
              {dueNow.length === 0 ? <div className="text-xs text-slate-400">Tidak ada jadwal kritikal.</div> : dueNow.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-red-500/10 rounded-xl text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white">{s.asset?.code || '-'} - {s.name}</div>
                    <div className="text-xs text-slate-300">{s.asset?.name || '-'}</div>
                    <div className="text-xs text-red-300">Due: {formatDateId(s.next_due_at)}</div>
                  </div>
                  <button onClick={() => handleCreateWo(s)} className="btn-primary px-3 py-1.5 rounded-lg text-xs text-white">Buat WO</button>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-4">Jadwal {selectedDay ? formatDateId(selectedDay) : '30 Hari ke Depan'} ({rowList.length})</h3>
            <div className="space-y-2">
              {rowList.length === 0 ? <div className="text-xs text-slate-400">Belum ada data jadwal.</div> : rowList.map((s) => {
                const c = severityColor[s.severity] || 'blue'
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl">
                    <div className={`w-10 h-10 rounded-xl bg-${c}-500/20 flex flex-col items-center justify-center`}>
                      <span className={`text-xs font-bold text-${c}-400`}>{s.next_due_at ? new Date(s.next_due_at).getDate() : '-'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{s.asset?.code || '-'} - {s.name}</div>
                      <div className="text-xs text-slate-300">{s.asset?.name || '-'}</div>
                      <div className="text-xs text-slate-400">{s.type} · Due: {formatDateId(s.next_due_at)} · {s.status}</div>
                    </div>
                    <button onClick={() => openEditModal(s)} className="text-xs px-2 py-1 rounded-lg border border-slate-600 text-slate-200">Edit</button>
                    <button onClick={() => handleCreateWo(s)} className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400">WO</button>
                    <button onClick={() => handleDelete(s.id)} className="text-xs px-2 py-1 rounded-lg border border-red-500/30 text-red-300">Hapus</button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-4">
            <h3 className="text-base font-semibold text-white">{editing ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-300 mb-1 block">Asset</label>
                <SearchableSelect
                  value={assetOptions.find((opt) => opt.value === String(form.asset_id)) || null}
                  onChange={(option) => setForm((s) => ({ ...s, asset_id: option?.value || '' }))}
                  options={assetOptions}
                  placeholder="Pilih asset..."
                  isClearable
                />
              </div>
              <label className="text-xs text-slate-300">Tipe
                <select value={form.type} onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))} className="input mt-1 px-3 py-2 rounded-xl text-sm w-full">
                  <option value="preventive">preventive</option>
                  <option value="periodic">periodic</option>
                  <option value="conditional">conditional</option>
                </select>
              </label>
              <label className="text-xs text-slate-300">Status
                <select value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))} className="input mt-1 px-3 py-2 rounded-xl text-sm w-full">
                  <option value="scheduled">scheduled</option>
                  <option value="due">due</option>
                  <option value="overdue">overdue</option>
                  <option value="completed">completed</option>
                </select>
              </label>
              <label className="text-xs text-slate-300 sm:col-span-2">Nama Jadwal
                <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Nama jadwal" className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" />
              </label>
              <label className="text-xs text-slate-300">Interval HM
                <input type="number" value={form.interval_hm} onChange={(e) => setForm((s) => ({ ...s, interval_hm: e.target.value }))} placeholder="Interval HM" className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" />
              </label>
              <label className="text-xs text-slate-300">Interval KM
                <input type="number" value={form.interval_km} onChange={(e) => setForm((s) => ({ ...s, interval_km: e.target.value }))} placeholder="Interval KM" className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" />
              </label>
              <label className="text-xs text-slate-300">Tanggal Due
                <input type="date" value={form.next_due_at} onChange={(e) => setForm((s) => ({ ...s, next_due_at: e.target.value }))} className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" />
              </label>
              <label className="text-xs text-slate-300">Next Due HM
                <input type="number" value={form.next_due_hm} onChange={(e) => setForm((s) => ({ ...s, next_due_hm: e.target.value }))} placeholder="Next due HM" className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" />
              </label>
              <label className="text-xs text-slate-300 sm:col-span-2">Catatan
                <textarea value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} placeholder="Catatan" className="input mt-1 px-3 py-2 rounded-xl text-sm min-h-20 w-full" />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-600 text-sm text-slate-200">Batal</button>
              <button onClick={handleSaveSchedule} disabled={saving} className="btn-primary px-4 py-2 rounded-xl text-sm text-white disabled:opacity-60">{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
