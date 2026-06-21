export function FooterInfo({ adminUrl, dashboardUrl, apkUrl }) {
  const year = new Date().getFullYear()

  return (
    <footer id="footer" className="mt-8 border-t border-[var(--line-soft)] py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <p className="m-0 font-display text-lg font-bold tracking-tight text-[var(--text-main)]">YWA Digital Workshop</p>
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm md:justify-start">
            <a className="footer-link" href={adminUrl} target="_blank" rel="noreferrer">Admin</a>
            <a className="footer-link" href={dashboardUrl} target="_blank" rel="noreferrer">Dashboard</a>
            <a className="footer-link" href={apkUrl} target="_blank" rel="noreferrer">Mobile App</a>
          </div>
        </div>
        <p className="m-0 text-center text-sm text-[var(--text-faint)] md:text-right">
          &copy; {year} YWA. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
