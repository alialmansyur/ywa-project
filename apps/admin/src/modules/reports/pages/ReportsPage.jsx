import { useEffect, useMemo, useState } from 'react'
import Chart from 'react-apexcharts'
import Swal from 'sweetalert2'
import { getBearerToken } from '../../../services/auth'
import { API_BASE_URL, apiRequest } from '../../../services/api'

const CONFIG = {
  p2h: { title: 'P2H Compliance', chart: 'rate' },
  wo: { title: 'Work Order Report' },
  breakdown: { title: 'Breakdown Analysis', chart: 'count' },
  cost: { title: 'Maintenance Cost' },
  utilization: { title: 'Asset Utilization' },
  mechanic: { title: 'Mechanic Performance' },
  'wo-history': { title: 'WO History' },
  'workshop-step-control': { title: 'Workshop Step Control' },
  'service-history': { title: 'Service History' },
  'downtime-analysis': { title: 'Downtime Analysis', chart: 'count' },
}

const WO_STATUS_OPTIONS = ['', 'draft', 'registered', 'triage', 'pending', 'approved', 'in_progress', 'on_hold', 'completed', 'cancelled']
const WO_TYPE_OPTIONS = ['', 'preventive', 'corrective', 'breakdown', 'inspection']
const STEP_OPTIONS = ['', 'REGISTRATION', 'APPROVAL', 'WASHING_BAY', 'INSPECTION_PKB', 'CHECKING', 'WAITING_BAY', 'CREATE_WO', 'REPAIR', 'QC', 'READY_BAY_CLOSE', 'HANDOVER', 'PLANNER_CHECK', 'KRANI_WO_JOBCARD', 'ASST_VERIFY_JOBCARD', 'KOORD_ALLOCATE_MECHANIC', 'UNIT_CHECK_PART_NEED', 'PART_SUPPLY', 'SERVICE_REPAIR', 'QC_CHECK', 'CLOSE_WO']

const swal = Swal.mixin({
  width: 420,
  customClass: {
    popup: 'rounded-2xl',
    confirmButton: 'rounded-lg',
    cancelButton: 'rounded-lg',
  },
  buttonsStyling: true,
})

