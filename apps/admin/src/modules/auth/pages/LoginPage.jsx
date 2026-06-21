import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, ApiError } from '../../../services/api'
import { mapMeResponse, saveAuthSession } from '../../../services/auth'

const spinnerStyle = {
  display: 'inline-block',
  width: '14px',
  height: '14px',
  border: '2px solid rgba(255,255,255,0.45)',
  borderTopColor: '#ffffff',
  borderRadius: '999px',
  animation: 'ywa-login-spin 0.7s linear infinite',
}

const rotatingBenefits = [
  'MANAJEMEN\nWORK ORDER',
  'MONITORING\nASSET',
  'APPROVAL\nBERJENJANG',
  'KONTROL\nINVENTORY',
  'LAPORAN\nOPERASIONAL',
]

export function LoginPage() {
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [benefitIndex, setBenefitIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setBenefitIndex((current) => (current + 1) % rotatingBenefits.length)
    }, 1900)

    return () => window.clearInterval(intervalId)
  }, [])

  const login = async (e) => {
    e.preventDefault()
    if (loading) return
    setErrorMessage('')
    setLoading(true)
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, client_category: 'web', client_app: 'admin' }),
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
    <div
      className="login-page-shell"
      style={{
        minHeight: '100vh',
        background: '#f8fbf8',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <main className="login-layout" style={{ minHeight: '100vh', position: 'relative' }}>
        <section
          className="login-panel login-panel-copy"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            position: 'relative',
            zIndex: 1,
          }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '24rem',
              }}
            >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={{ height: '32px', display: 'flex', alignItems: 'center' }}>
                <img src="/logo-tap.png" alt="Logo TAP" style={{ height: '32px', width: 'auto', objectFit: 'contain', display: 'block' }} />
              </div>
              <div style={{ height: '32px', display: 'flex', alignItems: 'center' }}>
                <img src="/logo-ywa.png" alt="Logo YWA" style={{ height: '32px', width: 'auto', objectFit: 'contain', display: 'block' }} />
              </div>
            </div>
            <div style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
              <h1 style={{ fontSize: '2.35rem', lineHeight: 1.05, fontWeight: 700, color: '#0f172a', margin: 0 }}>Halo,<br />Selamat Datang Kembali</h1>
              <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.75rem' }}>Hai, selamat datang kembali ke ruang kerjamu.</p>
            </div>

            <form onSubmit={login} autoComplete="off" style={{ display: 'grid', gap: '1rem' }}>
              {errorMessage ? (
                <div style={{ borderRadius: '0.85rem', border: '1px solid #fca5a5', background: '#fef2f2', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#b91c1c' }}>
                  {errorMessage}
                </div>
              ) : null}

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>Email / ID Karyawan</label>
                <input
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  placeholder="nama@ywa.co.id"
                  style={{ width: '100%', height: '48px', padding: '0 0.9rem', borderRadius: '0.85rem', fontSize: '0.875rem', background: 'rgba(255, 255, 255, 0.96)', border: '1px solid #dbe4dd', color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
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
                    autoComplete="new-password"
                    placeholder="Masukkan password"
                    style={{ width: '100%', height: '48px', padding: '0 4.25rem 0 0.9rem', borderRadius: '0.85rem', fontSize: '0.875rem', background: 'rgba(255, 255, 255, 0.96)', border: '1px solid #dbe4dd', color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button
                    disabled={loading}
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', height: '32px', padding: '0 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', border: 'none', background: 'transparent', cursor: 'pointer' }}
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

              <button disabled={loading} style={{ width: '100%', height: '48px', borderRadius: '0.85rem', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.9 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.55rem', boxShadow: '0 14px 30px rgba(5, 150, 105, 0.22)' }}>
                {loading ? (
                  <>
                    <span aria-hidden="true" style={spinnerStyle} />
                    <span>Memproses...</span>
                  </>
                ) : 'Masuk ke Sistem'}
              </button>
            </form>
          </div>
        </section>

        <section
          className="login-panel login-panel-brush"
          aria-hidden="true"
          style={{
            position: 'relative',
            overflow: 'hidden',
            background:
              'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.22) 0, rgba(255, 255, 255, 0) 22%), linear-gradient(160deg, #0f9f6e 0%, #0a7a59 48%, #07503c 100%)',
          }}
        >
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              minHeight: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem',
            }}
          >
            <div style={{ width: '100%', maxWidth: '28rem', color: '#ffffff' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.82)' }}>
                Kelola seluruh proses workshop
                <br />
                secara lebih mudah, cepat, dan terintegrasi
                <br />
                dalam satu sistem untuk
              </p>
              <div style={{ marginTop: '1rem', minHeight: '6.25rem', display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                <span
                  key={rotatingBenefits[benefitIndex]}
                  className="login-benefit-text"
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    fontSize: '3.15rem',
                    lineHeight: 0.94,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {rotatingBenefits[benefitIndex]}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginTop: '1.25rem' }}>
                {rotatingBenefits.map((benefit, index) => (
                  <span
                    key={benefit}
                    style={{
                      width: index === benefitIndex ? '2rem' : '0.55rem',
                      height: '0.55rem',
                      borderRadius: '999px',
                      background: index === benefitIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                      transition: 'all 240ms ease',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              inset: '-10% -5% auto auto',
              width: '22rem',
              height: '22rem',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.14)',
              filter: 'blur(28px)',
              animation: 'ywa-login-float 10s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '-10%',
              bottom: '-12%',
              width: '26rem',
              height: '26rem',
              borderRadius: '999px',
              background: 'rgba(4, 120, 87, 0.34)',
              filter: 'blur(22px)',
              animation: 'ywa-login-float 14s ease-in-out infinite reverse',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 70% 35%, rgba(255, 255, 255, 0.16) 0, rgba(255, 255, 255, 0) 24%), radial-gradient(circle at 35% 75%, rgba(255, 255, 255, 0.08) 0, rgba(255, 255, 255, 0) 26%)',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: '-16% 18% 44% -12%',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              opacity: 0.34,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: '2% 8% 26% -22%',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              opacity: 0.3,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: '16% -2% 8% -18%',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.11)',
              opacity: 0.26,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: '34% -18% -10% -8%',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              opacity: 0.22,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: '10%',
              top: '14%',
              width: '7rem',
              height: '7rem',
              borderRadius: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(4px)',
              transform: 'rotate(18deg)',
              opacity: 0.5,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '12%',
              bottom: '14%',
              width: '1rem',
              height: '1rem',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.2)',
              boxShadow: '0 0 0 10px rgba(255, 255, 255, 0.04), 0 0 0 24px rgba(255, 255, 255, 0.03)',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '16%',
              top: '20%',
              width: '9rem',
              padding: '0.9rem 1rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(8px)',
              animation: 'ywa-login-float 12s ease-in-out infinite',
            }}
          >
            <div style={{ width: '56%', height: '0.45rem', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.72)' }} />
            <div style={{ width: '100%', height: '0.35rem', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.22)', marginTop: '0.65rem' }} />
            <div style={{ width: '84%', height: '0.35rem', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.16)', marginTop: '0.45rem' }} />
          </div>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: '12%',
              bottom: '18%',
              width: '10rem',
              padding: '1rem',
              borderRadius: '1.15rem',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              animation: 'ywa-login-float 16s ease-in-out infinite reverse',
            }}
          >
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.8rem' }}>
              <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.82)' }} />
              <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.45)' }} />
              <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.28)' }} />
            </div>
            <div style={{ width: '100%', height: '0.4rem', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.18)' }} />
            <div style={{ width: '72%', height: '0.4rem', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.58)', marginTop: '0.7rem' }} />
          </div>
        </section>
      </main>
      <style>{`
        @keyframes ywa-login-spin { to { transform: rotate(360deg); } }
        @keyframes ywa-login-float {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -14px, 0);
          }
        }
        @keyframes ywa-login-benefit-enter {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .login-layout {
          display: grid;
          grid-template-columns: minmax(0, 5fr) minmax(360px, 7fr);
        }
        .login-panel {
          min-height: 100vh;
        }
        .login-benefit-text {
          display: inline-block;
          animation: ywa-login-benefit-enter 240ms ease-out;
        }
        .login-panel-copy {
          background:
            radial-gradient(circle at top left, rgba(5, 150, 105, 0.08) 0, rgba(5, 150, 105, 0) 24%),
            linear-gradient(180deg, #fbfdfb 0%, #f4f8f5 100%);
        }
        @media (prefers-reduced-motion: reduce) {
          .login-benefit-text {
            animation: none;
          }
          .login-panel-brush * {
            animation: none !important;
            transition: none !important;
          }
        }
        @media (max-width: 900px) {
          .login-layout {
            grid-template-columns: 1fr;
          }
          .login-panel-brush {
            display: none;
          }
          .login-panel-copy {
            padding: 2rem 1rem;
            background: #f8fbf8;
          }
        }
        @media (max-width: 640px) {
          .login-page-shell img[alt="Logo TAP"],
          .login-page-shell img[alt="Logo YWA"] {
            height: 28px !important;
          }
        }
      `}</style>
    </div>
  )
}

