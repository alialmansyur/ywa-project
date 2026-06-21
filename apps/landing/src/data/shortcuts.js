export const shortcuts = [
  {
    envKey: 'VITE_ADMIN_URL',
    fallbackHref: 'http://localhost:8002',
    title: 'Admin',
    label: 'Operational Control',
    description: 'Kelola data inti, approval, dan konfigurasi operasional dalam satu area kerja.',
    actionLabel: 'Buka Admin',
    icon: 'shield',
  },
  {
    envKey: 'VITE_DASHBOARD_URL',
    fallbackHref: 'http://localhost:8001',
    title: 'Dashboard',
    label: 'Realtime Monitoring',
    description: 'Pantau KPI, antrian unit, dan kondisi operasional realtime dengan tampilan ringkas.',
    actionLabel: 'Buka Dashboard',
    icon: 'chart',
  },
  {
    envKey: 'VITE_APK_BASE_PATH',
    fallbackHref: '/apk',
    title: 'Mobile APK',
    label: 'Field Distribution',
    description: 'Distribusi APK terbaru untuk tim lapangan dan kebutuhan maintenance mobile.',
    actionLabel: 'Lihat APK',
    icon: 'download',
  },
]
