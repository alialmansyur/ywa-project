import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import { AdminLayout } from '../layout/AdminLayout'
import { LoginPage } from '../modules/auth/pages/LoginPage'
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage'
import { AssetsPage } from '../modules/assets/pages/AssetsPage'
import { AssetDetailPage } from '../modules/assets/pages/AssetDetailPage'
import { P2hPage } from '../modules/p2h/pages/P2hPage'
const WorkOrdersPage = lazy(() => import('../modules/work-orders/pages/WorkOrdersPage').then((m) => ({ default: m.WorkOrdersPage })))
const WorkshopControlTowerPage = lazy(() => import('../modules/workshop-control-tower/pages/WorkshopControlTowerPage').then((m) => ({ default: m.WorkshopControlTowerPage })))
import { SchedulePage } from '../modules/schedule/pages/SchedulePage'
import { InventoryPage } from '../modules/inventory/pages/InventoryPage'
import { P2hReportPage } from '../modules/reports/pages/P2hReportPage'
import { WoReportPage } from '../modules/reports/pages/WoReportPage'
import { BreakdownReportPage } from '../modules/reports/pages/BreakdownReportPage'
import { CostReportPage } from '../modules/reports/pages/CostReportPage'
import { UtilizationReportPage } from '../modules/reports/pages/UtilizationReportPage'
import { MechanicReportPage } from '../modules/reports/pages/MechanicReportPage'
import { WoHistoryReportPage } from '../modules/reports/pages/WoHistoryReportPage'
import { WorkshopStepControlReportPage } from '../modules/reports/pages/WorkshopStepControlReportPage'
import { ServiceHistoryReportPage } from '../modules/reports/pages/ServiceHistoryReportPage'
import { DowntimeAnalysisReportPage } from '../modules/reports/pages/DowntimeAnalysisReportPage'
import { MonitoringPage } from '../modules/monitoring/pages/MonitoringPage'
import { UsersPage } from '../modules/users/pages/UsersPage'
import { RoleManagerPage } from '../modules/settings/pages/RoleManagerPage'
import { SmtpConfigurationPage } from '../modules/settings/pages/SmtpConfigurationPage'
import { SystemSettingPage } from '../modules/settings/pages/SystemSettingPage'
import { NotificationTestPage } from '../modules/settings/pages/NotificationTestPage'
import { MasterDataManagerPage } from '../modules/settings/pages/MasterDataManagerPage'
import { DatabaseBackupPage } from '../modules/settings/pages/DatabaseBackupPage'
import { DashboardAccessTokenPage } from '../modules/settings/pages/DashboardAccessTokenPage'
import { ApprovalInboxPage } from '../modules/approvals/pages/ApprovalInboxPage'
import { ApprovalHistoryPage } from '../modules/approvals/pages/ApprovalHistoryPage'
import { ApprovalMatrixPage } from '../modules/settings/pages/ApprovalMatrixPage'
const EmailTemplatesPage = lazy(() => import('../modules/settings/pages/EmailTemplatesPage').then((m) => ({ default: m.EmailTemplatesPage })))
import { FindingsPage } from '../modules/findings/pages/FindingsPage'
import { BreakdownReportsPage } from '../modules/breakdown-reports/pages/BreakdownReportsPage'
import { isAuthenticated, subscribeAuthChange } from '../services/auth'
import { apiRequest, ApiError } from '../services/api'

function withLayout(title, element) {
  return <AdminLayout title={title}>{element}</AdminLayout>
}

function normalizeRoute(path) {
  const raw = String(path || '').trim()
  if (!raw) return '/'
  return raw.endsWith('/') && raw.length > 1 ? raw.slice(0, -1) : raw
}

function hasRouteAccess(pathname, allowedRoutes) {
  const current = normalizeRoute(pathname)
  const allowed = allowedRoutes.map((route) => normalizeRoute(route))

  if (allowed.includes(current)) return true

  return allowed.some((route) => {
    if (route === '/') return current === '/'
    return current.startsWith(`${route}/`)
  })
}

