export function ModulePage({ title, subtitle }) {
  return (
    <div className="module-page">
      <div className="page-card">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="grid-cards">
        <div className="page-card">Widget 1</div>
        <div className="page-card">Widget 2</div>
        <div className="page-card">Widget 3</div>
      </div>
    </div>
  )
}
