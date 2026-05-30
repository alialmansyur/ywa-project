const AUTH_STORAGE_KEY = 'tapg-auth'
const AUTH_CHANGED_EVENT = 'tapg-auth-changed'

function emitAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export function getAuthSession() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    const session = JSON.parse(raw)
    if (!session?.token) return null
    return session
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function saveAuthSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  emitAuthChanged()
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  emitAuthChanged()
}

export function getBearerToken() {
  const session = getAuthSession()
  return session?.token ?? null
}

export function isAuthenticated() {
  return Boolean(getBearerToken())
}

export function subscribeAuthChange(listener) {
  window.addEventListener(AUTH_CHANGED_EVENT, listener)
  window.addEventListener('storage', listener)

  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}
