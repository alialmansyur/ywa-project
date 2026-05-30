import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function SlideFourAnalyst({ settings, analystData, isLoading, error }) {
  const hasTrendData = (analystData?.trendRows || []).length > 0
  const hasBottleneckData = (analystData?.bottleneckRows || []).length > 0
  const hasStatusMix = (analystData?.statusMixRows || []).length > 0
  const palette = ['#38bdf8', '#34d399', '#f59e0b', '#a78bfa', '#f97316', '#94a3b8', '#f43f5e', '#22d3ee']

  return (
    <section className="slide-panel slide-scrollable analyst-slide">
      <div className="panel-title-wrap">
        <h1 className="panel-title">{settings.slide4Title}</h1>
        <p className="panel-note">{settings.slide4Desc}</p>
      </div>

      {isLoading ? <div className="panel-feedback panel-feedback-loading">Memuat data analyst...</div> : null}
      {error ? <div className="panel-feedback panel-feedback-error">Gagal memuat data analyst. Coba refresh slide aktif.</div> : null}

      <div className="analyst-grid analyst-grid-two-col">
        <section className="panel analyst-panel">
          <h3>WO vs Downtime (30 Hari)</h3>
          {!hasTrendData && !isLoading && !error ? <div className="panel-feedback">Belum ada data trend.</div> : null}
          {hasTrendData ? (
            <div className="analyst-chart-wrap analyst-chart-lg">
              <ResponsiveContainer>
                <LineChart data={analystData.trendRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="woCreated" name="WO Created" stroke="#38bdf8" strokeWidth={2} dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="woCompleted" name="WO Completed" stroke="#34d399" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="downtime" name="Downtime (m)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </section>

        <section className="panel analyst-panel">
          <h3>Top Bottleneck</h3>
          {!hasBottleneckData && !isLoading && !error ? <div className="panel-feedback">Belum ada data bottleneck.</div> : null}
          {hasBottleneckData ? (
            <div className="analyst-chart-wrap analyst-chart-lg">
              <ResponsiveContainer>
                <BarChart data={analystData.bottleneckRows} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis type="category" dataKey="step" tick={{ fill: '#94a3b8', fontSize: 11 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="minutes" name="Downtime (m)" fill="#f97316" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </section>
      </div>

      <div className="analyst-grid analyst-grid-two-col">
        <section className="panel analyst-panel">
          <h3>Avg Queue Minutes per Day</h3>
          {!hasTrendData && !isLoading && !error ? <div className="panel-feedback">Belum ada data queue harian.</div> : null}
          {hasTrendData ? (
            <div className="analyst-chart-wrap analyst-chart-md">
              <ResponsiveContainer>
                <LineChart data={analystData.trendRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgQueue" name="Avg Queue (m)" stroke="#22d3ee" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </section>

        <section className="panel analyst-panel">
          <h3>WO by Status (30D)</h3>
          {!hasStatusMix && !isLoading && !error ? <div className="panel-feedback">Belum ada data status WO.</div> : null}
          {hasStatusMix ? (
            <div className="analyst-chart-wrap analyst-chart-md">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={analystData.statusMixRows} dataKey="total" nameKey="status" outerRadius={68} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {analystData.statusMixRows.map((entry, idx) => (
                      <Cell key={`${entry.status}-${idx}`} fill={palette[idx % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </section>
      </div>

      <section className="panel analyst-panel">
        <div className="analyst-kpi-grid">
          <div className="mini-input">WO Created 30D: <strong>{analystData?.totals?.woCreated || 0}</strong></div>
          <div className="mini-input">WO Completed 30D: <strong>{analystData?.totals?.woCompleted || 0}</strong></div>
          <div className="mini-input">Completion Rate: <strong>{analystData?.totals?.completionRate || 0}%</strong></div>
          <div className="mini-input">Downtime 30D: <strong>{analystData?.totals?.downtime || 0}m</strong></div>
        </div>
      </section>
    </section>
  )
}
