export function FooterInfo({ adminUrl, dashboardUrl, apkUrl }) {
  const year = new Date().getFullYear()

  return (
    <footer id="footer" className="mt-8 border-t border-[var(--line-soft)] py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="m-0 font-display text-2xl font-bold tracking-tight text-[var(--text-main)]">YWA</p>
          <p className="m-0 mt-3 text-sm leading-7 text-[var(--text-muted)]">
            Internal landing page untuk akses operasional yang cepat, bersih, dan konsisten di seluruh workflow maintenance.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-sm lg:items-end">
          <div className="flex flex-wrap gap-5">
            <a className="footer-link" href={adminUrl} target="_blank" rel="noreferrer">
              Admin
            </a>
            <a className="footer-link" href={dashboardUrl} target="_blank" rel="noreferrer">
              Dashboard
            </a>
            <a className="footer-link" href={apkUrl} target="_blank" rel="noreferrer">
              Mobile APK
            </a>
            <a className="footer-link" href="/apk/release-notes.json" target="_blank" rel="noreferrer">
              Release Notes
            </a>
          </div>
          <p className="m-0 text-[var(--text-faint)]">© {year} YWA Maintenance. Internal use only.</p>
        </div>
      </div>
    </footer>
  )
}
