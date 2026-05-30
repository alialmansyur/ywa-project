import { useQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { TOKEN_KEY, getJson } from '../../../services/api'
import { BlockingLoader } from '../components/BlockingLoader'
import { DashboardContent } from '../components/DashboardContent'

export function DashboardPage() {
  const meQuery = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => getJson('/auth/me'),
    retry: false,
  })

  if (meQuery.isLoading) {
    return (
      <div className="dashboard-shell">
        <BlockingLoader text="Memvalidasi token & session..." />
      </div>
    )
  }

  if (meQuery.error) return <Navigate to="/login" replace />

  const permissions = meQuery.data?.permissions || []
  if (!permissions.includes('view work-orders')) {
    return (
      <div className="dashboard-shell">
        <section className="panel auth-card">
          <h3>Akses Ditolak</h3>
          <p className="panel-note">Akun tidak memiliki permission <code>view work-orders</code>.</p>
          <button onClick={() => { localStorage.removeItem(TOKEN_KEY); window.location.reload() }}>Logout</button>
        </section>
      </div>
    )
  }

  return <DashboardContent me={meQuery.data} />
}
