export const shortcuts = [
  {
    envKey: 'VITE_ADMIN_URL',
    fallbackHref: 'http://103.247.10.115:8002',
    title: 'Admin',
    label: 'Operational Control',
    description: 'Kelola data inti, approval, dan konfigurasi operasional dalam satu area kerja.',
    actionLabel: 'Buka Admin',
    icon: 'shield',
  },
  {
    envKey: 'VITE_DASHBOARD_URL',
    fallbackHref: 'http://103.247.10.115:8001',
    title: 'Dashboard',
    label: 'Realtime Monitoring',
    description: 'Pantau KPI, antrian unit, dan kondisi operasional realtime dengan tampilan ringkas.',
    actionLabel: 'Buka Dashboard',
    icon: 'chart',
  },
  {
    envKey: 'VITE_APK_URL',
    fallbackHref: 'https://expo.dev/accounts/alialmansyur/projects/tapg-mobile/builds/79db443b-029f-49c4-a927-e9984bf0f391',
    title: 'Mobile APK',
    label: 'Field Distribution',
    description: 'Distribusi APK terbaru untuk tim lapangan dan kebutuhan maintenance mobile.',
    actionLabel: 'Buka Build',
    icon: 'download',
  },
]
