import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { postJson, TOKEN_KEY } from '../../../services/api'
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

export function LoginCard() {
  const qc = useQueryClient()
  const inputRefs = useRef([])
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ywaLogoError, setYwaLogoError] = useState(false)

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const submitPin = async (pinValue) => {
    if (loading || pinValue.length !== 6) return
    setLoading(true)
    setError('')
    try {
      const res = await postJson('/auth/dashboard-token/login', { pin: pinValue })
      const token = res?.access_token || res?.token
      if (!token) throw new Error('Token login tidak ditemukan.')
      localStorage.setItem(TOKEN_KEY, String(token).replace(/^Bearer\s+/i, ''))
      await qc.invalidateQueries()
    } catch (err) {
      setError(String(err.message || err))
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const onDigitChange = (index, rawValue) => {
    const val = String(rawValue || '').replace(/\D/g, '')
    if (!val) {
      setDigits((prev) => {
        const next = [...prev]
        next[index] = ''
        return next
      })
      return
    }

    const chars = val.slice(0, 6).split('')
    setDigits((prev) => {
      const next = [...prev]
      let pointer = index
      chars.forEach((char) => {
        if (pointer < 6) {
          next[pointer] = char
          pointer += 1
        }
      })

      if (pointer < 6) {
        inputRefs.current[pointer]?.focus()
      } else {
        const pin = next.join('')
        submitPin(pin)
      }

      return next
    })
  }

  const onKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setDigits((prev) => {
        const next = [...prev]
        next[index - 1] = ''
        return next
      })
    }
  }

  const onPaste = (event) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = ['', '', '', '', '', '']
    pasted.split('').forEach((char, idx) => {
      next[idx] = char
    })
    setDigits(next)
    if (pasted.length === 6) {
      submitPin(pasted)
      return
    }
    inputRefs.current[pasted.length]?.focus()
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

      <main style={{ minHeight: 'calc(100vh - 56px)', padding: '2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '24rem', padding: '1.25rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.35rem', lineHeight: 1.05, fontWeight: 700, color: '#0f172a', margin: 0 }}>Masuk Dashboard</h1>
            <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.75rem' }}>Masukkan PIN akses 6 digit.</p>
          </div>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '1.75rem' }}>
            {error ? (
              <div style={{ borderRadius: '0.5rem', border: '1px solid #fca5a5', background: '#fef2f2', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#b91c1c' }}>
                {error}
              </div>
            ) : null}

            <div>
              <label style={{ display: 'block', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.7rem' }}>PIN Dashboard</label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.45rem' }} onPaste={onPaste}>
                {digits.map((digit, index) => (
                  <input
                    key={`pin-${index}`}
                    ref={(el) => { inputRefs.current[index] = el }}
                    disabled={loading}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onKeyDown={(event) => onKeyDown(index, event)}
                    onChange={(event) => onDigitChange(index, event.target.value)}
                    style={{
                      width: '46px',
                      height: '54px',
                      textAlign: 'center',
                      borderRadius: '0.5rem',
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      color: '#1e293b',
                    }}
                  />
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ width: '100%', height: '44px', borderRadius: '0.5rem', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.875rem', border: 'none', opacity: 0.9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.55rem' }}>
                <span aria-hidden="true" style={spinnerStyle} />
                <span>Memproses...</span>
              </div>
            ) : null}
          </div>
        </div>
      </main>
      <style>{'@keyframes tapg-login-spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  )
}
