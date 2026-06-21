import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { apiRequest, ApiError } from '../../../services/api'

const swal = Swal.mixin({ width: 420, customClass: { popup: 'rounded-2xl' } })
const ACTIONS = ['view', 'create', 'update', 'assign', 'refresh', 'manage', 'edit', 'review', 'execute']
const SKELETON_ROWS = Array.from({ length: 6 }, (_, i) => i)

function SkeletonBox({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-700/60 ${className}`} />
}

export function RoleManagerPage() {
  const [category, setCategory] = useState('admin')
  const [roles, setRoles] = useState([])
  const [matrix, setMatrix] = useState([])
  const [users, setUsers] = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [accessMode, setAccessMode] = useState('role')
  const [customPermissions, setCustomPermissions] = useState([])
  const [allPermissions, setAllPermissions] = useState([])
  const [loading, setLoading] = useState(false)

  const selectedRole = useMemo(() => roles.find((r) => String(r.id) === String(selectedRoleId)) || null, [roles, selectedRoleId])
  const selectedPermissionIds = useMemo(() => new Set((selectedRole?.permissions || []).map((p) => String(p.id))), [selectedRole])
  const customPermissionIds = useMemo(() => new Set(customPermissions.map((p) => String(p.id))), [customPermissions])
  const permissionIdByName = useMemo(() => new Map((allPermissions || []).map((p) => [p.name, p.id])), [allPermissions])
  const permissionById = useMemo(() => new Map((allPermissions || []).map((p) => [String(p.id), p.name])), [allPermissions])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [roleRes, matrixRes, userRes, permissionRes] = await Promise.all([
        apiRequest(`/settings/roles?category=${category}`),
        apiRequest(`/settings/permission-matrix?category=${category}`),
        apiRequest('/users?per_page=200'),
        apiRequest(`/settings/permissions?category=${category}`),
      ])
      const roleData = roleRes.data || []
      setRoles(roleData)
      setMatrix(matrixRes.data || [])
      setUsers(userRes.data || [])
      setAllPermissions(permissionRes.data || [])
      if (!selectedRoleId && roleData.length > 0) setSelectedRoleId(String(roleData[0].id))
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal memuat role manager.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setSelectedRoleId('')
    fetchData()
  }, [category])

  const updatePermission = (permission, checked) => {
    if (!selectedRole) return
    const current = new Map((selectedRole.permissions || []).map((item) => [String(item.id), item]))
    const key = String(permission.id)
    if (checked) current.set(key, { id: permission.id, name: permission.name })
    else current.delete(key)

    setRoles((prev) => prev.map((role) => (
      role.id === selectedRole.id ? { ...role, permissions: Array.from(current.values()) } : role
    )))
  }

  const saveRolePermissions = async () => {
    if (!selectedRole) return
    try {
      const payloadPermissions = (selectedRole.permissions || [])
        .map((item) => item?.name || permissionById.get(String(item?.id)))
        .filter(Boolean)
      await apiRequest(`/settings/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selectedRole.name, permissions: payloadPermissions }),
      })
      await swal.fire({ icon: 'success', title: 'Tersimpan', text: 'Permission role berhasil diperbarui.' })
      fetchData()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error.message || 'Tidak dapat menyimpan role.' })
    }
  }

  const rows = useMemo(() => {
    const byParent = new Map()
    const ordered = matrix.map((item) => ({ ...item }))

    ordered.forEach((item) => {
      const key = item.parent_id ?? 'root'
      const list = byParent.get(key) || []
      list.push(item)
      byParent.set(key, list)
    })

    const flatten = (parentKey = 'root', level = 0) => {
      const list = byParent.get(parentKey) || []
      return list.flatMap((item) => ([
        { ...item, __level: level },
        ...flatten(item.id, level + 1),
      ]))
    }

    return flatten('root', 0).filter((item) => item.menu_key)
  }, [matrix])

  const treeDiagram = useMemo(() => {
    const lines = []
    rows.forEach((menu) => {
      const prefix = menu.__level > 0 ? `${'  '.repeat(menu.__level)}└─ ` : ''
      lines.push(`${prefix}${menu.label} [${menu.menu_key}] (${menu.route || '-'})`)
    })
    return lines.join('\n')
  }, [rows])

  const loadUserAccess = async (userId) => {
    setSelectedUserId(String(userId))
    if (!userId) return
    try {
      const res = await apiRequest(`/settings/users/${userId}/access`)
      setAccessMode(res.data?.access_mode || 'role')
      const normalized = (res.data?.permissions || []).map((name) => ({
        id: permissionIdByName.get(name) ?? name,
        name,
      }))
      setCustomPermissions(normalized)
    } catch {
      setAccessMode('role')
      setCustomPermissions([])
    }
  }

  const toggleUserPermission = (permission) => {
    setCustomPermissions((prev) => (
      prev.some((x) => String(x.id) === String(permission.id))
        ? prev.filter((x) => String(x.id) !== String(permission.id))
        : [...prev, { id: permission.id, name: permission.name }]
    ))
  }

  const saveUserAccess = async () => {
    if (!selectedUserId) return
    try {
      await apiRequest(`/settings/users/${selectedUserId}/access-mode`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_mode: accessMode }),
      })

      if (accessMode === 'custom') {
        await apiRequest(`/settings/users/${selectedUserId}/permissions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions: customPermissions.map((item) => item.name).filter(Boolean) }),
        })
      }

      await swal.fire({ icon: 'success', title: 'Tersimpan', text: 'Akses user berhasil diperbarui.' })
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error.message || 'Gagal simpan akses user.' })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Role Manager</h2>
          <p className="text-sm text-slate-400 mt-1">Matrix permission berbasis Menu &gt; Aksi.</p>
        </div>
        <div className="flex gap-2 items-end">
          <label className="text-xs text-slate-300">Kategori
            <select
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm mt-1"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="admin">Kategori Admin</option>
              <option value="web">Kategori Web</option>
              <option value="mobile">Kategori Mobile</option>
            </select>
          </label>
          <label className="text-xs text-slate-300">Role
            <select
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm mt-1"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
            >
              <option value="">Pilih role</option>
              {!loading && roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
          </label>
          <button onClick={fetchData} className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm">Refresh</button>
          <button onClick={saveRolePermissions} disabled={!selectedRole || loading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-sm">Simpan</button>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 overflow-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="text-left text-slate-300 border-b border-slate-700">
              <th className="py-3 px-2">Menu</th>
              {ACTIONS.map((action) => <th key={action} className="py-3 px-2 capitalize text-center">{action}</th>)}
              <th className="py-3 px-2">Permission Lain</th>
            </tr>
          </thead>
          <tbody>
            {loading ? SKELETON_ROWS.map((x) => (
              <tr key={`skeleton-${x}`} className="border-b border-slate-700/60">
                <td className="py-2 px-2"><SkeletonBox className="h-4 w-40" /></td>
                {ACTIONS.map((a) => <td key={`skeleton-${x}-${a}`} className="py-2 px-2"><SkeletonBox className="h-4 w-4 mx-auto" /></td>)}
                <td className="py-2 px-2"><SkeletonBox className="h-4 w-48" /></td>
              </tr>
            )) : rows.map((menu) => {
              const perms = menu.permissions || []
              const actionPermissions = menu.action_permissions || {}
              const other = perms
                .map((p) => p?.name)
                .filter((name) => name && !ACTIONS.some((a) => name.startsWith(`${a} `)))
              return (
                <tr key={`${menu.menu_key}-${menu.parent_id ?? 'root'}`} className="border-b border-slate-700/60">
                  <td className="py-2 px-2 text-slate-100">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${(menu.__level || 0) * 16}px` }}>
                      {(menu.__level || 0) > 0 ? <span className="text-slate-500">└─</span> : null}
                      <span>{menu.label}</span>
                    </div>
                  </td>
                  {ACTIONS.map((action) => {
                    const permission = actionPermissions[action] || null
                    const permissionName = permission?.name || null
                    const permissionId = permission?.id || (permissionName ? permissionIdByName.get(permissionName) : null)
                    return (
                      <td key={`${menu.menu_key}-${action}-${permissionId || 'na'}`} className="py-2 px-2 text-center align-middle">
                        {permissionName ? (
                          <input
                            type="checkbox"
                            checked={selectedPermissionIds.has(String(permissionId))}
                            onChange={(e) => updatePermission({ id: permissionId, name: permissionName }, e.target.checked)}
                            disabled={!selectedRole}
                            className="w-5 h-5 mx-auto block rounded bg-slate-900 border-slate-600 text-blue-500 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                          />
                        ) : <span className="text-slate-600">-</span>}
                      </td>
                    )
                  })}
                  <td className="py-2 px-2 text-xs text-slate-400">{other.join(', ') || '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Akses User (Default by Role / Custom per User)</h3>
        {loading && (
          <div className="space-y-3">
            <SkeletonBox className="h-10 w-96" />
            <div className="flex gap-2">
              <SkeletonBox className="h-5 w-32" />
              <SkeletonBox className="h-5 w-36" />
              <SkeletonBox className="h-9 w-36" />
            </div>
          </div>
        )}
        {!loading && <div className="flex flex-wrap gap-3 items-end">
          <label className="text-xs text-slate-300">User
            <select className="bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm min-w-80 mt-1" value={selectedUserId} onChange={(e) => loadUserAccess(e.target.value)}>
              <option value="">Pilih user</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm"><input type="radio" checked={accessMode === 'role'} onChange={() => setAccessMode('role')} /> Default by role</label>
          <label className="flex items-center gap-2 text-sm"><input type="radio" checked={accessMode === 'custom'} onChange={() => setAccessMode('custom')} /> Custom per user</label>
          <button onClick={saveUserAccess} disabled={!selectedUserId} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-sm">Simpan Akses User</button>
        </div>}

        {selectedUserId ? (
          <div className="overflow-auto border border-slate-700 rounded-lg">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="text-left text-slate-300 border-b border-slate-700">
                  <th className="py-3 px-2">Menu</th>
                  {ACTIONS.map((action) => <th key={`u-${action}`} className="py-3 px-2 capitalize text-center">{action}</th>)}
                  <th className="py-3 px-2">Permission Lain</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((menu) => {
                  const perms = menu.permissions || []
                  const actionPermissions = menu.action_permissions || {}
                  const other = perms
                    .map((p) => p?.name)
                    .filter((name) => name && !ACTIONS.some((a) => name.startsWith(`${a} `)))
                  return (
                    <tr key={`user-${menu.menu_key}-${menu.parent_id ?? 'root'}`} className="border-b border-slate-700/60">
                      <td className="py-2 px-2 text-slate-100">
                        <div className="flex items-center gap-2" style={{ paddingLeft: `${(menu.__level || 0) * 16}px` }}>
                          {(menu.__level || 0) > 0 ? <span className="text-slate-500">└─</span> : null}
                          <span>{menu.label}</span>
                        </div>
                      </td>
                      {ACTIONS.map((action) => {
                        const permission = actionPermissions[action] || null
                        const permissionName = permission?.name || null
                        const permissionId = permission?.id || (permissionName ? permissionIdByName.get(permissionName) : null)
                        return (
                          <td key={`user-${menu.menu_key}-${action}-${permissionId || 'na'}`} className="py-2 px-2 text-center align-middle">
                            {permissionName ? (
                              <input
                                type="checkbox"
                                checked={customPermissionIds.has(String(permissionId))}
                                onChange={() => toggleUserPermission({ id: permissionId, name: permissionName })}
                                disabled={accessMode !== 'custom'}
                                className="w-5 h-5 mx-auto block rounded bg-slate-900 border-slate-600 text-blue-500 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                              />
                            ) : <span className="text-slate-600">-</span>}
                          </td>
                        )
                      })}
                      <td className="py-2 px-2 text-xs text-slate-400">{other.join(', ') || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400">
            Pilih user terlebih dahulu untuk menampilkan matrix akses user.
          </div>
        )}
      </div>

      {/* <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white">Diagram Tree Menu/Submenu</h3>
        <pre className="text-xs text-slate-300 bg-slate-900/60 border border-slate-700 rounded-lg p-3 overflow-auto">{treeDiagram || '-'}</pre>
      </div> */}
    </div>
  )
}
