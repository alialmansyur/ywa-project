import { ExitFullscreenIcon, FullscreenIcon, LogoutIcon, MoonIcon, ReloadIcon, SettingsIcon, SunIcon, EyeIcon, EyeOffIcon, HelpIcon } from '../modules/dashboard/components/icons'

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
  onStartTour,
}) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <img src="/logo-app-transparant.png" alt="Logo YWA" className="sidebar-logo-image" />
        </div>
      </div>

      <div className="sidebar-actions">
        <button type="button" className="icon-toggle pulse-tour" onClick={onStartTour} aria-label="Tutorial" title="Tutorial Navigasi" style={{ color: "var(--accent)" }}><HelpIcon /></button>
        <button type="button" className="icon-toggle reload-icon-btn" aria-label="Muat Ulang" title="Muat Ulang" onClick={handleManualReload} disabled={isReloading}><ReloadIcon /></button>
        <button type="button" className="icon-toggle settings-btn" aria-label="Settings" title="Settings" onClick={openSettings}><SettingsIcon /></button>
        <button type="button" className="icon-toggle theme-btn" onClick={() => setTheme((p) => (p === 'dark' ? 'light' : 'dark'))} aria-label="Toggle Theme" title="Toggle Theme">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</button>
        <button type="button" className="icon-toggle fullscreen-btn" onClick={toggleFullscreen} aria-label="Toggle Fullscreen" title="Toggle Fullscreen">{isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}</button>
        <button type="button" className="icon-toggle kpi-btn" onClick={() => setShowKpi((p) => !p)} aria-label="Toggle KPI" title={showKpi ? 'Sembunyikan KPI' : 'Tampilkan KPI'}>{showKpi ? <EyeOffIcon /> : <EyeIcon />}</button>
      </div>

      <div className="sidebar-bottom">
        <button type="button" className="icon-toggle logout-btn" onClick={handleLogout} aria-label="Logout" title="Logout"><LogoutIcon /></button>
      </div>
    </aside>
  )
}
