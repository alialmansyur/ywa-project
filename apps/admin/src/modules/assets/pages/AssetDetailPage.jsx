import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { apiRequest, ApiError } from '../../../services/api'
import { ModalPortal } from '../../shared/components/ModalPortal'

const swal = Swal.mixin({
  width: 420,
  buttonsStyling: false,
  customClass: {
    popup: 'rounded-2xl',
    confirmButton: 'px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium',
    cancelButton: 'px-4 py-2 rounded-xl border border-slate-500 text-slate-200 text-sm font-medium ml-2',
  },
})

const DEFAULT_EDIT_FORM = {
  io_code: '',
  name: '',
  brand: '',
  model: '',
  company_code: '',
  plant: '',
  year: '',
  category_id: '',
  status: 'active',
  current_hm: '',
  current_km: '',
  serial_number: '',
  chasis_no: '',
  engine_no: '',
  asset_no: '',
  plate_number: '',
  veh_plate_no: '',
  notes: '',
}

const DEFAULT_TRIGGER_FORM = {
  trigger_type: 'hm',
  alert_before_value: 25,
  escalation_target: 'planner_supervisor',
  auto_create_work_order: true,
  notes: '',
}

const DEFAULT_SCHEDULE_FORM = {
  type: 'preventive',
  name: '',
  interval_hm: '',
  interval_km: '',
  next_due_at: '',
  status: 'scheduled',
  notes: '',
}

const DEFAULT_DOC_FORM = {
  type: 'other',
  document_number: '',
  issued_at: '',
  expired_at: '',
  notes: '',
}

