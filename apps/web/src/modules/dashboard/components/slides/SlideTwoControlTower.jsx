import { useMemo } from 'react'
import { BAY_LABEL, CONTROL_TOWER_BOARD_ORDER } from '../constants'
import { eventLabel, fmtDate } from '../utils'

export function SlideTwoControlTower({
  settings,
  towerQ,
  setTowerQ,
  towerBay,
  setTowerBay,
  towerType,
  setTowerType,
  towerStatus,
  setTowerStatus,
  laneCards,
  setSelectedWoId,
  towerRows,
  towerQuery,
  isLoading,
  error,
  bottleneckSummary,
}) {
  const boardColumns = useMemo(() => CONTROL_TOWER_BOARD_ORDER, [])

  return (
    <section className="slide-panel tower-slide-page">
      <div className="panel-title-wrap">
        <h1 className="panel-title">{settings.slide2Title}</h1>
        <p className="panel-note">{settings.slide2Desc} · adopsi penuh /workshop-control-tower</p>
        <p className="panel-micro">Bottleneck: {bottleneckSummary?.step || '-'} · Late {bottleneckSummary?.late || 0} · Hold {bottleneckSummary?.hold || 0}</p>
      </div>

      {/* <section className="panel tower-kpi-panel">
        <div className="tower-kpi-grid">
          <div className="tower-kpi-item"><span>Active WO</span><strong>{towerQuery.data?.overview?.active_wo || 0}</strong></div>
          <div className="tower-kpi-item"><span>WO Selesai</span><strong>{towerQuery.data?.overview?.completed_wo || 0}</strong></div>
          <div className="tower-kpi-item"><span>On Hold</span><strong>{towerQuery.data?.overview?.hold_wo || 0}</strong></div>
          <div className="tower-kpi-item"><span>Late Steps</span><strong>{towerQuery.data?.overview?.late_steps || 0}</strong></div>
          <div className="tower-kpi-item"><span>Downtime Today</span><strong>{towerQuery.data?.overview?.total_downtime_today || 0}m</strong></div>
        </div>
      </section> */}

      <section className="panel tower-filter-panel">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="tower-filter-grid tower-filter-strip">
            <input value={towerQ} onChange={(e) => { setTowerQ(e.target.value) }} placeholder="Cari code, io_code, name, WO, SAP, step..." className="mini-input" />
            <select value={towerBay} onChange={(e) => { setTowerBay(e.target.value) }} className="mini-input">
              <option value="all">Semua Bay</option>
              {boardColumns.map((b) => <option key={b} value={b}>{BAY_LABEL[b]}</option>)}
            </select>
            <select value={towerType} onChange={(e) => { setTowerType(e.target.value) }} className="mini-input">
              <option value="all">Semua Tipe WO</option>
              <option value="preventive">preventive</option>
              <option value="corrective">corrective</option>
              <option value="breakdown">breakdown</option>
              <option value="inspection">inspection</option>
            </select>
            <select value={towerStatus} onChange={(e) => { setTowerStatus(e.target.value) }} className="mini-input">
              <option value="all">Semua Status WO</option>
              <option value="registered">registered</option>
              <option value="triage">triage</option>
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="in_progress">in_progress</option>
              <option value="on_hold">on_hold</option>
            </select>
          </div>
        </div>
      </section>

      <section className="panel tower-board-panel">
        <div className="tower-board" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          {boardColumns.map((bay) => (
            <div key={bay} className="tower-bay-card">
              <div className="tower-bay-head">
                <strong>{BAY_LABEL[bay]}</strong>
                <span>{(laneCards[bay] || []).length}</span>
              </div>
              <div className="tower-bay-list">
                {(laneCards[bay] || []).slice(0, 6).map((row) => (
                  <button type="button" key={`${bay}-${row.wo_id}`} className="tower-wo-item tower-wo-button" onClick={() => setSelectedWoId(row.wo_id)}>
                    <div className="tower-wo-code">{row.asset_code || '-'}</div>
                    <div className="tower-wo-name">{row.asset_name || '-'}</div>
                    <div className="tower-wo-sub">{row.step_name || '-'} · {String(row.wo_status || '-').toUpperCase()}</div>
                    <div className="tower-wo-sub">Queue {row.queue_minutes_live || 0}m / EST {row.est_minutes || 0}m</div>
                  </button>
                ))}
                {(laneCards[bay] || []).length === 0 ? <div className="tower-empty">Kosong</div> : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="tower-main-grid">
        <section className="panel tower-table-panel">
          <h3>Antrian WO Aktif</h3>
          {isLoading ? <div className="panel-feedback panel-feedback-loading">Memuat data control tower...</div> : null}
          {error ? <div className="panel-feedback panel-feedback-error">Gagal memuat control tower. Coba refresh slide aktif.</div> : null}
          <div className="table-wrap tower-table-scroll-pane">
            <table className="tower-active-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Bay</th>
                  <th>Step</th>
                  <th>Queue</th>
                  <th>Downtime</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {towerRows.map((row) => (
                  <tr key={`s2-${row.wo_id}`}>
                    <td>
                      <div className="unit-name">{row.asset_code || '-'}</div>
                      <div className="unit-sub">{row.asset_name || '-'}</div>
                    </td>
                    <td>{BAY_LABEL[row.current_bay] || row.current_bay || '-'}</td>
                    <td>{row.step_name || '-'}</td>
                    <td>{row.queue_minutes_live || 0}m / {row.est_minutes || 0}m</td>
                    <td>{row.downtime_minutes || 0}m</td>
                    <td className="tower-status">{String(row.wo_status || '-').toUpperCase()}</td>
                  </tr>
                ))}
                {towerRows.length === 0 ? <tr><td colSpan={6} className="tower-empty-row">Tidak ada data antrean.</td></tr> : null}
              </tbody>
            </table>
          </div>
          <div className="tower-pagination">
            <div>Menampilkan {towerRows.length} data aktif. Tabel mengikuti scroll kontainer dashboard.</div>
          </div>
        </section>

        <section className="panel tower-feed-panel">
          <h3>Live Feed</h3>
          <div className="tower-feed-list hide-scrollbar">
            {(towerQuery.data?.liveFeed || []).map((event) => (
              <div key={event.id} className="tower-feed-event">
                <div className="tower-feed-title">{eventLabel(event.event_key)} · {event.wo_code}</div>
                <div className="tower-feed-meta">{event.actor_name || 'system'} · {fmtDate(event.triggered_at)}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
