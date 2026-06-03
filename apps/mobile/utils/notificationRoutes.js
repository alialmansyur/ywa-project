function normalizeRouteValue(value) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function buildRouteWithParams(route, params) {
  const normalizedRoute = normalizeRouteValue(route)
  if (!normalizedRoute) return ''

  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return normalizedRoute
  }

  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return
    search.set(key, String(value))
  })

  const query = search.toString()
  if (!query) return normalizedRoute
  return normalizedRoute.includes('?') ? `${normalizedRoute}&${query}` : `${normalizedRoute}?${query}`
}

const LEGACY_ROUTE_MAP = {
  '/mechanic': '/(tabs)/mechanic',
  '/report': '/(tabs)/report',
  '/work-orders': '/(tabs)/work-orders',
  '/workshop': '/(tabs)/workshop',
  '/workshop/detail': '/(tabs)/workshop/detail',
  '/findings': '/(tabs)/findings',
  '/guide': '/(tabs)/guide',
  '/schedule': '/(tabs)/schedule',
  '/preventive': '/(tabs)/preventive',
  '/assets': '/(tabs)/unit-assets',
  '/p2h': '/p2h',
  '/notifications': '/notifications',
}

export function resolveMobileNotificationRoute(data) {
  const structuredTarget = data?.target?.mobile
  const structuredRoute = buildRouteWithParams(structuredTarget?.route, structuredTarget?.params)
  if (structuredRoute) return structuredRoute

  const directRoute = normalizeRouteValue(data?.route)
  if (!directRoute) return ''

  const [pathname, search = ''] = directRoute.split('?')
  const normalizedPath = LEGACY_ROUTE_MAP[pathname] || pathname
  if (!normalizedPath) return ''

  return search ? `${normalizedPath}?${search}` : normalizedPath
}
