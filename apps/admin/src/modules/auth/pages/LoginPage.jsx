import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, ApiError } from '../../../services/api'
import { mapMeResponse, saveAuthSession } from '../../../services/auth'
import { PlatformBadge } from '../../shared/components/PlatformBadge'

const spinnerStyle = {
  display: 'inline-block',
  width: '14px',
  height: '14px',
  border: '2px solid rgba(255,255,255,0.45)',
  borderTopColor: '#ffffff',
  borderRadius: '999px',
  animation: 'tapg-login-spin 0.7s linear infinite',
}

export function LoginPage() {
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ywaLogoError, setYwaLogoError] = useState(false)

  const login = async (e) => {
    e.preventDefault()
    if (loading) return
    setErrorMessage('')
    setLoading(true)
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, client_category: 'web' }),
      })

      const rawToken = response.access_token || response.token
      if (!rawToken) {
        throw new ApiError('Token login tidak ditemukan pada response.', { status: 500, details: response })
      }

      const normalizedToken = rawToken.replace(/^Bearer\s+/i, '')

      saveAuthSession({
        token: normalizedToken,
        tokenType: response.token_type || 'Bearer',
        user: mapMeResponse(response.user || null),
      })

      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Terjadi kendala saat menghubungi server. Silakan coba lagi.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8faf8', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <header style={{ height: '56px', borderBottom: '1px solid rgba(148, 163, 184, 0.22)', background: '#fff', padding: '0 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo-tap.png" alt="Logo TAP" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          {!ywaLogoError ? (
            <img
              src="/logo-ywa.png"
              alt="Logo YWA"
              style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
              onError={() => setYwaLogoError(true)}
            />
          ) : (
            <div style={{ height: '28px', padding: '0 0.5rem', borderRadius: '6px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              YWA
            </div>
          )}
        </div>
        <PlatformBadge />
      </header>

      <main style={{ minHeight: 'calc(100vh - 56px)', padding: '2rem 1rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '24rem', padding: '1.25rem' }}>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '2.35rem', lineHeight: 1.05, fontWeight: 700, color: '#0f172a', margin: 0 }}>Halo,<br />Selamat Datang Kembali</h1>
            <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.75rem' }}>Hai, selamat datang kembali ke ruang kerjamu.</p>
          </div>

          <form onSubmit={login} style={{ display: 'grid', gap: '1rem', marginTop: '1.75rem' }}>
            {errorMessage ? (
              <div style={{ borderRadius: '0.5rem', border: '1px solid #fca5a5', background: '#fef2f2', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#b91c1c' }}>
                {errorMessage}
              </div>
            ) : null}

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>Email / ID Karyawan</label>
              <input
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@tapg.co.id"
                style={{ width: '100%', height: '44px', padding: '0 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  disabled={loading}
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  style={{ width: '100%', height: '44px', padding: '0 4rem 0 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' }}
                />
                <button
                  disabled={loading}
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', height: '32px', padding: '0 0.625rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', border: 'none', background: 'transparent', cursor: 'pointer' }}
                >
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                <input disabled={loading} type="checkbox" defaultChecked style={{ width: '1rem', height: '1rem', accentColor: '#059669' }} />
                Remember me
              </label>
              <button disabled={loading} type="button" style={{ fontWeight: 600, color: '#047857', border: 'none', background: 'transparent', cursor: 'pointer' }}>Forgot Password?</button>
            </div>

            <button disabled={loading} style={{ width: '100%', height: '44px', borderRadius: '0.5rem', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.9 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.55rem' }}>
              {loading ? (
                <>
                  <span aria-hidden="true" style={spinnerStyle} />
                  <span>Memproses...</span>
                </>
              ) : 'Masuk ke Sistem'}
            </button>
          </form>
        </div>
      </main>
      <style>{'@keyframes tapg-login-spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  )
}

