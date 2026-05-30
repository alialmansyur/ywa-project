import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'
import { ApiError, apiRequest } from '../../../services/api'
import { ModalPortal } from '../../shared/components/ModalPortal'

const DEFAULT_PART_FORM = {
  code: '',
  name: '',
  unit: '',
  category: '',
  brand: '',
  part_number: '',
  min_stock: 0,
  unit_price: 0,
  notes: '',
}

const DEFAULT_TX_FORM = {
  part_id: '',
  type: 'in',
  qty: '',
  unit_price: '',
  reference_type: '',
  reference_id: '',
  notes: '',
  location: 'gudang-utama',
}

const swal = Swal.mixin({
  width: 420,
  customClass: {
    popup: 'rounded-2xl',
    confirmButton: 'rounded-lg',
    cancelButton: 'rounded-lg',
  },
  buttonsStyling: true,
})

function formatRupiah(value) {
  const numeric = Number(value || 0)
  return `Rp ${numeric.toLocaleString('id-ID')}`
}

function parseRupiahInput(raw) {
  const cleaned = String(raw || '').replace(/[^\d.,-]/g, '').replace(',', '.')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
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

function ReloadIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12a8 8 0 10-2.34 5.66M20 12v6m0-6h-6" />
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

function PlusIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14" />
    </svg>
  )
}