function statusBadge(status) {
  const map = {
    active: 'bg-green-500/15 text-green-400 border-green-500/30',
    inactive: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    maintenance: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    breakdown: 'bg-red-500/15 text-red-400 border-red-500/30',
  }
  const cls = map[status] || map.inactive
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border ${cls}`}>
      <span className="w-2 h-2 rounded-full bg-current opacity-90" />
      {status || 'unknown'}
    </span>
  )
}

export function AssetDetailPage() {
  const navigate = useNavigate()
  const { assetRef } = useParams()
  const location = useLocation()

  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [assetData, setAssetData] = useState(null)
  const [photosData, setPhotosData] = useState([])
  const [preventiveData, setPreventiveData] = useState(null)
  const [scheduleData, setScheduleData] = useState([])
  const [workshopHistory, setWorkshopHistory] = useState([])
  const [documentsData, setDocumentsData] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])
  const [kpiData, setKpiData] = useState({ breakdown_count: 0, findings_count: 0 })

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [triggerModalOpen, setTriggerModalOpen] = useState(false)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const [photoPreviewModalOpen, setPhotoPreviewModalOpen] = useState(false)
  const [documentModalOpen, setDocumentModalOpen] = useState(false)

  const [editForm, setEditForm] = useState(DEFAULT_EDIT_FORM)
  const [triggerForm, setTriggerForm] = useState(DEFAULT_TRIGGER_FORM)
  const [scheduleForm, setScheduleForm] = useState(DEFAULT_SCHEDULE_FORM)
  const [documentForm, setDocumentForm] = useState(DEFAULT_DOC_FORM)

  const [photoFile, setPhotoFile] = useState(null)
  const [documentFile, setDocumentFile] = useState(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  const baseAsset = useMemo(() => {
    const fromState = location.state?.asset
    return {
      code: fromState?.code || 'UNKNOWN-ASSET',
      name: fromState?.name || 'Asset Unit',
      status: fromState?.status || 'active',
      categoryName: fromState?.categoryName || 'Heavy Equipment',
      brand: fromState?.brand || '-',
      model: fromState?.model || '-',
      year: fromState?.year || '',
      hm: fromState?.currentHm || 0,
      km: fromState?.currentKm || 0,
      plate: fromState?.plateNumber || '-',
      serialNumber: fromState?.serialNumber || '-',
      chasisNo: fromState?.chasisNo || '-',
      engineNo: fromState?.engineNo || '-',
      assetNo: fromState?.assetNo || '-',
      qrCode: fromState?.qrCode || decodeURIComponent(assetRef || ''),
      publicUuid: fromState?.publicUuid || '',
      ioCode: fromState?.ioCode || fromState?.code || '-',
      companyCode: fromState?.companyCode || '-',
      plant: fromState?.plant || '-',
      vehPlateNo: fromState?.vehPlateNo || fromState?.plateNumber || '-',
      notes: fromState?.notes || '-',
    }
  }, [assetRef, location.state?.asset])

  const resolvedAsset = useMemo(() => {
    if (!assetData) return baseAsset
    return {
      code: assetData.code || baseAsset.code,
      name: assetData.name || baseAsset.name,
      status: assetData.status || baseAsset.status,
      categoryName: assetData.category?.name || baseAsset.categoryName,
      brand: assetData.brand || '-',
      model: assetData.model || '-',
      year: assetData.year || '',
      hm: Number(assetData.current_hm || 0),
      km: Number(assetData.current_km || 0),
      plate: assetData.plate_number || '-',
      serialNumber: assetData.serial_number || '-',
      chasisNo: assetData.chasis_no || assetData.serial_number || '-',
      engineNo: assetData.engine_no || assetData.engine_number || '-',
      assetNo: assetData.asset_no || assetData.sap_asset_no || '-',
      qrCode: assetData.qr_code || baseAsset.qrCode,
      publicUuid: assetData.public_uuid || baseAsset.publicUuid,
      ioCode: assetData.io_code || assetData.code || baseAsset.ioCode,
      companyCode: assetData.company_code || '-',
      plant: assetData.plant || assetData.plant_code || '-',
      vehPlateNo: assetData.veh_plate_no || assetData.plate_number || '-',
      notes: assetData.notes || '-',
    }
  }, [assetData, baseAsset])

  const triggerSettings = useMemo(() => [
    { label: 'Trigger Type', value: preventiveData?.trigger_type ? preventiveData.trigger_type.toUpperCase() : 'HM' },
    { label: 'Alert Before Due', value: preventiveData?.alert_before_value ? `${preventiveData.alert_before_value} unit` : '25 unit' },
    { label: 'Escalation', value: preventiveData?.escalation_target || 'planner_supervisor' },
    { label: 'Auto Create WO', value: preventiveData?.auto_create_work_order ? 'Enabled' : 'Disabled' },
  ], [preventiveData])

  const totalCost = workshopHistory.reduce((sum, row) => sum + Number(row.cost || 0), 0)
  const breakdownCount = Number(kpiData?.breakdown_count ?? workshopHistory.filter((row) => row.category === 'breakdown').length)
  const findingsCount = Number(kpiData?.findings_count ?? 0)
  const preventiveCount = workshopHistory.filter((row) => row.category === 'preventive').length
  const compliancePercent = workshopHistory.length > 0
    ? Math.round((preventiveCount / workshopHistory.length) * 100)
    : 0
  const totalDowntimeHours = workshopHistory.reduce((sum, row) => sum + Number(row.downtime_hours || 0), 0)
  const averageDowntimeHours = workshopHistory.length > 0
    ? Number((totalDowntimeHours / workshopHistory.length).toFixed(1))
    : 0

  const normalizedSchedules = useMemo(() => {
    const now = new Date()
    return scheduleData.map((row) => {
      const dueDate = row.next_due_at ? new Date(row.next_due_at) : null
      const isOverdueByDate = Boolean(dueDate && dueDate < now && row.status !== 'completed')
      return { ...row, dueDate, isOverdueByDate }
    })
  }, [scheduleData])

  const preventiveHealth = useMemo(() => {
    const overdueCount = normalizedSchedules.filter((row) => row.status === 'overdue' || row.isOverdueByDate).length
    const dueCount = normalizedSchedules.filter((row) => row.status === 'due').length
    const hasTrigger = Boolean(preventiveData?.trigger_type)
    if (overdueCount > 0) {
      return { label: 'Critical', className: 'bg-red-500/15 text-red-300 border-red-500/40', hint: `${overdueCount} jadwal overdue` }
    }
    if (dueCount > 0 || !hasTrigger) {
      return { label: 'Warning', className: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40', hint: dueCount > 0 ? `${dueCount} jadwal due` : 'Trigger belum dikonfigurasi' }
    }
    return { label: 'Aman', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40', hint: 'Preventive dalam batas aman' }
  }, [normalizedSchedules, preventiveData])

  const timelineItems = useMemo(() => {
    const nextDue = [...normalizedSchedules]
      .filter((row) => row.dueDate)
      .sort((a, b) => a.dueDate - b.dueDate)[0]
    const latestWorkshop = [...workshopHistory]
      .filter((row) => row.date_out || row.date_in)
      .sort((a, b) => new Date(b.date_out || b.date_in) - new Date(a.date_out || a.date_in))[0]

    return [
      {
        title: 'Trigger Preventive',
        value: preventiveData?.trigger_type ? `Aktif (${preventiveData.trigger_type.toUpperCase()})` : 'Belum diset',
        meta: preventiveHealth.hint,
      },
      {
        title: 'Jadwal Service Berikutnya',
        value: nextDue?.name || 'Belum ada jadwal',
        meta: nextDue?.next_due_at || '-',
      },
      {
        title: 'Service Terakhir',
        value: latestWorkshop?.reference_no || latestWorkshop?.category || 'Belum ada history',
        meta: latestWorkshop?.date_out || latestWorkshop?.date_in || '-',
      },
      {
        title: 'Dokumen & Foto',
        value: `${documentsData.length} dokumen / ${photosData.length} foto`,
        meta: 'Kelengkapan arsip unit',
      },
    ]
  }, [normalizedSchedules, workshopHistory, preventiveData, preventiveHealth.hint, documentsData.length, photosData.length])

  const fireError = async (err, fallback) => {
    await swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: err instanceof ApiError ? err.message : fallback,
    })
  }

  const fetchAll = async () => {
    if (!assetRef) return
    setLoading(true)
    setError('')
    try {
      const encodedRef = encodeURIComponent(assetRef)
      const [detail, photos, preventive, schedules, history, documents, kpis] = await Promise.all([
        apiRequest(`/assets/detail/${encodedRef}`),
        apiRequest(`/assets/detail/${encodedRef}/photos`),
        apiRequest(`/assets/detail/${encodedRef}/preventive`),
        apiRequest(`/assets/detail/${encodedRef}/schedules`),
        apiRequest(`/assets/detail/${encodedRef}/workshop-history?per_page=50`),
        apiRequest(`/assets/detail/${encodedRef}/documents`),
        apiRequest(`/assets/detail/${encodedRef}/kpis`),
      ])
      setAssetData(detail?.asset || null)
      setPhotosData(photos?.data || [])
      setPreventiveData(preventive?.data || null)
      setScheduleData(schedules?.data || [])
      setWorkshopHistory(history?.data || [])
      setDocumentsData(documents?.data || [])
      setKpiData(kpis?.data || { breakdown_count: 0, findings_count: 0 })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat detail asset.')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const rows = await apiRequest('/assets/categories')
      setCategoryOptions(Array.isArray(rows) ? rows : [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchAll()
    fetchCategories()
  }, [assetRef])

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl('')
      return
    }

    const objectUrl = URL.createObjectURL(photoFile)
    setPhotoPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [photoFile])

  const openEditModal = () => {
    setEditForm({
      io_code: resolvedAsset.ioCode === '-' ? '' : resolvedAsset.ioCode,
      name: resolvedAsset.name === '-' ? '' : resolvedAsset.name,
      brand: resolvedAsset.brand === '-' ? '' : resolvedAsset.brand,
      model: resolvedAsset.model === '-' ? '' : resolvedAsset.model,
      company_code: resolvedAsset.companyCode === '-' ? '' : resolvedAsset.companyCode,
      plant: resolvedAsset.plant === '-' ? '' : resolvedAsset.plant,
      year: resolvedAsset.year || '',
      category_id: assetData?.category_id ? String(assetData.category_id) : '',
      status: resolvedAsset.status || 'active',
      current_hm: resolvedAsset.hm || '',
      current_km: resolvedAsset.km || '',
      serial_number: resolvedAsset.serialNumber === '-' ? '' : resolvedAsset.serialNumber,
      chasis_no: resolvedAsset.chasisNo === '-' ? '' : resolvedAsset.chasisNo,
      engine_no: resolvedAsset.engineNo === '-' ? '' : resolvedAsset.engineNo,
      asset_no: resolvedAsset.assetNo === '-' ? '' : resolvedAsset.assetNo,
      plate_number: resolvedAsset.plate === '-' ? '' : resolvedAsset.plate,
      veh_plate_no: resolvedAsset.vehPlateNo === '-' ? '' : resolvedAsset.vehPlateNo,
      notes: resolvedAsset.notes === '-' ? '' : resolvedAsset.notes,
    })
    setEditModalOpen(true)
  }

  const openTriggerModal = () => {
    setTriggerForm({
      trigger_type: preventiveData?.trigger_type || 'hm',
      alert_before_value: preventiveData?.alert_before_value || 25,
      escalation_target: preventiveData?.escalation_target || 'planner_supervisor',
      auto_create_work_order: preventiveData?.auto_create_work_order ?? true,
      notes: preventiveData?.notes || '',
    })
    setTriggerModalOpen(true)
  }

  const handleSaveEditAsset = async () => {
    try {
      await apiRequest(`/assets/detail/${encodeURIComponent(assetRef)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          io_code: editForm.io_code || null,
          brand: editForm.brand || null,
          model: editForm.model || null,
          company_code: editForm.company_code || null,
          plant: editForm.plant || null,
          plant_code: editForm.plant || null,
          year: editForm.year ? Number(editForm.year) : null,
          category_id: editForm.category_id ? Number(editForm.category_id) : null,
          status: editForm.status,
          current_hm: editForm.current_hm ? Number(editForm.current_hm) : null,
          current_km: editForm.current_km ? Number(editForm.current_km) : null,
          serial_number: editForm.serial_number || null,
          chasis_no: editForm.chasis_no || null,
          engine_no: editForm.engine_no || null,
          engine_number: editForm.engine_no || null,
          asset_no: editForm.asset_no || null,
          sap_asset_no: editForm.asset_no || null,
          plate_number: editForm.plate_number || null,
          veh_plate_no: editForm.veh_plate_no || null,
          notes: editForm.notes || null,
        }),
      })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Informasi asset diperbarui.' })
      setEditModalOpen(false)
      await fetchAll()
    } catch (err) {
      await fireError(err, 'Gagal update informasi asset.')
    }
  }

  const handleSaveTrigger = async () => {
    try {
      await apiRequest(`/assets/detail/${encodeURIComponent(assetRef)}/preventive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger_type: triggerForm.trigger_type,
          alert_before_value: Number(triggerForm.alert_before_value || 0),
          escalation_target: triggerForm.escalation_target,
          auto_create_work_order: Boolean(triggerForm.auto_create_work_order),
          notes: triggerForm.notes || null,
        }),
      })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Trigger preventive tersimpan.' })
      setTriggerModalOpen(false)
      await fetchAll()
    } catch (err) {
      await fireError(err, 'Gagal simpan trigger preventive.')
    }
  }

  const handleAddSchedule = async () => {
    try {
      await apiRequest(`/assets/detail/${encodeURIComponent(assetRef)}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: scheduleForm.type,
          name: scheduleForm.name,
          interval_hm: scheduleForm.interval_hm ? Number(scheduleForm.interval_hm) : null,
          interval_km: scheduleForm.interval_km ? Number(scheduleForm.interval_km) : null,
          next_due_at: scheduleForm.next_due_at || null,
          status: scheduleForm.status,
          notes: scheduleForm.notes || null,
        }),
      })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Penjadwalan preventive ditambahkan.' })
      setScheduleModalOpen(false)
      setScheduleForm(DEFAULT_SCHEDULE_FORM)
      await fetchAll()
    } catch (err) {
      await fireError(err, 'Gagal tambah penjadwalan preventive.')
    }
  }

  const handleCancelSchedule = async (scheduleId) => {
    const confirm = await swal.fire({
      icon: 'warning',
      title: 'Batalkan jadwal ini?',
      text: 'Jadwal preventive akan dihapus oleh admin.',
      showCancelButton: true,
      confirmButtonText: 'Ya, batalkan',
      cancelButtonText: 'Batal',
    })
    if (!confirm.isConfirmed) return

    try {
      await apiRequest(`/assets/detail/${encodeURIComponent(assetRef)}/schedules/${scheduleId}`, { method: 'DELETE' })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Jadwal preventive dibatalkan.' })
      await fetchAll()
    } catch (err) {
      await fireError(err, 'Gagal membatalkan jadwal preventive.')
    }
  }

  const handleUploadPhoto = async () => {
    if (!photoFile) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Pilih file foto terlebih dahulu.' })
      return
    }
    try {
      const form = new FormData()
      form.append('photo', photoFile)
      form.append('title', photoFile.name)
      await apiRequest(`/assets/detail/${encodeURIComponent(assetRef)}/photos`, { method: 'POST', body: form })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Foto asset berhasil diupload.' })
      setPhotoModalOpen(false)
      setPhotoFile(null)
      setPhotoPreviewUrl('')
      await fetchAll()
    } catch (err) {
      await fireError(err, 'Gagal upload foto asset.')
    }
  }

  const openPhotoPreviewModal = (photo) => {
    setSelectedPhoto(photo)
    setPhotoPreviewModalOpen(true)
  }

  const handleDeletePhoto = async () => {
    if (!selectedPhoto?.id) return

    const confirm = await swal.fire({
      icon: 'warning',
      title: 'Hapus foto ini?',
      text: 'Foto akan dihapus permanen dari data asset.',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    })
    if (!confirm.isConfirmed) return

    try {
      await apiRequest(`/assets/detail/${encodeURIComponent(assetRef)}/photos/${selectedPhoto.id}`, { method: 'DELETE' })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Foto asset berhasil dihapus.' })
      setPhotoPreviewModalOpen(false)
      setSelectedPhoto(null)
      await fetchAll()
    } catch (err) {
      await fireError(err, 'Gagal menghapus foto asset.')
    }
  }

  const handleUploadDocument = async () => {
    if (!documentFile) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Pilih file dokumen terlebih dahulu.' })
      return
    }
    try {
      const form = new FormData()
      form.append('file', documentFile)
      form.append('type', documentForm.type)
      if (documentForm.document_number) form.append('document_number', documentForm.document_number)
      if (documentForm.issued_at) form.append('issued_at', documentForm.issued_at)
      if (documentForm.expired_at) form.append('expired_at', documentForm.expired_at)
      if (documentForm.notes) form.append('notes', documentForm.notes)
      await apiRequest(`/assets/detail/${encodeURIComponent(assetRef)}/documents`, { method: 'POST', body: form })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Dokumen unit berhasil diupload.' })
      setDocumentModalOpen(false)
      setDocumentFile(null)
      setDocumentForm(DEFAULT_DOC_FORM)
      await fetchAll()
    } catch (err) {
      await fireError(err, 'Gagal upload dokumen unit.')
    }
  }

  const handleDeleteDocument = async (documentId) => {
    const confirm = await swal.fire({
      icon: 'warning',
      title: 'Hapus dokumen ini?',
      text: 'Dokumen akan dihapus permanen.',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    })
    if (!confirm.isConfirmed) return

    try {
      await apiRequest(`/assets/detail/${encodeURIComponent(assetRef)}/documents/${documentId}`, { method: 'DELETE' })
      await fetchAll()
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Dokumen berhasil dihapus.' })
    } catch (err) {
      await fireError(err, 'Gagal menghapus dokumen unit.')
    }
  }

  const renderDetailSkeleton = () => {
    const tabSkeleton = (() => {
      if (tab === 'photos') {
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="h-4 w-24 rounded bg-slate-700/70 mb-2" />
                <div className="h-3 w-72 rounded bg-slate-700/50" />
              </div>
              <div className="h-9 w-28 rounded-xl bg-slate-700/70" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`sk-photo-${index}`} className="card p-3">
                  <div className="aspect-video rounded-xl bg-slate-700/70" />
                  <div className="h-3 w-28 rounded bg-slate-700/50 mt-2" />
                </div>
              ))}
            </div>
          </div>
        )
      }
      if (tab === 'triggers') {
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="h-4 w-32 rounded bg-slate-700/70 mb-2" />
                <div className="h-3 w-64 rounded bg-slate-700/50" />
              </div>
              <div className="h-9 w-36 rounded-xl bg-slate-700/70" />
            </div>
            <div className="h-20 rounded-xl bg-slate-700/60" />
            <div className="card p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`sk-trigger-${index}`} className="h-4 w-full rounded bg-slate-700/60" />
              ))}
            </div>
          </div>
        )
      }
      if (tab === 'schedule') {
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="h-4 w-28 rounded bg-slate-700/70 mb-2" />
                <div className="h-3 w-64 rounded bg-slate-700/50" />
              </div>
              <div className="h-9 w-44 rounded-xl bg-slate-700/70" />
            </div>
            <div className="card p-5 space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`sk-schedule-${index}`} className="h-4 w-full rounded bg-slate-700/60" />
              ))}
            </div>
          </div>
        )
      }
      if (tab === 'documents') {
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="h-4 w-28 rounded bg-slate-700/70 mb-2" />
                <div className="h-3 w-72 rounded bg-slate-700/50" />
              </div>
              <div className="h-9 w-36 rounded-xl bg-slate-700/70" />
            </div>
            <div className="card p-5 space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`sk-doc-${index}`} className="h-12 w-full rounded-xl bg-slate-700/60" />
              ))}
            </div>
          </div>
        )
      }
      if (tab === 'workshop') {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`sk-workshop-kpi-${index}`} className="card p-4">
                  <div className="h-3 w-20 rounded bg-slate-700/50 mb-2" />
                  <div className="h-6 w-24 rounded bg-slate-700/70" />
                </div>
              ))}
            </div>
            <div className="card p-5 space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`sk-workshop-row-${index}`} className="h-4 w-full rounded bg-slate-700/60" />
              ))}
            </div>
          </div>
        )
      }

      return (
        <div className="card p-5">
          <div className="h-4 w-40 rounded bg-slate-700/70 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`sk-overview-${index}`}>
                <div className="h-3 w-20 rounded bg-slate-700/50 mb-2" />
                <div className="h-4 w-full rounded bg-slate-700/70" />
              </div>
            ))}
          </div>
        </div>
      )
    })()

    return (
      <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`sk-kpi-${index}`} className="card p-4">
            <div className="h-3 w-20 rounded bg-slate-700/50 mb-3" />
            <div className="h-6 w-28 rounded bg-slate-700/70" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-40 rounded bg-slate-700/70" />
            <div className="h-6 w-20 rounded-full bg-slate-700/70" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`sk-timeline-${index}`} className="rounded-xl border border-slate-700 bg-slate-800/40 p-3">
                <div className="h-3 w-28 rounded bg-slate-700/60 mb-2" />
                <div className="h-4 w-3/4 rounded bg-slate-700/70 mb-2" />
                <div className="h-3 w-1/2 rounded bg-slate-700/50" />
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <div className="h-4 w-32 rounded bg-slate-700/70 mb-4" />
          <div className="rounded-xl border border-slate-700 p-3 mb-3">
            <div className="h-3 w-24 rounded bg-slate-700/60 mb-2" />
            <div className="h-5 w-20 rounded bg-slate-700/70 mb-2" />
            <div className="h-3 w-32 rounded bg-slate-700/50" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`sk-health-${index}`} className="h-4 w-full rounded bg-slate-700/60" />
            ))}
          </div>
        </div>
      </div>
      <div className="card p-2 inline-flex rounded-2xl border border-slate-700 gap-1">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`sk-tab-${index}`} className="h-8 w-24 rounded-xl bg-slate-700/70" />
        ))}
      </div>
      <div>
        {tabSkeleton}
      </div>
    </div>
    )
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500 mb-1">
            <Link to="/assets" className="hover:text-slate-300">Assets</Link>
            <span className="mx-1">/</span>
            <span className="text-slate-400">Detail</span>
            <span className="mx-1">/</span>
            <span className="text-blue-300">{resolvedAsset.code}</span>
          </div>
          <h2 className="text-xl font-bold text-white">{resolvedAsset.code} - {resolvedAsset.name}</h2>
          <p className="text-sm text-slate-500">Detail informasi unit asset.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate('/assets')} className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/40">
            Back
          </button>
          {statusBadge(resolvedAsset.status)}
          <button type="button" onClick={fetchAll} disabled={loading} className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/40 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Memuat...' : 'Muat Ulang'}
          </button>
          <button type="button" onClick={openEditModal} className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/40">Edit Informasi Asset</button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`sk-head-${index}`} className="card p-4">
              <div className="h-3 w-16 rounded bg-slate-700/50 mb-2" />
              <div className="h-4 w-24 rounded bg-slate-700/70" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="card p-4"><div className="text-xs text-slate-500 mb-1">Kategori</div><div className="text-sm text-slate-200">{resolvedAsset.categoryName}</div></div>
          <div className="card p-4"><div className="text-xs text-slate-500 mb-1">HM / KM</div><div className="text-sm text-slate-200">{resolvedAsset.hm > 0 ? `${resolvedAsset.hm.toLocaleString()} HM` : `${resolvedAsset.km.toLocaleString()} KM`}</div></div>
          <div className="card p-4"><div className="text-xs text-slate-500 mb-1">Chasis No.</div><div className="text-sm text-slate-200">{resolvedAsset.chasisNo || '-'}</div></div>
          <div className="card p-4"><div className="text-xs text-slate-500 mb-1">KODE IO</div><div className="text-sm text-slate-200">{resolvedAsset.ioCode}</div></div>
        </div>
      )}

      {error && <div className="card p-4 text-sm text-red-300 border border-red-500/30">{error}</div>}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="card p-4">
            <div className="text-xs text-slate-500">Asset Downtime Total</div>
            <div className="text-xl font-semibold text-yellow-300 mt-1">{totalDowntimeHours.toLocaleString('id-ID')} jam</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-slate-500">Biaya Maintenance</div>
            <div className="text-xl font-semibold text-emerald-300 mt-1">Rp {totalCost.toLocaleString('id-ID')}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-slate-500">Breakdown</div>
            <div className="text-xl font-semibold text-red-300 mt-1">{breakdownCount} kejadian</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-slate-500">Temuan</div>
            <div className="text-xl font-semibold text-amber-300 mt-1">{findingsCount} temuan</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-slate-500">Kepatuhan Preventive</div>
            <div className="text-xl font-semibold text-blue-300 mt-1">{compliancePercent}%</div>
          </div>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="card p-5 xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Timeline Kesehatan Asset</h3>
              <span className={`px-2.5 py-1 rounded-full text-xs border ${preventiveHealth.className}`}>{preventiveHealth.label}</span>
            </div>
            <div className="space-y-3">
              {timelineItems.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-700 bg-slate-800/40 p-3">
                  <div className="text-xs text-slate-500">{item.title}</div>
                  <div className="text-sm text-slate-200 mt-1">{item.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{item.meta}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Status Preventive</h3>
            <div className={`rounded-xl border p-3 mb-3 ${preventiveHealth.className}`}>
              <div className="text-xs">Kondisi Saat Ini</div>
              <div className="text-base font-semibold mt-1">{preventiveHealth.label}</div>
              <div className="text-xs mt-1">{preventiveHealth.hint}</div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Overdue</span>
                <span>{normalizedSchedules.filter((row) => row.status === 'overdue' || row.isOverdueByDate).length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Due</span>
                <span>{normalizedSchedules.filter((row) => row.status === 'due').length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Scheduled</span>
                <span>{normalizedSchedules.filter((row) => row.status === 'scheduled').length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Completed</span>
                <span>{normalizedSchedules.filter((row) => row.status === 'completed').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <div className="card p-2 inline-flex rounded-2xl border border-slate-700 gap-1">
          {[
            ['overview', 'Informasi'],
            ['photos', 'Foto Aset'],
            ['triggers', 'Trigger Preventive'],
            ['schedule', 'Penjadwalan'],
            ['documents', 'Dokumen Unit'],
            ['workshop', 'History Workshop'],
          ].map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={`px-3 py-2 rounded-xl text-sm transition-colors ${tab === key ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:bg-slate-700/40'}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {loading ? renderDetailSkeleton() : tab === 'overview' && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Informasi Umum Asset</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><div className="text-xs text-slate-500 mb-1">Brand</div><div className="text-slate-200">{resolvedAsset.brand}</div></div>
            <div><div className="text-xs text-slate-500 mb-1">Model</div><div className="text-slate-200">{resolvedAsset.model}</div></div>
            <div><div className="text-xs text-slate-500 mb-1">Company Code</div><div className="text-slate-200">{resolvedAsset.companyCode}</div></div>
            <div><div className="text-xs text-slate-500 mb-1">Plant</div><div className="text-slate-200">{resolvedAsset.plant}</div></div>
            <div><div className="text-xs text-slate-500 mb-1">Tahun</div><div className="text-slate-200">{resolvedAsset.year || '-'}</div></div>
            <div><div className="text-xs text-slate-500 mb-1">No Polisi</div><div className="text-slate-200">{resolvedAsset.vehPlateNo}</div></div>
            <div><div className="text-xs text-slate-500 mb-1">Chasis No.</div><div className="text-slate-200">{resolvedAsset.chasisNo}</div></div>
            <div><div className="text-xs text-slate-500 mb-1">Engine No.</div><div className="text-slate-200">{resolvedAsset.engineNo}</div></div>
            <div><div className="text-xs text-slate-500 mb-1">Asset No.</div><div className="text-slate-200">{resolvedAsset.assetNo}</div></div>
            <div><div className="text-xs text-slate-500 mb-1">QR Code</div><div className="text-slate-200 font-mono text-xs">{resolvedAsset.qrCode}</div></div>
            <div className="col-span-2"><div className="text-xs text-slate-500 mb-1">Catatan</div><div className="text-slate-200">{resolvedAsset.notes}</div></div>
          </div>
        </div>
      )}

      {!loading && tab === 'photos' && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Foto Asset</h3>
              <p className="text-xs text-slate-500 mt-1">Unggah foto kondisi unit terbaru untuk kebutuhan monitoring visual dan audit.</p>
            </div>
            <button type="button" onClick={() => setPhotoModalOpen(true)} className="btn-primary px-4 py-2 rounded-xl text-sm text-white">Tambah Foto</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(photosData.length > 0 ? photosData : []).map((photo) => (
              <div key={photo.id} className="card p-3">
                <button type="button" onClick={() => openPhotoPreviewModal(photo)} className="aspect-video w-full rounded-xl overflow-hidden border border-slate-700 text-left">
                  <img
                    src={photo.photo_path}
                    alt={photo.title || 'asset-photo'}
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                      const parent = event.currentTarget.parentElement
                      if (parent && !parent.querySelector('[data-photo-fallback=\"1\"]')) {
                        const fallback = document.createElement('div')
                        fallback.setAttribute('data-photo-fallback', '1')
                        fallback.className = 'w-full h-full flex items-center justify-center text-xs text-slate-400 bg-slate-900/40'
                        fallback.textContent = 'Foto tidak tersedia'
                        parent.appendChild(fallback)
                      }
                    }}
                  />
                </button>
                <div className="mt-2 text-xs text-slate-300">{photo.title || `Photo #${photo.id}`}</div>
              </div>
            ))}
            {photosData.length === 0 && <div className="card p-6 text-xs text-slate-400 md:col-span-3">Belum ada foto asset.</div>}
          </div>
        </div>
      )}

      {!loading && tab === 'triggers' && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Trigger Preventive</h3>
              <p className="text-xs text-slate-500 mt-1">Kelola trigger preventive untuk unit Anda.</p>
            </div>
            <button type="button" onClick={openTriggerModal} className="btn-primary px-4 py-2 rounded-xl text-sm text-white">Tambah / Ubah Trigger</button>
          </div>
          <div className={`rounded-xl border px-4 py-3 ${preventiveHealth.className}`}>
            <div className="text-xs">Status Trigger Preventive</div>
            <div className="text-sm font-semibold mt-1">{preventiveHealth.label}</div>
            <div className="text-xs mt-1">{preventiveHealth.hint}</div>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Setting Trigger Preventive</h3>
            <div className="space-y-3 text-sm">
              {triggerSettings.map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-slate-700 pb-2 last:border-0 last:pb-0">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="text-slate-200">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && tab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Penjadwalan</h3>
              <p className="text-xs text-slate-500 mt-1">Kelola jadwal preventive untuk unit Anda.</p>
            </div>
            <button type="button" onClick={() => setScheduleModalOpen(true)} className="btn-primary px-4 py-2 rounded-xl text-sm text-white">Tambah Penjadwalan Preventive</button>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Task</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Interval</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal Due</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {scheduleData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-700/20">
                      <td className="py-3 px-4 text-slate-200">{row.name || '-'}</td>
                      <td className="py-3 px-4 text-slate-400 text-xs">{row.interval_hm ? `${row.interval_hm} HM` : '-'} {row.interval_km ? `/ ${row.interval_km} KM` : ''}</td>
                      <td className="py-3 px-4 text-blue-300 text-xs">{row.next_due_at || '-'}</td>
                      <td className="py-3 px-4 text-xs text-slate-300">{row.status || 'scheduled'}</td>
                      <td className="py-3 px-4">
                        <button type="button" onClick={() => handleCancelSchedule(row.id)} className="btn-primary px-3 py-1.5 rounded-lg text-xs text-white">Cancel</button>
                      </td>
                    </tr>
                  ))}
                  {scheduleData.length === 0 && <tr><td colSpan="5" className="py-8 text-center text-slate-400">Belum ada jadwal preventive.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Dokumen Unit</h3>
              <p className="text-xs text-slate-500 mt-1">Kelola dokumen legal dan administratif unit seperti STNK, BPKB, KIR, dan lainnya.</p>
            </div>
            <button type="button" onClick={() => setDocumentModalOpen(true)} className="btn-primary px-4 py-2 rounded-xl text-sm text-white">Tambah Dokumen Unit</button>
          </div>
          <div className="card p-5">
            {documentsData.length === 0 ? (
              <div className="text-xs text-slate-400">Belum ada dokumen unit.</div>
            ) : (
              <div className="space-y-2">
                {documentsData.map((doc) => (
                  <div key={doc.id} className="p-3 rounded-xl bg-slate-700/20 border border-slate-700 text-xs flex items-center justify-between">
                    <div>
                      <div className="text-slate-200">{doc.type?.toUpperCase()} {doc.document_number ? `- ${doc.document_number}` : ''}</div>
                      <div className="text-slate-500">{doc.file_path}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <a href={doc.file_path} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline">Lihat</a>
                      <button type="button" onClick={() => handleDeleteDocument(doc.id)} className="text-red-300 hover:underline">Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'workshop' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-4"><div className="text-xs text-slate-500">Total Cost</div><div className="text-lg font-bold text-emerald-300">Rp {totalCost.toLocaleString('id-ID')}</div></div>
            <div className="card p-4"><div className="text-xs text-slate-500">Total Job</div><div className="text-lg font-bold text-blue-300">{workshopHistory.length}</div></div>
            <div className="card p-4"><div className="text-xs text-slate-500">Avg Asset Downtime</div><div className="text-lg font-bold text-yellow-300">{averageDowntimeHours.toLocaleString('id-ID')} jam</div></div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">WO</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Periode</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kategori</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Issue</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {workshopHistory.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-700/20">
                      <td className="py-3 px-4 text-xs text-blue-300 font-mono">{row.reference_no || `HIS-${row.id}`}</td>
                      <td className="py-3 px-4 text-xs text-slate-300">{row.date_in || '-'} s/d {row.date_out || '-'}</td>
                      <td className="py-3 px-4 text-xs text-slate-300">{row.category || '-'}</td>
                      <td className="py-3 px-4 text-xs text-slate-300">{row.issue || '-'}</td>
                      <td className="py-3 px-4 text-xs text-slate-300">{row.action_taken || '-'}</td>
                      <td className="py-3 px-4 text-xs text-emerald-300">Rp {Number(row.cost || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                  {workshopHistory.length === 0 && <tr><td colSpan="6" className="py-8 text-center text-slate-400">Belum ada history workshop.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && (
        <ModalPortal>
          <div onClick={() => setEditModalOpen(false)} className="max-h-screen overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-8">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-700"><h3 className="font-semibold text-white">Edit Informasi Asset</h3></div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
                <label className="text-xs text-slate-300">KODE IO<input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="KODE IO" value={editForm.io_code} onChange={(e) => setEditForm((s) => ({ ...s, io_code: e.target.value }))} /></label>
                <label className="text-xs text-slate-300 md:col-span-2">Nama Asset<input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="Nama asset" value={editForm.name} onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Status<select className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" value={editForm.status} onChange={(e) => setEditForm((s) => ({ ...s, status: e.target.value }))}>
                  <option value="active">active</option><option value="inactive">inactive</option><option value="maintenance">maintenance</option><option value="breakdown">breakdown</option>
                </select></label>
                <label className="text-xs text-slate-300">Kategori<select className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" value={editForm.category_id} onChange={(e) => setEditForm((s) => ({ ...s, category_id: e.target.value }))}>
                  <option value="">Pilih kategori</option>
                  {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select></label>
                <label className="text-xs text-slate-300">Brand<input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="Brand" value={editForm.brand} onChange={(e) => setEditForm((s) => ({ ...s, brand: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Model<input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="Model" value={editForm.model} onChange={(e) => setEditForm((s) => ({ ...s, model: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Company Code<input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="Company Code" value={editForm.company_code} onChange={(e) => setEditForm((s) => ({ ...s, company_code: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Plant<input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="Plant" value={editForm.plant} onChange={(e) => setEditForm((s) => ({ ...s, plant: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Tahun<input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="Tahun" value={editForm.year} onChange={(e) => setEditForm((s) => ({ ...s, year: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Serial Number (Legacy)<input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="Serial Number (legacy)" value={editForm.serial_number} onChange={(e) => setEditForm((s) => ({ ...s, serial_number: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Chasis No.<input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="Chasis No." value={editForm.chasis_no} onChange={(e) => setEditForm((s) => ({ ...s, chasis_no: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Engine No.<input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="Engine No." value={editForm.engine_no} onChange={(e) => setEditForm((s) => ({ ...s, engine_no: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Asset No.<input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="Asset No." value={editForm.asset_no} onChange={(e) => setEditForm((s) => ({ ...s, asset_no: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Plate Number (Legacy)<input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="Plate Number (legacy)" value={editForm.plate_number} onChange={(e) => setEditForm((s) => ({ ...s, plate_number: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Veh. Plate No. / No. Polisi<input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="Veh. Plate No. / No. Polisi" value={editForm.veh_plate_no} onChange={(e) => setEditForm((s) => ({ ...s, veh_plate_no: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Current HM<input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="Current HM" value={editForm.current_hm} onChange={(e) => setEditForm((s) => ({ ...s, current_hm: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Current KM<input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="Current KM" value={editForm.current_km} onChange={(e) => setEditForm((s) => ({ ...s, current_km: e.target.value }))} /></label>
                <label className="text-xs text-slate-300 md:col-span-3 xl:col-span-4">Catatan<textarea className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" rows={3} placeholder="Catatan" value={editForm.notes} onChange={(e) => setEditForm((s) => ({ ...s, notes: e.target.value }))} /></label>
              </div>
              <div className="p-5 border-t border-slate-700 flex justify-end gap-2">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300">Batal</button>
                <button type="button" onClick={handleSaveEditAsset} className="px-4 py-2 rounded-xl bg-blue-600 text-white">Simpan</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {triggerModalOpen && (
        <ModalPortal>
          <div onClick={() => setTriggerModalOpen(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-700"><h3 className="font-semibold text-white">Form Trigger Preventive</h3></div>
              <div className="p-5 space-y-3">
                <label className="text-xs text-slate-300">Trigger Type
                  <select className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" value={triggerForm.trigger_type} onChange={(e) => setTriggerForm((s) => ({ ...s, trigger_type: e.target.value }))}>
                    <option value="hm">Hour Meter (HM)</option>
                    <option value="km">Kilometer (KM)</option>
                    <option value="calendar">Calendar</option>
                  </select>
                </label>
                <label className="text-xs text-slate-300">Batas Alert Sebelum Due
                  <input className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" placeholder="Batas alert sebelum due" value={triggerForm.alert_before_value} onChange={(e) => setTriggerForm((s) => ({ ...s, alert_before_value: e.target.value }))} />
                </label>
                <label className="text-xs text-slate-300">Escalation Target
                  <select className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" value={triggerForm.escalation_target} onChange={(e) => setTriggerForm((s) => ({ ...s, escalation_target: e.target.value }))}>
                    <option value="planner">Planner</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="planner_supervisor">Planner + Supervisor</option>
                  </select>
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={triggerForm.auto_create_work_order} onChange={(e) => setTriggerForm((s) => ({ ...s, auto_create_work_order: e.target.checked }))} />Auto Create Work Order</label>
                <label className="text-xs text-slate-300">Catatan Trigger
                  <textarea className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" rows={3} placeholder="Catatan trigger" value={triggerForm.notes} onChange={(e) => setTriggerForm((s) => ({ ...s, notes: e.target.value }))} />
                </label>
              </div>
              <div className="p-5 border-t border-slate-700 flex justify-end gap-2">
                <button type="button" onClick={() => setTriggerModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300">Batal</button>
                <button type="button" onClick={handleSaveTrigger} className="px-4 py-2 rounded-xl bg-blue-600 text-white">Simpan Trigger</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {scheduleModalOpen && (
        <ModalPortal>
          <div onClick={() => setScheduleModalOpen(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-700"><h3 className="font-semibold text-white">Tambah Penjadwalan Preventive</h3></div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-xs text-slate-300">Tipe
                  <select className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" value={scheduleForm.type} onChange={(e) => setScheduleForm((s) => ({ ...s, type: e.target.value }))}>
                    <option value="preventive">preventive</option>
                    <option value="periodic">periodic</option>
                    <option value="conditional">conditional</option>
                  </select>
                </label>
                <label className="text-xs text-slate-300">Status
                  <select className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" value={scheduleForm.status} onChange={(e) => setScheduleForm((s) => ({ ...s, status: e.target.value }))}>
                    <option value="scheduled">scheduled</option>
                    <option value="due">due</option>
                    <option value="overdue">overdue</option>
                    <option value="completed">completed</option>
                  </select>
                </label>
                <label className="text-xs text-slate-300 sm:col-span-2">Nama Jadwal Preventive
                  <input className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Nama jadwal preventive" value={scheduleForm.name} onChange={(e) => setScheduleForm((s) => ({ ...s, name: e.target.value }))} />
                </label>
                <label className="text-xs text-slate-300">Interval HM
                  <input className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Interval HM" value={scheduleForm.interval_hm} onChange={(e) => setScheduleForm((s) => ({ ...s, interval_hm: e.target.value }))} />
                </label>
                <label className="text-xs text-slate-300">Interval KM
                  <input className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Interval KM" value={scheduleForm.interval_km} onChange={(e) => setScheduleForm((s) => ({ ...s, interval_km: e.target.value }))} />
                </label>
                <label className="text-xs text-slate-300 sm:col-span-2">Tanggal Due
                  <input type="date" className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" value={scheduleForm.next_due_at} onChange={(e) => setScheduleForm((s) => ({ ...s, next_due_at: e.target.value }))} />
                </label>
                <label className="text-xs text-slate-300 sm:col-span-2">Catatan
                  <textarea className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" rows={3} placeholder="Catatan" value={scheduleForm.notes} onChange={(e) => setScheduleForm((s) => ({ ...s, notes: e.target.value }))} />
                </label>
              </div>
              <div className="p-5 border-t border-slate-700 flex justify-end gap-2">
                <button type="button" onClick={() => setScheduleModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300">Batal</button>
                <button type="button" onClick={handleAddSchedule} className="px-4 py-2 rounded-xl bg-blue-600 text-white">Simpan Jadwal</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {photoModalOpen && (
        <ModalPortal>
          <div onClick={() => setPhotoModalOpen(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-700"><h3 className="font-semibold text-white">Upload Foto Asset</h3></div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                <div>
                  <label
                    className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-600 hover:border-emerald-400/60 bg-slate-900/40 p-6 text-center h-[320px] flex flex-col items-center justify-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const file = e.dataTransfer.files?.[0]
                      if (file) setPhotoFile(file)
                    }}
                  >
                    <div className="text-sm text-slate-200 font-medium">Drop file foto di sini</div>
                    <div className="text-xs text-slate-500 mt-1">atau klik untuk memilih file image</div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                    {photoFile && <div className="text-xs text-emerald-300 mt-3">{photoFile.name}</div>}
                  </label>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-3 h-[320px] flex flex-col">
                  <div className="text-xs text-slate-400 mb-2">Preview</div>
                  {photoPreviewUrl ? (
                    <>
                      <div className="flex-1 rounded-lg border border-slate-700 bg-slate-950/40 overflow-hidden flex items-center justify-center">
                        <img src={photoPreviewUrl} alt="Preview Foto Asset" className="w-full h-full object-contain" />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoFile(null)
                            setPhotoPreviewUrl('')
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs border border-slate-600 text-slate-300 hover:bg-slate-700/40"
                        >
                          Hapus Pilihan
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-xs text-slate-500">
                      Belum ada preview
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 border-t border-slate-700 flex justify-end gap-2">
                <button type="button" onClick={() => setPhotoModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300">Batal</button>
                <button type="button" onClick={handleUploadPhoto} className="px-4 py-2 rounded-xl bg-blue-600 text-white">Upload</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {photoPreviewModalOpen && selectedPhoto && (
        <ModalPortal>
          <div className="fixed inset-0 z-[80] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Preview Foto Asset</h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedPhoto.title || `Photo #${selectedPhoto.id}`}</p>
                </div>
                <button type="button" onClick={() => { setPhotoPreviewModalOpen(false); setSelectedPhoto(null) }} className="px-3 py-2 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700/60 text-sm">Tutup</button>
              </div>
              <div className="p-4">
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900/50">
                  <img
                    src={selectedPhoto.photo_path}
                    alt={selectedPhoto.title || 'asset-photo-preview'}
                    className="w-full max-h-[50vh] object-contain"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 break-all">{selectedPhoto.photo_path || '-'}</div>
                  <button type="button" onClick={handleDeletePhoto} className="btn-primary px-4 py-2 rounded-xl text-sm text-white">
                    Hapus Foto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {documentModalOpen && (
        <ModalPortal>
          <div onClick={() => setDocumentModalOpen(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-700"><h3 className="font-semibold text-white">Tambah Dokumen Unit</h3></div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className="sm:col-span-2 block cursor-pointer rounded-2xl border-2 border-dashed border-slate-600 hover:border-yellow-400/60 bg-slate-900/40 p-6 text-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files?.[0]
                    if (file) setDocumentFile(file)
                  }}
                >
                  <div className="text-sm text-slate-200 font-medium">Drop file dokumen di sini</div>
                  <div className="text-xs text-slate-500 mt-1">atau klik untuk memilih file dokumen</div>
                  <input type="file" className="hidden" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
                  {documentFile && <div className="text-xs text-yellow-300 mt-3">{documentFile.name}</div>}
                </label>
                <select className="input px-3 py-2 rounded-xl text-sm" value={documentForm.type} onChange={(e) => setDocumentForm((s) => ({ ...s, type: e.target.value }))}>
                  <option value="stnk">stnk</option>
                  <option value="bpkb">bpkb</option>
                  <option value="kir">kir</option>
                  <option value="insurance">insurance</option>
                  <option value="other">other</option>
                </select>
                <input className="input px-3 py-2 rounded-xl text-sm" placeholder="Nomor dokumen" value={documentForm.document_number} onChange={(e) => setDocumentForm((s) => ({ ...s, document_number: e.target.value }))} />
                <input type="date" className="input px-3 py-2 rounded-xl text-sm" value={documentForm.issued_at} onChange={(e) => setDocumentForm((s) => ({ ...s, issued_at: e.target.value }))} />
                <input type="date" className="input px-3 py-2 rounded-xl text-sm" value={documentForm.expired_at} onChange={(e) => setDocumentForm((s) => ({ ...s, expired_at: e.target.value }))} />
                <textarea className="input px-3 py-2 rounded-xl text-sm sm:col-span-2" rows={3} placeholder="Catatan" value={documentForm.notes} onChange={(e) => setDocumentForm((s) => ({ ...s, notes: e.target.value }))} />
              </div>
              <div className="p-5 border-t border-slate-700 flex justify-end gap-2">
                <button type="button" onClick={() => setDocumentModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300">Batal</button>
                <button type="button" onClick={handleUploadDocument} className="px-4 py-2 rounded-xl bg-blue-600 text-white">Upload</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
