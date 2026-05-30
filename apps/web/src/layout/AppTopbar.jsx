export function AppTopbar({ settings, now, lastUpdateAt, connectionStatus, latencyMs }) {
  const lastUpdateText = lastUpdateAt
    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'medium', hour12: false }).format(new Date(lastUpdateAt))
    : '-'
  return (
    <header className="topbar">
      <div className="brand">
        <div>
          <p className="brand-title">{settings.headerTitle}</p>
          <p className="brand-subtitle">{settings.headerSubtitle}</p>
        </div>
      </div>
      <div className="topbar-actions topbar-actions-text-only">
        <div className="datetime">
          <p>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(now)} · {new Intl.DateTimeFormat('id-ID', { timeStyle: 'medium', hour12: false }).format(now)} WIB</p>
          <p>Update Terakhir: {lastUpdateText} · <span className={`conn-${String(connectionStatus || '').toLowerCase()}`}>{connectionStatus}</span> · {Math.floor((latencyMs || 0) / 1000)}s</p>
        </div>
      </div>
    </header>
  )
}
