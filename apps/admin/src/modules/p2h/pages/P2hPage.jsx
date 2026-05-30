import { useMemo, useState } from 'react'
import { ModalPortal } from '../../shared/components/ModalPortal'

const p2hData = [
  { id: 1, code: 'P2H-240518-001', asset: 'PC-001', name: 'PC 200-10', operator: 'Ahmad Fauzi', shift: 'Pagi', time: '06:48', status: 'REVIEWED', findings: 0 },
  { id: 2, code: 'P2H-240518-002', asset: 'DT-012', name: 'Dump Truck 12', operator: 'Budi Santoso', shift: 'Pagi', time: '07:12', status: 'SUBMITTED', findings: 2 },
  { id: 3, code: 'P2H-240518-003', asset: 'GD-005', name: 'Grader 005', operator: 'Candra Wijaya', shift: 'Pagi', time: '07:05', status: 'REVIEWED', findings: 1 },
  { id: 4, code: 'P2H-240518-004', asset: 'BHL-003', name: 'Backhoe Loader', operator: 'Dedi Kurniawan', shift: 'Pagi', time: '07:22', status: 'SUBMITTED', findings: 0 },
  { id: 5, code: 'P2H-240518-005', asset: 'DT-008', name: 'Dump Truck 08', operator: 'Eko Prasetyo', shift: 'Pagi', time: '07:35', status: 'DRAFT', findings: 0 },
  { id: 6, code: 'P2H-240517-001', asset: 'PC-001', name: 'PC 200-10', operator: 'Ahmad Fauzi', shift: 'Pagi', time: '06:52', status: 'REVIEWED', findings: 0 },
  { id: 7, code: 'P2H-240517-002', asset: 'WL-002', name: 'Wheel Loader', operator: 'Fajar Nugroho', shift: 'Sore', time: '14:10', status: 'REVIEWED', findings: 3 },
]

function statusBadge(s) {
  const map = { SUBMITTED: ['blue', 'SUBMITTED'], REVIEWED: ['green', 'REVIEWED'], DRAFT: ['gray', 'DRAFT'], REJECTED: ['red', 'REJECTED'] }
  const [c, l] = map[s] || ['gray', s]
  return <span className={`px-2 py-0.5 rounded-full text-xs bg-${c}-500/15 text-${c}-400 border border-${c}-500/20`}>{l}</span>
}

