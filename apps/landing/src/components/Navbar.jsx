import { ThemeToggle } from './ThemeToggle'

export function Navbar({ appTitle, theme, onToggle, adminUrl, dashboardUrl }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line-soft)] bg-[color:var(--nav-bg)] backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <img src="/logo-app.png" alt="Logo App" className="h-11 w-11 shrink-0 object-contain" />
          <div className="min-w-0">
            <p className="m-0 truncate font-display text-base font-bold tracking-tight text-[var(--text-main)] sm:text-lg">{appTitle}</p>
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] sm:text-xs">Maintenance Portal</p>
          </div>
        </div>

        <div className="hidden items-center gap-1 lg:flex">
          <a className="nav-link" href="#hero">
            Beranda
          </a>
          <a className="nav-link" href="#access">
            Access
          </a>
          <a className="nav-link" href={adminUrl} target="_blank" rel="noreferrer">
            Admin
          </a>
          <a className="nav-link" href={dashboardUrl} target="_blank" rel="noreferrer">
            Dashboard
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle theme={theme} onToggle={onToggle} />
        </div>
      </nav>
    </header>
  )
}
