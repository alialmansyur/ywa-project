export function SettingsModal({ show, setShow, settingsTab, setSettingsTab, settingsDraft, setSettingsDraft, saveSettings, saving = false, lockOpen = false }) {
  if (!show) return null
  return (
    <div className="settings-overlay" onClick={() => { if (!lockOpen) setShow(false) }}>
      <div className="settings-modal" role="dialog" aria-modal="true" aria-label="Pengaturan dashboard" onClick={(e) => e.stopPropagation()}>
        <h3>Dashboard Settings</h3>
        <div className="settings-tabs">
          <button type="button" className={settingsTab === 'general' ? 'active' : ''} onClick={() => setSettingsTab('general')}>General</button>
          <button type="button" className={settingsTab === 'slide1' ? 'active' : ''} onClick={() => setSettingsTab('slide1')}>Slide 1</button>
          <button type="button" className={settingsTab === 'slide2' ? 'active' : ''} onClick={() => setSettingsTab('slide2')}>Slide 2</button>
        </div>
        <div className="settings-form">
          {settingsTab === 'general' ? (
            <>
              <label>Judul Dashboard<input value={settingsDraft.headerTitle} onChange={(e) => setSettingsDraft((p) => ({ ...p, headerTitle: e.target.value }))} /></label>
              <label>Deskripsi Dashboard<input value={settingsDraft.headerSubtitle} onChange={(e) => setSettingsDraft((p) => ({ ...p, headerSubtitle: e.target.value }))} /></label>
              <label>Durasi Slider (detik)<input type="number" min="5" value={settingsDraft.sliderDurationSec} onChange={(e) => setSettingsDraft((p) => ({ ...p, sliderDurationSec: e.target.value }))} /></label>
              <label>Running Text (pisahkan dengan |)<textarea rows={3} value={settingsDraft.runningText} onChange={(e) => setSettingsDraft((p) => ({ ...p, runningText: e.target.value }))} /></label>
            </>
          ) : null}
          {settingsTab === 'slide1' ? (
            <>
              <label>Judul Slide 1<input value={settingsDraft.slide1Title} onChange={(e) => setSettingsDraft((p) => ({ ...p, slide1Title: e.target.value }))} /></label>
              <label>Deskripsi Slide 1<input value={settingsDraft.slide1Desc} onChange={(e) => setSettingsDraft((p) => ({ ...p, slide1Desc: e.target.value }))} /></label>
              <label>Kecepatan Auto Scroll<input type="number" min="4" max="120" value={settingsDraft.slide1ScrollSpeed} onChange={(e) => setSettingsDraft((p) => ({ ...p, slide1ScrollSpeed: e.target.value }))} /></label>
              <label>Delay Auto Scroll (detik)<input type="number" min="0" max="10" value={settingsDraft.slide1ScrollDelaySec} onChange={(e) => setSettingsDraft((p) => ({ ...p, slide1ScrollDelaySec: e.target.value }))} /></label>
              <label>Pause Loop (ms)<input type="number" min="0" max="5000" step="100" value={settingsDraft.slide1ScrollLoopPauseMs} onChange={(e) => setSettingsDraft((p) => ({ ...p, slide1ScrollLoopPauseMs: e.target.value }))} /></label>
            </>
          ) : null}
          {settingsTab === 'slide2' ? (
            <>
              <label>Judul Slide 2<input value={settingsDraft.slide2Title} onChange={(e) => setSettingsDraft((p) => ({ ...p, slide2Title: e.target.value }))} /></label>
              <label>Deskripsi Slide 2<input value={settingsDraft.slide2Desc} onChange={(e) => setSettingsDraft((p) => ({ ...p, slide2Desc: e.target.value }))} /></label>
            </>
          ) : null}
        </div>
        <div className="settings-actions">
          <button type="button" className="btn-md" onClick={() => setShow(false)} disabled={saving}>Batal</button>
          <button type="button" className="primary btn-xl" onClick={saveSettings} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </div>
    </div>
  )
}
