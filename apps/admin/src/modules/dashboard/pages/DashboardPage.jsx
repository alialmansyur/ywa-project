import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Chart from 'react-apexcharts'
import { apiRequest, ApiError } from '../../../services/api'

const KPI_META = [
  { key: 'total_assets', label: 'Total Aset', subKey: 'assets_sub', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'blue', grad: 'from-blue-500/20 to-blue-600/5' },
  { key: 'active_work_orders', label: 'WO Aktif', subKey: 'wo_sub', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'purple', grad: 'from-purple-500/20 to-purple-600/5' },
  { key: 'completed_work_orders', label: 'WO Selesai', subKey: 'completed_sub', icon: 'M5 13l4 4L19 7', color: 'green', grad: 'from-green-500/20 to-green-600/5' },
  { key: 'mttr_minutes_month', label: 'MTTR', subKey: 'mttr_sub', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'yellow', grad: 'from-yellow-500/20 to-yellow-600/5' },
]

const STATUS_COLOR = {
  draft: 'gray',
  pending: 'yellow',
  approved: 'blue',
  in_progress: 'purple',
  on_hold: 'orange',
  completed: 'green',
  cancelled: 'slate',
  active: 'green',
  inactive: 'gray',
  maintenance: 'yellow',
  breakdown: 'red',
}

const eventLabels = {
  PROCESS_STARTED: 'Process Dimulai',
  PROCESS_COMPLETED: 'Process Selesai',
  STEP_IN: 'Step Mulai',
  STEP_OUT: 'Step Selesai',
  STEP_HOLD: 'Step Di-hold',
  STEP_RESUME: 'Step Dilanjutkan',
  STEP_APPROVED: 'Step Disetujui',
  STEP_REJECTED: 'Step Ditolak',
  NEXT_STEP_READY: 'Step Berikutnya Siap',
  BAY_IN: 'Masuk Bay',
  BAY_OUT: 'Keluar Bay',
  QC_OK: 'QC OK',
  QC_NOT_OK: 'QC Tidak OK',
  ROUTE_TO_SERVICE_REWORK: 'Kembali ke Rework Service',
  PART_REQUIRED: 'Part Diperlukan',
  PART_NOT_REQUIRED: 'Part Tidak Diperlukan',
}

function fmtDateTime(v) {
  if (!v) return '-'
  return new Date(v).toLocaleString('id-ID')
}

function humanizeLabel(value) {
  if (!value) return '-'
  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function toDateInputValue(date) {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 10)
}

