import { BAY_LABEL } from './constants'
import { fmtDate } from './utils'

const KPI_DETAIL_MAP = {
  active_wo: {
    title: 'Active WO',
    description: 'Daftar work order yang masih aktif di workshop.',
    columns: ['WO', 'Unit', 'Step', 'Bay', 'Queue', 'Status'],
    buildRows: (items) => items.map((item) => ([
      item.wo_code || '-',
      `${item.asset_code || '-'}${item.asset_name ? ` · ${item.asset_name}` : ''}`,
      item.step_name || '-',
      BAY_LABEL[item.current_bay] || item.current_bay || '-',
      `${item.queue_minutes_live || 0}m / ${item.est_minutes || 0}m`,
      String(item.wo_status || '-').toUpperCase(),
    ])),
  },
  late_steps: {
    title: 'Late Steps',
    description: 'Step hari ini yang actual-nya melebihi estimasi.',
    columns: ['WO', 'Unit', 'Step', 'EST', 'ACT', 'Gap'],
    buildRows: (items) => items.map((item) => ([
      item.wo_code || '-',
      `${item.asset_code || '-'}${item.asset_name ? ` · ${item.asset_name}` : ''}`,
      item.step_name || '-',
      `${item.est_minutes || 0}m`,
      `${item.actual_minutes || 0}m`,
      `+${item.gap_minutes || 0}m`,
    ])),
  },
  on_hold: {
    title: 'On Hold',
    description: 'WO aktif yang sedang tertahan di workshop.',
    columns: ['WO', 'Unit', 'Step', 'Bay', 'Queue', 'Update'],
    buildRows: (items) => items.map((item) => ([
      item.wo_code || '-',
      `${item.asset_code || '-'}${item.asset_name ? ` · ${item.asset_name}` : ''}`,
      item.step_name || '-',
      BAY_LABEL[item.current_bay] || item.current_bay || '-',
      `${item.queue_minutes_live || 0}m`,
      fmtDate(item.updated_at),
    ])),
  },
  completed_today: {
    title: 'Completed WO (Today)',
    description: 'WO yang selesai hari ini.',
    columns: ['WO', 'Unit', 'Tipe', 'Judul', 'Selesai'],
    buildRows: (items) => items.map((item) => ([
      item.wo_code || '-',
      `${item.asset_code || '-'}${item.asset_name ? ` · ${item.asset_name}` : ''}`,
      item.wo_type || '-',
      item.wo_title || '-',
      fmtDate(item.completed_at),
    ])),
  },
  schedule_due_today: {
    title: 'Schedule Due Hari Ini',
    description: 'Jadwal maintenance yang jatuh tempo hari ini.',
    columns: ['Schedule', 'Unit', 'Tipe', 'Due', 'Status', 'WO Aktif'],
    buildRows: (items) => items.map((item) => ([
      item.name || '-',
      `${item.asset_code || '-'}${item.asset_name ? ` · ${item.asset_name}` : ''}`,
      item.type || '-',
      fmtDate(item.next_due_at),
      String(item.status || '-').toUpperCase(),
      item.active_wo_code || '-',
    ])),
  },
}

export function KpiDetailModal({ selectedKpiKey, setSelectedKpiKey, kpiDetailQuery }) {
  if (!selectedKpiKey) return null

  const config = KPI_DETAIL_MAP[selectedKpiKey]
  const items = kpiDetailQuery.data?.kpis?.[selectedKpiKey] || []
  const rows = config ? config.buildRows(items) : []

  return (
    <div className="wo-modal-overlay" onClick={() => setSelectedKpiKey(null)}>
      <div className="wo-modal kpi-detail-modal" role="dialog" aria-modal="true" aria-label={config?.title || 'Detail KPI'} onClick={(e) => e.stopPropagation()}>
        <div className="wo-modal-head">
          <div>
            <div className="wo-modal-code">KPI Dashboard</div>
            <h3>{config?.title || 'Detail KPI'}</h3>
            <div className="wo-modal-asset">{config?.description || 'Detail data KPI.'}</div>
          </div>
          <button type="button" className="wo-modal-close" onClick={() => setSelectedKpiKey(null)}>Tutup</button>
        </div>
        <div className="wo-modal-body kpi-detail-body">
          <section className="panel">
            <div className="kpi-detail-summary">
              <div className="wo-overview-item">
                <span>Total Data</span>
                <strong>{items.length}</strong>
              </div>
              <div className="wo-overview-item">
                <span>Generated</span>
                <strong>{fmtDate(kpiDetailQuery.data?.generated_at)}</strong>
              </div>
            </div>
            {kpiDetailQuery.isLoading ? <div className="panel-feedback panel-feedback-loading">Memuat detail KPI...</div> : null}
            {kpiDetailQuery.error ? <div className="panel-feedback panel-feedback-error">Gagal memuat detail KPI.</div> : null}
            {!kpiDetailQuery.isLoading && !kpiDetailQuery.error ? (
              <div className="table-wrap">
                <table className="tower-active-table">
                  <thead>
                    <tr>
                      {config.columns.map((column) => <th key={column}>{column}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr key={`${selectedKpiKey}-${rowIndex}`}>
                        {row.map((cell, cellIndex) => <td key={`${selectedKpiKey}-${rowIndex}-${cellIndex}`}>{cell}</td>)}
                      </tr>
                    ))}
                    {rows.length === 0 ? <tr><td colSpan={config.columns.length} className="tower-empty-row">Tidak ada data untuk KPI ini.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}
