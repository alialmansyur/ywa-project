import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { TOKEN_KEY, getJson } from '../../../services/api'
import { DEFAULT_SETTINGS } from './constants'
import { elapsedSeconds, isActiveWorkshopRow, resolveBoardColumn } from './utils'
import { KpiIcon } from './icons'
import { SlideOneQueue } from './slides/SlideOneQueue'
import { SlideTwoControlTower } from './slides/SlideTwoControlTower'
import { SlideThreeSchedule } from './slides/SlideThreeSchedule'
import { SlideFourAnalyst } from './slides/SlideFourAnalyst'
import { SettingsModal } from './SettingsModal'
import { WoDetailModal } from './WoDetailModal'
import { BlockingLoader } from './BlockingLoader'
import { DashboardSkeleton } from './DashboardSkeleton'
import { AppTopbar } from '../../../layout/AppTopbar'
import { AppSidebar } from '../../../layout/AppSidebar'

export function DashboardContent({ me }) {
  const TOTAL_SLIDES = 2
  const [activeSlide, setActiveSlide] = useState(0)
  const [showKpi, setShowKpi] = useState(true)
  const [now, setNow] = useState(new Date())
  const [theme, setTheme] = useState(() => localStorage.getItem('tapg-theme') || 'dark')
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement))
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(() => {
    const raw = localStorage.getItem('tapg-dashboard-settings')
    if (!raw) return DEFAULT_SETTINGS
    try { return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } } catch { return DEFAULT_SETTINGS }
  })
  const [settingsDraft, setSettingsDraft] = useState(settings)
  const [settingsTab, setSettingsTab] = useState('general')
  const [scheduleDate, setScheduleDate] = useState(new Date())
  const [scheduleQ, setScheduleQ] = useState('')
  const [scheduleStatus, setScheduleStatus] = useState('')
  const [scheduleType, setScheduleType] = useState('')
  const [selectedDay, setSelectedDay] = useState('')
  const [towerQ, setTowerQ] = useState('')
  const [towerBay, setTowerBay] = useState('all')
  const [towerType, setTowerType] = useState('all')
  const [towerStatus, setTowerStatus] = useState('all')
  const [selectedWoId, setSelectedWoId] = useState(null)
  const [isManualReloading, setIsManualReloading] = useState(false)
  const [notifiedQueueIds, setNotifiedQueueIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tapg-dashboard-notified-queue-ids') || '[]')
    } catch {
      return []
    }
  })
  const [kpiPrev, setKpiPrev] = useState({ active: 0, completed: 0, hold: 0, late: 0, downtime: 0 })

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(clock)
  }, [])

  useEffect(() => {
    const sliderTimer = setInterval(() => setActiveSlide((prev) => (prev + 1) % TOTAL_SLIDES), Math.max(5, Number(settings.sliderDurationSec) || 20) * 1000)
    return () => clearInterval(sliderTimer)
  }, [settings.sliderDurationSec, TOTAL_SLIDES])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('theme-light', theme === 'light')
    localStorage.setItem('tapg-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('tapg-dashboard-settings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    if (!selectedWoId) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [selectedWoId])

  useEffect(() => {
    document.documentElement.classList.add('dashboard-display-root')
    return () => document.documentElement.classList.remove('dashboard-display-root')
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenEnabled) return
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
    else await document.exitFullscreen()
  }

  const towerParams = useMemo(() => {
    const params = new URLSearchParams()
    params.set('per_page', '100')
    if (towerQ.trim()) params.set('q', towerQ.trim())
    if (towerBay !== 'all') params.set('bay', towerBay)
    if (towerType !== 'all') params.set('wo_type', towerType)
    if (towerStatus !== 'all') params.set('status', towerStatus)
    return params.toString()
  }, [towerQ, towerBay, towerType, towerStatus])

  const towerQuery = useQuery({
    queryKey: ['tower-dashboard', towerParams],
    queryFn: async () => {
      const [overview, liveFeed, workOrders, bottlenecks] = await Promise.all([
        getJson('/workshop-control-tower/overview'),
        getJson('/workshop-control-tower/live-feed?limit=20'),
        getJson(`/workshop-control-tower/work-orders?${towerParams}`),
        getJson(`/workshop-control-tower/bottlenecks?${towerParams}`).catch(() => null),
      ])
      return { overview, liveFeed, workOrders, bottlenecks }
    },
    refetchInterval: 10000,
  })

  const scheduleQuery = useQuery({
    queryKey: ['dashboard-schedule', scheduleQ, scheduleStatus, scheduleType],
    queryFn: async () => {
      const params = new URLSearchParams({ per_page: '200' })
      if (scheduleQ.trim()) params.set('q', scheduleQ.trim())
      if (scheduleStatus) params.set('status', scheduleStatus)
      if (scheduleType) params.set('type', scheduleType)
      return getJson(`/schedules?${params.toString()}`)
    },
    refetchInterval: 120000,
  })

  const summaryQuery = useQuery({
    queryKey: ['dashboard-operational-summary'],
    queryFn: async () => getJson('/dashboard/workshop-operational-summary'),
    refetchInterval: 30000,
  })

  const analystQuery = useQuery({
    queryKey: ['dashboard-analyst-30d'],
    queryFn: async () => {
      return getJson('/dashboard/analyst-summary?range=30')
    },
    refetchInterval: 120000,
  })

  const woDetailQuery = useQuery({
    queryKey: ['tower-wo-detail', selectedWoId],
    enabled: Boolean(selectedWoId),
    queryFn: async () => {
      const [detail, process, timeline, metrics] = await Promise.all([
        getJson(`/work-orders/${selectedWoId}`),
        getJson(`/work-orders/${selectedWoId}/process`).catch(() => null),
        getJson(`/work-orders/${selectedWoId}/timeline`).catch(() => []),
        getJson(`/work-orders/${selectedWoId}/metrics`).catch(() => null),
      ])
      return { detail, process, timeline: Array.isArray(timeline) ? timeline : [], metrics }
    },
  })

  const towerRows = useMemo(() => (towerQuery.data?.workOrders?.data || []).filter((row) => isActiveWorkshopRow(row)), [towerQuery.data])
  const boardBuckets = useMemo(() => {
    const order = ['approval', 'washing_bay', 'inspection_pkb', 'checking', 'waiting_bay', 'create_wo', 'repair', 'qc', 'ready_bay_close', 'handover']
    const out = Object.fromEntries(order.map((bay) => [bay, []]))
    for (const row of towerRows) {
      const key = resolveBoardColumn(row)
      if (!out[key]) out[key] = []
      out[key].push(row)
    }
    for (const key of Object.keys(out)) {
      out[key] = out[key].sort((a, b) => Number(b.queue_minutes_live || 0) - Number(a.queue_minutes_live || 0))
    }
    return out
  }, [towerRows])

  const queueRows = useMemo(() => (towerQuery.data?.workOrders?.data || []).filter((row) => isActiveWorkshopRow(row)), [towerQuery.data])
  const activeCount = towerRows.length
  const holdCount = towerRows.filter((row) => String(row.wo_status || '').toLowerCase() === 'on_hold').length
  const inProgressCount = towerRows.filter((row) => String(row.wo_status || '').toLowerCase() === 'in_progress').length
  const completedCount = Number(summaryQuery.data?.wo_completed_today || 0)
  const lateCount = Number(summaryQuery.data?.late_steps_total || towerQuery.data?.overview?.late_steps || 0)
  const downtimeTodayMinutes = Number(summaryQuery.data?.downtime_today_minutes || towerQuery.data?.overview?.total_downtime_today || 0)
  const woTodayCount = Number(summaryQuery.data?.wo_today_total || 0)

  const dueNow = scheduleQuery.data?.data || []
  const dueTodayCount = Number(summaryQuery.data?.schedule_due_today_total || 0)
  const overdueCount = Number(summaryQuery.data?.schedule_overdue_total || 0)
  const upcomingCount = Number(summaryQuery.data?.schedule_upcoming_7d_total || 0)

  const monthCells = useMemo(() => {
    const y = scheduleDate.getFullYear()
    const m = scheduleDate.getMonth()
    const first = new Date(y, m, 1).getDay()
    const total = new Date(y, m + 1, 0).getDate()
    const calendarMap = {}
    for (const row of dueNow) {
      const key = row.next_due_at ? new Date(row.next_due_at).toISOString().slice(0, 10) : null
      if (!key) continue
      calendarMap[key] = (calendarMap[key] || 0) + 1
    }
    const cells = []
    for (let i = 0; i < first; i += 1) cells.push({ empty: true })
    for (let d = 1; d <= total; d += 1) {
      const dt = new Date(y, m, d)
      const key = dt.toISOString().slice(0, 10)
      cells.push({ d, key, count: calendarMap[key] || 0 })
    }
    return cells
  }, [scheduleDate, dueNow])

  const scheduleRows = useMemo(() => {
    if (!selectedDay) return dueNow
    return dueNow.filter((row) => row.next_due_at && new Date(row.next_due_at).toISOString().slice(0, 10) === selectedDay)
  }, [dueNow, selectedDay])

  const queueRowsPrepared = useMemo(() => {
    const rows = queueRows.filter((row) => {
      if (towerQ.trim()) {
        const haystack = [row.wo_code, row.sap_reference_no, row.asset_code, row.asset_name, row.step_name].filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(towerQ.trim().toLowerCase())) return false
      }
      if (towerBay !== 'all' && resolveBoardColumn(row) !== towerBay) return false
      if (towerType !== 'all' && String(row.wo_type || '').toLowerCase() !== towerType) return false
      if (towerStatus !== 'all' && String(row.wo_status || '').toLowerCase() !== towerStatus) return false
      return true
    })
    return rows
  }, [queueRows, towerQ, towerBay, towerType, towerStatus])
  const queueRowsFifo = useMemo(() => {
    return [...queueRowsPrepared].sort((a, b) => {
      const ta = new Date(a?.wo_created_at || a?.created_at || 0).getTime()
      const tb = new Date(b?.wo_created_at || b?.created_at || 0).getTime()
      if (ta !== tb) return ta - tb
      return Number(a?.wo_id || 0) - Number(b?.wo_id || 0)
    })
  }, [queueRowsPrepared])
  const overSlaCount = queueRowsPrepared.filter((row) => Number(row.queue_minutes_live || 0) > Number(row.est_minutes || 0)).length

  const runningTextItems = useMemo(() => {
    const raw = String(settings.runningText || '').trim()
    if (!raw) return []
    return raw
      .split('|')
      .map((item) => item.trim())
      .filter(Boolean)
  }, [settings.runningText])

  const connectionStatus = useMemo(() => {
    if (towerQuery.isError) return 'OFFLINE'
    if (towerQuery.isFetching || scheduleQuery.isFetching || summaryQuery.isFetching || analystQuery.isFetching) return 'SYNCING'
    return 'LIVE'
  }, [towerQuery.isError, towerQuery.isFetching, scheduleQuery.isFetching, summaryQuery.isFetching, analystQuery.isFetching])

  const latencyMs = useMemo(() => {
    const latest = Math.max(Number(towerQuery.dataUpdatedAt || 0), Number(scheduleQuery.dataUpdatedAt || 0), Number(summaryQuery.dataUpdatedAt || 0), Number(analystQuery.dataUpdatedAt || 0), Number(woDetailQuery.dataUpdatedAt || 0))
    if (!latest) return 0
    return Math.max(0, now.getTime() - latest)
  }, [towerQuery.dataUpdatedAt, scheduleQuery.dataUpdatedAt, summaryQuery.dataUpdatedAt, analystQuery.dataUpdatedAt, woDetailQuery.dataUpdatedAt, now])

  useEffect(() => {
    setKpiPrev((prev) => ({
      active: activeCount || prev.active,
      completed: completedCount || prev.completed,
      hold: holdCount || prev.hold,
      late: lateCount || prev.late,
      downtime: downtimeTodayMinutes || prev.downtime,
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [towerQuery.dataUpdatedAt, scheduleQuery.dataUpdatedAt, summaryQuery.dataUpdatedAt])

  useEffect(() => {
    const currentRows = queueRowsPrepared || []
    if (!towerQuery.dataUpdatedAt || currentRows.length === 0) return

    const knownIds = new Set((notifiedQueueIds || []).map((id) => String(id)))
    const newRows = currentRows.filter((row) => row?.wo_id && !knownIds.has(String(row.wo_id)))

    if (newRows.length === 0) return

    const newest = newRows[0]
    const newIds = newRows.map((row) => String(row.wo_id))
    Swal.fire({
      title: 'Unit Baru Masuk Workshop',
      icon: 'info',
      timer: 4500,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: { popup: 'swal-rounded' },
      html: `
        <div style="text-align:left;line-height:1.5">
          <div><b>Nama:</b> ${newest.asset_name || newest.asset?.name || '-'}</div>
          <div><b>Kode Aset:</b> ${newest.asset_code || newest.asset?.code || '-'}</div>
          <div><b>No Polisi:</b> ${newest.police_no || newest.license_plate || newest.nopol || newest.asset?.police_no || newest.asset?.license_plate || '-'}</div>
          <div><b>No Reg Workshop:</b> ${newest.wo_code || '-'}</div>
        </div>
      `,
    })

    const merged = Array.from(new Set([...(notifiedQueueIds || []).map((id) => String(id)), ...newIds]))
    setNotifiedQueueIds(merged)
    localStorage.setItem('tapg-dashboard-notified-queue-ids', JSON.stringify(merged))
  }, [towerQuery.dataUpdatedAt, queueRowsPrepared, notifiedQueueIds])

  const handleManualReload = async () => {
    setIsManualReloading(true)
    try {
      await Promise.all([towerQuery.refetch(), scheduleQuery.refetch(), summaryQuery.refetch(), analystQuery.refetch(), selectedWoId ? woDetailQuery.refetch() : Promise.resolve()])
    } finally {
      setIsManualReloading(false)
    }
  }

  const analystData = useMemo(() => {
    const days = (analystQuery.data?.trend || []).map((row) => ({
      label: row.label,
      downtime: Number(row.downtime_minutes || 0),
      woCreated: Number(row.wo_created || 0),
      woCompleted: Number(row.wo_completed || 0),
      avgQueue: Number(row.avg_queue_minutes || 0),
    }))

    const bottleneckRows = (analystQuery.data?.bottlenecks || []).slice(0, 5).map((x) => ({
      step: String(x.step_code || '-'),
      minutes: Number(x.total_downtime_minutes || 0),
    }))

    return {
      trendRows: days,
      bottleneckRows,
      statusMixRows: (analystQuery.data?.status_mix || []).map((row) => ({
        status: String(row.status || '-'),
        total: Number(row.total || 0),
      })),
      totals: {
        woCreated: Number(analystQuery.data?.totals?.wo_created || 0),
        woCompleted: Number(analystQuery.data?.totals?.wo_completed || 0),
        completionRate: Number(analystQuery.data?.totals?.completion_rate || 0),
        downtime: Number(analystQuery.data?.totals?.downtime_minutes || 0),
      },
    }
  }, [analystQuery.data])

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi Logout',
      text: 'Anda yakin ingin keluar dari dashboard?',
      icon: 'warning',
      customClass: { popup: 'swal-rounded' },
      showCancelButton: true,
      confirmButtonText: 'Ya, Logout',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#475569',
      reverseButtons: true,
    })
    if (!result.isConfirmed) return
    localStorage.removeItem(TOKEN_KEY)
    window.location.href = '/login'
  }

  const handleKpiDrilldown = (kind) => {
    if (kind === 'hold') setTowerStatus('on_hold')
    else if (kind === 'late') setTowerStatus('approved')
    else if (kind === 'active') setTowerStatus('all')
    setActiveSlide(1)
  }

  const isInitialDashboardLoading = useMemo(() => {
    const towerNotReady = !towerQuery.dataUpdatedAt && (towerQuery.isLoading || towerQuery.isFetching)
    const summaryNotReady = !summaryQuery.dataUpdatedAt && (summaryQuery.isLoading || summaryQuery.isFetching)
    return towerNotReady || summaryNotReady
  }, [towerQuery.dataUpdatedAt, towerQuery.isLoading, towerQuery.isFetching, summaryQuery.dataUpdatedAt, summaryQuery.isLoading, summaryQuery.isFetching])

  return (
    <div className="dashboard-shell dashboard-with-sidebar">
      <AppSidebar theme={theme} setTheme={setTheme} isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} handleManualReload={handleManualReload} isReloading={towerQuery.isFetching || scheduleQuery.isFetching} openSettings={() => { setSettingsDraft(settings); setSettingsTab('general'); setShowSettings(true) }} handleLogout={handleLogout} showKpi={showKpi} setShowKpi={setShowKpi} />
      <div className={showKpi ? "dashboard-main" : "dashboard-main dashboard-main-kpi-hidden"}>
        {isInitialDashboardLoading ? <DashboardSkeleton showKpi={showKpi} /> : (
          <>
            {runningTextItems.length > 0 ? <div className="running-text-wrap"><div className="running-text-track">{runningTextItems.map((text, index) => <span key={`${index}-${text}`}>{text}</span>)}</div></div> : null}
            <AppTopbar settings={settings} now={now} lastUpdateAt={Math.max(Number(towerQuery.dataUpdatedAt || 0), Number(scheduleQuery.dataUpdatedAt || 0), Number(woDetailQuery.dataUpdatedAt || 0))} connectionStatus={connectionStatus} latencyMs={latencyMs} />
            {showKpi && (
              <section className="kpi-grid">
                <article className="kpi-card kpi-clickable" role="button" tabIndex={0} onClick={() => handleKpiDrilldown('active')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleKpiDrilldown('active')}><div className="kpi-head"><span className="kpi-icon"><KpiIcon kind="queue" /></span><div className="kpi-meta"><p>Active WO</p><h3>{activeCount}</h3><small>{activeCount - kpiPrev.active >= 0 ? '+' : ''}{activeCount - kpiPrev.active}</small></div></div></article>
                <article className="kpi-card kpi-clickable kpi-critical" role="button" tabIndex={0} onClick={() => handleKpiDrilldown('late')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleKpiDrilldown('late')}><div className="kpi-head"><span className="kpi-icon"><KpiIcon kind="late" /></span><div className="kpi-meta"><p>Late Steps</p><h3>{lateCount}</h3><small>{lateCount - kpiPrev.late >= 0 ? '+' : ''}{lateCount - kpiPrev.late}</small></div></div></article>
                <article className="kpi-card kpi-clickable kpi-warning" role="button" tabIndex={0} onClick={() => handleKpiDrilldown('hold')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleKpiDrilldown('hold')}><div className="kpi-head"><span className="kpi-icon"><KpiIcon kind="hold" /></span><div className="kpi-meta"><p>On Hold</p><h3>{holdCount}</h3><small>{holdCount - kpiPrev.hold >= 0 ? '+' : ''}{holdCount - kpiPrev.hold}</small></div></div></article>
                <article className="kpi-card"><div className="kpi-head"><span className="kpi-icon"><KpiIcon kind="queue" /></span><div className="kpi-meta"><p>Completed WO (Today)</p><h3>{completedCount}</h3><small>{completedCount - kpiPrev.completed >= 0 ? '+' : ''}{completedCount - kpiPrev.completed}</small></div></div></article>
                <article className="kpi-card"><div className="kpi-head"><span className="kpi-icon"><KpiIcon kind="down" /></span><div className="kpi-meta"><p>Schedule Due Hari Ini</p><h3>{dueTodayCount}</h3><small>{dueTodayCount}</small></div></div></article>
                <article className="kpi-card"><div className="kpi-head"><span className="kpi-icon"><KpiIcon kind="down" /></span><div className="kpi-meta"><p>Downtime</p><h3>{downtimeTodayMinutes} m</h3><small>{downtimeTodayMinutes - kpiPrev.downtime >= 0 ? '+' : ''}{downtimeTodayMinutes - kpiPrev.downtime}</small></div></div></article>
              </section>
            )}
            <main className="content">
          <div className="content-top">
            <div className="content-meta"><p>Auto {settings.sliderDurationSec}s</p><p>FIFO {queueRowsPrepared.length} WO</p><p>Feed {(towerQuery.data?.liveFeed || []).length}</p></div>
            <div className="slider-indicator" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button aria-label="Pindah ke slide antrean FIFO" className={activeSlide === 0 ? 'dot active' : 'dot'} onClick={() => setActiveSlide(0)} />
              <button aria-label="Pindah ke slide control tower" className={activeSlide === 1 ? 'dot active' : 'dot'} onClick={() => setActiveSlide(1)} />
            </div>
          </div>
          <div className="slider-window">
            <div className="slider-track" style={{ '--slide-count': TOTAL_SLIDES, width: `${TOTAL_SLIDES * 100}%`, transform: `translateX(-${activeSlide * (100 / TOTAL_SLIDES)}%)` }}>
              <SlideOneQueue settings={settings} queueRows={queueRowsFifo} onRowClick={(row) => setSelectedWoId(row.wo_id)} isLoading={towerQuery.isLoading} error={towerQuery.error} now={now} />
              <SlideTwoControlTower settings={settings} towerQ={towerQ} setTowerQ={setTowerQ} towerBay={towerBay} setTowerBay={setTowerBay} towerType={towerType} setTowerType={setTowerType} towerStatus={towerStatus} setTowerStatus={setTowerStatus} laneCards={boardBuckets} setSelectedWoId={setSelectedWoId} towerPageRows={towerRows.slice(0, 12)} towerTotal={towerRows.length} towerPage={1} towerPerPage={12} setTowerPerPage={() => {}} setTowerPage={() => {}} towerLastPage={1} towerQuery={towerQuery} isLoading={towerQuery.isLoading} error={towerQuery.error} bottleneckSummary={towerQuery.data?.bottlenecks || null} />
              {/* <SlideThreeSchedule
                settings={settings}
                scheduleQ={scheduleQ}
                setScheduleQ={setScheduleQ}
                scheduleStatus={scheduleStatus}
                setScheduleStatus={setScheduleStatus}
                scheduleType={scheduleType}
                setScheduleType={setScheduleType}
                setSelectedDay={setSelectedDay}
                setScheduleDate={setScheduleDate}
                scheduleDate={scheduleDate}
                monthCells={monthCells}
                selectedDay={selectedDay}
                dueNow={dueNow}
                schedules={dueNow}
                scheduleRows={scheduleRows}
                isLoading={scheduleQuery.isLoading}
                error={scheduleQuery.error}
                overdueCount={overdueCount}
                dueTodayCount={dueTodayCount}
                upcomingCount={upcomingCount}
                activeCount={activeCount}
                holdCount={holdCount}
                overSlaCount={overSlaCount}
                downtimeTodayMinutes={downtimeTodayMinutes}
              />
              <SlideFourAnalyst settings={settings} analystData={analystData} isLoading={analystQuery.isLoading} error={analystQuery.error} /> */}
            </div>
          </div>
            </main>
          </>
        )}
      </div>
      <SettingsModal show={showSettings} setShow={setShowSettings} settingsTab={settingsTab} setSettingsTab={setSettingsTab} settingsDraft={settingsDraft} setSettingsDraft={setSettingsDraft} saveSettings={() => { setSettings({ ...settingsDraft, sliderDurationSec: Number(settingsDraft.sliderDurationSec) || DEFAULT_SETTINGS.sliderDurationSec, slide1ScrollSpeed: Number(settingsDraft.slide1ScrollSpeed) || DEFAULT_SETTINGS.slide1ScrollSpeed, slide1ScrollDelaySec: Number(settingsDraft.slide1ScrollDelaySec) || DEFAULT_SETTINGS.slide1ScrollDelaySec, slide1ScrollLoopPauseMs: Number(settingsDraft.slide1ScrollLoopPauseMs) || DEFAULT_SETTINGS.slide1ScrollLoopPauseMs }); setShowSettings(false) }} lockOpen={showSettings} />
      <WoDetailModal selectedWoId={selectedWoId} setSelectedWoId={setSelectedWoId} woDetailQuery={woDetailQuery} />
      {isManualReloading ? <BlockingLoader text="Memuat data terbaru..." /> : null}
    </div>
  )
}
