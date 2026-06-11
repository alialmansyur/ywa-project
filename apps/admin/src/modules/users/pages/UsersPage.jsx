import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'
import { apiRequest, ApiError, uploadWithProgress, API_BASE_URL } from '../../../services/api'
import { getBearerToken } from '../../../services/auth'
import { ModalPortal } from '../../shared/components/ModalPortal'

const DEFAULT_FORM = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: '',
  is_active: true,
  employee_code: '',
  job_code: '',
  sex: 'unknown',
  employment_status: '',
}

const PASSWORD_RULE_TEXT = 'Password minimal 8 karakter, mengandung huruf kecil, huruf besar, angka, dan simbol.'
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

const swal = Swal.mixin({
  width: 420,
  customClass: {
    popup: 'rounded-2xl',
    confirmButton: 'rounded-lg',
    cancelButton: 'rounded-lg',
  },
  buttonsStyling: true,
})

function toUser(item) {
  const role = item.roles?.[0]?.name || '-'
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone || '-',
    employeeCode: item.profile?.employee_code || '-',
    jobCode: item.profile?.job_code || '-',
    sex: item.profile?.sex || 'unknown',
    employmentStatus: item.profile?.employment_status || '-',
    role,
    isActive: Boolean(item.is_active),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    avatar: item.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() || '')
      .join(''),
  }
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusBadge(active) {
  return active
    ? <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400 border border-green-500/20">Aktif</span>
    : <span className="px-2 py-0.5 rounded-full text-xs bg-slate-500/15 text-slate-300 border border-slate-500/20">Non-aktif</span>
}

function isStrongPassword(password) {
  return PASSWORD_REGEX.test(password)
}

function generateStrongPassword(length = 14) {
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ'
  const digits = '23456789'
  const symbols = '!@#$%^&*()-_=+[]{}?'
  const all = `${lower}${upper}${digits}${symbols}`

  const required = [
    lower[Math.floor(Math.random() * lower.length)],
    upper[Math.floor(Math.random() * upper.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ]

  while (required.length < length) {
    required.push(all[Math.floor(Math.random() * all.length)])
  }

  return required.sort(() => Math.random() - 0.5).join('')
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" strokeWidth="2" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 20h4l10-10a2.1 2.1 0 10-4-4L4 16v4z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14" />
    </svg>
  )
}

function ReloadIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12a8 8 0 10-2.34 5.66M20 12v6m0-6h-6" />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.5 8.5l-8 8v3h3l1-1h2l1-1h2l1.5-1.5" />
    </svg>
  )
}

function StatusOnIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function StatusOffIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function SkeletonBox({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-700/60 ${className}`} />
}

export function UsersPage() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [view, setView] = useState('list')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [formModal, setFormModal] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importProgress, setImportProgress] = useState(0)
  const [importLoading, setImportLoading] = useState(false)

  const filtered = useMemo(() => users, [users])

  const stats = useMemo(() => ({
    total,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
  }), [users, total])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('per_page', String(perPage))
      params.set('page', String(page))
      if (query) params.set('search', query)
      if (roleFilter !== 'ALL') params.set('role', roleFilter)
      if (statusFilter !== 'ALL') params.set('is_active', String(statusFilter === 'ACTIVE'))

      const response = await apiRequest(`/users?${params.toString()}`)
      setUsers((response.data || []).map(toUser))
      setTotal(response.total || 0)
      setLastPage(response.last_page || 1)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal memuat data user.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await apiRequest('/users/roles')
      const roleList = Array.from(new Set(response.data || []))
      setRoles(roleList)
      if (!form.role && roleList.length > 0) {
        setForm((prev) => ({ ...prev, role: roleList[0] }))
      }
    } catch {
      setRoles([])
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [page, perPage, query, roleFilter, statusFilter])

  const openCreate = () => {
    setForm({ ...DEFAULT_FORM, role: roles[0] || '' })
    setFormModal({ mode: 'create', id: null })
  }

  const openEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone === '-' ? '' : user.phone,
      password: '',
      role: user.role === '-' ? (roles[0] || '') : user.role,
      is_active: user.isActive,
      employee_code: user.employeeCode === '-' ? '' : user.employeeCode,
      job_code: user.jobCode === '-' ? '' : user.jobCode,
      sex: user.sex || 'unknown',
      employment_status: user.employmentStatus === '-' ? '' : user.employmentStatus,
    })
    setFormModal({ mode: 'edit', id: user.id })
  }

  const closeForm = () => {
    if (submitLoading) return
    setFormModal(null)
    setForm(DEFAULT_FORM)
    setShowPassword(false)
  }

  const handleCopyPassword = async () => {
    if (!form.password) {
      await swal.fire({ icon: 'info', title: 'Info', text: 'Password masih kosong.' })
      return
    }

    try {
      await navigator.clipboard.writeText(form.password)
      await swal.fire({ icon: 'success', title: 'Tersalin', text: 'Password berhasil disalin.' })
    } catch {
      await swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak bisa menyalin password.' })
    }
  }

  const handleSave = async () => {
    if (!form.name || !form.email || !form.role) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Nama, email, dan role wajib diisi.' })
      return
    }

    if (formModal?.mode === 'create' && !form.password) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Password wajib diisi untuk user baru.' })
      return
    }

    if (form.password && !isStrongPassword(form.password)) {
      await swal.fire({ icon: 'warning', title: 'Password lemah', text: PASSWORD_RULE_TEXT })
      return
    }

    const confirmResult = await swal.fire({
      title: formModal?.mode === 'edit' ? 'Simpan perubahan user?' : 'Buat user baru?',
      text: 'Data akan dikirim ke server.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, lanjutkan',
      cancelButtonText: 'Batal',
    })

    if (!confirmResult.isConfirmed) return

    setSubmitLoading(true)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        role: form.role,
        is_active: form.is_active,
        employee_code: form.employee_code || null,
        job_code: form.job_code || null,
        sex: form.sex || 'unknown',
        employment_status: form.employment_status || null,
      }

      if (form.password) {
        payload.password = form.password
      }

      if (formModal?.mode === 'edit') {
        await apiRequest(`/users/${formModal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await apiRequest('/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data user berhasil disimpan.' })
      closeForm()
      await fetchUsers()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal menyimpan user.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleToggle = async (user) => {
    const confirmResult = await swal.fire({
      title: user.isActive ? 'Nonaktifkan user ini?' : 'Aktifkan user ini?',
      text: 'Perubahan status akan langsung diterapkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, lanjutkan',
      cancelButtonText: 'Batal',
    })

    if (!confirmResult.isConfirmed) return

    try {
      await apiRequest(`/users/${user.id}/toggle-active`, { method: 'PATCH' })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Status user berhasil diperbarui.' })
      await fetchUsers()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal mengubah status user.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    }
  }

  const handleDelete = async (user) => {
    const confirmResult = await swal.fire({
      title: 'Hapus user ini?',
      text: `User ${user.name} akan dihapus permanen.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    })

    if (!confirmResult.isConfirmed) return

    try {
      await apiRequest(`/users/${user.id}`, { method: 'DELETE' })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'User berhasil dihapus.' })
      if (selected?.id === user.id) setSelected(null)
      await fetchUsers()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal menghapus user.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    }
  }

  const handleResetPassword = async (user) => {
    const confirmResult = await swal.fire({
      title: 'Reset Password?',
      text: `Password untuk ${user.name} akan dikembalikan ke default (Ywa@2026).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Reset',
      cancelButtonText: 'Batal',
    })

    if (!confirmResult.isConfirmed) return

    try {
      const res = await apiRequest(`/users/${user.id}/reset-password`, { method: 'POST' })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: res.message || 'Password berhasil direset.' })
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal mereset password.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    }
  }

  const downloadImportTemplate = async () => {
    try {
      const token = getBearerToken()
      const response = await fetch(`${API_BASE_URL}/users/import-template`, {
        headers: token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error('Gagal download template.')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'user_operator_import_template.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      await swal.fire({ icon: 'error', title: 'Gagal', text: 'Template import tidak bisa diunduh.' })
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Pilih file Excel/CSV terlebih dahulu.' })
      return
    }

    setImportLoading(true)
    setImportProgress(0)
    try {
      const response = await uploadWithProgress('/users/import', importFile, {
        onProgress: (progress) => setImportProgress(progress),
      })
      const result = response?.result || {}
      await swal.fire({
        icon: 'success',
        title: 'Import selesai',
        text: `Created: ${result.created ?? 0}, Updated: ${result.updated ?? 0}, Skipped: ${result.skipped ?? 0}`,
      })
      setImportModalOpen(false)
      setImportFile(null)
      setImportProgress(0)
      await fetchUsers()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal import file user.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    } finally {
      setImportLoading(false)
    }
  }

  const handleReload = async () => {
    setHasLoaded(false)
    await fetchUsers()
  }

  const handleExportXlsx = async () => {
    try {
      const allRows = []
      let exportPage = 1
      let exportLastPage = 1

      do {
        const params = new URLSearchParams()
        params.set('per_page', '200')
        params.set('page', String(exportPage))
        if (query) params.set('search', query)
        if (roleFilter !== 'ALL') params.set('role', roleFilter)
        if (statusFilter !== 'ALL') params.set('is_active', String(statusFilter === 'ACTIVE'))

        const response = await apiRequest(`/users?${params.toString()}`)
        allRows.push(...(response.data || []).map(toUser))
        exportLastPage = response.last_page || 1
        exportPage += 1
      } while (exportPage <= exportLastPage)

      const rows = allRows.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        is_active: u.isActive ? 'active' : 'inactive',
        employee_code: u.employeeCode,
        job_code: u.jobCode,
        sex: u.sex,
        employment_status: u.employmentStatus,
        created_at: u.createdAt || '',
        updated_at: u.updatedAt || '',
      }))

      if (rows.length === 0) {
        await swal.fire({ icon: 'info', title: 'Info', text: 'Tidak ada data user untuk diexport.' })
        return
      }

      const sheet = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, sheet, 'Users')
      XLSX.writeFile(wb, `users_export_${new Date().toISOString().slice(0, 10)}.xlsx`)
      await swal.fire({ icon: 'success', title: 'Berhasil', text: `Data user berhasil diexport (${rows.length} baris).` })
    } catch {
      await swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal export user ke .xlsx.' })
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {!hasLoaded ? (
          <>
            <div className="space-y-2">
              <SkeletonBox className="h-6 w-52" />
              <SkeletonBox className="h-4 w-80" />
            </div>
            <SkeletonBox className="h-10 w-32" />
          </>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-bold">Manajemen Pengguna</h2>
              <p className="text-sm text-slate-500">Data user terhubung langsung dengan endpoint API.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReload}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/50 disabled:opacity-60 inline-flex items-center gap-2"
              >
                Muat Ulang
              </button>
              <button onClick={openCreate} className="btn-primary px-4 py-2 rounded-xl text-sm text-white inline-flex items-center gap-2">
                <PlusIcon />
                Tambah User
              </button>
              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="px-4 py-2 rounded-xl text-sm border border-blue-500/40 text-blue-300 hover:bg-blue-500/10"
              >
                Upload Excel
              </button>
              <button
                type="button"
                onClick={handleExportXlsx}
                className="px-4 py-2 rounded-xl text-sm border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
              >
                Export .xlsx
              </button>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {!hasLoaded ? (
          <>
            <div className="card p-4 space-y-2"><SkeletonBox className="h-8 w-20" /><SkeletonBox className="h-4 w-24" /></div>
            <div className="card p-4 space-y-2"><SkeletonBox className="h-8 w-20" /><SkeletonBox className="h-4 w-16" /></div>
            <div className="card p-4 space-y-2"><SkeletonBox className="h-8 w-20" /><SkeletonBox className="h-4 w-20" /></div>
          </>
        ) : (
          <>
            <div className="card p-4"><div className="text-2xl font-bold text-blue-400">{stats.total}</div><div className="text-xs text-slate-500 mt-1">Total User</div></div>
            <div className="card p-4"><div className="text-2xl font-bold text-green-400">{stats.active}</div><div className="text-xs text-slate-500 mt-1">Aktif</div></div>
            <div className="card p-4"><div className="text-2xl font-bold text-slate-300">{stats.inactive}</div><div className="text-xs text-slate-500 mt-1">Non-aktif</div></div>
          </>
        )}
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        {!hasLoaded ? (
          <>
            <SkeletonBox className="h-10 flex-1 min-w-52" />
            <SkeletonBox className="h-10 w-36" />
            <SkeletonBox className="h-10 w-36" />
            <SkeletonBox className="h-10 w-36 ml-auto" />
          </>
        ) : (
          <>
            <input value={query} onChange={(e) => { setPage(1); setQuery(e.target.value) }} placeholder="Cari nama, email, telepon..." className="input flex-1 min-w-52 px-3 py-2 rounded-xl text-sm" />
            <select value={roleFilter} onChange={(e) => { setPage(1); setRoleFilter(e.target.value) }} className="input px-3 py-2 rounded-xl text-sm min-w-36">
              <option value="ALL">Semua Role</option>
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }} className="input px-3 py-2 rounded-xl text-sm min-w-36">
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Non-aktif</option>
            </select>
            <select value={perPage} onChange={(e) => { setPage(1); setPerPage(Number(e.target.value)) }} className="input px-3 py-2 rounded-xl text-sm min-w-28">
              <option value={10}>10 / halaman</option>
              <option value={25}>25 / halaman</option>
              <option value={50}>50 / halaman</option>
            </select>
            <div className="ml-auto inline-flex rounded-xl border border-slate-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setView('list')}
                className={`px-4 py-2 text-sm ${view === 'list' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:bg-slate-700/40'}`}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setView('grid')}
                className={`px-4 py-2 text-sm ${view === 'grid' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:bg-slate-700/40'}`}
              >
                Grid
              </button>
            </div>
          </>
        )}
      </div>

      {view === 'list' && (
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee Code</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {!hasLoaded ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`skeleton-row-${index}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <SkeletonBox className="w-9 h-9 rounded-lg" />
                        <div className="space-y-1.5">
                          <SkeletonBox className="h-3 w-28" />
                          <SkeletonBox className="h-3 w-36" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-20" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-4 w-24" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-4 w-28" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-20 rounded-full" /></td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 justify-end items-center">
                        <SkeletonBox className="w-8 h-8 rounded-lg" />
                        <SkeletonBox className="w-8 h-8 rounded-lg" />
                        <SkeletonBox className="w-20 h-8 rounded-full" />
                        <SkeletonBox className="w-8 h-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-slate-400">Tidak ada data user.</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-700/20 cursor-pointer" onClick={() => setSelected(u)}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-slate-700 flex items-center justify-center text-xs font-semibold text-white">{u.avatar}</div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-blue-400">{u.role}</td>
                  <td className="py-3 px-4 text-xs text-slate-300">{u.employeeCode}</td>
                  <td className="py-3 px-4">{statusBadge(u.isActive)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end items-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(u) }}
                        className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-blue-400 border border-slate-600/70 bg-slate-700/30 hover:bg-blue-500/10"
                        title="Detail"
                        type="button"
                      >
                        <EyeIcon />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(u) }}
                        className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-yellow-400 border border-slate-600/70 bg-slate-700/30 hover:bg-yellow-500/10"
                        title="Edit"
                        type="button"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggle(u) }}
                        className={`w-8 h-8 rounded-lg inline-flex items-center justify-center border transition-colors ${
                          u.isActive
                            ? 'text-emerald-300 border-emerald-400/60 bg-emerald-500/10 hover:bg-emerald-500/20'
                            : 'text-slate-300 border-slate-500/70 bg-slate-600/20 hover:bg-slate-600/35'
                        }`}
                        title={u.isActive ? 'Nonaktifkan user' : 'Aktifkan user'}
                        type="button"
                      >
                        {u.isActive ? <StatusOnIcon /> : <StatusOffIcon />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleResetPassword(u) }}
                        className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-purple-400 border border-slate-600/70 bg-slate-700/30 hover:bg-purple-500/10"
                        title="Reset Password"
                        type="button"
                      >
                        <KeyIcon />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(u) }}
                        className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-red-400 border border-slate-600/70 bg-slate-700/30 hover:bg-red-500/10"
                        title="Hapus"
                        type="button"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <div>
          Menampilkan {users.length === 0 ? 0 : ((page - 1) * perPage) + 1}-{Math.min(page * perPage, total)} dari {total} data
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span>Hal {page} / {lastPage}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage || loading}
            className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={`grid-skeleton-${index}`} className="card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <SkeletonBox className="w-10 h-10 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <SkeletonBox className="h-3 w-28" />
                    <SkeletonBox className="h-3 w-36" />
                  </div>
                </div>
                <SkeletonBox className="h-4 w-20" />
                <SkeletonBox className="h-4 w-24" />
                <div className="flex justify-between pt-2">
                  <SkeletonBox className="h-8 w-20 rounded-full" />
                  <div className="flex gap-2">
                    <SkeletonBox className="w-8 h-8 rounded-lg" />
                    <SkeletonBox className="w-8 h-8 rounded-lg" />
                    <SkeletonBox className="w-8 h-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="card p-8 text-center text-slate-400 md:col-span-2 xl:col-span-3">Tidak ada data user.</div>
          ) : (
            filtered.map((u) => (
              <div key={u.id} className="card p-4 space-y-3 cursor-pointer hover:border-slate-600" onClick={() => setSelected(u)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-slate-700 flex items-center justify-center text-xs font-semibold text-white">{u.avatar}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-100 truncate">{u.name}</div>
                    <div className="text-xs text-slate-400 truncate">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-300">{u.role}</span>
                  {statusBadge(u.isActive)}
                </div>
                <div className="text-xs text-slate-400">{u.phone}</div>
                <div className="text-xs text-slate-500">Dibuat: {formatDate(u.createdAt)}</div>
                <div className="flex gap-2 justify-end items-center pt-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(u) }}
                    className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-blue-400 border border-slate-600/70 bg-slate-700/30 hover:bg-blue-500/10"
                    title="Detail"
                    type="button"
                  >
                    <EyeIcon />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(u) }}
                    className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-yellow-400 border border-slate-600/70 bg-slate-700/30 hover:bg-yellow-500/10"
                    title="Edit"
                    type="button"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggle(u) }}
                    className={`w-8 h-8 rounded-lg inline-flex items-center justify-center border transition-colors ${
                      u.isActive
                        ? 'text-emerald-300 border-emerald-400/60 bg-emerald-500/10 hover:bg-emerald-500/20'
                        : 'text-slate-300 border-slate-500/70 bg-slate-600/20 hover:bg-slate-600/35'
                    }`}
                    title={u.isActive ? 'Nonaktifkan user' : 'Aktifkan user'}
                    type="button"
                  >
                    {u.isActive ? <StatusOnIcon /> : <StatusOffIcon />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleResetPassword(u) }}
                    className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-purple-400 border border-slate-600/70 bg-slate-700/30 hover:bg-purple-500/10"
                    title="Reset Password"
                    type="button"
                  >
                    <KeyIcon />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(u) }}
                    className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-red-400 border border-slate-600/70 bg-slate-700/30 hover:bg-red-500/10"
                    title="Hapus"
                    type="button"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selected && (
        <ModalPortal>
        <div
          onClick={() => setSelected(null)}
          className="max-h-screen overflow-y-auto hide-scrollbar py-8"
        >
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[calc(100dvh-4rem)] overflow-y-auto hide-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <div>
                <div className="font-bold text-white">{selected.name}</div>
                <div className="text-xs text-slate-500">{selected.email}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4 text-sm">
              <div><div className="text-xs text-slate-500 mb-1">Role</div><div className="text-slate-300">{selected.role}</div></div>
              <div><div className="text-xs text-slate-500 mb-1">Status</div><div>{statusBadge(selected.isActive)}</div></div>
              <div><div className="text-xs text-slate-500 mb-1">No. HP</div><div className="text-slate-300">{selected.phone}</div></div>
              <div><div className="text-xs text-slate-500 mb-1">Employee Code</div><div className="text-slate-300">{selected.employeeCode}</div></div>
              <div><div className="text-xs text-slate-500 mb-1">Job Code</div><div className="text-slate-300">{selected.jobCode}</div></div>
              <div><div className="text-xs text-slate-500 mb-1">Sex</div><div className="text-slate-300 uppercase">{selected.sex}</div></div>
              <div><div className="text-xs text-slate-500 mb-1">Status Karyawan</div><div className="text-slate-300">{selected.employmentStatus}</div></div>
              <div><div className="text-xs text-slate-500 mb-1">Created</div><div className="text-slate-300">{formatDate(selected.createdAt)}</div></div>
              <div><div className="text-xs text-slate-500 mb-1">Updated</div><div className="text-slate-300">{formatDate(selected.updatedAt)}</div></div>
            </div>
            <div className="p-5 border-t border-slate-700 flex gap-2">
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1 py-2 rounded-xl text-sm text-slate-300">Tutup</button>
              <button onClick={() => { openEdit(selected); setSelected(null) }} className="btn-primary flex-1 py-2 rounded-xl text-sm text-white">Edit User</button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {formModal && (
        <ModalPortal>
        <div
          onClick={closeForm}
          className="max-h-screen overflow-y-auto hide-scrollbar py-8"
        >
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[calc(100dvh-4rem)] overflow-y-auto hide-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-700">
              <h3 className="font-bold text-white">{formModal.mode === 'edit' ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
            </div>
            <div className="p-5 space-y-3">
              <label className="text-xs text-slate-300">Nama Lengkap
                <input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Nama lengkap" />
              </label>
              <label className="text-xs text-slate-300">Email
                <input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" />
              </label>
              <label className="text-xs text-slate-300">No. HP
                <input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="No. HP" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-slate-300">Employee Code
                  <input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" value={form.employee_code} onChange={(e) => setForm((prev) => ({ ...prev, employee_code: e.target.value }))} placeholder="Employee Code" />
                </label>
                <label className="text-xs text-slate-300">Job Code
                  <input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" value={form.job_code} onChange={(e) => setForm((prev) => ({ ...prev, job_code: e.target.value }))} placeholder="Job Code" />
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-300">Password</label>
                <div className="flex gap-2">
                  <input className="input w-full px-3 py-2 rounded-xl text-sm" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} placeholder={formModal.mode === 'edit' ? 'Password baru (opsional)' : 'Password'} />
                  <button
                    type="button"
                    className="px-3 py-2 rounded-xl text-xs border border-slate-600 text-slate-200 hover:bg-slate-700/50"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-xl text-xs border border-slate-600 text-slate-200 hover:bg-slate-700/50"
                    onClick={() => setForm((prev) => ({ ...prev, password: generateStrongPassword() }))}
                  >
                    Generate
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-xl text-xs border border-slate-600 text-slate-200 hover:bg-slate-700/50"
                    onClick={handleCopyPassword}
                  >
                    Copy
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">{PASSWORD_RULE_TEXT}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-slate-300">Role
                  <select className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                <label className="text-xs text-slate-300">Status
                  <select className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" value={form.is_active ? 'ACTIVE' : 'INACTIVE'} onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.value === 'ACTIVE' }))}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-slate-300">Jenis Kelamin
                  <select className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" value={form.sex} onChange={(e) => setForm((prev) => ({ ...prev, sex: e.target.value }))}>
                    <option value="unknown">UNKNOWN</option>
                    <option value="male">MALE</option>
                    <option value="female">FEMALE</option>
                    <option value="other">OTHER</option>
                  </select>
                </label>
                <label className="text-xs text-slate-300">Status Karyawan
                  <input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" value={form.employment_status} onChange={(e) => setForm((prev) => ({ ...prev, employment_status: e.target.value }))} placeholder="Status Karyawan (contoh: KT)" />
                </label>
              </div>
            </div>
            <div className="p-5 border-t border-slate-700 flex gap-2">
              <button className="btn-secondary flex-1 py-2 rounded-xl text-sm" onClick={closeForm} disabled={submitLoading}>Batal</button>
              <button className="btn-primary flex-1 py-2 rounded-xl text-sm text-white" onClick={handleSave} disabled={submitLoading}>{submitLoading ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {importModalOpen && (
        <ModalPortal>
        <div
          onClick={() => !importLoading && setImportModalOpen(false)}
          className="max-h-screen overflow-y-auto hide-scrollbar py-8"
        >
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[calc(100dvh-4rem)] overflow-y-auto hide-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-700">
              <h3 className="font-bold text-white">Upload Excel User Operator</h3>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-400">Format kolom: Employee Code, Employee Name, Job Code, Sex, Status.</p>
              <button type="button" onClick={downloadImportTemplate} className="text-xs px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700/50">
                Download Template
              </button>
              <label className="text-xs text-slate-300">File Import
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="input mt-1 w-full px-3 py-2 rounded-xl text-sm"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
              </label>
              {importLoading && (
                <div className="space-y-2">
                  <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div className="h-2 bg-blue-500 transition-all duration-200" style={{ width: `${importProgress}%` }} />
                  </div>
                  <div className="text-xs text-slate-400">Upload progress: {importProgress}%</div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-700 flex gap-2">
              <button className="btn-secondary flex-1 py-2 rounded-xl text-sm" onClick={() => setImportModalOpen(false)} disabled={importLoading}>Batal</button>
              <button className="btn-primary flex-1 py-2 rounded-xl text-sm text-white" onClick={handleImport} disabled={importLoading}>
                {importLoading ? 'Mengupload...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  )
}
