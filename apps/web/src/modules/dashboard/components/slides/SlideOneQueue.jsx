import { useEffect, useRef, useState } from 'react'
import { elapsedSeconds, fmtElapsed, statusClass, stepCompactLabel, stepNumberFromRow } from '../utils'

export function SlideOneQueue({ settings, towerQ, setTowerQ, queueRows, onRowClick, isLoading, error, now }) {
  const tableWrapRef = useRef(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (!queueRows?.length || isLoading) return undefined

    const wrap = tableWrapRef.current
    if (!wrap) return undefined

    let animationFrameId = 0
    let lastTime = performance.now()
    const speed = Math.max(4, Number(settings.slide1ScrollSpeed) || 24) * (isExpanded ? 1.25 : 1)
    const startDelayMs = Math.max(0, Number(settings.slide1ScrollDelaySec) || 1) * 1000

    const scroll = (time) => {
      const delta = Math.max(0, (time - lastTime) / 1000)
      lastTime = time

      const maxScrollTop = Math.max(0, wrap.scrollHeight - wrap.clientHeight)
      if (maxScrollTop > 0) {
        const nextTop = wrap.scrollTop + speed * delta
        wrap.scrollTop = nextTop >= maxScrollTop - 1 ? 0 : nextTop
      }

      animationFrameId = requestAnimationFrame(scroll)
    }

    const startId = window.setTimeout(() => {
      lastTime = performance.now()
      animationFrameId = requestAnimationFrame(scroll)
    }, startDelayMs)

    return () => {
      clearTimeout(startId)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [queueRows, isLoading, isExpanded, settings.slide1ScrollSpeed, settings.slide1ScrollDelaySec])

  return (
    <section className="slide-panel">
      <div className="panel-title-wrap slide1-head" style={{ borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="panel-title">{settings.slide1Title}</h1>
          <p className="panel-note">{settings.slide1Desc}</p>
        </div>
        <div className="queue-toolbar" style={{ marginBottom: 0, minWidth: '350px' }}>
          <input
            value={towerQ}
            onChange={(e) => { setTowerQ(e.target.value) }}
            placeholder="Cari code, io_code, name, WO, SAP, step..."
            className="mini-input queue-search-input"
            style={{ width: '100%' }}
          />
        </div>
      </div>
      <section className={isExpanded ? 'queue-panel queue-panel-expanded' : 'queue-panel'}>
        {isLoading ? <div className="panel-feedback panel-feedback-loading">Memuat data queue...</div> : null}
        {error ? <div className="panel-feedback panel-feedback-error">Gagal memuat queue. Coba refresh slide aktif.</div> : null}
        <div className="table-wrap queue-desktop-table queue-auto-scroll" ref={tableWrapRef}>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Code</th>
                <th>Name</th>
                <th>Step</th>
                <th>Time In</th>
                <th className="text-right">Elapsed</th>
                <th className="text-right">SLA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(queueRows || []).map((row, idx) => (
                <tr key={row.wo_id} className="clickable-row" onClick={() => onRowClick(row)}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="unit-name">{row.asset_code || row.asset?.code || '-'}</div>
                    <div className="unit-sub">IO: {row.asset_io_code || row.asset?.io_code || '-'}</div>
                  </td>
                  <td>
                    <div className="unit-name">{row.asset_name || row.asset?.name || '-'}</div>
                    <div className="unit-sub">{row.police_no || row.license_plate || row.nopol || row.asset?.police_no || row.asset?.license_plate || '-'}</div>
                  </td>
                  <td>{stepCompactLabel(row)} (Step {stepNumberFromRow(row)}/11)<br />{row.step_name || '-'}</td>
                  <td>{row.wo_created_at ? new Date(row.wo_created_at).toLocaleTimeString('id-ID', { hour12: false }) : '-'}</td>
                  <td className="text-right queue-timer">{fmtElapsed(elapsedSeconds(row, now.getTime()))}</td>
                  <td className={Number(row.queue_minutes_live || 0) > Number(row.est_minutes || 0) ? 'text-right queue-over' : 'text-right queue-safe'}>
                    {row.queue_minutes_live || 0}m / {row.est_minutes || 0}m
                    <div className="sla-progress">
                      <span className={Number(row.queue_minutes_live || 0) > Number(row.est_minutes || 0) ? 'bar over' : 'bar safe'} style={{ width: `${Math.min(100, Math.round((Number(row.queue_minutes_live || 0) / Math.max(1, Number(row.est_minutes || 0))) * 100))}%` }} />
                    </div>
                  </td>
                  <td>
                    <span className={Number(row.queue_minutes_live || 0) > Number(row.est_minutes || 0) ? 'status-badge status-badge-over' : 'status-badge status-badge-safe'}>
                      {String(row.wo_status || '-').toUpperCase()} · {statusClass(Number(row.queue_minutes_live || 0), Number(row.est_minutes || 0))}
                    </span>
                  </td>
                </tr>
              ))}
              {(queueRows || []).length === 0 ? <tr><td colSpan={8} className="tower-empty-row">Tidak ada data queue.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}
