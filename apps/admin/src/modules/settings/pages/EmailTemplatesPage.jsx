import { useEffect, useState, useMemo } from 'react'
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

export function EmailTemplatesPage() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ subject: '', body_html: '', is_active: true })
  const [saving, setSaving] = useState(false)

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const response = await apiRequest('/settings/email-templates?per_page=100')
      setTemplates(response.data?.data || response.data || [])
      if (!selectedTemplate && response.data?.data?.length > 0) {
        selectTemplate(response.data.data[0])
      }
    } catch (error) {
      swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memuat template email.' })
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const selectTemplate = (t) => {
    setSelectedTemplate(t)
    setFormData({
      subject: t.subject,
      body_html: t.body_html,
      is_active: t.is_active,
    })
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!formData.subject || !formData.body_html) {
      swal.fire({ icon: 'warning', title: 'Validasi', text: 'Subjek dan Isi Email wajib diisi.' })
      return
    }

    setSaving(true)
    try {
      const res = await apiRequest(`/settings/email-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      swal.fire({ icon: 'success', title: 'Berhasil', text: 'Template email diperbarui.' })
      
      // Update local state
      const updated = res.data?.data || res.data
      setTemplates(templates.map(t => t.id === updated.id ? updated : t))
      setSelectedTemplate(updated)
      setIsEditing(false)
    } catch (error) {
      swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal menyimpan template.' })
    } finally {
      setSaving(false)
    }
  }

  // Removed Quill modules

  return (
    <div className="p-6 space-y-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Email Templates</h2>
          <p className="text-sm text-slate-500">Kelola template email untuk notifikasi dan autentikasi.</p>
        </div>
        <button type="button" onClick={fetchTemplates} disabled={loading} className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/50">
          Muat Ulang
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 min-h-0 overflow-hidden">
        {/* Left Pane: List */}
        <div className="card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="font-semibold text-slate-200">Daftar Template</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scroll">
            {!hasLoaded ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonBox key={i} className="h-14 w-full" />)
            ) : templates.length === 0 ? (
              <div className="text-sm text-center text-slate-500 py-4">Belum ada template.</div>
            ) : (
              templates.map((t) => (
                <div key={t.id} onClick={() => selectTemplate(t)} className={`p-3 rounded-xl border cursor-pointer transition-colors ${selectedTemplate?.id === t.id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/30'}`}>
                  <div className={`font-semibold text-sm ${selectedTemplate?.id === t.id ? 'text-blue-300' : 'text-slate-200'}`}>{t.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{t.code}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Editor */}
        <div className="md:col-span-2 card flex flex-col overflow-hidden">
          {selectedTemplate ? (
            <>
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-200">{selectedTemplate.name}</h3>
                  <p className="text-xs text-slate-400">Kode: {selectedTemplate.code}</p>
                </div>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg text-xs font-medium transition-colors">
                    Edit Template
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setIsEditing(false); selectTemplate(selectedTemplate) }} className="px-3 py-1.5 border border-slate-600 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700/50">
                      Batal
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
                      {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scroll space-y-4">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs text-slate-400 mb-1 block">Subjek Email</span>
                    <input 
                      className={`input w-full px-3 py-2 rounded-xl text-sm ${!isEditing && 'opacity-70 cursor-not-allowed bg-slate-800'}`} 
                      value={formData.subject} 
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })} 
                      disabled={!isEditing}
                    />
                  </label>
                  
                  <div className="block">
                    <span className="text-xs text-slate-400 mb-1 flex justify-between">
                        <span>Isi Email (HTML)</span>
                        {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                            <span className="text-slate-500">Variabel: {selectedTemplate.variables.map(v => `{{${v}}}`).join(', ')}</span>
                        )}
                    </span>
                    {!isEditing ? (
                        <div className="border border-slate-700 rounded-xl p-4 bg-slate-800/50 overflow-auto min-h-[300px]">
                            <div dangerouslySetInnerHTML={{ __html: formData.body_html }} />
                        </div>
                    ) : (
                        <div className="bg-slate-800 rounded-xl overflow-hidden">
                            <textarea 
                                value={formData.body_html} 
                                onChange={(e) => setFormData({ ...formData, body_html: e.target.value })} 
                                className="w-full h-[300px] bg-transparent text-slate-200 p-4 font-mono text-sm focus:outline-none resize-none"
                                placeholder="Masukkan kode HTML template email di sini..."
                            />
                        </div>
                    )}
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer pt-4">
                    <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} disabled={!isEditing} className="rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500" />
                    <span className={`text-sm ${!isEditing ? 'text-slate-500' : 'text-slate-300'}`}>Template Aktif</span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-slate-500">Pilih template di samping untuk melihat atau mengubah.</div>
          )}
        </div>
      </div>
    </div>
  )
}
