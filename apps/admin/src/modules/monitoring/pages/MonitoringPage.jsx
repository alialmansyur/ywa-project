import { useMemo, useState } from 'react'

const assets = [
  { id: 1, code: 'PC-001', name: 'PC 200-10', operator: 'Ahmad Fauzi', status: 'ACTIVE', speed: 0, fuel: 78 },
  { id: 2, code: 'DT-012', name: 'Dump Truck 12', operator: 'Budi Santoso', status: 'BREAKDOWN', speed: 0, fuel: 45 },
  { id: 3, code: 'GD-005', name: 'Grader 005', operator: 'Candra Wijaya', status: 'ACTIVE', speed: 12, fuel: 62 },
]

export function MonitoringPage() {
  const [q, setQ] = useState('')
  const [selectedId, setSelectedId] = useState(1)
  const filtered = useMemo(() => assets.filter((a) => !q || `${a.code} ${a.name} ${a.operator}`.toLowerCase().includes(q.toLowerCase())), [q])
  const sel = assets.find((a) => a.id === selectedId)

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 h-[calc(100vh-140px)]">
        <div className="card p-3 flex flex-col">
          <div className="grid grid-cols-3 gap-2 mb-3 text-xs"><div className="bg-slate-800/60 p-2 rounded">Active <div className="text-green-400 font-bold">2</div></div><div className="bg-slate-800/60 p-2 rounded">Breakdown <div className="text-red-400 font-bold">1</div></div><div className="bg-slate-800/60 p-2 rounded">Moving <div className="text-blue-400 font-bold">1</div></div></div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kode, nama, operator..." className="input px-3 py-2 rounded-xl text-sm mb-3" />
          <div className="flex-1 overflow-y-auto custom-scroll space-y-2">{filtered.map((a) => <button key={a.id} onClick={() => setSelectedId(a.id)} className={`w-full p-3 rounded-xl border text-left ${selectedId === a.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/50'}`}><div className="font-mono text-blue-400 text-xs">{a.code}</div><div className="text-sm font-semibold">{a.name}</div><div className="text-xs text-slate-500">👤 {a.operator} · ⛽ {a.fuel}%</div></button>)}</div>
        </div>
        <div className="card p-3 relative"><div className="w-full h-full rounded-xl bg-slate-800 grid place-items-center text-slate-500">Map container (Leaflet placeholder)</div>{sel && <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-700 rounded-xl p-3 w-72 text-sm"><div className="font-mono text-blue-400">{sel.code}</div><div className="font-semibold mt-1">{sel.name}</div><div className="text-xs text-slate-500 mt-1">Operator: {sel.operator}</div><div className="text-xs text-slate-500">Status: {sel.status}</div><div className="text-xs text-slate-500">Speed: {sel.speed} km/h</div></div>}</div>
      </div>
    </div>
  )
}
