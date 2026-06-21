import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { apiRequest, ApiError } from '../../../services/api'

const DEFAULT_SETTINGS = {
  headerTitle: 'YWA Workshop Operations Dashboard',
  headerSubtitle: 'Monitoring antrean, flow proses, dan preventive secara realtime.',
  sliderDurationSec: 20,
  slide1ScrollSpeed: 24,
  slide1ScrollDelaySec: 1,
  slide1ScrollLoopPauseMs: 1000,
  runningText: 'ALERT: UNIT OVER SLA MENJADI PRIORITAS PENANGANAN|PERHATIAN: UNIT ON HOLD WAJIB DITINDAKLANJUTI DENGAN ETA|INFO: MONITOR STEP BOTTLENECK SECARA BERKALA|SCHEDULE: PREVENTIVE DUE TODAY HARUS DITUNTASKAN',
  slide1Title: 'FIFO Workshop Board',
  slide1Desc: 'Antrian unit aktif dari registrasi hingga serah terima (auto-hide saat selesai).',
  slide2Title: 'Workshop Control Tower',
  slide2Desc: 'Paritas layout control tower admin, mode view-only.',
  slide3Title: 'Preventive & Operational KPI',
  slide3Desc: 'Fokus due schedule, bottleneck, dan performa harian workshop.',
  slide4Title: 'Dashboard Analyst',
  slide4Desc: 'Trend 30 hari: WO, downtime, dan bottleneck.',
}

const swal = Swal.mixin({ width: 420, customClass: { popup: 'rounded-2xl' } })

export function DashboardSettingsPage() {
  const [form, setForm] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await apiRequest('/settings/dashboard-settings')
      setForm({ ...DEFAULT_SETTINGS, ...(res?.data || {}) })
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal memuat dashboard settings.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const save = async () => {
    setSaving(true)
    try {
      await apiRequest('/settings/dashboard-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sliderDurationSec: Number(form.sliderDurationSec) || DEFAULT_SETTINGS.sliderDurationSec,
          slide1ScrollSpeed: Number(form.slide1ScrollSpeed) || DEFAULT_SETTINGS.slide1ScrollSpeed,
          slide1ScrollDelaySec: Number(form.slide1ScrollDelaySec) || DEFAULT_SETTINGS.slide1ScrollDelaySec,
          slide1ScrollLoopPauseMs: Number(form.slide1ScrollLoopPauseMs) || DEFAULT_SETTINGS.slide1ScrollLoopPauseMs,
        }),
      })
      await swal.fire({ icon: 'success', title: 'Tersimpan', text: 'Dashboard setting berhasil disimpan.' })
      await fetchSettings()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error?.message || 'Gagal menyimpan dashboard setting.' })
    } finally {
      setSaving(false)
    }
  }

  const renderInput = (label, key, type = 'text', extra = {}) => (
    <label className="block space-y-2">
      <span className="text-sm text-slate-300">{label}</span>
      {type === 'textarea' ? (
        <textarea
          rows={extra.rows || 3}
          value={form[key]}
          onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white"
        />
      ) : (
        <input
          type={type}
          min={extra.min}
          max={extra.max}
          step={extra.step}
          value={form[key]}
          onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white"
        />
      )}
    </label>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Dashboard Settings</h2>
          <p className="text-sm text-slate-400 mt-1">Konfigurasi tampilan dashboard web yang dibaca langsung dari database.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchSettings} disabled={loading || saving} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-60 text-sm text-white">Refresh</button>
          <button onClick={save} disabled={loading || saving} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-sm text-white">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-4 xl:col-span-1">
          <h3 className="text-sm font-semibold text-white">General</h3>
          {renderInput('Judul Dashboard', 'headerTitle')}
          {renderInput('Deskripsi Dashboard', 'headerSubtitle')}
          {renderInput('Durasi Slider (detik)', 'sliderDurationSec', 'number', { min: 5, max: 600 })}
          {renderInput('Running Text (pisahkan dengan |)', 'runningText', 'textarea', { rows: 4 })}
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-4 xl:col-span-1">
          <h3 className="text-sm font-semibold text-white">Slide 1</h3>
          {renderInput('Judul Slide 1', 'slide1Title')}
          {renderInput('Deskripsi Slide 1', 'slide1Desc')}
          {renderInput('Kecepatan Auto Scroll', 'slide1ScrollSpeed', 'number', { min: 4, max: 120 })}
          {renderInput('Delay Auto Scroll (detik)', 'slide1ScrollDelaySec', 'number', { min: 0, max: 10 })}
          {renderInput('Pause Loop (ms)', 'slide1ScrollLoopPauseMs', 'number', { min: 0, max: 5000, step: 100 })}
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-4 xl:col-span-1">
          <h3 className="text-sm font-semibold text-white">Slide Lainnya</h3>
          {renderInput('Judul Slide 2', 'slide2Title')}
          {renderInput('Deskripsi Slide 2', 'slide2Desc')}
          {renderInput('Judul Slide 3', 'slide3Title')}
          {renderInput('Deskripsi Slide 3', 'slide3Desc')}
          {renderInput('Judul Slide 4', 'slide4Title')}
          {renderInput('Deskripsi Slide 4', 'slide4Desc')}
        </div>
      </div>
    </div>
  )
}
