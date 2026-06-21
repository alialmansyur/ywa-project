export function DashboardSkeleton({ showKpi = true }) {
  return (
    <>
      <section className="dashboard-skeleton-topbar topbar" aria-hidden="true" style={{ padding: '0.8rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="skeleton-line" style={{ width: '250px', height: '24px', borderRadius: '4px' }} />
          <div className="skeleton-line" style={{ width: '380px', height: '16px', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div className="skeleton-line" style={{ width: '220px', height: '20px', borderRadius: '4px' }} />
          <div className="skeleton-line" style={{ width: '320px', height: '14px', borderRadius: '4px' }} />
        </div>
      </section>

      {showKpi ? (
        <section className="kpi-grid dashboard-skeleton-kpis" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <article key={`kpi-skeleton-${index}`} className="kpi-card dashboard-skeleton-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem' }}>
              <div className="skeleton-line" style={{ width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div className="skeleton-line" style={{ width: '50%', height: '14px', borderRadius: '4px' }} />
                <div className="skeleton-line" style={{ width: '40%', height: '28px', borderRadius: '4px' }} />
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <main className="content dashboard-skeleton-content" aria-hidden="true" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="content-top" style={{ marginBottom: '1rem' }}>
          <div className="content-meta">
            <p className="skeleton-chip" style={{ width: '80px', height: '24px', borderRadius: '999px', background: 'var(--border)' }} />
            <p className="skeleton-chip" style={{ width: '90px', height: '24px', borderRadius: '999px', background: 'var(--border)' }} />
            <p className="skeleton-chip" style={{ width: '70px', height: '24px', borderRadius: '999px', background: 'var(--border)' }} />
          </div>
          <div className="slider-indicator segmented-control" style={{ background: 'color-mix(in srgb, var(--panel) 90%, transparent)', border: '1px solid var(--border)' }}>
            <div className="skeleton-line" style={{ width: '120px', height: '20px', margin: '6px', borderRadius: '4px' }} />
            <div className="skeleton-line" style={{ width: '120px', height: '20px', margin: '6px', borderRadius: '4px' }} />
          </div>
        </div>

        <div className="dashboard-skeleton-slide" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="slide1-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '30%' }}>
              <div className="skeleton-line" style={{ width: '100%', height: '28px', borderRadius: '4px' }} />
            </div>
            <div className="queue-toolbar" style={{ width: '350px' }}>
              <div className="skeleton-line" style={{ width: '100%', height: '42px', borderRadius: '999px' }} />
            </div>
          </div>
          
          <div className="dashboard-skeleton-table" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', background: 'var(--border)', padding: '2px' }}>
            <div className="skeleton-row" style={{ height: '45px', background: 'var(--panel)', borderRadius: '16px 16px 0 0' }} />
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`row-skeleton-${index}`} className="skeleton-row" style={{ height: '52px', background: 'color-mix(in srgb, var(--panel) 96%, transparent)' }} />
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
