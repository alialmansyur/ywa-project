import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'
import { apiRequest, ApiError, uploadWithProgress } from '../../../services/api'
import { ModalPortal } from '../../shared/components/ModalPortal'

const DEFAULT_FORM = {
  code: '',
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

const DEFAULT_ASSIGN_FORM = {
  user_id: '',
  notes: '',
}

const STATUS_OPTIONS = ['active', 'inactive', 'maintenance', 'breakdown']

const swal = Swal.mixin({
  width: 420,
  customClass: {
    popup: 'rounded-2xl',
    confirmButton: 'rounded-lg',
    cancelButton: 'rounded-lg',
  },
  buttonsStyling: true,
})

function toAsset(item) {
  const assignment = item.active_assignment || null
  return {
    id: item.id,
    publicUuid: item.public_uuid || '',
    code: item.code || '-',
    ioCode: item.io_code || item.code || '-',
    name: item.name || '-',
    brand: item.brand || '-',
    model: item.model || '-',
    companyCode: item.company_code || '-',
    plant: item.plant || item.plant_code || '-',
    year: item.year,
    categoryId: item.category_id,
    categoryName: item.category?.name || '-',
    status: (item.status || '').toLowerCase(),
    currentHm: Number(item.current_hm || 0),
    currentKm: Number(item.current_km || 0),
    serialNumber: item.serial_number || '-',
    chasisNo: item.chasis_no || item.serial_number || '-',
    engineNo: item.engine_no || item.engine_number || '-',
    assetNo: item.asset_no || item.sap_asset_no || '-',
    plateNumber: item.plate_number || '-',
    vehPlateNo: item.veh_plate_no || item.plate_number || '-',
    notes: item.notes || '-',
    qrCode: item.qr_code || '-',
    latestLocation: item.latest_location || null,
    activeAssignment: assignment ? {
      id: assignment.id,
      assignedAt: assignment.assigned_at || null,
      notes: assignment.notes || '',
      user: assignment.user ? {
        id: assignment.user.id,
        name: assignment.user.name || '-',
        email: assignment.user.email || '-',
      } : null,
    } : null,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

function statusBadge(status) {
  const map = {
    active: 'bg-green-500/15 text-green-400 border-green-500/30',
    inactive: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    maintenance: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    breakdown: 'bg-red-500/15 text-red-400 border-red-500/30',
  }
  const cls = map[status] || map.inactive
  return <span className={`px-2 py-0.5 rounded-full text-xs border ${cls}`}>{status || 'unknown'}</span>
}

function SkeletonBox({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-700/60 ${className}`} />
}

function formatAssignmentLabel(asset) {
  if (!asset?.activeAssignment?.user) return 'Belum di-assign'
  return asset.activeAssignment.user.name || asset.activeAssignment.user.email || 'User aktif'
}

function EyeIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" /><circle cx="12" cy="12" r="3" strokeWidth="2" /></svg> }
function EditIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 20h4l10-10a2.1 2.1 0 10-4-4L4 16v4z" /></svg> }
function TrashIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14" /></svg> }
function PlusIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14" /></svg> }
function QrIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h2v2h-2zm4 0h2v2h-2zm-4 4h2v2h-2zm2-2h4v4h-2v-2h-2z" /></svg> }
function StatusOnIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 6L9 17l-5-5" /></svg> }
function StatusOffIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6l12 12M18 6L6 18" /></svg> }

export function AssetsPage() {
  const navigate = useNavigate()
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [view, setView] = useState('list')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [selectedSchedule, setSelectedSchedule] = useState([])
  const [selectedHistory, setSelectedHistory] = useState([])
  const [formModal, setFormModal] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [categoryOptions, setCategoryOptions] = useState([])
  const [importFile, setImportFile] = useState(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [qrModal, setQrModal] = useState(null)
  const [scanCode, setScanCode] = useState('')
  const [assignableUsers, setAssignableUsers] = useState([])
  const [assignModal, setAssignModal] = useState(null)
  const [assignForm, setAssignForm] = useState(DEFAULT_ASSIGN_FORM)
  const [assignmentLoading, setAssignmentLoading] = useState(false)

  const stats = useMemo(() => ({
    total,
    active: assets.filter((a) => a.status === 'active').length,
    inactive: assets.filter((a) => a.status === 'inactive').length,
    maintenance: assets.filter((a) => a.status === 'maintenance').length,
  }), [assets, total])

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
      if (query) params.set('search', query)
      if (statusFilter !== 'ALL') params.set('status', statusFilter)

      const response = await apiRequest(`/assets?${params.toString()}`)
      setAssets((response.data || []).map(toAsset))
      setTotal(response.total || 0)
      setLastPage(response.last_page || 1)
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal memuat aset.' })
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  const fetchAssetCategories = async () => {
    try {
      const response = await apiRequest('/assets/categories')
      const rows = Array.isArray(response) ? response : []
      setCategoryOptions(rows.map((item) => ({ id: Number(item.id), name: item.name || `Kategori #${item.id}` })))
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal memuat kategori aset.' })
    }
  }

  const fetchAssignableUsers = async () => {
    try {
      const response = await apiRequest('/users?per_page=200&role=operator&is_active=true')
      const rows = Array.isArray(response?.data) ? response.data : []
      const normalized = rows
        .map((item) => ({
          id: Number(item.id),
          name: item.name || '-',
          email: item.email || '-',
          role: item.roles?.[0]?.name || '',
          isActive: Boolean(item.is_active),
          activeAssignmentAssetId: item.asset_assignments?.[0]?.asset_id ? Number(item.asset_assignments[0].asset_id) : null,
        }))
        .filter((item) => item.isActive && !item.activeAssignmentAssetId)

      setAssignableUsers(normalized.sort((a, b) => a.name.localeCompare(b.name)))
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal memuat user assignment.' })
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [page, perPage, query, statusFilter])

  useEffect(() => {
    fetchAssetCategories()
  }, [])

  useEffect(() => {
    fetchAssignableUsers()
  }, [])

  const openCreate = () => {
    setForm(DEFAULT_FORM)
    setFormModal({ mode: 'create', id: null })
  }

  const openEdit = (asset) => {
    setForm({
      code: asset.code,
      io_code: asset.ioCode === '-' ? '' : asset.ioCode,
      name: asset.name,
      brand: asset.brand === '-' ? '' : asset.brand,
      model: asset.model === '-' ? '' : asset.model,
      company_code: asset.companyCode === '-' ? '' : asset.companyCode,
      plant: asset.plant === '-' ? '' : asset.plant,
      year: asset.year || '',
      category_id: asset.categoryId ? String(asset.categoryId) : '',
      status: asset.status || 'inactive',
      current_hm: asset.currentHm || '',
      current_km: asset.currentKm || '',
      serial_number: asset.serialNumber === '-' ? '' : asset.serialNumber,
      chasis_no: asset.chasisNo === '-' ? '' : asset.chasisNo,
      engine_no: asset.engineNo === '-' ? '' : asset.engineNo,
      asset_no: asset.assetNo === '-' ? '' : asset.assetNo,
      plate_number: asset.plateNumber === '-' ? '' : asset.plateNumber,
      veh_plate_no: asset.vehPlateNo === '-' ? '' : asset.vehPlateNo,
      notes: asset.notes === '-' ? '' : asset.notes,
    })
    setFormModal({ mode: 'edit', id: asset.id })
  }

  const closeForm = () => {
    if (submitLoading) return
    setForm(DEFAULT_FORM)
    setFormModal(null)
  }

  const openAssignModal = (asset) => {
    setAssignForm({
      user_id: asset?.activeAssignment?.user?.id ? String(asset.activeAssignment.user.id) : '',
      notes: asset?.activeAssignment?.notes || '',
    })
    setAssignModal(asset)
  }

  const closeAssignModal = (force = false) => {
    if (assignmentLoading && !force) return
    setAssignModal(null)
    setAssignForm(DEFAULT_ASSIGN_FORM)
  }

  const handleSave = async () => {
    if (!form.name || !form.category_id || (formModal?.mode === 'create' && !form.code)) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Code (saat create), nama, dan kategori wajib diisi.' })
      return
    }

    setSubmitLoading(true)
    try {
      const payload = {
        io_code: form.io_code || null,
        name: form.name,
        brand: form.brand || null,
        model: form.model || null,
        company_code: form.company_code || null,
        plant: form.plant || null,
        plant_code: form.plant || null,
        year: form.year ? Number(form.year) : null,
        category_id: Number(form.category_id),
        status: form.status,
        current_hm: form.current_hm ? Number(form.current_hm) : null,
        current_km: form.current_km ? Number(form.current_km) : null,
        serial_number: form.serial_number || null,
        chasis_no: form.chasis_no || null,
        engine_no: form.engine_no || null,
        engine_number: form.engine_no || null,
        asset_no: form.asset_no || null,
        sap_asset_no: form.asset_no || null,
        plate_number: form.plate_number || null,
        veh_plate_no: form.veh_plate_no || null,
        notes: form.notes || null,
      }

      if (formModal?.mode === 'create') {
        payload.code = form.code
        await apiRequest('/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await apiRequest(`/assets/${formModal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data aset tersimpan.' })
      closeForm()
      await fetchAssets()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal simpan aset.' })
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (asset) => {
    const confirm = await swal.fire({
      title: 'Hapus aset ini?',
      text: `${asset.code} - ${asset.name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    })
    if (!confirm.isConfirmed) return

    try {
      await apiRequest(`/assets/${asset.id}`, { method: 'DELETE' })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Aset dihapus.' })
      if (selected?.id === asset.id) setSelected(null)
      await fetchAssets()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal hapus aset.' })
    }
  }

  const handleAssign = async () => {
    if (!assignModal?.id || !assignForm.user_id) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Pilih member/operator terlebih dahulu.' })
      return
    }

    setAssignmentLoading(true)
    try {
      await apiRequest('/assets/assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_id: assignModal.id,
          user_id: Number(assignForm.user_id),
          notes: assignForm.notes || null,
        }),
      })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Asset berhasil di-assign.' })
      closeAssignModal(true)
      await fetchAssets()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal assign asset.' })
    } finally {
      setAssignmentLoading(false)
    }
  }

  const handleUnassign = async (asset) => {
    const confirm = await swal.fire({
      title: 'Lepas assignment asset ini?',
      text: `${asset.code} - ${asset.name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, lepas',
      cancelButtonText: 'Batal',
    })
    if (!confirm.isConfirmed) return

    setAssignmentLoading(true)
    try {
      await apiRequest('/assets/assignment', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset_id: asset.id }),
      })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Assignment asset berhasil dilepas.' })
      if (selected?.id === asset.id) {
        setSelected((prev) => prev ? { ...prev, activeAssignment: null } : prev)
        setSelectedDetail((prev) => prev ? { ...prev, activeAssignment: null } : prev)
      }
      await fetchAssets()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal unassign asset.' })
    } finally {
      setAssignmentLoading(false)
    }
  }

  const handleToggle = async (asset) => {
    const nextStatus = asset.status === 'active' ? 'inactive' : 'active'
    try {
      await apiRequest(`/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: `Status aset menjadi ${nextStatus}.` })
      await fetchAssets()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal ubah status aset.' })
    }
  }

  const openDetail = async (asset) => {
    setSelected(asset)
    try {
      const [detail, schedule, history] = await Promise.all([
        apiRequest(`/assets/${asset.id}`),
        apiRequest(`/assets/${asset.id}/schedule`),
        apiRequest(`/assets/${asset.id}/history?per_page=10`),
      ])
      setSelectedDetail(toAsset(detail))
      setSelectedSchedule(schedule || [])
      setSelectedHistory(history?.data || [])
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal memuat detail aset.' })
    }
  }

  const handleUpdateHmKm = async () => {
    if (!selected?.id) return
    const hm = window.prompt('Input HM (kosongkan jika tidak update):', '')
    const km = window.prompt('Input KM (kosongkan jika tidak update):', '')
    if (!hm && !km) return

    try {
      await apiRequest(`/assets/${selected.id}/hm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hm_value: hm ? Number(hm) : undefined,
          km_value: km ? Number(km) : undefined,
        }),
      })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'HM/KM berhasil diperbarui.' })
      await openDetail(selected)
      await fetchAssets()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal update HM/KM.' })
    }
  }

  const handleUpdateLocation = async () => {
    if (!selected?.id) return
    const lat = window.prompt('Latitude:', '')
    const lng = window.prompt('Longitude:', '')
    const address = window.prompt('Alamat (opsional):', '') || null
    if (!lat || !lng) return

    try {
      await apiRequest(`/assets/${selected.id}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: Number(lat), lng: Number(lng), address }),
      })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Lokasi aset berhasil diperbarui.' })
      await openDetail(selected)
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal update lokasi.' })
    }
  }

  const downloadImportTemplate = () => {
    const templateRows = [
      {
        code: 'DT-099',
        name: 'Dump Truck 99',
        brand: 'Hino',
        model: 'FM260JD',
        year: 2021,
        category_id: categoryOptions[0]?.id || 1,
        status: 'active',
        current_hm: 0,
        current_km: 52340,
        serial_number: 'SN-DT099',
        plate_number: 'KT 9999 XX',
        notes: 'Contoh import data aset',
      },
    ]

    const masterRows = [
      { field: 'status', allowed_value: 'active' },
      { field: 'status', allowed_value: 'inactive' },
      { field: 'status', allowed_value: 'maintenance' },
      { field: 'status', allowed_value: 'breakdown' },
      ...categoryOptions.map((category) => ({
        field: 'category_id',
        allowed_value: category.id,
        description: category.name,
      })),
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(templateRows), 'Template Import')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(masterRows), 'Master Data')
    XLSX.writeFile(wb, 'asset_import_template.xlsx')
  }

  const handleImport = async () => {
    if (!importFile) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Pilih file Excel/CSV terlebih dahulu.' })
      return
    }

    setImportLoading(true)
    setImportProgress(0)
    try {
      const response = await uploadWithProgress('/assets/import', importFile, {
        onProgress: (v) => setImportProgress(v),
      })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: response?.message || 'Import diterima server.' })
      setImportModalOpen(false)
      setImportFile(null)
      await fetchAssets()
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'Gagal import aset.' })
    } finally {
      setImportLoading(false)
      setImportProgress(0)
    }
  }

  const handleExport = async () => {
    try {
      const allRows = []
      let exportPage = 1
      let exportLastPage = 1

      do {
        const params = new URLSearchParams({ page: String(exportPage), per_page: '200' })
        if (query) params.set('search', query)
        if (statusFilter !== 'ALL') params.set('status', statusFilter)

        const response = await apiRequest(`/assets?${params.toString()}`)
        allRows.push(...(response.data || []))
        exportLastPage = response.last_page || 1
        exportPage += 1
      } while (exportPage <= exportLastPage)

      const rows = allRows.map((raw) => {
        const item = toAsset(raw)
        return ({
        id: item.id,
        code: item.code,
        io_code: item.ioCode,
        name: item.name,
        brand: item.brand,
        model: item.model,
        company_code: item.companyCode,
        plant: item.plant,
        year: item.year || '',
        category: item.categoryName,
        status: item.status,
        current_hm: item.currentHm,
        current_km: item.currentKm,
        serial_number: item.serialNumber,
        chasis_no: item.chasisNo,
        engine_no: item.engineNo,
        asset_no: item.assetNo,
        plate_number: item.plateNumber,
        veh_plate_no: item.vehPlateNo,
        public_uuid: item.publicUuid,
        qr_code: item.qrCode,
        created_at: item.createdAt || '',
        updated_at: item.updatedAt || '',
        })
      })

      if (rows.length === 0) {
        await swal.fire({ icon: 'info', title: 'Info', text: 'Tidak ada data aset untuk diexport.' })
        return
      }

      const sheet = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, sheet, 'Assets')
      XLSX.writeFile(wb, `assets_export_${new Date().toISOString().slice(0, 10)}.xlsx`)

      await swal.fire({ icon: 'success', title: 'Berhasil', text: `Data aset berhasil diexport (${rows.length} baris).` })
    } catch {
      await swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal export data aset ke .xlsx.' })
    }
  }

  const handleScanQr = async () => {
    if (!scanCode) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Kode QR tidak boleh kosong.' })
      return
    }

    try {
      const detail = await apiRequest(`/assets/scan/${encodeURIComponent(scanCode)}`)
      setQrModal(toAsset(detail))
    } catch (error) {
      await swal.fire({ icon: 'error', title: 'Gagal', text: error instanceof ApiError ? error.message : 'QR code tidak ditemukan.' })
    }
  }

  const handleReload = async () => {
    setHasLoaded(false)
    await fetchAssets()
  }

  const getQrValue = (asset) => {
    if (!asset) return ''
    if (asset.assetNo && asset.assetNo !== '-') return asset.assetNo
    if (asset.qrCode && asset.qrCode !== '-') return asset.qrCode
    return asset.code || ''
  }

  const handleDownloadQr = async (asset) => {
    const qrValue = getQrValue(asset)
    if (!qrValue) return

    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(qrValue)}`
      const response = await fetch(qrUrl)
      if (!response.ok) throw new Error('Fetch QR gagal')

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `${asset.code || 'asset'}-${qrValue}-qrcode.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      await swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal download QR code.' })
    }
  }

  const openDetailPage = (asset) => {
    const assetRef = asset.publicUuid || (asset.qrCode && asset.qrCode !== '-' ? asset.qrCode : asset.code)
    navigate(`/assets/detail/${encodeURIComponent(assetRef)}`, {
      state: {
        asset,
      },
    })
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {!hasLoaded ? (
          <>
            <div className="space-y-2">
              <SkeletonBox className="h-6 w-52" />
              <SkeletonBox className="h-4 w-72" />
            </div>
            <SkeletonBox className="h-10 w-40" />
          </>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-bold">Manajemen Aset</h2>
              <p className="text-sm text-slate-500">Seluruh endpoint aset sudah terhubung ke API.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleReload} disabled={loading} className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/50 disabled:opacity-60">
                Muat Ulang
              </button>
              <button onClick={openCreate} className="btn-primary px-4 py-2 rounded-xl text-sm text-white inline-flex items-center gap-2"><PlusIcon />Tambah Aset</button>
              <button type="button" onClick={() => setImportModalOpen(true)} className="px-4 py-2 rounded-xl text-sm border border-blue-500/40 text-blue-300 hover:bg-blue-500/10">Import Excel</button>
              <button type="button" onClick={handleExport} className="px-4 py-2 rounded-xl text-sm border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10">Export .xlsx</button>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {!hasLoaded ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 space-y-2"><SkeletonBox className="h-8 w-20" /><SkeletonBox className="h-4 w-24" /></div>
          ))
        ) : (
          <>
            <div className="card p-4"><div className="text-2xl font-bold text-blue-400">{stats.total}</div><div className="text-xs text-slate-500 mt-1">Total Aset</div></div>
            <div className="card p-4"><div className="text-2xl font-bold text-green-400">{stats.active}</div><div className="text-xs text-slate-500 mt-1">Aktif</div></div>
            <div className="card p-4"><div className="text-2xl font-bold text-slate-300">{stats.inactive}</div><div className="text-xs text-slate-500 mt-1">Non-aktif</div></div>
            <div className="card p-4"><div className="text-2xl font-bold text-yellow-300">{stats.maintenance}</div><div className="text-xs text-slate-500 mt-1">Maintenance</div></div>
          </>
        )}
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <input value={query} onChange={(e) => { setPage(1); setQuery(e.target.value) }} placeholder="Cari kode / nama aset..." className="input flex-1 min-w-52 px-3 py-2 rounded-xl text-sm" />
        <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }} className="input px-3 py-2 rounded-xl text-sm min-w-36">
          <option value="ALL">Semua Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={perPage} onChange={(e) => { setPage(1); setPerPage(Number(e.target.value)) }} className="input px-3 py-2 rounded-xl text-sm min-w-28">
          <option value={10}>10 / halaman</option>
          <option value={25}>25 / halaman</option>
          <option value={50}>50 / halaman</option>
        </select>
        <div className="ml-auto inline-flex rounded-xl border border-slate-700 overflow-hidden">
          <button type="button" onClick={() => setView('list')} className={`px-4 py-2 text-sm ${view === 'list' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:bg-slate-700/40'}`}>List</button>
          <button type="button" onClick={() => setView('grid')} className={`px-4 py-2 text-sm ${view === 'grid' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:bg-slate-700/40'}`}>Grid</button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aset</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kategori</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dipakai Oleh</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">HM/KM</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {!hasLoaded ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4"><SkeletonBox className="h-9 w-40" /></td>
                      <td className="py-3 px-4"><SkeletonBox className="h-6 w-24" /></td>
                      <td className="py-3 px-4"><SkeletonBox className="h-6 w-28" /></td>
                      <td className="py-3 px-4"><SkeletonBox className="h-6 w-20" /></td>
                      <td className="py-3 px-4"><SkeletonBox className="h-6 w-20" /></td>
                      <td className="py-3 px-4"><SkeletonBox className="h-8 w-40 ml-auto" /></td>
                    </tr>
                  ))
                ) : assets.length === 0 ? (
                  <tr><td colSpan="6" className="py-8 text-center text-slate-400">Tidak ada data aset.</td></tr>
                ) : (
                  assets.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-700/20">
                      <td className="py-3 px-4"><button type="button" onClick={() => openDetailPage(a)} className="text-xs font-semibold text-blue-300 hover:text-blue-200 hover:underline">{a.code}</button><div className="text-xs text-slate-200">{a.name}</div></td>
                      <td className="py-3 px-4 text-xs text-slate-300">{a.categoryName}</td>
                      <td className="py-3 px-4 text-xs">
                        <div className={a.activeAssignment?.user ? 'text-slate-200' : 'text-slate-500'}>{formatAssignmentLabel(a)}</div>
                        {a.activeAssignment?.user?.email ? <div className="text-slate-500">{a.activeAssignment.user.email}</div> : null}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300">{a.currentHm > 0 ? `${a.currentHm.toLocaleString()} HM` : `${a.currentKm.toLocaleString()} KM`}</td>
                      <td className="py-3 px-4">{statusBadge(a.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-end items-center">
                          <button onClick={() => openDetailPage(a)} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-blue-400 border border-slate-600/70 bg-slate-700/30 hover:bg-blue-500/10" type="button" title="Detail"><EyeIcon /></button>
                          <button onClick={(e) => { e.stopPropagation(); openAssignModal(a) }} className="px-2.5 h-8 rounded-lg inline-flex items-center justify-center text-xs text-cyan-300 border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20" type="button" title="Assign">Assign</button>
                          {a.activeAssignment?.user ? <button onClick={(e) => { e.stopPropagation(); handleUnassign(a) }} className="px-2.5 h-8 rounded-lg inline-flex items-center justify-center text-xs text-rose-300 border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20" type="button" title="Unassign">Unassign</button> : null}
                          <button onClick={(e) => { e.stopPropagation(); openEdit(a) }} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-yellow-400 border border-slate-600/70 bg-slate-700/30 hover:bg-yellow-500/10" type="button" title="Edit"><EditIcon /></button>
                          <button onClick={(e) => { e.stopPropagation(); setQrModal(a) }} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-purple-400 border border-slate-600/70 bg-slate-700/30 hover:bg-purple-500/10" type="button" title="QR Code"><QrIcon /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleToggle(a) }} className={`w-8 h-8 rounded-lg inline-flex items-center justify-center border ${a.status === 'active' ? 'text-emerald-300 border-emerald-400/60 bg-emerald-500/10' : 'text-slate-300 border-slate-500/70 bg-slate-600/20'}`} type="button" title="Aktif/Nonaktif">{a.status === 'active' ? <StatusOnIcon /> : <StatusOffIcon />}</button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(a) }} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-red-400 border border-slate-600/70 bg-slate-700/30 hover:bg-red-500/10" type="button" title="Hapus"><TrashIcon /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {assets.map((a) => (
            <div key={a.id} className="card p-4 space-y-3 cursor-pointer hover:border-slate-600" onClick={() => openDetail(a)}>
              <div className="flex items-center justify-between"><div><div className="text-xs font-semibold text-blue-300">{a.code}</div><div className="text-sm font-semibold text-slate-100">{a.name}</div></div>{statusBadge(a.status)}</div>
              <div className="text-xs text-slate-400">{a.categoryName}</div>
              <div className="text-xs text-slate-400">Dipakai oleh: <span className={a.activeAssignment?.user ? 'text-slate-200' : 'text-slate-500'}>{formatAssignmentLabel(a)}</span></div>
              <div className="text-xs text-slate-400">{a.currentHm > 0 ? `${a.currentHm.toLocaleString()} HM` : `${a.currentKm.toLocaleString()} KM`}</div>
              <div className="flex gap-2 justify-end">
                <button onClick={(e) => { e.stopPropagation(); openAssignModal(a) }} className="px-2.5 h-8 rounded-lg inline-flex items-center justify-center text-xs text-cyan-300 border border-cyan-500/40 bg-cyan-500/10">Assign</button>
                {a.activeAssignment?.user ? <button onClick={(e) => { e.stopPropagation(); handleUnassign(a) }} className="px-2.5 h-8 rounded-lg inline-flex items-center justify-center text-xs text-rose-300 border border-rose-500/40 bg-rose-500/10">Unassign</button> : null}
                <button onClick={(e) => { e.stopPropagation(); openEdit(a) }} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-yellow-400 border border-slate-600/70 bg-slate-700/30"><EditIcon /></button>
                <button onClick={(e) => { e.stopPropagation(); setQrModal(a) }} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-purple-400 border border-slate-600/70 bg-slate-700/30"><QrIcon /></button>
                <button onClick={(e) => { e.stopPropagation(); handleToggle(a) }} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-emerald-300 border border-emerald-400/60 bg-emerald-500/10">{a.status === 'active' ? <StatusOnIcon /> : <StatusOffIcon />}</button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(a) }} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-red-400 border border-slate-600/70 bg-slate-700/30"><TrashIcon /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <div>Menampilkan {assets.length === 0 ? 0 : ((page - 1) * perPage) + 1}-{Math.min(page * perPage, total)} dari {total} data</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Prev</button>
          <span>Hal {page} / {lastPage}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page >= lastPage || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Next</button>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="text-sm font-semibold">Scan QR Aset</div>
        <div className="flex gap-2">
          <input value={scanCode} onChange={(e) => setScanCode(e.target.value)} placeholder="Masukkan isi QR code" className="input flex-1 px-3 py-2 rounded-xl text-sm" />
          <button type="button" onClick={handleScanQr} className="px-4 py-2 rounded-xl text-sm border border-purple-500/40 text-purple-300 hover:bg-purple-500/10">Scan</button>
        </div>
      </div>

      {formModal && (
        <ModalPortal>
          <div onClick={closeForm} className="max-h-screen overflow-y-auto hide-scrollbar py-8">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[calc(100dvh-4rem)] overflow-y-auto hide-scrollbar" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-700"><h3 className="font-semibold">{formModal.mode === 'edit' ? 'Edit Aset' : 'Tambah Aset'}</h3></div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formModal.mode === 'create' && <label className="text-xs text-slate-300">Kode Aset<input value={form.code} onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))} placeholder="Kode aset" className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>}
                <label className="text-xs text-slate-300">KODE IO<input value={form.io_code} onChange={(e) => setForm((s) => ({ ...s, io_code: e.target.value }))} placeholder="KODE IO" className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>
                <label className="text-xs text-slate-300 sm:col-span-2">Nama Aset / Description<input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Nama aset / Description" className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>
                <label className="text-xs text-slate-300">Brand<input value={form.brand} onChange={(e) => setForm((s) => ({ ...s, brand: e.target.value }))} placeholder="Brand" className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>
                <label className="text-xs text-slate-300">Model<input value={form.model} onChange={(e) => setForm((s) => ({ ...s, model: e.target.value }))} placeholder="Model" className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>
                <label className="text-xs text-slate-300">Company Code<input value={form.company_code} onChange={(e) => setForm((s) => ({ ...s, company_code: e.target.value }))} placeholder="Company Code" className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>
                <label className="text-xs text-slate-300">Plant<input value={form.plant} onChange={(e) => setForm((s) => ({ ...s, plant: e.target.value }))} placeholder="Plant" className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>
                <label className="text-xs text-slate-300">Tahun<input value={form.year} onChange={(e) => setForm((s) => ({ ...s, year: e.target.value }))} placeholder="Tahun" className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>
                <label className="text-xs text-slate-300">Kategori<select value={form.category_id} onChange={(e) => setForm((s) => ({ ...s, category_id: e.target.value }))} className="input mt-1 w-full px-3 py-2 rounded-xl text-sm"><option value="">Pilih kategori</option>{categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.name} (#{c.id})</option>)}</select></label>
                <label className="text-xs text-slate-300">Status<select value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))} className="input mt-1 w-full px-3 py-2 rounded-xl text-sm">{STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
                <label className="text-xs text-slate-300">Current HM<input value={form.current_hm} onChange={(e) => setForm((s) => ({ ...s, current_hm: e.target.value }))} placeholder="Current HM" className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>
                <label className="text-xs text-slate-300">Current KM<input value={form.current_km} onChange={(e) => setForm((s) => ({ ...s, current_km: e.target.value }))} placeholder="Current KM" className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>
                <label className="text-xs text-slate-300">Serial Number (Legacy)<input value={form.serial_number} onChange={(e) => setForm((s) => ({ ...s, serial_number: e.target.value }))} placeholder="Serial Number (legacy)" className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>
                <label className="text-xs text-slate-300">Chasis No.<input value={form.chasis_no} onChange={(e) => setForm((s) => ({ ...s, chasis_no: e.target.value }))} placeholder="Chasis No." className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>
                <label className="text-xs text-slate-300">Engine No.<input value={form.engine_no} onChange={(e) => setForm((s) => ({ ...s, engine_no: e.target.value }))} placeholder="Engine No." className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>
                <label className="text-xs text-slate-300">Asset No.<input value={form.asset_no} onChange={(e) => setForm((s) => ({ ...s, asset_no: e.target.value }))} placeholder="Asset No." className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>
                <label className="text-xs text-slate-300">Plate Number (Legacy)<input value={form.plate_number} onChange={(e) => setForm((s) => ({ ...s, plate_number: e.target.value }))} placeholder="Plate Number (legacy)" className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>
                <label className="text-xs text-slate-300">Veh. Plate No. / No. Polisi<input value={form.veh_plate_no} onChange={(e) => setForm((s) => ({ ...s, veh_plate_no: e.target.value }))} placeholder="Veh. Plate No. / No. Polisi" className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" /></label>
                <label className="text-xs text-slate-300 sm:col-span-2">Catatan<textarea value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} placeholder="Catatan" className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" rows={3} /></label>
              </div>
              <div className="p-5 border-t border-slate-700 flex gap-2 justify-end">
                <button type="button" onClick={closeForm} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300">Batal</button>
                <button type="button" onClick={handleSave} disabled={submitLoading} className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-60">{submitLoading ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {selected && (
        <ModalPortal>
          <div onClick={() => { setSelected(null); setSelectedDetail(null); setSelectedHistory([]); setSelectedSchedule([]) }}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto hide-scrollbar" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-700"><div className="font-bold text-blue-300">{selected.code}</div><div className="text-sm text-slate-200">{selected.name}</div></div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-slate-500 text-xs">Public UUID</div><div className="text-slate-200 break-all">{(selectedDetail || selected).publicUuid || '-'}</div></div>
                  <div><div className="text-slate-500 text-xs">KODE IO</div><div className="text-slate-200">{(selectedDetail || selected).ioCode}</div></div>
                  <div><div className="text-slate-500 text-xs">Status</div><div>{statusBadge((selectedDetail || selected).status)}</div></div>
                  <div><div className="text-slate-500 text-xs">QR Code</div><div className="text-slate-200">{(selectedDetail || selected).qrCode}</div></div>
                  <div><div className="text-slate-500 text-xs">Kategori</div><div className="text-slate-200">{(selectedDetail || selected).categoryName}</div></div>
                  <div><div className="text-slate-500 text-xs">Dipakai Oleh</div><div className="text-slate-200">{formatAssignmentLabel(selectedDetail || selected)}</div></div>
                  <div><div className="text-slate-500 text-xs">Company / Plant</div><div className="text-slate-200">{(selectedDetail || selected).companyCode} / {(selectedDetail || selected).plant}</div></div>
                  <div><div className="text-slate-500 text-xs">No Polisi</div><div className="text-slate-200">{(selectedDetail || selected).vehPlateNo}</div></div>
                  <div><div className="text-slate-500 text-xs">Chasis / Engine</div><div className="text-slate-200">{(selectedDetail || selected).chasisNo} / {(selectedDetail || selected).engineNo}</div></div>
                  <div><div className="text-slate-500 text-xs">Asset No.</div><div className="text-slate-200">{(selectedDetail || selected).assetNo}</div></div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">History HM/KM</div>
                  <div className="space-y-2">{selectedHistory.length === 0 ? <div className="text-xs text-slate-400">Belum ada history.</div> : selectedHistory.map((h) => <div key={h.id} className="text-xs p-2 rounded-lg bg-slate-700/30 border border-slate-700">HM: {h.hm_value} | KM: {h.km_value} | {h.recorded_at}</div>)}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">Schedule Maintenance</div>
                  <div className="space-y-2">{selectedSchedule.length === 0 ? <div className="text-xs text-slate-400">Belum ada schedule.</div> : selectedSchedule.map((s) => <div key={s.id} className="text-xs p-2 rounded-lg bg-slate-700/30 border border-slate-700">{s.task_name || s.maintenance_type || `Schedule #${s.id}`} - due: {s.next_due_at || '-'}</div>)}</div>
                </div>
              </div>
              <div className="p-5 border-t border-slate-700 flex gap-2 flex-wrap">
                <button type="button" onClick={() => openAssignModal(selectedDetail || selected)} className="px-3 py-2 rounded-xl border border-cyan-500/40 text-cyan-300 text-sm">Assign</button>
                {(selectedDetail || selected)?.activeAssignment?.user ? <button type="button" onClick={() => handleUnassign(selectedDetail || selected)} className="px-3 py-2 rounded-xl border border-rose-500/40 text-rose-300 text-sm">Unassign</button> : null}
                <button type="button" onClick={handleUpdateHmKm} className="px-3 py-2 rounded-xl border border-slate-600 text-slate-200 text-sm">Update HM/KM</button>
                <button type="button" onClick={handleUpdateLocation} className="px-3 py-2 rounded-xl border border-slate-600 text-slate-200 text-sm">Update Lokasi</button>
                <button type="button" onClick={() => setQrModal(selectedDetail || selected)} className="px-3 py-2 rounded-xl border border-purple-500/40 text-purple-300 text-sm">QR Code</button>
                <button type="button" onClick={() => { openEdit(selectedDetail || selected); setSelected(null) }} className="px-3 py-2 rounded-xl border border-yellow-500/40 text-yellow-300 text-sm">Edit</button>
                <button type="button" onClick={() => handleToggle(selectedDetail || selected)} className="px-3 py-2 rounded-xl border border-emerald-500/40 text-emerald-300 text-sm">Aktif/Nonaktif</button>
                <button type="button" onClick={() => handleDelete(selectedDetail || selected)} className="px-3 py-2 rounded-xl border border-red-500/40 text-red-300 text-sm">Hapus</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {assignModal && (
        <ModalPortal>
          <div onClick={closeAssignModal} className="max-h-screen overflow-y-auto hide-scrollbar py-8">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[calc(100dvh-4rem)] overflow-y-auto hide-scrollbar" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-700">
                <h3 className="font-semibold">Assign Asset</h3>
                <div className="text-xs text-slate-400 mt-1">{assignModal.code} - {assignModal.name}</div>
              </div>
              <div className="p-5 space-y-4">
                <div className="rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-3">
                  <div className="text-xs text-slate-500">Kondisi saat ini</div>
                  <div className="text-sm text-slate-200 mt-1">{formatAssignmentLabel(assignModal)}</div>
                  {assignModal.activeAssignment?.assignedAt ? <div className="text-xs text-slate-500 mt-1">Assigned at: {assignModal.activeAssignment.assignedAt}</div> : null}
                </div>
                <label className="text-xs text-slate-300">
                  Member / Operator
                  <select value={assignForm.user_id} onChange={(e) => setAssignForm((prev) => ({ ...prev, user_id: e.target.value }))} className="input mt-1 w-full px-3 py-2 rounded-xl text-sm">
                    <option value="">Pilih user</option>
                    {assignableUsers.map((user) => (
                      <option key={user.id} value={user.id}>{user.name} ({user.role || 'user'})</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-slate-300">
                  Catatan
                  <textarea value={assignForm.notes} onChange={(e) => setAssignForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Catatan assignment" className="input mt-1 w-full px-3 py-2 rounded-xl text-sm" rows={3} />
                </label>
              </div>
              <div className="p-5 border-t border-slate-700 flex gap-2 justify-end">
                <button type="button" onClick={closeAssignModal} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300" disabled={assignmentLoading}>Batal</button>
                <button type="button" onClick={handleAssign} disabled={assignmentLoading} className="px-4 py-2 rounded-xl bg-cyan-600 text-white disabled:opacity-60">{assignmentLoading ? 'Menyimpan...' : 'Assign'}</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {importModalOpen && (
        <ModalPortal>
          <div onClick={() => !importLoading && setImportModalOpen(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-700"><h3 className="font-bold text-white">Upload Excel Asset</h3></div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-400">Kolom wajib: code, name, category_id. Kolom lain opsional.</p>
                <button type="button" onClick={downloadImportTemplate} className="text-xs px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700/50">Download Template + Master Data</button>
                <input type="file" accept=".xlsx,.xls,.csv" className="input w-full px-3 py-2 rounded-xl text-sm" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                {importLoading && (
                  <div className="space-y-2">
                    <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden"><div className="h-2 bg-blue-500 transition-all duration-200" style={{ width: `${importProgress}%` }} /></div>
                    <div className="text-xs text-slate-400">Upload progress: {importProgress}%</div>
                  </div>
                )}
              </div>
              <div className="p-5 border-t border-slate-700 flex gap-2">
                <button className="btn-secondary flex-1 py-2 rounded-xl text-sm" onClick={() => setImportModalOpen(false)} disabled={importLoading}>Batal</button>
                <button className="btn-primary flex-1 py-2 rounded-xl text-sm text-white" onClick={handleImport} disabled={importLoading}>{importLoading ? 'Mengupload...' : 'Upload'}</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {qrModal && (
        <ModalPortal>
          <div onClick={() => setQrModal(null)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
              <div className="font-semibold text-white mb-1">QR Code Aset</div>
              <div className="text-xs text-slate-500 mb-1">{qrModal.code}</div>
              <div className="text-xs text-blue-300 mb-4">QR Value: {getQrValue(qrModal)}</div>
              <div className="w-48 h-48 bg-white rounded-xl mx-auto flex items-center justify-center mb-4 p-2">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getQrValue(qrModal))}`} alt="QR Code Asset" className="w-full h-full" />
              </div>
              <div className="space-y-2">
                <button className="w-full py-2 rounded-xl text-sm border border-blue-500/40 text-blue-300 hover:bg-blue-500/10" onClick={() => handleDownloadQr(qrModal)}>Download QR</button>
                <button className="btn-secondary w-full py-2 rounded-xl text-sm" onClick={() => setQrModal(null)}>Tutup</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