function ProtectedByMenu({ authenticated, routePath, children }) {
  const [allowedRoutes, setAllowedRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const loadAllowedRoutes = async () => {
      if (!authenticated) {
        if (active) {
          setAllowedRoutes([])
          setLoading(false)
        }
        return
      }

      setLoading(true)
      try {
        const response = await apiRequest('/settings/menu-access?category=admin')
        if (!active) return

        const flatten = (items) => (items || []).flatMap((item) => {
          const routes = item?.route ? [item.route] : []
          return [...routes, ...flatten(item?.children || [])]
        })
        setAllowedRoutes(flatten(response.data || []))
      } catch (error) {
        if (!active) return
        if (error instanceof ApiError && error.status === 403) {
          setAllowedRoutes([])
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadAllowedRoutes()
    return () => { active = false }
  }, [authenticated])

  if (!authenticated) return <Navigate to="/login" replace />
  if (loading) {
    return (
      <div className="fixed inset-0 z-[999] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-slate-600 border-t-blue-400 animate-spin" />
          <div className="text-sm text-slate-200">Memuat akses menu...</div>
        </div>
      </div>
    )
  }

  return hasRouteAccess(routePath, allowedRoutes) ? children : <Navigate to="/dashboard" replace />
}

export function AppRouter() {
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated())

  useEffect(() => {
    const unsubscribe = subscribeAuthChange(() => {
      setAuthenticated(isAuthenticated())
    })

    return unsubscribe
  }, [])

  return (
    <Routes>
      <Route path="/login" element={authenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<ProtectedByMenu authenticated={authenticated} routePath="/dashboard">{withLayout('Dashboard', <DashboardPage />)}</ProtectedByMenu>} />
      <Route path="/assets" element={<ProtectedByMenu authenticated={authenticated} routePath="/assets">{withLayout('Asset Management', <AssetsPage />)}</ProtectedByMenu>} />
      <Route path="/assets/detail/:assetRef" element={<ProtectedByMenu authenticated={authenticated} routePath="/assets">{withLayout('Asset Detail', <AssetDetailPage />)}</ProtectedByMenu>} />
      <Route path="/p2h" element={<ProtectedByMenu authenticated={authenticated} routePath="/p2h">{withLayout('P2H / Checklist', <P2hPage />)}</ProtectedByMenu>} />
      <Route path="/work-orders" element={<ProtectedByMenu authenticated={authenticated} routePath="/work-orders">{withLayout('Work Orders', <Suspense fallback={<div className="p-6 text-sm text-slate-400">Loading Work Orders...</div>}><WorkOrdersPage /></Suspense>)}</ProtectedByMenu>} />
      <Route path="/workshop-control-tower" element={<ProtectedByMenu authenticated={authenticated} routePath="/workshop-control-tower">{withLayout('Workshop Control', <Suspense fallback={<div className="p-6 text-sm text-slate-400">Loading Workshop Control...</div>}><WorkshopControlTowerPage /></Suspense>)}</ProtectedByMenu>} />
      <Route path="/schedule" element={<ProtectedByMenu authenticated={authenticated} routePath="/schedule">{withLayout('Jadwal Maintenance', <SchedulePage />)}</ProtectedByMenu>} />
      <Route path="/inventory" element={<ProtectedByMenu authenticated={authenticated} routePath="/inventory">{withLayout('Inventory', <InventoryPage />)}</ProtectedByMenu>} />
      {/* Reports */}
      <Route path="/reports/p2h" element={<ProtectedByMenu authenticated={authenticated} routePath="/reports/p2h">{withLayout('P2H Compliance', <P2hReportPage />)}</ProtectedByMenu>} />
      <Route path="/reports/wo" element={<ProtectedByMenu authenticated={authenticated} routePath="/reports/wo">{withLayout('Work Order Report', <WoReportPage />)}</ProtectedByMenu>} />
      <Route path="/reports/breakdown" element={<ProtectedByMenu authenticated={authenticated} routePath="/reports/breakdown">{withLayout('Breakdown Analysis', <BreakdownReportPage />)}</ProtectedByMenu>} />
      <Route path="/reports/cost" element={<ProtectedByMenu authenticated={authenticated} routePath="/reports/cost">{withLayout('Maintenance Cost', <CostReportPage />)}</ProtectedByMenu>} />
      <Route path="/reports/utilization" element={<ProtectedByMenu authenticated={authenticated} routePath="/reports/utilization">{withLayout('Asset Utilization', <UtilizationReportPage />)}</ProtectedByMenu>} />
      <Route path="/reports/mechanic" element={<ProtectedByMenu authenticated={authenticated} routePath="/reports/mechanic">{withLayout('Mechanic Performance', <MechanicReportPage />)}</ProtectedByMenu>} />
      <Route path="/reports/wo-history" element={<ProtectedByMenu authenticated={authenticated} routePath="/reports/wo-history">{withLayout('WO History', <WoHistoryReportPage />)}</ProtectedByMenu>} />
      <Route path="/reports/workshop-step-control" element={<ProtectedByMenu authenticated={authenticated} routePath="/reports/workshop-step-control">{withLayout('Workshop Step Control', <WorkshopStepControlReportPage />)}</ProtectedByMenu>} />
      <Route path="/reports/service-history" element={<ProtectedByMenu authenticated={authenticated} routePath="/reports/service-history">{withLayout('Service History', <ServiceHistoryReportPage />)}</ProtectedByMenu>} />
      <Route path="/reports/downtime-analysis" element={<ProtectedByMenu authenticated={authenticated} routePath="/reports/downtime-analysis">{withLayout('Downtime Analysis', <DowntimeAnalysisReportPage />)}</ProtectedByMenu>} />

      <Route path="/monitoring" element={<ProtectedByMenu authenticated={authenticated} routePath="/monitoring">{withLayout('Monitoring', <MonitoringPage />)}</ProtectedByMenu>} />
      <Route path="/users" element={<ProtectedByMenu authenticated={authenticated} routePath="/users">{withLayout('User Management', <UsersPage />)}</ProtectedByMenu>} />
      <Route path="/settings/role-manager" element={<ProtectedByMenu authenticated={authenticated} routePath="/settings/role-manager">{withLayout('Role Manager', <RoleManagerPage />)}</ProtectedByMenu>} />
      <Route path="/settings/smtp" element={<ProtectedByMenu authenticated={authenticated} routePath="/settings/smtp">{withLayout('SMTP Configuration', <SmtpConfigurationPage />)}</ProtectedByMenu>} />
      <Route path="/settings/system" element={<ProtectedByMenu authenticated={authenticated} routePath="/settings/system">{withLayout('System Setting', <SystemSettingPage />)}</ProtectedByMenu>} />
      <Route path="/settings/notification-test" element={<ProtectedByMenu authenticated={authenticated} routePath="/settings/notification-test">{withLayout('Notification Test', <NotificationTestPage />)}</ProtectedByMenu>} />
      <Route path="/settings/master-data" element={<ProtectedByMenu authenticated={authenticated} routePath="/settings/master-data">{withLayout('Master Data Manager', <MasterDataManagerPage />)}</ProtectedByMenu>} />
      
      <Route path="/settings/database-backup" element={<ProtectedByMenu authenticated={authenticated} routePath="/settings/database-backup">{withLayout('Database Backup', <DatabaseBackupPage />)}</ProtectedByMenu>} />
      <Route path="/settings/dashboard-access-token" element={<ProtectedByMenu authenticated={authenticated} routePath="/settings/dashboard-access-token">{withLayout('Token Akses Dashboard', <DashboardAccessTokenPage />)}</ProtectedByMenu>} />

      {/* New Modules */}
      <Route path="/approvals/inbox" element={<ProtectedByMenu authenticated={authenticated} routePath="/approvals/inbox">{withLayout('Approval Inbox', <ApprovalInboxPage />)}</ProtectedByMenu>} />
      <Route path="/approvals/requests" element={<ProtectedByMenu authenticated={authenticated} routePath="/approvals/requests">{withLayout('Approval History', <ApprovalHistoryPage />)}</ProtectedByMenu>} />
      <Route path="/settings/approval-matrix" element={<ProtectedByMenu authenticated={authenticated} routePath="/settings/approval-matrix">{withLayout('Approval Matrix', <ApprovalMatrixPage />)}</ProtectedByMenu>} />
      <Route path="/settings/email-templates" element={<ProtectedByMenu authenticated={authenticated} routePath="/settings/email-templates">{withLayout('Email Templates', <Suspense fallback={<div className="p-6 text-sm text-slate-400">Loading...</div>}><EmailTemplatesPage /></Suspense>)}</ProtectedByMenu>} />
      <Route path="/findings" element={<ProtectedByMenu authenticated={authenticated} routePath="/findings">{withLayout('Findings', <FindingsPage />)}</ProtectedByMenu>} />
      <Route path="/breakdown-reports" element={<ProtectedByMenu authenticated={authenticated} routePath="/breakdown-reports">{withLayout('Breakdown Reports', <BreakdownReportsPage />)}</ProtectedByMenu>} />
      <Route path="*" element={<Navigate to={authenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
