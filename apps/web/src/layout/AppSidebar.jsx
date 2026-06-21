import { ExitFullscreenIcon, FullscreenIcon, LogoutIcon, MoonIcon, ReloadIcon, SettingsIcon, SunIcon, EyeIcon, EyeOffIcon } from '../modules/dashboard/components/icons'

export function AppSidebar({
  theme,
  setTheme,
  isFullscreen,
  toggleFullscreen,
  handleManualReload,
  isReloading,
  openSettings,
  handleLogout,
  showKpi,
  setShowKpi,
}) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <img src="/logo-app.png" alt="Logo YWA" className="sidebar-logo-image" />
        </div>
      </div>

      <div className="sidebar-actions">
        <button type="button" className="icon-toggle reload-icon-btn" aria-label="Muat Ulang" title="Muat Ulang" onClick={handleManualReload} disabled={isReloading}><ReloadIcon /></button>
        <button type="button" className="icon-toggle" aria-label="Settings" title="Settings" onClick={openSettings}><SettingsIcon /></button>
        <button type="button" className="icon-toggle" onClick={() => setTheme((p) => (p === 'dark' ? 'light' : 'dark'))} aria-label="Toggle Theme" title="Toggle Theme">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</button>
        <button type="button" className="icon-toggle" onClick={toggleFullscreen} aria-label="Toggle Fullscreen" title="Toggle Fullscreen">{isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}</button>
        <button type="button" className="icon-toggle" onClick={() => setShowKpi((p) => !p)} aria-label="Toggle KPI" title={showKpi ? 'Sembunyikan KPI' : 'Tampilkan KPI'}>{showKpi ? <EyeOffIcon /> : <EyeIcon />}</button>
      </div>

      <div className="sidebar-bottom">
        <button type="button" className="icon-toggle" onClick={handleLogout} aria-label="Logout" title="Logout"><LogoutIcon /></button>
      </div>
    </aside>
  )
}
