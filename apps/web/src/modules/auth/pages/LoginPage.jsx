import { useQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { getJson } from '../../../services/api'
import { BlockingLoader } from '../../dashboard/components/BlockingLoader'
import { LoginCard } from '../../dashboard/components/LoginCard'

export function LoginPage() {
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

  if (meQuery.data) {
    const permissions = meQuery.data?.permissions || []
    if (permissions.includes('view work-orders')) return <Navigate to="/" replace />
  }

  return <LoginCard />
}