function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-700/60 ${className}`} />
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'number') return Number.isInteger(value) ? value : value.toFixed(2)
  return String(value)
}

function resolveColumns(type, firstRow = {}) {
  const fixed = {
    p2h: ['code', 'name', 'total_days', 'done', 'missed', 'findings', 'rate'],
    wo: ['code', 'name', 'total_wo', 'completed_wo', 'total_cost'],
    breakdown: ['code', 'name', 'total_breakdowns', 'processed_breakdowns'],
    cost: ['code', 'name', 'completed_wo', 'total_cost'],
    utilization: ['code', 'name', 'total_wo', 'completed_wo', 'avg_service_minutes'],
    mechanic: ['mechanic_name', 'total_wo', 'completed_wo', 'sla_rate', 'balanced_score', 'total_downtime_minutes', 'total_rework'],
    'wo-history': ['wo_code', 'asset_name', 'wo_type', 'wo_status', 'total_est_minutes', 'total_actual_minutes', 'total_downtime_minutes', 'downtime_estimated_minutes', 'downtime_gap_minutes'],
    'workshop-step-control': ['wo_code', 'asset_name', 'step_code', 'step_name', 'status', 'process_in_at', 'process_out_at', 'est_minutes', 'actual_minutes', 'variance_minutes', 'downtime_minutes', 'rework_count', 'mechanic_name'],
    'service-history': ['wo_code', 'asset_name', 'wo_type', 'wo_status', 'mechanic_name', 'part_code', 'part_name', 'qty_used', 'part_cost', 'total_actual_minutes', 'total_est_minutes', 'delay_minutes', 'delay_reason'],
    'downtime-analysis': ['wo_code', 'asset_name', 'estimated_downtime_minutes', 'actual_downtime_minutes', 'downtime_gap_minutes'],
  }
  if (fixed[type]) return fixed[type]
  return Object.keys(firstRow)
}

function labelize(key) {
  return String(key).replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function buildKpis(summary, details = []) {
  const items = Object.entries(summary || {}).map(([key, value]) => ({ key, value }))
  if (items.length < 4) items.push({ key: 'total_records', value: details.length })
  if (items.length < 4) items.push({ key: 'showing_records', value: details.length })
  if (items.length < 4) items.push({ key: 'data_health', value: 'OK' })
  return items.slice(0, 4)
}

export function ReportsPage({ type = 'p2h', title }) {
  const report = CONFIG[type] || CONFIG.p2h
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [data, setData] = useState(null)
  const [generatedAt, setGeneratedAt] = useState('')

  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0])
  const [status, setStatus] = useState('')
  const [woType, setWoType] = useState('')
  const [stepCode, setStepCode] = useState('')

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type, start: dateFrom, end: dateTo })
      if (status) params.set('status', status)
      if (woType) params.set('wo_type', woType)
      if (stepCode) params.set('step_code', stepCode)
      const json = await apiRequest(`/reports/data?${params.toString()}`)
      setData(json)
      setGeneratedAt(new Date().toLocaleString('id-ID'))
      setPage(1)
    } catch (error) {
      console.error(error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  const details = data?.details || []
  const total = details.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const pageSafe = Math.min(page, lastPage)
  const paginatedDetails = useMemo(() => {
    const start = (pageSafe - 1) * perPage
    return details.slice(start, start + perPage)
  }, [details, pageSafe, perPage])

  const columns = useMemo(() => resolveColumns(type, details[0] || {}), [type, details])
  const kpis = useMemo(() => buildKpis(data?.summary || {}, details), [data, details])
  const chartCategories = useMemo(() => data?.chart?.map((c) => c.date) || [], [data])
  const chartSeries = useMemo(() => {
    if (!data?.chart || !report.chart) return []
    return [{ name: title || report.title, data: data.chart.map((c) => c[report.chart] ?? c.count ?? 0) }]
  }, [data, report, title])

  const doExport = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams({ type, start: dateFrom, end: dateTo })
      if (status) params.set('status', status)
      if (woType) params.set('wo_type', woType)
      if (stepCode) params.set('step_code', stepCode)

      const token = getBearerToken()
      const response = await fetch(`${API_BASE_URL}/reports/export?${params.toString()}`, {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          ...(token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        let message = `Gagal export report (${response.status})`
        const contentType = response.headers.get('content-type') || ''

        if (contentType.includes('application/json')) {
          const body = await response.json()
          if (typeof body?.message === 'string' && body.message) {
            message = body.message
          }
        }

        throw new Error(message)
      }

      const blob = await response.blob()
      const contentDisposition = response.headers.get('content-disposition') || ''
      const matchedFileName = contentDisposition.match(/filename="([^"]+)"/i)
      const fileName = matchedFileName?.[1] || `report_${type}_${new Date().toISOString().slice(0, 10)}.xlsx`
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      await swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error instanceof Error ? error.message : 'Gagal export report ke Excel.',
      })
    } finally {
      setExporting(false)
    }
  }

  const showStatusFilter = ['wo', 'wo-history', 'service-history'].includes(type)
  const showWoTypeFilter = ['wo', 'wo-history', 'downtime-analysis', 'service-history'].includes(type)
  const showStepFilter = type === 'workshop-step-control'

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{title || report.title}</h2>
          <p className="text-sm text-slate-500">Generate dan export laporan maintenance</p>
        </div>
        <button onClick={fetchData} disabled={loading} className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/50 disabled:opacity-60">
          {loading ? 'Memuat...' : 'Muat Ulang'}
        </button>
      </div>

      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div><label className="block text-xs text-slate-500 mb-1.5">Tanggal Mulai</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input w-full px-3 py-2.5 rounded-xl text-sm" /></div>
          <div><label className="block text-xs text-slate-500 mb-1.5">Tanggal Akhir</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input w-full px-3 py-2.5 rounded-xl text-sm" /></div>
          {showStatusFilter ? (
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Status WO</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-full px-3 py-2.5 rounded-xl text-sm">
                {WO_STATUS_OPTIONS.map((x) => <option key={x || 'all-status'} value={x}>{x || 'Semua Status'}</option>)}
              </select>
            </div>
          ) : null}
          {showWoTypeFilter ? (
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Kategori WO</label>
              <select value={woType} onChange={(e) => setWoType(e.target.value)} className="input w-full px-3 py-2.5 rounded-xl text-sm">
                {WO_TYPE_OPTIONS.map((x) => <option key={x || 'all-type'} value={x}>{x || 'Semua Kategori'}</option>)}
              </select>
            </div>
          ) : null}
          {showStepFilter ? (
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Step</label>
              <select value={stepCode} onChange={(e) => setStepCode(e.target.value)} className="input w-full px-3 py-2.5 rounded-xl text-sm">
                {STEP_OPTIONS.map((x) => <option key={x || 'all-step'} value={x}>{x || 'Semua Step'}</option>)}
              </select>
            </div>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} disabled={loading} className="btn-primary px-5 py-2.5 rounded-xl text-sm text-white">{loading ? 'Memuat...' : 'Generate Laporan'}</button>
          <button onClick={doExport} disabled={exporting} className="btn-secondary px-4 py-2.5 rounded-xl text-sm text-green-400 border-green-500/20 disabled:opacity-60">{exporting ? 'Exporting...' : 'Export Excel'}</button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-20" />)}</div>
          <SkeletonBlock className="h-64" />
          <SkeletonBlock className="h-72" />
        </div>
      ) : !data ? (
        <div className="text-center py-10 text-slate-400">Gagal memuat laporan.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpis.map(({ key, value }) => (
              <div key={key} className="stat-card p-4">
                <div className="text-2xl font-bold text-blue-400">{formatValue(value)}</div>
                <div className="text-xs text-slate-500 mt-1">{labelize(key)}</div>
              </div>
            ))}
          </div>

          {chartSeries.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold mb-4">Tren {title || report.title}</h3>
              <Chart
                type="line"
                height={250}
                series={chartSeries}
                options={{
                  chart: { background: 'transparent', toolbar: { show: false } },
                  xaxis: { categories: chartCategories, labels: { style: { colors: '#64748b', fontSize: '10px' } } },
                  colors: ['#10b981'],
                  stroke: { curve: 'smooth', width: 2 },
                  theme: { mode: 'dark' },
                  tooltip: { theme: 'dark' },
                }}
              />
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Detail {title || report.title}</h3>
              <span className="text-xs text-slate-500">{total} records {generatedAt ? `· Generated: ${generatedAt}` : ''}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    {columns.map((c) => <th key={c} className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">{labelize(c)}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {paginatedDetails.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-700/20">
                      {columns.map((c) => <td key={c} className="py-3 px-4 text-slate-300">{formatValue(row[c])}</td>)}
                    </tr>
                  ))}
                  {paginatedDetails.length === 0 ? (
                    <tr><td colSpan={Math.max(columns.length, 1)} className="py-8 text-center text-slate-400">Tidak ada data.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <div>Menampilkan {total === 0 ? 0 : ((pageSafe - 1) * perPage) + 1}-{Math.min(pageSafe * perPage, total)} dari {total} data</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe <= 1 || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50"
              >
                Prev
              </button>
              <span>Hal {pageSafe} / {lastPage}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={pageSafe >= lastPage || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
