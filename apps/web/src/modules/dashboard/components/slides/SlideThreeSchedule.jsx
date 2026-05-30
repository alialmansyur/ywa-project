import { DAYS, MONTHS } from '../constants'
import { fmtDate } from '../utils'

export function SlideThreeSchedule({
  settings,
  scheduleQ,
  setScheduleQ,
  scheduleStatus,
  setScheduleStatus,
  scheduleType,
  setScheduleType,
  setSelectedDay,
  setScheduleDate,
  scheduleDate,
  monthCells,
  selectedDay,
  dueNow,
  schedules,
  scheduleRows,
  isLoading,
  error,
  overdueCount,
  dueTodayCount,
  upcomingCount,
  activeCount,
  holdCount,
  overSlaCount,
  downtimeTodayMinutes,
}) {
  return (
    <section className="slide-panel slide-scrollable">
      <div className="panel-title-wrap">
        <h1 className="panel-title">{settings.slide3Title}</h1>
        <p className="panel-note">{settings.slide3Desc} · adopsi /schedule</p>
      </div>
      <section className="panel" style={{ marginBottom: '0.8rem' }}>
        <div className="tower-filter-grid schedule-filter-grid">
          <input value={scheduleQ} onChange={(e) => setScheduleQ(e.target.value)} placeholder="Cari asset/jadwal..." className="mini-input" />
          <select value={scheduleStatus} onChange={(e) => setScheduleStatus(e.target.value)} className="mini-input"><option value="">Semua status</option><option value="scheduled">scheduled</option><option value="due">due</option><option value="overdue">overdue</option><option value="completed">completed</option></select>
          <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)} className="mini-input"><option value="">Semua tipe</option><option value="preventive">preventive</option><option value="periodic">periodic</option><option value="conditional">conditional</option></select>
          <button className="mini-btn" onClick={() => { setScheduleQ(''); setScheduleStatus(''); setScheduleType(''); setSelectedDay('') }}>Reset</button>
        </div>
      </section>
      <section className="panel" style={{ marginBottom: '0.8rem' }}>
        <div className="tower-filter-grid schedule-filter-grid">
          <div className="mini-input">Due Today: <strong>{dueTodayCount}</strong></div>
          <div className="mini-input">Overdue: <strong>{overdueCount}</strong></div>
          <div className="mini-input">Upcoming 7 Hari: <strong>{upcomingCount}</strong></div>
          <div className="mini-input">WO Aktif/Hold: <strong>{activeCount}/{holdCount}</strong></div>
          <div className="mini-input">Over SLA: <strong>{overSlaCount}</strong> · Downtime: <strong>{downtimeTodayMinutes}m</strong></div>
        </div>
      </section>

      <div className="schedule-grid">
        <div className="schedule-card">
          <div className="cal-head">
            <button className="mini-btn" onClick={() => setScheduleDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>‹</button>
            <strong>{MONTHS[scheduleDate.getMonth()]} {scheduleDate.getFullYear()}</strong>
            <button className="mini-btn" onClick={() => setScheduleDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>›</button>
          </div>
          <div className="cal-grid">
            {DAYS.map((d) => <div key={d} className="cal-day">{d}</div>)}
            {monthCells.map((c, i) => (
              <button key={i} type="button" disabled={c.empty} onClick={() => !c.empty && setSelectedDay((p) => (p === c.key ? '' : c.key))} className={c.empty ? 'cal-cell empty' : `cal-cell ${selectedDay === c.key ? 'active' : ''}`}>
                {!c.empty ? <><span>{c.d}</span>{c.count > 0 ? <i>{c.count}</i> : null}</> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="schedule-list">
          {isLoading ? <div className="panel-feedback panel-feedback-loading">Memuat data jadwal...</div> : null}
          {error ? <div className="panel-feedback panel-feedback-error">Gagal memuat jadwal. Coba refresh slide aktif.</div> : null}
          <h3><span className="title-icon">⚠</span> Prioritas Preventive</h3>
          {(dueNow.length ? dueNow : schedules.slice(0, 6)).map((row) => (
            <div key={`due-${row.id}`} className="schedule-item">
              <strong>{row.asset?.code || '-'} - {row.name}</strong>
              <small>{row.type} · due: {fmtDate(row.next_due_at)} · status: {row.status}</small>
            </div>
          ))}

          <h3 style={{ marginTop: '0.9rem' }}><span className="title-icon">🗂</span> Jadwal {selectedDay ? selectedDay : 'Aktif'}</h3>
          {scheduleRows.slice(0, 10).map((row) => (
            <div key={`row-${row.id}`} className="schedule-item">
              <strong>{row.asset?.code || '-'} - {row.name}</strong>
              <small>{row.type} · {row.status} · due: {fmtDate(row.next_due_at)}</small>
            </div>
          ))}
          {scheduleRows.length === 0 && !isLoading && !error ? <div className="panel-feedback">Tidak ada jadwal sesuai filter.</div> : null}
        </div>
      </div>
    </section>
  )
}