export function P2hPage() {
  const [status, setStatus] = useState('ALL')
  const [shift, setShift] = useState('ALL')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [showCompliance, setShowCompliance] = useState(false)

  const rows = useMemo(() => {
    return p2hData.filter((p) => {
      const matchStatus = status === 'ALL' || p.status === status
      const matchShift = shift === 'ALL' || p.shift === shift
      const matchQ = !query || `${p.asset} ${p.name} ${p.operator}`.toLowerCase().includes(query.toLowerCase())
      return matchStatus && matchShift && matchQ
    })
  }, [status, shift, query])

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">P2H — Pre-Use Inspection</h2>
          <p className="text-sm text-slate-500">Pemeriksaan harian sebelum pengoperasian unit</p>
        </div>
        <button onClick={() => setShowCompliance(true)} className="btn-primary px-4 py-2 rounded-xl text-sm text-white">Laporan Compliance</button>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold text-white">Compliance Hari Ini</div>
            <div className="text-xs text-slate-500 mt-0.5">62 dari 71 unit aktif sudah submit P2H</div>
          </div>
          <div className="text-right"><div className="text-2xl font-bold text-green-400">87%</div><div className="text-xs text-slate-500">compliance rate</div></div>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: '87%' }} /></div>
        <div className="flex justify-between text-xs text-slate-500 mt-2"><span>Target: 95%</span><span className="text-yellow-400">⚠ 9 unit belum submit</span></div>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="input px-3 py-2 rounded-xl text-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input px-3 py-2 rounded-xl text-sm min-w-36"><option value="ALL">Semua Status</option><option>SUBMITTED</option><option>REVIEWED</option><option>DRAFT</option><option>REJECTED</option></select>
        <select value={shift} onChange={(e) => setShift(e.target.value)} className="input px-3 py-2 rounded-xl text-sm min-w-28"><option value="ALL">Semua Shift</option><option>Pagi</option><option>Sore</option><option>Malam</option></select>
        <div className="relative flex-1 min-w-48"><input value={query} onChange={(e) => setQuery(e.target.value)} type="text" placeholder="Cari unit, operator..." className="input w-full pl-3 pr-4 py-2 rounded-xl text-sm" /></div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-700 bg-slate-800/50"><th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">No. P2H</th><th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Unit</th><th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Operator</th><th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Shift / Waktu</th><th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Temuan</th><th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th><th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi</th></tr></thead>
            <tbody className="divide-y divide-slate-700/50">
              {rows.map((p) => (
                <tr key={p.id} className="cursor-pointer hover:bg-slate-700/20" onClick={() => setSelected(p)}>
                  <td className="py-3 px-4 font-mono text-blue-400 text-xs">{p.code}</td>
                  <td className="py-3 px-4"><div className="font-semibold text-slate-200 text-xs">{p.asset}</div><div className="text-xs text-slate-500">{p.name}</div></td>
                  <td className="py-3 px-4 text-slate-300 text-xs">{p.operator}</td>
                  <td className="py-3 px-4"><div className="text-xs text-slate-300">{p.shift}</div><div className="text-xs text-slate-500">{p.time} WIB</div></td>
                  <td className="py-3 px-4">{p.findings > 0 ? <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/15 text-red-400 border border-red-500/20">⚠ {p.findings} temuan</span> : <span className="text-xs text-green-400">✓ Tidak ada</span>}</td>
                  <td className="py-3 px-4">{statusBadge(p.status)}</td>
                  <td className="py-3 px-4"><div className="flex gap-1"><button onClick={(e) => { e.stopPropagation(); setSelected(p) }} className="px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">Detail</button>{p.status === 'SUBMITTED' && <button onClick={(e) => { e.stopPropagation(); setSelected(p) }} className="px-3 py-1.5 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">Review</button>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <ModalPortal>
        <div onClick={() => setSelected(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <div><div className="text-xs text-blue-400 font-mono">{selected.code}</div><div className="font-bold text-white">{selected.asset} — {selected.name}</div><div className="text-xs text-slate-500">{selected.operator} · Shift {selected.shift} · {selected.time} WIB</div></div>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 rounded-xl p-3"><span>GeoTag: -3.1234°, 116.4567° · Site B, Area 3</span></div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3"><span className="text-sm font-semibold text-red-400">2 Temuan Perlu Perhatian</span></div>
                <div className="space-y-2">{[['Hydraulic', 'Rembesan oli pada selang hydraulic kiri', 'NOK'], ['Engine', 'Knocking sound saat idle', 'Perhatian']].map(([cat, desc, cond]) => <div key={cat} className="flex gap-3 text-xs"><span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">{cat}</span><span className="text-slate-300 flex-1">{desc}</span><span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{cond}</span></div>)}</div>
              </div>

              {[['Engine', [['Level oli mesin', 'OK'], ['Kebocoran oli', 'OK'], ['Knocking sound', 'Perhatian'], ['Temperatur normal', 'OK']]], ['Hydraulic', [['Level oli hydraulic', 'OK'], ['Kebocoran selang', 'NOK'], ['Tekanan normal', 'OK']]], ['Body & Safety', [['Lampu depan', 'OK'], ['Lampu belakang', 'OK'], ['APAR', 'OK'], ['Sabuk pengaman', 'OK']]]].map(([cat, items]) => (
                <div key={cat}>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{cat}</div>
                  <div className="space-y-1.5">{items.map(([item, cond]) => <div key={item} className="flex items-center gap-3 p-2.5 bg-slate-900/50 rounded-lg text-xs"><span className={cond === 'OK' ? 'text-green-400' : cond === 'NOK' ? 'text-red-400' : 'text-yellow-400'}>{cond === 'OK' ? '✓' : cond === 'NOK' ? '✗' : '⚠'}</span><span className="flex-1 text-slate-300">{item}</span><span className={`px-2 py-0.5 rounded-full text-xs ${cond === 'OK' ? 'bg-green-500/15 text-green-400' : cond === 'NOK' ? 'bg-red-500/15 text-red-400' : 'bg-yellow-500/15 text-yellow-400'}`}>{cond}</span></div>)}</div>
                </div>
              ))}

              <div className="bg-slate-900/50 rounded-xl p-4"><div className="text-xs text-slate-500 mb-2">Tanda Tangan Operator</div><div className="h-20 bg-white/5 border border-slate-700 rounded-lg flex items-center justify-center"><span className="text-2xl italic text-slate-400 font-serif">Budi S.</span></div></div>
            </div>
            <div className="flex gap-2 p-5 border-t border-slate-700"><button onClick={() => setSelected(null)} className="btn-secondary flex-1 py-2 rounded-xl text-sm text-slate-300">Tutup</button><button className="px-4 py-2 rounded-xl text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors">Tolak</button><button className="btn-primary flex-1 py-2 rounded-xl text-sm text-white">✓ Approve & Buat WO</button></div>
          </div>
        </div>
        </ModalPortal>
      )}

      {showCompliance && (
        <ModalPortal>
        <div onClick={() => setShowCompliance(false)}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-3">Laporan Compliance — Heatmap Placeholder</h3>
            <div className="grid grid-cols-6 gap-2">{Array.from({ length: 30 }).map((_, i) => <div key={i} className="h-10 rounded bg-slate-700/50" />)}</div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  )
}
