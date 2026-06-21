import axios from 'axios'

const rawBase = import.meta.env.VITE_API_BASE_URL
export const API_BASE_URL = rawBase && rawBase.trim() ? rawBase.trim() : '/api/v1'
export const TOKEN_KEY = 'tapg-web-token'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json' },
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

function normalizeError(error) {
  if (error?.response?.data?.message) return new Error(error.response.data.message)
  if (error?.response?.status === 401) return new Error('Unauthenticated.')
  if (error?.response?.status === 403) return new Error('Forbidden.')
  if (error?.code === 'ECONNABORTED') return new Error('Koneksi ke API timeout. Cek server API dan jaringan.')
  if (error?.message === 'Network Error') return new Error('Tidak bisa terhubung ke API. Cek VITE_API_BASE_URL/proxy dan pastikan API aktif.')
  return new Error(error?.message || 'Request API gagal.')
}

export async function getJson(path, config = {}) {
  try {
    const response = await api.get(path, config)
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function postJson(path, body = {}, config = {}) {
  try {
    const response = await api.post(path, body, config)
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function putJson(path, body = {}, config = {}) {
  try {
    const response = await api.put(path, body, config)
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function revokeSession() {
  try {
    await api.post('/auth/logout')
  } catch {
    // Best-effort revoke: local session cleanup still happens on the client.
  }
}
