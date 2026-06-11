import { BAY_LABEL } from './constants'
import { fmtDate } from './utils'

function stepStatusClass(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'done' || s === 'approved') return 'wo-step-status wo-step-status-done'
  if (s === 'in_progress') return 'wo-step-status wo-step-status-in-progress'
  if (s === 'ready') return 'wo-step-status wo-step-status-ready'
  if (s === 'hold') return 'wo-step-status wo-step-status-hold'
  if (s === 'rejected') return 'wo-step-status wo-step-status-rejected'
  return 'wo-step-status wo-step-status-neutral'
}

export function WoDetailModal({ selectedWoId, setSelectedWoId, woDetailQuery }) {
  if (!selectedWoId) return null
  const detail = woDetailQuery.data?.detail
  const stepLogs = woDetailQuery.data?.process?.instances?.[0]?.step_logs || []
  const doneCount = stepLogs.filter((s) => ['done', 'approved'].includes(String(s.status || '').toLowerCase())).length
  const totalSteps = Math.max(11, stepLogs.length || 0)
  const currentStepLabel = detail?.current_step_name || detail?.step_name || ''
  const progressCount = currentStepLabel && ['registrasi kedatangan', 'approval kedatangan'].includes(String(currentStepLabel).toLowerCase()) && String(detail?.current_bay || '').toLowerCase() === 'cuci_unit' ? Math.max(3, doneCount) : doneCount
  const asset = detail?.asset || {}

  return (
    <div className="wo-modal-overlay" onClick={() => setSelectedWoId(null)}>
      <div className="wo-modal" role="dialog" aria-modal="true" aria-label="Detail work order" onClick={(e) => e.stopPropagation()}>
        <div className="wo-modal-head">
          <div>
            <div className="wo-modal-code">{asset.code || '-'} · {asset.name || '-'}</div>
            {asset.io_code ? <div className="wo-modal-sap">IO: {asset.io_code}</div> : null}
            <h3>{detail?.title || 'Detail Work Order'}</h3>
            <div className="wo-modal-asset">{detail?.code || '-'}{detail?.sap_reference_no ? ` · SAP ${detail.sap_reference_no}` : ''}</div>
          </div>
          <button type="button" className="wo-modal-close" onClick={() => setSelectedWoId(null)}>Tutup</button>
        </div>
        <div className="wo-modal-body">
          <section className="panel">
            <div className="wo-overview-grid">
              <div className="wo-overview-item">
                <span>Nomor WO</span>
                <strong>{detail?.code || '-'}</strong>
              </div>
              <div className="wo-overview-item">
                <span>No. SAP</span>
                <strong>{detail?.sap_reference_no || '-'}</strong>
              </div>
              <div className="wo-overview-item">
                <span>Asset Code</span>
                <strong>{asset.code || '-'}</strong>
              </div>
              <div className="wo-overview-item">
                <span>Asset Name</span>
                <strong>{asset.name || '-'}</strong>
              </div>
            </div>
            <h4>Flow Steps</h4>
            <div className="wo-step-progress-wrap">
              <div className="wo-step-progress-track">
                <span className="wo-step-progress-fill" style={{ width: `${Math.min(100, Math.round((progressCount / Math.max(1, totalSteps)) * 100))}%` }} />
              </div>
              <div className="wo-step-progress-text">{progressCount}/{totalSteps} selesai</div>
            </div>
            <div className="wo-step-list">
              {stepLogs.map((step) => (
                <div key={step.id} className="wo-step-item">
                  <div className="wo-step-head">
                    <strong>{step.step_name || '-'}</strong>
                    <span className={stepStatusClass(step.status)}>{step.status}</span>
                  </div>
                  <div className="wo-step-meta">IN: {fmtDate(step.process_in_at)} | OUT: {fmtDate(step.process_out_at)}</div>
                  <div className="wo-step-meta">Bay: {BAY_LABEL[step.bay_in] || step.bay_in || '-'} · DT: {step.downtime_minutes || 0}m · Rework: {step.rework_count || 0}</div>
                </div>
              ))}
              {stepLogs.length === 0 ? <div className="wo-empty">Belum ada flow step.</div> : null}
            </div>
          </section>
          <div className="wo-side-grid">
            <section className="panel">
              <h4>Metrics</h4>
              {woDetailQuery.data?.metrics ? (
                <div className="wo-metrics">
                  <div>Est: {woDetailQuery.data.metrics.total_est_minutes} menit</div>
                  <div>Actual: {woDetailQuery.data.metrics.total_actual_minutes} menit</div>
                  <div>Downtime: {woDetailQuery.data.metrics.total_downtime_minutes} menit</div>
                  <div>Late Steps: {woDetailQuery.data.metrics.late_steps}</div>
                </div>
              ) : <div className="wo-empty">Belum ada metrics.</div>}
            </section>
            <section className="panel">
              <h4>Timeline</h4>
              <div className="wo-timeline-list hide-scrollbar">
                {(woDetailQuery.data?.timeline || []).map((item, index) => (
                  <div key={`${item.type || 'x'}-${index}`} className="wo-timeline-item">
                    <div className="wo-timeline-title">{item.title || '-'}</div>
                    <div className="wo-timeline-time">{fmtDate(item.time)}</div>
                  </div>
                ))}
                {(woDetailQuery.data?.timeline || []).length === 0 ? <div className="wo-empty">Timeline kosong.</div> : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
