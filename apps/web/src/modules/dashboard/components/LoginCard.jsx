import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { postJson, TOKEN_KEY } from '../../../services/api'

const spinnerStyle = {
  display: 'inline-block',
  width: '14px',
  height: '14px',
  border: '2px solid rgba(255,255,255,0.45)',
  borderTopColor: '#ffffff',
  borderRadius: '999px',
  animation: 'ywa-login-spin 0.7s linear infinite',
}

export function LoginCard() {
  const qc = useQueryClient()
  const inputRefs = useRef([])
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    <main className="login-page">
      <div className="login-page__glow login-page__glow--left" aria-hidden="true" />
      <div className="login-page__glow login-page__glow--right" aria-hidden="true" />
      <section className="login-shell" aria-label="Form login dashboard">
        <div className="login-card__heading">
          <div className="login-brand" aria-label="Brand TPA dan YWA" style={{ display: 'none' }}>
            <img src="/logo-tap.png" alt="Logo TPA" className="login-brand__tap" />
            <img src="/logo-ywa.png" alt="Logo YWA" className="login-brand__ywa" />
          </div>
          <h1>Masuk Dashboard</h1>
          <p>Masukkan PIN akses 6 digit.</p>
        </div>

        <div className="login-card__body">
            {error ? (
              <div className="login-card__error" role="alert">
                {error}
              </div>
            ) : null}

          <div>
            <label className="login-card__label">PIN Dashboard</label>
            <div className="login-card__pin" onPaste={onPaste}>
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
                    className="login-card__digit"
                    aria-label={`Digit PIN ${index + 1}`}
                  />
                ))}
            </div>
          </div>

          {loading ? (
            <div className="login-card__loading">
              <span aria-hidden="true" style={spinnerStyle} />
              <span>Memproses...</span>
            </div>
          ) : null}
        </div>
      </section>
      <style>{'@keyframes ywa-login-spin { to { transform: rotate(360deg); } }'}</style>
    </main>
  )
}
