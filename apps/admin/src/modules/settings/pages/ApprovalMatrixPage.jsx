import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { apiRequest, ApiError } from '../../../services/api'
import { ModalPortal } from '../../shared/components/ModalPortal'

const swal = Swal.mixin({
  width: 420,
  customClass: {
    popup: 'rounded-2xl',
    confirmButton: 'rounded-lg',
    cancelButton: 'rounded-lg',
  },
  buttonsStyling: true,
})

function SkeletonBox({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-700/60 ${className}`} />
}

function extractRows(response) {
  if (Array.isArray(response?.items)) return response.items
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response)) return response
  return []
}

export function ApprovalMatrixPage() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  
  const [steps, setSteps] = useState([])
  const [stepsLoading, setStepsLoading] = useState(false)

  // Modals state
  const [templateModal, setTemplateModal] = useState(null) // { mode: 'create'|'edit', id? }
  const [templateForm, setTemplateForm] = useState({ 
    name: '', code: '', route_key: '', 
    target_action: 'create', approval_mode: 'sequential',
    min_approvals_total: 1, is_active: true, auto_approve_outside_window: true
  })
  
  const [stepModal, setStepModal] = useState(null) // { mode: 'create'|'edit', id? }
  const [stepForm, setStepForm] = useState({ 
    step_name: '', step_order: 1, assignment_mode: 'fixed_users', 
    min_approvals_required: 1, allow_self_approval: false, 
    is_active: true, sla_hours: '' 
  })
  
  const [roles, setRoles] = useState([])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const response = await apiRequest('/settings/approvals/templates')
      setTemplates(extractRows(response))
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal memuat template approval.' })
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  const fetchSteps = async (templateId) => {
    setStepsLoading(true)
    try {
      const response = await apiRequest(`/settings/approvals/templates/${templateId}/steps`)
      setSteps(extractRows(response))
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memuat tahapan approval.' })
    } finally {
      setStepsLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await apiRequest('/settings/roles')
      setRoles(extractRows(response))
    } catch (e) {
      // ignore
    }
  }

  const [assignUsersModal, setAssignUsersModal] = useState(null) // { step: object }
  const [allUsers, setAllUsers] = useState([])
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [userSearchTerm, setUserSearchTerm] = useState('')

  const fetchAllUsers = async () => {
    try {
      const res = await apiRequest('/users?per_page=1000') // get all users
      setAllUsers(res.data?.data || res.data || [])
    } catch (e) {}
  }

  useEffect(() => {
    fetchTemplates()
    fetchRoles()
    fetchAllUsers()
  }, [])

  const selectTemplate = (t) => {
    setSelectedTemplate(t)
    fetchSteps(t.id)
  }

  // --- Template Actions ---
  const saveTemplate = async () => {
    if (!templateForm.name || !templateForm.code || !templateForm.route_key) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Nama, kode, dan route_key wajib diisi.' })
      return
    }

    try {
      if (templateModal.mode === 'create') {
        await apiRequest('/settings/approvals/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateForm),
        })
      } else {
        await apiRequest(`/settings/approvals/templates/${templateModal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateForm),
        })
      }
      setTemplateModal(null)
      await fetchTemplates()
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Template tersimpan.' })
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal simpan template.' })
    }
  }

  const openEditTemplate = (t) => {
    setTemplateForm({ 
      name: t.name, code: t.code, route_key: t.route_key, 
      target_action: t.target_action, approval_mode: t.approval_mode,
      min_approvals_total: t.min_approvals_total, is_active: t.is_active, 
      auto_approve_outside_window: t.auto_approve_outside_window
    })
    setTemplateModal({ mode: 'edit', id: t.id })
  }

  // --- Step Actions ---
  const saveStep = async () => {
    if (!stepForm.step_name || !selectedTemplate) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Nama tahapan wajib diisi.' })
      return
    }

    try {
      const payload = { ...stepForm }
      if (payload.sla_hours === '') payload.sla_hours = null

      if (stepModal.mode === 'create') {
        await apiRequest(`/settings/approvals/templates/${selectedTemplate.id}/steps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await apiRequest(`/settings/approvals/templates/${selectedTemplate.id}/steps/${stepModal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      setStepModal(null)
      await fetchSteps(selectedTemplate.id)
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Tahapan (step) tersimpan.' })
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal simpan tahapan.' })
    }
  }

  const openCreateStep = () => {
    setStepForm({ step_name: '', step_order: steps.length + 1, assignment_mode: 'fixed_users', min_approvals_required: 1, allow_self_approval: false, is_active: true, sla_hours: '' })
    setStepModal({ mode: 'create' })
  }

  const openEditStep = (s) => {
    setStepForm({
      step_name: s.step_name,
      step_order: s.step_order,
      assignment_mode: s.assignment_mode,
      min_approvals_required: s.min_approvals_required,
      allow_self_approval: s.allow_self_approval,
      is_active: s.is_active,
      sla_hours: s.sla_hours || '',
    })
    setStepModal({ mode: 'edit', id: s.id })
  }

  const openAssignUsers = (s) => {
    setAssignUsersModal({ step: s })
    setSelectedUserIds(s.users?.map(u => u.id) || [])
    setUserSearchTerm('')
  }

  const saveAssignedUsers = async () => {
    if (!selectedTemplate || !assignUsersModal?.step?.id) return
    if (selectedUserIds.length === 0) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Pilih minimal satu approver sebelum menyimpan.' })
      return
    }

    try {
      await apiRequest(`/settings/approvals/templates/${selectedTemplate.id}/steps/${assignUsersModal.step.id}/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_ids: selectedUserIds })
      })
      setAssignUsersModal(null)
      await fetchSteps(selectedTemplate.id)
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Approver berhasil di-assign.' })
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal assign approver.' })
    }
  }

  return (
    <div className="p-6 space-y-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Approval Matrix</h2>
          <p className="text-sm text-slate-500">Atur hierarki persetujuan untuk setiap jenis dokumen.</p>
        </div>
        <button type="button" onClick={fetchTemplates} disabled={loading} className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/50">
          Muat Ulang
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 min-h-0 overflow-hidden">
        {/* Left Pane: Templates */}
        <div className="card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-slate-200">Kategori Approval</h3>
            <button onClick={() => { setTemplateForm({ name: '', code: '', route_key: '', target_action: 'create', approval_mode: 'sequential', min_approvals_total: 1, is_active: true, auto_approve_outside_window: true }); setTemplateModal({ mode: 'create' }) }} className="text-xs text-blue-400 hover:text-blue-300">
              + Tambah
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scroll">
            {!hasLoaded ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonBox key={i} className="h-14 w-full" />)
            ) : templates.length === 0 ? (
              <div className="text-sm text-center text-slate-500 py-4">Belum ada template.</div>
            ) : (
              templates.map((t) => (
                <div key={t.id} onClick={() => selectTemplate(t)} className={`p-3 rounded-xl border cursor-pointer transition-colors ${selectedTemplate?.id === t.id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/30'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className={`font-semibold text-sm ${selectedTemplate?.id === t.id ? 'text-blue-300' : 'text-slate-200'}`}>{t.name}</div>
                      <div className="text-xs text-slate-500">{t.code}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); openEditTemplate(t) }} className="text-slate-400 hover:text-slate-200"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Steps */}
        <div className="md:col-span-2 card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-200">Urutan Approval (Steps)</h3>
              {selectedTemplate && <p className="text-xs text-slate-400">Untuk {selectedTemplate.name}</p>}
            </div>
            {selectedTemplate && (
              <button onClick={openCreateStep} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg text-xs font-medium transition-colors">
                + Tambah Tahapan
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scroll">
            {!selectedTemplate ? (
              <div className="flex items-center justify-center h-full text-sm text-slate-500">Pilih kategori approval di samping untuk melihat urutan (steps).</div>
            ) : stepsLoading ? (
              <div className="space-y-3">
                <SkeletonBox className="h-16 w-full" />
                <SkeletonBox className="h-16 w-full" />
              </div>
            ) : steps.length === 0 ? (
              <div className="text-center text-sm text-slate-500 mt-10">Belum ada tahapan approval untuk kategori ini.</div>
            ) : (
              <div className="space-y-4">
                {steps.sort((a,b) => a.step_order - b.step_order).map((s, index) => (
                  <div key={s.id} className="relative flex gap-4">
                    {/* Timeline line */}
                    {index !== steps.length - 1 && <div className="absolute left-4 top-10 bottom-[-1rem] w-px bg-slate-600" />}
                    
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 border-2 border-slate-800 z-10 shrink-0">
                      {s.step_order}
                    </div>
                    
                    <div className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-200 text-sm">{s.step_name}</h4>
                          <div className="text-xs text-slate-500">Assign: {s.assignment_mode}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openEditStep(s)} className="text-slate-400 hover:text-slate-200"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Users ({s.users?.length || 0}):</span>
                        <div className="flex flex-wrap gap-1 flex-1">
                            {s.users?.map(u => (
                                <span key={u.id} className="text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded">{u.name}</span>
                            ))}
                        </div>
                        {s.assignment_mode === 'fixed_users' && (
                          <button onClick={() => openAssignUsers(s)} className="text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded text-[10px] font-semibold border border-blue-500/30">
                            + ASSIGN
                          </button>
                        )}
                      </div>
                      {s.sla_hours && (
                        <div className="text-xs text-amber-400 mt-2">
                          SLA Approval: {s.sla_hours} jam.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {templateModal && (
        <ModalPortal>
          <div onClick={() => setTemplateModal(null)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-white mb-4">{templateModal.mode === 'create' ? 'Tambah Kategori Approval' : 'Edit Kategori Approval'}</h3>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs text-slate-300 mb-1 block">Nama Kategori</span>
                  <input className="input w-full px-3 py-2 rounded-xl text-sm" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} placeholder="Contoh: Approval Work Order" />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-300 mb-1 block">Kode Unik</span>
                  <input className="input w-full px-3 py-2 rounded-xl text-sm" value={templateForm.code} onChange={(e) => setTemplateForm({ ...templateForm, code: e.target.value })} placeholder="Contoh: app.wo" />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-300 mb-1 block">Route Key / Alias</span>
                  <input className="input w-full px-3 py-2 rounded-xl text-sm" value={templateForm.route_key} onChange={(e) => setTemplateForm({ ...templateForm, route_key: e.target.value })} placeholder="Contoh: mobile.workshop.register" />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-300 mb-1 block">Mode Approval</span>
                  <select className="input w-full px-3 py-2 rounded-xl text-sm" value={templateForm.approval_mode} onChange={(e) => setTemplateForm({ ...templateForm, approval_mode: e.target.value })}>
                      <option value="sequential">Sequential (Berurutan)</option>
                      <option value="parallel">Parallel (Bebas)</option>
                      <option value="single">Single (Satu Step Saja)</option>
                  </select>
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setTemplateModal(null)} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm">Batal</button>
                <button type="button" onClick={saveTemplate} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm">Simpan</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {stepModal && (
        <ModalPortal>
          <div onClick={() => setStepModal(null)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-white mb-4">{stepModal.mode === 'create' ? 'Tambah Tahapan Approval' : 'Edit Tahapan Approval'}</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <label className="block flex-1">
                    <span className="text-xs text-slate-300 mb-1 block">Nama Tahapan</span>
                    <input className="input w-full px-3 py-2 rounded-xl text-sm" value={stepForm.step_name} onChange={(e) => setStepForm({ ...stepForm, step_name: e.target.value })} placeholder="Contoh: Supervisor Review" />
                  </label>
                  <label className="block w-24">
                    <span className="text-xs text-slate-300 mb-1 block">Urutan</span>
                    <input type="number" min={1} className="input w-full px-3 py-2 rounded-xl text-sm" value={stepForm.step_order} onChange={(e) => setStepForm({ ...stepForm, step_order: Number(e.target.value) })} />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs text-slate-300 mb-1 block">Mode Assignment</span>
                  <select className="input w-full px-3 py-2 rounded-xl text-sm" value={stepForm.assignment_mode} onChange={(e) => setStepForm({ ...stepForm, assignment_mode: e.target.value })}>
                    <option value="fixed_users">Fixed Users (Static)</option>
                    <option value="manual_users">Manual Assign per Request</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-slate-300 mb-1 block">Minimal Approve (Orang)</span>
                  <input type="number" min={1} className="input w-full px-3 py-2 rounded-xl text-sm" value={stepForm.min_approvals_required} onChange={(e) => setStepForm({ ...stepForm, min_approvals_required: Number(e.target.value) })} />
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={stepForm.is_active} onChange={(e) => setStepForm({ ...stepForm, is_active: e.target.checked })} className="rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-slate-300">Aktif</span>
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs text-slate-300 mb-1 block">SLA (Jam) - Opsional</span>
                  <input type="number" min={1} className="input w-full px-3 py-2 rounded-xl text-sm" value={stepForm.sla_hours} onChange={(e) => setStepForm({ ...stepForm, sla_hours: e.target.value })} placeholder="Contoh: 24" />
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setStepModal(null)} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm">Batal</button>
                <button type="button" onClick={saveStep} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm">Simpan</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {assignUsersModal && (
        <ModalPortal>
          <div onClick={() => setAssignUsersModal(null)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-white mb-4">Assign Approver: {assignUsersModal.step.step_name}</h3>
              <div className="mb-4">
                <input 
                  type="text" 
                  placeholder="Cari nama atau email..." 
                  className="input w-full px-3 py-2 rounded-xl text-sm"
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scroll">
                {allUsers.length === 0 ? (
                   <p className="text-sm text-slate-400 text-center py-4">Memuat pengguna...</p>
                ) : (
                   <div className="space-y-2">
                     {allUsers.filter(u => 
                       u.name.toLowerCase().includes((userSearchTerm || '').toLowerCase()) || 
                       u.email.toLowerCase().includes((userSearchTerm || '').toLowerCase())
                     ).map(u => (
                        <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-600">
                           <input 
                             type="checkbox" 
                             checked={selectedUserIds.includes(u.id)}
                             onChange={(e) => {
                               if (e.target.checked) setSelectedUserIds(prev => [...prev, u.id])
                               else setSelectedUserIds(prev => prev.filter(id => id !== u.id))
                             }}
                             className="rounded bg-slate-900 border-slate-600 text-blue-500 focus:ring-blue-500" 
                           />
                           <div>
                             <div className="text-sm text-slate-200 font-medium">{u.name}</div>
                             <div className="text-xs text-slate-500">{u.email}</div>
                           </div>
                        </label>
                     ))}
                     {allUsers.filter(u => 
                       u.name.toLowerCase().includes((userSearchTerm || '').toLowerCase()) || 
                       u.email.toLowerCase().includes((userSearchTerm || '').toLowerCase())
                     ).length === 0 && (
                       <p className="text-sm text-slate-400 text-center py-4">Tidak ada pengguna yang cocok.</p>
                     )}
                   </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setAssignUsersModal(null)} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm">Batal</button>
                <button type="button" onClick={saveAssignedUsers} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm">Simpan</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
