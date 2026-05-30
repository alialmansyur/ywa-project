import { useEffect, useRef, useState } from 'react'
import { getCurrentPlatform, navigateToPlatform } from '../../../utils/platformSwitch'

export function PlatformBadge() {
  const [openMenu, setOpenMenu] = useState(false)
  const menuRef = useRef(null)
  const currentPlatform = getCurrentPlatform()

  const isAdmin = currentPlatform === 'admin'
  const badgeText = isAdmin ? 'Admin Panel' : 'Dashboard Panel'

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpenMenu((v) => !v)}
        style={{
          border: 'none',
          background: 'transparent',
          color: '#334155',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '18px',
          fontWeight: 700,
          cursor: 'pointer',
          padding: 0,
          lineHeight: 1,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
        title={`Current: ${badgeText}`}
      >
        <span>{badgeText}</span>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ display: 'block', color: '#94a3b8' }}>
          <path d={openMenu ? 'M5 12L10 7L15 12' : 'M5 8L10 13L15 8'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {openMenu && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '0.5rem',
            minWidth: '220px',
            borderRadius: '0.75rem',
            border: '1px solid rgba(71, 85, 105, 0.25)',
            background: '#ffffff',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
            zIndex: 100,
            overflow: 'hidden',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          <div style={{ padding: '0.5rem 0' }}>
            <button
              type="button"
              onClick={() => {
                setOpenMenu(false)
                if (!isAdmin) navigateToPlatform('admin')
              }}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                background: isAdmin ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                color: isAdmin ? '#047857' : '#334155',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isAdmin ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>Admin Panel</span>
              {isAdmin && <span style={{ marginLeft: 'auto' }}>Active</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                setOpenMenu(false)
                if (isAdmin) navigateToPlatform('web')
              }}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                background: !isAdmin ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                color: !isAdmin ? '#047857' : '#334155',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: 600,
                cursor: !isAdmin ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>Dashboard Panel</span>
              {!isAdmin && <span style={{ marginLeft: 'auto' }}>Active</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