function SkeletonBox({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-700/60 ${className}`} />
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('this_month')
  const [fromDate, setFromDate] = useState(toDateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1)))
  const [toDate, setToDate] = useState(toDateInputValue(new Date()))
  const [overview, setOverview] = useState(null)
  const [woStatus, setWoStatus] = useState([])
  const [woPriority, setWoPriority] = useState([])
  const [slaGapTrend, setSlaGapTrend] = useState({ labels: [], series: [], actualSeries: [], slaSeries: [], reportedDowntimeSeries: [] })
  const [upcoming, setUpcoming] = useState([])
  const [assetStatus, setAssetStatus] = useState([])
  const [activities, setActivities] = useState([])
  const [workshopOverview, setWorkshopOverview] = useState(null)
  const [workshopBottlenecks, setWorkshopBottlenecks] = useState(null)

  const load = async (forcedPeriod = null) => {
    setLoading(true)
    setError('')
    try {
      const activePeriod = forcedPeriod || period
      const periodQuery = activePeriod === 'custom'
        ? `period=custom&from=${fromDate}&to=${toDate}`
        : `period=${activePeriod}`

      const [ov, wo, woPrio, dtTrend, sch, asset, act, wsOv, wsBtl] = await Promise.all([
        apiRequest('/dashboard/overview'),
        apiRequest(`/dashboard/work-order-status?${periodQuery}`),
        apiRequest(`/dashboard/work-order-priority?${periodQuery}`),
        apiRequest(`/dashboard/downtime-trend?${periodQuery}`),
        apiRequest('/dashboard/upcoming-schedules?days=7&limit=10'),
        apiRequest('/dashboard/asset-status'),
        apiRequest('/dashboard/recent-activities?limit=20'),
        apiRequest('/workshop-control-tower/overview'),
        apiRequest('/workshop-control-tower/bottlenecks?from=' + new Date(Date.now() - (7 * 86400000)).toISOString().slice(0, 10) + '&to=' + new Date().toISOString().slice(0, 10)),
      ])

      setOverview(ov)
      setWoStatus(Array.isArray(wo?.items) ? wo.items : [])
      setWoPriority(Array.isArray(woPrio?.items) ? woPrio.items : [])
      setSlaGapTrend({
        labels: Array.isArray(dtTrend?.labels) ? dtTrend.labels : [],
        series: Array.isArray(dtTrend?.series) ? dtTrend.series : [],
        actualSeries: Array.isArray(dtTrend?.actual_series) ? dtTrend.actual_series : [],
        slaSeries: Array.isArray(dtTrend?.sla_series) ? dtTrend.sla_series : [],
        reportedDowntimeSeries: Array.isArray(dtTrend?.reported_downtime_series) ? dtTrend.reported_downtime_series : [],
      })
      setUpcoming(
        Array.isArray(sch?.schedules)
          ? sch.schedules
          : Array.isArray(sch?.data)
            ? sch.data
            : []
      )
      setAssetStatus(Array.isArray(asset?.items) ? asset.items : [])
      setActivities(Array.isArray(act?.data) ? act.data : [])
      setWorkshopOverview(wsOv || null)
      setWorkshopBottlenecks(wsBtl || null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat data dashboard.')
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  useEffect(() => {
    load('this_month')
  }, [])

  const kpiData = useMemo(() => {
    const totalAssets = overview?.total_assets || 0
    const completed = woStatus.find((x) => x.status === 'completed')?.total || 0
    const woTotal = woStatus.reduce((acc, cur) => acc + Number(cur.total || 0), 0)
    return {
      total_assets: String(totalAssets),
      assets_sub: 'Data aset terdaftar',
      active_work_orders: String(overview?.active_work_orders || 0),
      wo_sub: `${overview?.overdue_work_orders || 0} overdue`,
      completed_work_orders: String(completed),
      completed_sub: woTotal > 0 ? `${Math.round((completed / woTotal) * 100)}% dari total WO` : 'Belum ada data WO',
      mttr_minutes_month: `${Number(overview?.mttr_minutes_month || 0)}m`,
      mttr_sub: 'Rata-rata bulan ini',
    }
  }, [overview, woStatus])

  const woLabels = woStatus.map((x) => x.status)
  const woSeries = woStatus.map((x) => x.total)
  const woPriorityLabels = woPriority.map((x) => humanizeLabel(x.priority))
  const woPrioritySeries = woPriority.map((x) => x.total)
  const dueSoonCount = upcoming.filter((s) => typeof s.days_left === 'number' && s.days_left <= 2).length
  const overdueCount = upcoming.filter((s) => typeof s.days_left === 'number' && s.days_left < 0).length
  const topBottlenecks = workshopBottlenecks?.top_by_sla_gap || workshopBottlenecks?.top_by_downtime || []
  const showSkeleton = !hasLoaded

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Dashboard Workshop</h2>
          <p className="text-sm text-slate-400">Monitoring work order, prioritas pekerjaan, dan tren SLA gap pada periode terpilih.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input px-3 py-2 rounded-lg text-sm"
          >
            <option value="this_month">Bulan Berjalan</option>
            <option value="last_30_days">30 Hari Terakhir</option>
            <option value="last_90_days">90 Hari Terakhir</option>
            <option value="custom">Custom</option>
          </select>
          {period === 'custom' ? (
            <>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input px-3 py-2 rounded-lg text-sm" />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input px-3 py-2 rounded-lg text-sm" />
            </>
          ) : null}
          <button onClick={() => load()} className="px-3 py-2 rounded-lg text-sm border border-blue-500/40 text-blue-300 hover:bg-blue-500/10">Terapkan Filter</button>
          <button onClick={() => { setHasLoaded(false); load(period) }} className="px-3 py-2 rounded-lg text-sm border border-slate-600 text-slate-300 hover:bg-slate-700/40">Muat Ulang</button>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {showSkeleton ? Array.from({ length: 4 }).map((_, i) => (
          <div key={`kpi-sk-${i}`} className="stat-card p-5 space-y-3">
            <SkeletonBox className="h-3 w-24" />
            <SkeletonBox className="h-7 w-20" />
            <SkeletonBox className="h-3 w-28" />
          </div>
        )) : KPI_META.map((k) => (
          <div key={k.label} className="stat-card p-5 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${k.grad} pointer-events-none`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400">{k.label}</span>
                <div className={`w-8 h-8 rounded-lg bg-${k.color}-500/20 flex items-center justify-center`}>
                  <svg className={`w-4 h-4 text-${k.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={k.icon} /></svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{loading ? '-' : kpiData[k.key]}</div>
              <div className="text-xs text-slate-500 mt-1">{kpiData[k.subKey]}</div>
            </div>
          </div>
        ))}
      </div>

      {showSkeleton ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="card p-5 xl:col-span-2 space-y-4">
              <SkeletonBox className="h-5 w-40" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SkeletonBox className="h-44 w-full" />
                <SkeletonBox className="h-44 w-full" />
              </div>
              <SkeletonBox className="h-44 w-full" />
            </div>
            <div className="card p-5 space-y-3">
              <SkeletonBox className="h-5 w-36" />
              {Array.from({ length: 6 }).map((_, i) => <SkeletonBox key={`ws-sk-${i}`} className="h-4 w-full" />)}
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="card p-5 xl:col-span-2 space-y-3">
              <SkeletonBox className="h-5 w-44" />
              {Array.from({ length: 6 }).map((_, i) => <SkeletonBox key={`upcoming-sk-${i}`} className="h-10 w-full" />)}
            </div>
            <div className="space-y-4">
              <div className="card p-5 space-y-3">
                <SkeletonBox className="h-5 w-24" />
                {Array.from({ length: 4 }).map((_, i) => <SkeletonBox key={`asset-sk-${i}`} className="h-4 w-full" />)}
              </div>
              <div className="card p-5 space-y-3">
                <SkeletonBox className="h-5 w-32" />
                {Array.from({ length: 4 }).map((_, i) => <SkeletonBox key={`act-sk-${i}`} className="h-4 w-full" />)}
              </div>
            </div>
          </div>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Status Work Order</h3>
            <span className="text-xs text-slate-500">Live</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-400 mb-2">Status Work Order</div>
              <Chart
                type="donut"
                height={180}
                series={woSeries.length > 0 ? woSeries : [1]}
                options={{
                  labels: woLabels.length > 0 ? woLabels : ['No Data'],
                  colors: ['#64748b', '#eab308', '#3b82f6', '#8b5cf6', '#f97316', '#10b981', '#334155'],
                  legend: { show: false },
                  dataLabels: { enabled: false },
                  plotOptions: { pie: { donut: { size: '72%' } } },
                  chart: { background: 'transparent' },
                  tooltip: { theme: 'dark' },
                  theme: { mode: 'dark' },
                }}
              />
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-2">WO by Priority</div>
              <Chart
                type="donut"
                height={180}
                series={woPrioritySeries.length > 0 ? woPrioritySeries : [1]}
                options={{
                  labels: woPriorityLabels.length > 0 ? woPriorityLabels : ['No Data'],
                  colors: ['#94a3b8', '#3b82f6', '#f59e0b', '#ef4444'],
                  legend: { show: false },
                  dataLabels: { enabled: false },
                  plotOptions: { pie: { donut: { size: '72%' } } },
                  chart: { background: 'transparent' },
                  tooltip: { theme: 'dark' },
                  theme: { mode: 'dark' },
                }}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/70">
            <div className="text-xs text-slate-400 mb-2">Trend SLA Gap Minutes</div>
            <Chart
              type="line"
              height={180}
              series={[
                { name: 'SLA Gap (menit)', data: slaGapTrend.series },
                { name: 'Actual (menit)', data: slaGapTrend.actualSeries },
                { name: 'SLA (menit)', data: slaGapTrend.slaSeries },
              ]}
              options={{
                chart: { background: 'transparent', toolbar: { show: false } },
                xaxis: { categories: slaGapTrend.labels, labels: { style: { colors: '#94a3b8', fontSize: '10px' } } },
                yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '10px' } } },
                stroke: { curve: 'smooth', width: 2 },
                colors: ['#38bdf8', '#f59e0b', '#22c55e'],
                grid: { borderColor: 'rgba(255,255,255,0.08)' },
                dataLabels: { enabled: false },
                theme: { mode: 'dark' },
                tooltip: { theme: 'dark' },
              }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            {woStatus.map((x) => (
              <div key={x.status} className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full bg-${STATUS_COLOR[x.status] || 'slate'}-400`} />
                <span className="text-slate-400">{humanizeLabel(x.status)}</span>
                <span className="ml-auto font-semibold text-white">{x.total}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-4">Workshop Snapshot</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between"><span className="text-slate-400">WO Berjalan</span><span className="font-semibold text-white">{workshopOverview?.active_wo ?? 0}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-400">WO On Hold</span><span className="font-semibold text-yellow-300">{workshopOverview?.hold_wo ?? 0}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-400">Step Terlambat</span><span className="font-semibold text-red-300">{workshopOverview?.late_steps ?? 0}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-400">SLA Gap Hari Ini</span><span className="font-semibold text-white">{workshopOverview?.total_sla_gap_today ?? workshopOverview?.total_downtime_today ?? 0}m</span></div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700/70">
            <h4 className="text-xs text-slate-400 mb-2">Top Bottleneck</h4>
            <div className="space-y-2">
              {topBottlenecks.slice(0, 3).map((row) => (
                <div key={row.step_code} className="text-xs border border-slate-700 rounded p-2">
                  <div className="text-slate-300">{humanizeLabel(row.step_code)}</div>
                  <div className="text-slate-500 mt-1">SLA Gap {Number(row.total_sla_gap_minutes ?? row.total_downtime_minutes ?? 0)} menit</div>
                </div>
              ))}
              {!loading && topBottlenecks.length === 0 ? <div className="text-xs text-slate-500">Belum ada data bottleneck.</div> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Jadwal Maintenance Mendatang</h3>
            <Link to="/schedule" className="text-xs text-blue-400 hover:text-blue-300">Lihat semua →</Link>
          </div>
          <div className="mb-3 flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-red-500/15 text-red-300 border border-red-500/20">Overdue: {overdueCount}</span>
            <span className="px-2 py-1 rounded bg-yellow-500/15 text-yellow-300 border border-yellow-500/20">Due ≤ 2 hari: {dueSoonCount}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-slate-500 border-b border-slate-700"><th className="text-left pb-3 font-medium">Unit</th><th className="text-left pb-3 font-medium">Tipe</th><th className="text-left pb-3 font-medium">Due Date</th><th className="text-left pb-3 font-medium">HM Due</th><th className="text-left pb-3 font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-700/50">
                {upcoming.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 font-mono text-blue-400 text-xs">{s.asset?.code || '-'}</td>
                    <td className="py-3 text-slate-300 text-xs">{s.name}</td>
                    <td className="py-3 text-slate-400 text-xs">{s.next_due_at ? new Date(s.next_due_at).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="py-3 text-slate-400 text-xs font-mono">{s.next_due_hm ?? '-'}</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">{s.days_left === null ? humanizeLabel(s.status) : `${s.days_left} hari`}</span></td>
                  </tr>
                ))}
                {!loading && upcoming.length === 0 ? <tr><td colSpan="5" className="py-4 text-center text-slate-500 text-xs">Tidak ada jadwal mendatang.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4">Status Aset</h3>
            <div className="space-y-3">
              {assetStatus.map((x) => (
                <div key={x.status} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full bg-${STATUS_COLOR[x.status] || 'slate'}-400 flex-shrink-0`} />
                  <span className="text-xs text-slate-400 flex-1">{humanizeLabel(x.status)}</span>
                  <span className="text-sm font-bold text-white">{x.total}</span>
                  <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full bg-${STATUS_COLOR[x.status] || 'slate'}-500 rounded-full`} style={{ width: `${x.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-3">Aktivitas Terbaru</h3>
            <div className="space-y-3 max-h-56 overflow-y-auto hide-scrollbar">
              {activities.map((x) => (
                <div key={x.id} className="flex gap-3 text-xs">
                  <span className="flex-shrink-0">•</span>
                  <div>
                    <div className="text-slate-300">{eventLabels[x.event_key] || humanizeLabel(x.event_key)} — {x.wo?.code || '-'}</div>
                    <div className="text-slate-600">{x.actor_name || '-'} · {fmtDateTime(x.triggered_at)}</div>
                  </div>
                </div>
              ))}
              {!loading && activities.length === 0 ? <div className="text-xs text-slate-500">Belum ada aktivitas.</div> : null}
            </div>
          </div>
        </div>
      </div>
      </>
      )}

    </div>
  )
}
