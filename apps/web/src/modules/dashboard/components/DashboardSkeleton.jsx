export function DashboardSkeleton({ showKpi = true }) {
  return (
    <>
      <section className="dashboard-skeleton-topbar" aria-hidden="true">
        <div className="skeleton-line skeleton-w-40" />
        <div className="skeleton-line skeleton-w-22" />
      </section>

      {showKpi ? (
        <section className="kpi-grid dashboard-skeleton-kpis" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <article key={`kpi-skeleton-${index}`} className="kpi-card dashboard-skeleton-card">
              <div className="skeleton-line skeleton-w-45" />
              <div className="skeleton-line skeleton-w-30" />
            </article>
          ))}
        </section>
      ) : null}

      <main className="content dashboard-skeleton-content" aria-hidden="true">
        <div className="content-top">
          <div className="content-meta">
            <p className="skeleton-chip" />
            <p className="skeleton-chip" />
            <p className="skeleton-chip" />
          </div>
          <div className="slider-indicator">
            <span className="dot skeleton-dot" />
            <span className="dot skeleton-dot" />
          </div>
        </div>
        <div className="dashboard-skeleton-slide">
          <div className="skeleton-line skeleton-w-34" />
          <div className="dashboard-skeleton-table">
            {Array.from({ length: 8 }).map((_, index) => <div key={`row-skeleton-${index}`} className="skeleton-row" />)}
          </div>
        </div>
      </main>
    </>
  )
}