function SkeletonBox({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-700/60 ${className}`} />
}

function toPart(item) {
  const inventories = item.inventory || []
  const totalStock = inventories.reduce((sum, inv) => sum + Number(inv.qty_available || 0), 0)
  const minStock = Number(item.min_stock || 0)
  const isActive = Boolean(item.is_active)

  return {
    id: item.id,
    code: item.code || '-',
    name: item.name || '-',
    brand: item.brand || '-',
    unit: item.unit || '-',
    category: item.category || '-',
    partNumber: item.part_number || '-',
    minStock,
    unitPrice: Number(item.unit_price || 0),
    notes: item.notes || '-',
    isActive,
    stock: totalStock,
    inventoryRows: inventories,
    raw: item,
  }
}

function stockLabel(stock, minStock) {
  if (stock <= 0) return 'Habis'
  if (stock <= minStock) return 'Kritis'
  return 'Aman'
}

function stockBadge(stock, minStock) {
  const label = stockLabel(stock, minStock)
  if (label === 'Aman') {
    return <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400 border border-green-500/20">Aman</span>
  }
  if (label === 'Kritis') {
    return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">Kritis</span>
  }
  return <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/15 text-red-400 border border-red-500/20">Habis</span>
}

function activeBadge(active) {
  return active
    ? <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400 border border-green-500/20">Aktif</span>
    : <span className="px-2 py-0.5 rounded-full text-xs bg-slate-500/15 text-slate-300 border border-slate-500/20">Non-aktif</span>
}

export function InventoryPage() {
  const [parts, setParts] = useState([])
  const [inventoryRows, setInventoryRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [stockFilter, setStockFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)

  const [selected, setSelected] = useState(null)
  const [selectedTransactions, setSelectedTransactions] = useState([])
  const [selectedTxLoading, setSelectedTxLoading] = useState(false)
  const [selectedTxPage, setSelectedTxPage] = useState(1)
  const [selectedTxLastPage, setSelectedTxLastPage] = useState(1)
  const [selectedTxDateFrom, setSelectedTxDateFrom] = useState('')
  const [selectedTxDateTo, setSelectedTxDateTo] = useState('')
  const [selectedTxType, setSelectedTxType] = useState('ALL')
  const [partModal, setPartModal] = useState(null)
  const [txModalOpen, setTxModalOpen] = useState(false)
  const [partForm, setPartForm] = useState(DEFAULT_PART_FORM)
  const [txForm, setTxForm] = useState(DEFAULT_TX_FORM)

  const categories = useMemo(() => {
    const set = new Set(parts.map((p) => p.category).filter((c) => c && c !== '-'))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [parts])

  const filtered = useMemo(() => {
    return parts.filter((p) => {
      const matchCategory = categoryFilter === 'ALL' || p.category === categoryFilter
      const partStockLabel = stockLabel(p.stock, p.minStock)
      const matchStock = stockFilter === 'ALL' || partStockLabel === stockFilter
      return matchCategory && matchStock
    })
  }, [parts, categoryFilter, stockFilter])

  const stats = useMemo(() => {
    const active = parts.filter((p) => p.isActive).length
    const inactive = parts.filter((p) => !p.isActive).length
    const critical = parts.filter((p) => stockLabel(p.stock, p.minStock) !== 'Aman').length
    return { total, active, inactive, critical }
  }, [parts, total])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('per_page', String(perPage))
      params.set('page', String(page))
      if (query) params.set('search', query)
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter)
      if (stockFilter === 'Kritis' || stockFilter === 'Habis') params.set('low_stock', '1')

      const [partsResponse, inventoryResponse] = await Promise.all([
        apiRequest(`/spare-parts?${params.toString()}`),
        apiRequest('/inventory?per_page=100'),
      ])

      setParts((partsResponse.data || []).map(toPart))
      setTotal(partsResponse.total || 0)
      setLastPage(partsResponse.last_page || 1)
      setInventoryRows(inventoryResponse.data || [])
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal memuat data inventory.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, perPage, query, categoryFilter, stockFilter])

  const openCreate = () => {
    setPartForm(DEFAULT_PART_FORM)
    setPartModal({ mode: 'create', id: null })
  }

  const openEdit = (part) => {
    setPartForm({
      code: part.code === '-' ? '' : part.code,
      name: part.name === '-' ? '' : part.name,
      unit: part.unit === '-' ? '' : part.unit,
      category: part.category === '-' ? '' : part.category,
      brand: part.brand === '-' ? '' : part.brand,
      part_number: part.partNumber === '-' ? '' : part.partNumber,
      min_stock: part.minStock ?? 0,
      unit_price: part.unitPrice ?? 0,
      notes: part.notes === '-' ? '' : part.notes,
    })
    setPartModal({ mode: 'edit', id: part.id, is_active: part.isActive })
  }

  const openTxModal = (part = null) => {
    setTxForm({
      ...DEFAULT_TX_FORM,
      part_id: part?.id ? String(part.id) : (parts[0]?.id ? String(parts[0].id) : ''),
    })
    setTxModalOpen(true)
  }

  const fetchDetailTransactions = async (partId, txPage = 1, dateFrom = '', dateTo = '', txType = 'ALL') => {
    setSelectedTxLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('part_id', String(partId))
      params.set('per_page', '10')
      params.set('page', String(txPage))
      if (dateFrom) params.set('date_from', dateFrom)
      if (dateTo) params.set('date_to', dateTo)
      if (txType !== 'ALL') params.set('type', txType)
      const txResponse = await apiRequest(`/inventory/transactions?${params.toString()}`)
      setSelectedTransactions(txResponse.data || [])
      setSelectedTxPage(txResponse.current_page || 1)
      setSelectedTxLastPage(txResponse.last_page || 1)
    } catch {
      setSelectedTransactions([])
      setSelectedTxPage(1)
      setSelectedTxLastPage(1)
    } finally {
      setSelectedTxLoading(false)
    }
  }

  const openDetail = async (part) => {
    setSelected(part)
    setSelectedTxDateFrom('')
    setSelectedTxDateTo('')
    setSelectedTxType('ALL')
    await fetchDetailTransactions(part.id, 1, '', '', 'ALL')
  }

  const handleSavePart = async () => {
    if (!partForm.code || !partForm.name || !partForm.unit) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Kode, nama, dan unit wajib diisi.' })
      return
    }

    setSubmitLoading(true)
    try {
      const payload = {
        code: partForm.code,
        name: partForm.name,
        unit: partForm.unit,
        category: partForm.category || null,
        brand: partForm.brand || null,
        part_number: partForm.part_number || null,
        min_stock: Number(partForm.min_stock || 0),
        unit_price: parseRupiahInput(partForm.unit_price),
        notes: partForm.notes || null,
      }

      if (partModal?.mode === 'edit') {
        await apiRequest(`/spare-parts/${partModal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            is_active: Boolean(partModal.is_active),
          }),
        })
      } else {
        await apiRequest('/spare-parts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      await swal.fire({ icon: 'success', title: 'Berhasil', text: partModal?.mode === 'edit' ? 'Spare part berhasil diperbarui.' : 'Spare part berhasil ditambahkan.' })
      setPartModal(null)
      setPartForm(DEFAULT_PART_FORM)
      await fetchData()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : (partModal?.mode === 'edit' ? 'Gagal memperbarui spare part.' : 'Gagal menambah spare part.')
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleTogglePart = async (part) => {
    const confirmResult = await swal.fire({
      title: part.isActive ? 'Nonaktifkan spare part ini?' : 'Aktifkan spare part ini?',
      text: 'Perubahan status akan langsung diterapkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, lanjutkan',
      cancelButtonText: 'Batal',
    })

    if (!confirmResult.isConfirmed) return

    try {
      await apiRequest(`/spare-parts/${part.id}/toggle-active`, { method: 'PATCH' })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Status spare part berhasil diperbarui.' })
      await fetchData()
      if (selected?.id === part.id) {
        setSelected((prev) => (prev ? { ...prev, isActive: !prev.isActive } : prev))
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal mengubah status spare part.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    }
  }

  const handleDeletePart = async (part) => {
    const confirmResult = await swal.fire({
      title: 'Hapus spare part ini?',
      text: `${part.code} - ${part.name} akan dihapus permanen.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    })

    if (!confirmResult.isConfirmed) return

    try {
      await apiRequest(`/spare-parts/${part.id}`, { method: 'DELETE' })
      await swal.fire({ icon: 'success', title: 'Berhasil', text: 'Spare part berhasil dihapus.' })
      if (selected?.id === part.id) setSelected(null)
      if (selected?.id === part.id) setSelectedTransactions([])
      await fetchData()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal menghapus spare part.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    }
  }

  const handleCreateTransaction = async () => {
    if (!txForm.part_id || !txForm.qty) {
      await swal.fire({ icon: 'warning', title: 'Validasi', text: 'Part dan qty wajib diisi.' })
      return
    }
    const selectedPart = parts.find((part) => Number(part.id) === Number(txForm.part_id))
    const qtyValue = Number(txForm.qty || 0)
    if (txForm.type === 'out' && selectedPart && qtyValue > Number(selectedPart.stock || 0)) {
      await swal.fire({ icon: 'warning', title: 'Stok Tidak Cukup', text: `Stok tersedia ${selectedPart.stock}. Qty keluar melebihi stok.` })
      return
    }

    setSubmitLoading(true)
    try {
      const response = await apiRequest('/inventory/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part_id: Number(txForm.part_id),
          type: txForm.type,
          qty: Number(txForm.qty),
          unit_price: txForm.unit_price ? parseRupiahInput(txForm.unit_price) : null,
          reference_type: txForm.reference_type || null,
          reference_id: txForm.reference_id ? Number(txForm.reference_id) : null,
          notes: txForm.notes || null,
          location: txForm.location || 'gudang-utama',
        }),
      })
      await swal.fire({
        icon: 'success',
        title: response?.approval_required ? 'Menunggu Approval' : 'Berhasil',
        text: response?.message || 'Transaksi inventory berhasil disimpan.',
      })
      setTxModalOpen(false)
      await fetchData()
      if (selected?.id && Number(txForm.part_id) === selected.id) {
        await fetchDetailTransactions(selected.id, 1, selectedTxDateFrom, selectedTxDateTo, selectedTxType)
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal menyimpan transaksi inventory.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleExportInventoryExcel = async () => {
    try {
      const allParts = []
      let exportPage = 1
      let exportLastPage = 1

      do {
        const params = new URLSearchParams()
        params.set('per_page', '200')
        params.set('page', String(exportPage))
        if (query) params.set('search', query)
        if (categoryFilter !== 'ALL') params.set('category', categoryFilter)
        if (stockFilter === 'Kritis' || stockFilter === 'Habis') params.set('low_stock', '1')

        const response = await apiRequest(`/spare-parts?${params.toString()}`)
        allParts.push(...(response.data || []).map(toPart))
        exportLastPage = response.last_page || 1
        exportPage += 1
      } while (exportPage <= exportLastPage)

      const exportFiltered = allParts.filter((p) => {
        const matchCategory = categoryFilter === 'ALL' || p.category === categoryFilter
        const partStockLabel = stockLabel(p.stock, p.minStock)
        const matchStock = stockFilter === 'ALL' || partStockLabel === stockFilter
        return matchCategory && matchStock
      })

      const rows = exportFiltered.map((p) => ({
        code: p.code,
        name: p.name,
        category: p.category,
        brand: p.brand,
        unit: p.unit,
        part_number: p.partNumber,
        stock: p.stock,
        min_stock: p.minStock,
        status_stock: stockLabel(p.stock, p.minStock),
        is_active: p.isActive ? 'active' : 'inactive',
        unit_price: p.unitPrice,
        notes: p.notes,
      }))

      if (rows.length === 0) {
        await swal.fire({ icon: 'info', title: 'Info', text: 'Tidak ada data inventory untuk diexport.' })
        return
      }

      const sheet = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, sheet, 'Inventory')
      XLSX.writeFile(wb, `inventory_export_${new Date().toISOString().slice(0, 10)}.xlsx`)
      await swal.fire({ icon: 'success', title: 'Berhasil', text: `Data inventory berhasil diexport (${rows.length} baris).` })
    } catch {
      await swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal export data inventory ke .xlsx.' })
    }
  }

  const handleExportTransactionsCsv = async () => {
    if (!selected?.id) return

    setSelectedTxLoading(true)
    try {
      const allRows = []
      let exportPage = 1
      let exportLastPage = 1

      do {
        const params = new URLSearchParams()
        params.set('part_id', String(selected.id))
        params.set('per_page', '100')
        params.set('page', String(exportPage))
        if (selectedTxDateFrom) params.set('date_from', selectedTxDateFrom)
        if (selectedTxDateTo) params.set('date_to', selectedTxDateTo)
        if (selectedTxType !== 'ALL') params.set('type', selectedTxType)

        const response = await apiRequest(`/inventory/transactions?${params.toString()}`)
        const pageRows = response.data || []
        allRows.push(...pageRows)
        exportLastPage = response.last_page || 1
        exportPage += 1
      } while (exportPage <= exportLastPage)

      if (allRows.length === 0) {
        await swal.fire({ icon: 'info', title: 'Info', text: 'Tidak ada data transaksi untuk diekspor.' })
        return
      }

      const header = ['transaction_id', 'created_at', 'type', 'qty', 'unit_price', 'reference_type', 'reference_id', 'processed_by', 'notes']
      const lines = [header.join(',')]
      allRows.forEach((tx) => {
        const values = [
          tx.id,
          tx.created_at || '',
          tx.type || '',
          Number(tx.qty || 0),
          Number(tx.unit_price || 0),
          tx.reference_type || '',
          tx.reference_id || '',
          tx.processor?.name || '',
          (tx.notes || '').replace(/"/g, '""'),
        ].map((value) => `"${String(value)}"`)
        lines.push(values.join(','))
      })

      const csvBlob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(csvBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inventory_transactions_${selected.code}_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Gagal mengekspor transaksi.'
      await swal.fire({ icon: 'error', title: 'Gagal', text: message })
    } finally {
      setSelectedTxLoading(false)
    }
  }

  const handleReload = async () => {
    setHasLoaded(false)
    await fetchData()
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
              <h2 className="text-lg font-bold">Inventory Spare Parts</h2>
              <p className="text-sm text-slate-500">Data inventory terhubung langsung dengan endpoint API.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleReload}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-sm border border-slate-600 text-slate-200 hover:bg-slate-700/50 disabled:opacity-60 inline-flex items-center gap-2"
              >
                Muat Ulang
              </button>
              <button onClick={openCreate} className="btn-primary px-4 py-2 rounded-xl text-sm text-white inline-flex items-center gap-2" type="button">
                <PlusIcon />
                Tambah Part
              </button>
              <button onClick={() => openTxModal()} className="px-4 py-2 rounded-xl text-sm border border-blue-500/40 text-blue-300 hover:bg-blue-500/10" type="button">
                Transaksi
              </button>
              <button onClick={handleExportInventoryExcel} className="px-4 py-2 rounded-xl text-sm border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10" type="button">
                Export .xlsx
              </button>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {!hasLoaded ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={`stat-skeleton-${idx}`} className="card p-4 space-y-2"><SkeletonBox className="h-8 w-20" /><SkeletonBox className="h-4 w-24" /></div>
          ))
        ) : (
          <>
            <div className="card p-4"><div className="text-2xl font-bold text-blue-400">{stats.total}</div><div className="text-xs text-slate-500 mt-1">Total Part</div></div>
            <div className="card p-4"><div className="text-2xl font-bold text-green-400">{stats.active}</div><div className="text-xs text-slate-500 mt-1">Aktif</div></div>
            <div className="card p-4"><div className="text-2xl font-bold text-slate-300">{stats.inactive}</div><div className="text-xs text-slate-500 mt-1">Non-aktif</div></div>
            <div className="card p-4"><div className="text-2xl font-bold text-yellow-400">{stats.critical}</div><div className="text-xs text-slate-500 mt-1">Kritis/Habis</div></div>
          </>
        )}
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        {!hasLoaded ? (
          <>
            <SkeletonBox className="h-10 flex-1 min-w-52" />
            <SkeletonBox className="h-10 w-36" />
            <SkeletonBox className="h-10 w-36" />
            <SkeletonBox className="h-10 w-32" />
          </>
        ) : (
          <>
            <input value={query} onChange={(e) => { setPage(1); setQuery(e.target.value) }} placeholder="Cari kode, nama, brand..." className="input flex-1 min-w-52 px-3 py-2 rounded-xl text-sm" />
            <select value={categoryFilter} onChange={(e) => { setPage(1); setCategoryFilter(e.target.value) }} className="input px-3 py-2 rounded-xl text-sm min-w-36">
              <option value="ALL">Semua Kategori</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select value={stockFilter} onChange={(e) => { setPage(1); setStockFilter(e.target.value) }} className="input px-3 py-2 rounded-xl text-sm min-w-36">
              <option value="ALL">Semua Stok</option>
              <option value="Aman">Aman</option>
              <option value="Kritis">Kritis</option>
              <option value="Habis">Habis</option>
            </select>
            <select value={perPage} onChange={(e) => { setPage(1); setPerPage(Number(e.target.value)) }} className="input px-3 py-2 rounded-xl text-sm min-w-28">
              <option value={10}>10 / halaman</option>
              <option value={25}>25 / halaman</option>
              <option value={50}>50 / halaman</option>
            </select>
          </>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Part</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kategori</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Stok</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Harga</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Stok</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aktif</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {!hasLoaded ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`skeleton-row-${index}`}>
                    <td className="py-3 px-4"><div className="space-y-1.5"><SkeletonBox className="h-3 w-32" /><SkeletonBox className="h-3 w-24" /></div></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-4 w-24" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-4 w-16" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-20 rounded-full" /></td>
                    <td className="py-3 px-4"><SkeletonBox className="h-6 w-20 rounded-full" /></td>
                    <td className="py-3 px-4"><div className="flex gap-2 justify-end"><SkeletonBox className="w-8 h-8 rounded-lg" /><SkeletonBox className="w-8 h-8 rounded-lg" /><SkeletonBox className="w-8 h-8 rounded-lg" /><SkeletonBox className="w-8 h-8 rounded-lg" /></div></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="py-8 text-center text-slate-400">Tidak ada data inventory.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/20 cursor-pointer" onClick={() => openDetail(p)}>
                  <td className="py-3 px-4">
                    <div className="font-mono text-xs text-blue-400">{p.code}</div>
                    <div className="text-xs font-semibold text-slate-200">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.brand} · {p.unit}</div>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-300">{p.category}</td>
                  <td className="py-3 px-4 text-xs text-slate-300">{p.stock} <span className="text-slate-500">(min {p.minStock})</span></td>
                  <td className="py-3 px-4 text-xs text-slate-300">{formatRupiah(p.unitPrice)}</td>
                  <td className="py-3 px-4">{stockBadge(p.stock, p.minStock)}</td>
                  <td className="py-3 px-4">{activeBadge(p.isActive)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end items-center">
                      <button onClick={(e) => { e.stopPropagation(); openDetail(p) }} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-blue-400 border border-slate-600/70 bg-slate-700/30 hover:bg-blue-500/10" title="Detail" type="button"><EyeIcon /></button>
                      <button onClick={(e) => { e.stopPropagation(); openEdit(p) }} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-yellow-400 border border-slate-600/70 bg-slate-700/30 hover:bg-yellow-500/10" title="Edit" type="button"><EditIcon /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleTogglePart(p) }} className={`w-8 h-8 rounded-lg inline-flex items-center justify-center border ${p.isActive ? 'text-emerald-300 border-emerald-400/60 bg-emerald-500/10' : 'text-slate-300 border-slate-500/70 bg-slate-600/20'}`} title="Aktif/Nonaktif" type="button">{p.isActive ? <StatusOnIcon /> : <StatusOffIcon />}</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeletePart(p) }} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-red-400 border border-slate-600/70 bg-slate-700/30 hover:bg-red-500/10" title="Hapus" type="button"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <div>Menampilkan {filtered.length === 0 ? 0 : ((page - 1) * perPage) + 1}-{Math.min(page * perPage, total)} dari {total} data</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Prev</button>
          <span>Hal {page} / {lastPage}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page >= lastPage || loading} className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50">Next</button>
        </div>
      </div>

      {selected && (
        <ModalPortal>
          <div className="w-full h-full overflow-y-auto hide-scrollbar py-6 flex items-start justify-center" onClick={() => { setSelected(null); setSelectedTransactions([]) }}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-slate-700">
                <div>
                  <div className="text-xs text-blue-400 font-mono">{selected.code}</div>
                  <div className="text-lg font-semibold text-white">{selected.name}</div>
                </div>
                <button type="button" onClick={() => { setSelected(null); setSelectedTransactions([]) }} className="text-slate-500 hover:text-white">✕</button>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="bg-slate-900/60 rounded-xl p-3"><div className="text-xs text-slate-500">Brand</div><div className="text-slate-200">{selected.brand}</div></div>
                  <div className="bg-slate-900/60 rounded-xl p-3"><div className="text-xs text-slate-500">Unit</div><div className="text-slate-200">{selected.unit}</div></div>
                  <div className="bg-slate-900/60 rounded-xl p-3"><div className="text-xs text-slate-500">Kategori</div><div className="text-slate-200">{selected.category}</div></div>
                  <div className="bg-slate-900/60 rounded-xl p-3"><div className="text-xs text-slate-500">Part Number</div><div className="text-slate-200">{selected.partNumber}</div></div>
                  <div className="bg-slate-900/60 rounded-xl p-3"><div className="text-xs text-slate-500">Stok</div><div className="text-slate-200">{selected.stock}</div></div>
                  <div className="bg-slate-900/60 rounded-xl p-3"><div className="text-xs text-slate-500">Harga</div><div className="text-slate-200">{formatRupiah(selected.unitPrice)}</div></div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  <div className="bg-slate-900/60 rounded-xl p-3">
                    <div className="text-xs text-slate-500 mb-2">Distribusi Stok per Lokasi</div>
                    <div className="space-y-1 text-xs text-slate-300">
                      {(inventoryRows.filter((row) => row.part_id === selected.id).length > 0
                        ? inventoryRows.filter((row) => row.part_id === selected.id)
                        : selected.inventoryRows
                      ).map((row) => (
                        <div key={row.id} className="flex items-center justify-between">
                          <span>{row.location || 'gudang-utama'}</span>
                          <span>{Number(row.qty_available || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 rounded-xl p-3">
                    <div className="text-xs text-slate-500">Catatan</div>
                    <div className="text-sm text-slate-200">{selected.notes}</div>
                  </div>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-3">
                  <div className="text-xs text-slate-500 mb-2">Riwayat Transaksi Terbaru</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                    <input
                      type="date"
                      className="input px-2 py-1.5 rounded-lg text-xs"
                      value={selectedTxDateFrom}
                      onChange={(e) => setSelectedTxDateFrom(e.target.value)}
                    />
                    <input
                      type="date"
                      className="input px-2 py-1.5 rounded-lg text-xs"
                      value={selectedTxDateTo}
                      onChange={(e) => setSelectedTxDateTo(e.target.value)}
                    />
                    <select
                      className="input px-2 py-1.5 rounded-lg text-xs"
                      value={selectedTxType}
                      onChange={(e) => setSelectedTxType(e.target.value)}
                    >
                      <option value="ALL">Semua Tipe</option>
                      <option value="in">Masuk (in)</option>
                      <option value="out">Keluar (out)</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="return">Return</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      type="button"
                      className="px-2 py-1 rounded-lg border border-slate-600 text-xs text-slate-300"
                      onClick={() => fetchDetailTransactions(selected.id, 1, selectedTxDateFrom, selectedTxDateTo, selectedTxType)}
                      disabled={selectedTxLoading}
                    >
                      Terapkan
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 rounded-lg border border-slate-600 text-xs text-slate-300"
                      onClick={() => {
                        setSelectedTxDateFrom('')
                        setSelectedTxDateTo('')
                        setSelectedTxType('ALL')
                        fetchDetailTransactions(selected.id, 1, '', '', 'ALL')
                      }}
                      disabled={selectedTxLoading}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 rounded-lg border border-blue-500/40 text-xs text-blue-300"
                      onClick={handleExportTransactionsCsv}
                      disabled={selectedTxLoading}
                    >
                      Export CSV
                    </button>
                  </div>
                  {selectedTxLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, idx) => <SkeletonBox key={`tx-skeleton-${idx}`} className="h-10 w-full" />)}
                    </div>
                  ) : selectedTransactions.length === 0 ? (
                    <div className="text-xs text-slate-400">Belum ada transaksi untuk part ini.</div>
                  ) : (
                    <div className="space-y-2">
                      {selectedTransactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between text-xs border-b border-slate-700/50 pb-2">
                          <div>
                            <div className="text-slate-200 font-medium">{tx.type} · Qty {Number(tx.qty || 0)}</div>
                            <div className="text-slate-500">{tx.reference_type || '-'} {tx.reference_id || ''} · {tx.processor?.name || '-'}</div>
                          </div>
                          <div className="text-slate-500">{new Date(tx.created_at).toLocaleString('id-ID')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                    <span>Hal {selectedTxPage} / {selectedTxLastPage}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-2 py-1 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50"
                        onClick={() => fetchDetailTransactions(selected.id, Math.max(1, selectedTxPage - 1), selectedTxDateFrom, selectedTxDateTo, selectedTxType)}
                        disabled={selectedTxPage <= 1 || selectedTxLoading}
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50"
                        onClick={() => fetchDetailTransactions(selected.id, Math.min(selectedTxLastPage, selectedTxPage + 1), selectedTxDateFrom, selectedTxDateTo, selectedTxType)}
                        disabled={selectedTxPage >= selectedTxLastPage || selectedTxLoading}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between gap-2 pt-2">
                  <button type="button" className="px-3 py-2 rounded-xl border border-blue-500/40 text-blue-300 text-sm" onClick={() => openTxModal(selected)}>Transaksi</button>
                  <button type="button" className="px-3 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm" onClick={() => { setSelected(null); setSelectedTransactions([]) }}>Tutup</button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {partModal && (
        <ModalPortal>
          <div onClick={() => !submitLoading && setPartModal(null)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{partModal?.mode === 'edit' ? 'Edit Spare Part' : 'Tambah Spare Part'}</h3>
                <button type="button" onClick={() => !submitLoading && setPartModal(null)} className="text-slate-500 hover:text-white">✕</button>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-xs text-slate-300">Kode<input className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Kode" value={partForm.code} onChange={(e) => setPartForm((s) => ({ ...s, code: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Nama<input className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Nama" value={partForm.name} onChange={(e) => setPartForm((s) => ({ ...s, name: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Unit<input className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Unit" value={partForm.unit} onChange={(e) => setPartForm((s) => ({ ...s, unit: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Kategori<input className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Kategori" value={partForm.category} onChange={(e) => setPartForm((s) => ({ ...s, category: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Brand<input className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Brand" value={partForm.brand} onChange={(e) => setPartForm((s) => ({ ...s, brand: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Part Number<input className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Part Number" value={partForm.part_number} onChange={(e) => setPartForm((s) => ({ ...s, part_number: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Min Stock<input type="number" className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Min Stock" value={partForm.min_stock} onChange={(e) => setPartForm((s) => ({ ...s, min_stock: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Harga (Rupiah)<input className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Harga (Rupiah)" value={partForm.unit_price} onChange={(e) => setPartForm((s) => ({ ...s, unit_price: e.target.value }))} /></label>
                <label className="text-xs text-slate-300 md:col-span-2">Catatan<textarea className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" rows="3" placeholder="Catatan" value={partForm.notes} onChange={(e) => setPartForm((s) => ({ ...s, notes: e.target.value }))} /></label>
              </div>
              <div className="p-5 border-t border-slate-700 flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300" onClick={() => setPartModal(null)} disabled={submitLoading}>Batal</button>
                <button type="button" className="btn-primary px-4 py-2 rounded-xl text-white disabled:opacity-60" onClick={handleSavePart} disabled={submitLoading}>{submitLoading ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {txModalOpen && (
        <ModalPortal>
          <div onClick={() => !submitLoading && setTxModalOpen(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Transaksi Inventory</h3>
                <button type="button" onClick={() => !submitLoading && setTxModalOpen(false)} className="text-slate-500 hover:text-white">✕</button>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-xs text-slate-300">Part
                  <select className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" value={txForm.part_id} onChange={(e) => setTxForm((s) => ({ ...s, part_id: e.target.value }))}>
                    <option value="">Pilih Part</option>
                    {parts.map((part) => <option key={part.id} value={part.id}>{part.code} - {part.name}</option>)}
                  </select>
                </label>
                <label className="text-xs text-slate-300">Tipe Transaksi
                  <select className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" value={txForm.type} onChange={(e) => setTxForm((s) => ({ ...s, type: e.target.value }))}>
                    <option value="in">Masuk (in)</option>
                    <option value="out">Keluar (out)</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="return">Return</option>
                  </select>
                </label>
                <label className="text-xs text-slate-300">Qty<input type="number" className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Qty" value={txForm.qty} onChange={(e) => setTxForm((s) => ({ ...s, qty: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Harga Satuan (Rupiah, opsional)<input className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Harga Satuan (Rupiah, opsional)" value={txForm.unit_price} onChange={(e) => setTxForm((s) => ({ ...s, unit_price: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Reference Type (mis. WO/PO)<input className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Reference Type (mis. WO/PO)" value={txForm.reference_type} onChange={(e) => setTxForm((s) => ({ ...s, reference_type: e.target.value }))} /></label>
                <label className="text-xs text-slate-300">Reference ID (opsional)<input type="number" className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Reference ID (opsional)" value={txForm.reference_id} onChange={(e) => setTxForm((s) => ({ ...s, reference_id: e.target.value }))} /></label>
                <label className="text-xs text-slate-300 md:col-span-2">Lokasi<input className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Lokasi" value={txForm.location} onChange={(e) => setTxForm((s) => ({ ...s, location: e.target.value }))} /></label>
                <label className="text-xs text-slate-300 md:col-span-2">Catatan<textarea rows="3" className="input mt-1 px-3 py-2 rounded-xl text-sm w-full" placeholder="Catatan" value={txForm.notes} onChange={(e) => setTxForm((s) => ({ ...s, notes: e.target.value }))} /></label>
              </div>
              <div className="p-5 border-t border-slate-700 flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300" onClick={() => setTxModalOpen(false)} disabled={submitLoading}>Batal</button>
                <button type="button" className="btn-primary px-4 py-2 rounded-xl text-white disabled:opacity-60" onClick={handleCreateTransaction} disabled={submitLoading}>{submitLoading ? 'Menyimpan...' : 'Simpan Transaksi'}</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
