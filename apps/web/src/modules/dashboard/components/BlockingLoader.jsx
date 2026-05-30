export function BlockingLoader({ text = 'Memuat data terbaru...' }) {
  return (
    <div className="reload-overlay" aria-live="polite" aria-busy="true">
      <div className="reload-overlay-card">
        <span className="reload-spinner" />
        <p>{text}</p>
      </div>
    </div>
  )
}
