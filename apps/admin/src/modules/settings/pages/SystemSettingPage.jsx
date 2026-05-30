import { Fragment, useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { apiRequest, ApiError } from '../../../services/api'

const DEFAULT_FORM = {
  key: '', label: '', type: 'string', scope: 'global', module_code: '', value: '', validation_rules: '{}', is_secret: false, is_editable: true,
}

const swal = Swal.mixin({ width: 420, customClass: { popup: 'rounded-2xl' } })
const SKELETON_ROWS = Array.from({ length: 6 }, (_, i) => i)

function SkeletonBox({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-700/60 ${className}`} />
}

export function SystemSettingPage() {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [form, setForm] = useState(DEFAULT_FORM)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [collapsedGroups, setCollapsedGroups] = useState({})
  const uploadKeys = new Set(['app.logo_url', 'app.favicon_url'])

  const groupedItems = useMemo(() => {
    const groups = new Map()
    for (const item of items) {
      const groupKey = item.scope === 'module'
        ? `module:${item.module_code || 'others'}`
        : 'global:global'
      const groupLabel = item.scope === 'module'
        ? `Module / ${item.module_code || 'others'}`
        : 'Global'
      if (!groups.has(groupKey)) {
        groups.set(groupKey, { key: groupKey, label: groupLabel, items: [] })
      }
      groups.get(groupKey).items.push(item)
    }
    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [items])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await apiRequest(`/settings/system?search=${encodeURIComponent(query)}`)
      setItems(res.data || [])
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal memuat system setting.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const save = async () => {
    const payload = {
      ...form,
      value: form.value,
      validation_rules: (() => { try { return JSON.parse(form.validation_rules || '{}') } catch { return {} } })(),
    }

    try {
      if (selectedId) {
        await apiRequest(`/settings/system/${selectedId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      } else {
        await apiRequest('/settings/system', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      }
      await swal.fire({ icon: 'success', title: 'Tersimpan', text: 'System setting berhasil disimpan.' })
      fetchItems()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error.message || 'Gagal simpan setting.' })
    }
  }

  const upload = async () => {
    if (!selectedId || !uploadFile) return
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      await apiRequest(`/settings/system/${selectedId}/upload`, {
        method: 'POST',
        body: formData,
      })
      await swal.fire({ icon: 'success', title: 'Tersimpan', text: 'File berhasil diupload.' })
      setUploadFile(null)
      fetchItems()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error.message || 'Gagal upload file.' })
    }
  }

  const pick = (item) => {
    setSelectedId(item.id)
    setForm({
      key: item.key,
      label: item.label,
      type: item.type,
      scope: item.scope,
      module_code: item.module_code || '',
      value: item.value ?? '',
      validation_rules: JSON.stringify(item.validation_rules || {}, null, 2),
      is_secret: Boolean(item.is_secret),
      is_editable: Boolean(item.is_editable),
    })
    setUploadFile(null)
  }

  return (
    <div className="p-6 grid gap-6 lg:grid-cols-3">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 lg:col-span-2">
        <div className="flex gap-2 mb-4">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari key/label" className="bg-slate-900/50 border border-slate-700 rounded-lg p-2 flex-1" />
          <button onClick={fetchItems} className="px-4 py-2 rounded-lg bg-slate-700">Filter</button>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="py-2 px-3 w-[38%]">Key</th>
                <th className="py-2 px-3 w-[14%]">Type</th>
                <th className="py-2 px-3 w-[14%]">Scope</th>
                <th className="py-2 px-3 w-[34%]">Value</th>
              </tr>
            </thead>
            <tbody>
              {loading ? SKELETON_ROWS.map((x) => (
                <tr key={`setting-skeleton-${x}`} className="border-t border-slate-700/70">
                  <td className="py-2 px-3"><SkeletonBox className="h-4 w-44" /></td>
                  <td className="py-2 px-3"><SkeletonBox className="h-4 w-16" /></td>
                  <td className="py-2 px-3"><SkeletonBox className="h-4 w-16" /></td>
                  <td className="py-2 px-3"><SkeletonBox className="h-4 w-28" /></td>
                </tr>
              )) : groupedItems.map((group) => {
                const isCollapsed = collapsedGroups[group.key] ?? false
                return (
                  <Fragment key={`group-fragment-${group.key}`}>
                    <tr key={`group-${group.key}`} className="border-t border-slate-700/70 bg-slate-700/20">
                      <td colSpan={4} className="py-2 px-2">
                        <button
                          type="button"
                          onClick={() => setCollapsedGroups((prev) => ({ ...prev, [group.key]: !isCollapsed }))}
                          className="flex items-center gap-2 text-slate-200 font-medium"
                        >
                          <span>{isCollapsed ? '+' : '-'}</span>
                          <span>{group.label}</span>
                          <span className="text-xs text-slate-400">({group.items.length})</span>
                        </button>
                      </td>
                    </tr>
                    {!isCollapsed && group.items.map((item) => (
                      <tr key={item.id} onClick={() => pick(item)} className="border-t border-slate-700/70 hover:bg-slate-700/20 cursor-pointer">
                        <td className="py-2 px-3 pl-7 break-words">{item.key}</td>
                        <td className="py-2 px-3">{item.type}</td>
                        <td className="py-2 px-3">{item.scope}</td>
                        <td className="py-2 px-3 break-words">{item.is_secret ? '******' : String(item.value ?? '-')}</td>
                      </tr>
                    ))}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-semibold">Editor Setting</h2>
        {['key','label','module_code'].map((field) => (
          <input key={field} value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} placeholder={field} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2" />
        ))}
        <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2">
          {['string','number','boolean','json','email','url','select'].map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select value={form.scope} onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value }))} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2">
          <option value="global">global</option><option value="module">module</option>
        </select>
        <textarea value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} placeholder="value" className="w-full min-h-20 bg-slate-900/50 border border-slate-700 rounded-lg p-2" />
        {uploadKeys.has(form.key) && selectedId && (
          <div className="space-y-2">
            <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm" />
            <button onClick={upload} disabled={!uploadFile} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60">Upload File</button>
          </div>
        )}
        <textarea value={form.validation_rules} onChange={(e) => setForm((p) => ({ ...p, validation_rules: e.target.value }))} placeholder="validation_rules JSON" className="w-full min-h-20 bg-slate-900/50 border border-slate-700 rounded-lg p-2" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_secret} onChange={(e) => setForm((p) => ({ ...p, is_secret: e.target.checked }))} /> Secret</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_editable} onChange={(e) => setForm((p) => ({ ...p, is_editable: e.target.checked }))} /> Editable</label>
        <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Simpan</button>
      </div>
    </div>
  )
}
