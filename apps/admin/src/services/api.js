import { clearAuthSession, getBearerToken } from './auth'

const rawBase = import.meta.env.VITE_API_BASE_URL
export const API_BASE_URL = rawBase && rawBase.trim() ? rawBase.trim() : '/api/v1'

export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function buildHeaders(customHeaders = {}) {
  const headers = { Accept: 'application/json', ...customHeaders }
  const token = getBearerToken()

  if (token) {
    headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
  }

  return headers
}

function extractErrorMessage(body, fallbackMessage) {
  if (!body) return fallbackMessage
  if (typeof body === 'string') return body
  if (typeof body.message === 'string' && body.message) return body.message

  if (body.errors && typeof body.errors === 'object') {
    const firstKey = Object.keys(body.errors)[0]
    const firstError = firstKey ? body.errors[firstKey] : null
    if (Array.isArray(firstError) && firstError.length > 0) return firstError[0]
    if (typeof firstError === 'string') return firstError
  }

  return fallbackMessage
}

export async function apiRequest(path, options = {}) {
  const method = options.method || 'GET'
  const headers = buildHeaders(options.headers)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const hasJson = contentType.includes('application/json')
  const body = hasJson ? await response.json() : await response.text()

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession()
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    throw new ApiError(
      extractErrorMessage(body, `Request gagal (${response.status})`),
      { status: response.status, details: body },
    )
  }

  return body
}

export function uploadWithProgress(path, file, { onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE_URL}${path}`)

    const token = getBearerToken()
    xhr.setRequestHeader('Accept', 'application/json')
    if (token) {
      xhr.setRequestHeader('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`)
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || typeof onProgress !== 'function') return
      onProgress(Math.round((event.loaded / event.total) * 100))
    }

    xhr.onload = () => {
      const raw = xhr.responseText || ''
      let body = raw
      try { body = raw ? JSON.parse(raw) : null } catch { body = raw }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body)
        return
      }

      if (xhr.status === 401) {
        clearAuthSession()
        if (window.location.pathname !== '/login') {
          window.location.replace('/login')
        }
      }

      reject(new ApiError(
        extractErrorMessage(body, `Request gagal (${xhr.status})`),
        { status: xhr.status, details: body },
      ))
    }

    xhr.onerror = () => reject(new ApiError('Jaringan bermasalah saat upload file.'))

    const form = new FormData()
    form.append('file', file)
    xhr.send(form)
  })
}
