import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { NAV_ITEMS } from '../types/navigation'
import { clearAuthSession, getAuthSession, mapMeResponse } from '../services/auth'
import { apiRequest, ApiError } from '../services/api'

function toRoleLabel(input) {
  const raw = String(input || '').trim()
  if (!raw) return 'User'
  return raw
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function initialsOf(name) {
  const raw = String(name || '').trim()
  if (!raw) return 'U'
  const words = raw.split(/\s+/).filter(Boolean)
  const first = words[0]?.[0] || ''
  const second = words.length > 1 ? words[1]?.[0] || '' : words[0]?.[1] || ''
  return `${first}${second}`.toUpperCase() || 'U'
}

export function Sidebar({ collapsed, isMobile = false, mobileOpen = false, onCloseMobile = null }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [openGroups, setOpenGroups] = useState({})
  const [menuItems, setMenuItems] = useState(NAV_ITEMS)
  const [logoError, setLogoError] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => {
    const session = getAuthSession()
    const user = mapMeResponse(session?.user || {})
    const roleRaw = user?.roles?.[0] || ''
    return {
      name: user?.name || 'User',
      role: toRoleLabel(roleRaw),
      avatar: initialsOf(user?.name),
    }
  })

  const iconMap = useMemo(() => {
    const map = {}
    for (const item of NAV_ITEMS) {
      map[item.id] = item.icon
      map[item.href] = item.icon
      if (item.children) {
        for (const child of item.children) {
          map[child.id] = item.icon
          map[child.href] = item.icon
        }
      }
    }
    return map
  }, [])

  useEffect(() => {
    let active = true
    const loadMenus = async () => {
      try {
        const response = await apiRequest('/settings/menu-access?category=admin')
        if (!active) return
        const apiMenus = (response.data || []).map((menu) => ({
          id: menu.menu_key,
          label: menu.label,
          href: menu.route || '#',
          icon: iconMap[menu.route] || iconMap[menu.menu_key] || iconMap.settings,
          children: (menu.children || []).map((child) => ({
            id: child.menu_key,
            label: child.label,
            href: child.route || '#',
          })),
        }))
        if (apiMenus.length > 0) setMenuItems(apiMenus)
      } catch (error) {
        if (error instanceof ApiError && error.status === 403) {
          setMenuItems([])
        }
      }
    }
    loadMenus()
    return () => { active = false }
  }, [iconMap])

  useEffect(() => {
    let active = true
    const loadCurrentUser = async () => {
      try {
        const me = mapMeResponse(await apiRequest('/auth/me'))
        if (!active) return
        const roleRaw = me?.roles?.[0] || ''
        setCurrentUser({
          name: me?.name || 'User',
          role: toRoleLabel(roleRaw),
          avatar: initialsOf(me?.name),
        })
      } catch {
        // Keep fallback from session cache
      }
    }
    loadCurrentUser()
    return () => { active = false }
  }, [])

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } catch {
      // Ignore API logout error and force local logout.
    } finally {
      clearAuthSession()
      navigate('/login', { replace: true })
    }
  }

  return (
    <aside
      id="sidebar"
      className={`admin-sidebar bg-slate-800/80 border-r border-slate-700/50 flex flex-col flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} ${isMobile ? `fixed inset-y-0 left-0 z-50 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}` : 'relative translate-x-0'}`}
    >
      <div className={`h-[72px] border-b border-slate-700/50 flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {!logoError ? (
              <img
                src="/logo-app.png"
                alt="Logo YWA"
                className="w-8 h-8 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs font-bold">
                Y
              </div>
            )}
          </div>
          {!collapsed && <div><div className="font-bold text-sm">Workshop</div><div className="text-xs text-slate-400">Admin Panel</div></div>}
        </div>
      </div>

      <nav className={`flex-1 overflow-y-auto custom-scroll ${collapsed ? 'px-2 py-3 space-y-2' : 'p-3 space-y-1'}`}>
        {!collapsed && <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">Menu Utama</div>}
        {menuItems.map((item) => {
          const hasChildren = Array.isArray(item.children) && item.children.length > 0
          const childActive = hasChildren && item.children.some((child) => location.pathname.startsWith(child.href))
          const groupOpen = openGroups[item.id] ?? childActive

          if (!hasChildren) {
            return (
              <NavLink
                key={item.id}
                to={item.href}
                onClick={() => {
                  if (isMobile && typeof onCloseMobile === 'function') onCloseMobile()
                }}
                className={({ isActive }) => `text-sm font-semibold transition-all duration-200 ${collapsed ? 'w-10 h-10 aspect-square mx-auto flex items-center justify-center rounded-xl' : 'flex items-center gap-3 px-3 py-2.5 rounded-xl'} ${isActive ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}
              >
                {({ isActive }) => (
                  <>
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={item.icon} />
                    </svg>
                    {!collapsed && <span>{item.label}</span>}
                    {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                  </>
                )}
              </NavLink>
            )
          }

          return (
            <div key={item.id} className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  if (collapsed) {
                    navigate(item.href)
                    return
                  }
                  setOpenGroups((prev) => ({ ...prev, [item.id]: !groupOpen }))
                }}
                className={`w-full text-sm font-semibold transition-all duration-200 ${collapsed ? 'w-10 h-10 aspect-square mx-auto flex items-center justify-center rounded-xl' : 'flex items-center gap-3 px-3 py-2.5 rounded-xl'} ${childActive ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={item.icon} />
                </svg>
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && <span className="ml-auto text-xs">{groupOpen ? '−' : '+'}</span>}
              </button>

              {!collapsed && groupOpen && (
                <div className="pl-4 space-y-1">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.id}
                      to={child.href}
                      onClick={() => {
                        if (isMobile && typeof onCloseMobile === 'function') onCloseMobile()
                      }}
                      className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${isActive ? 'bg-blue-500/15 text-blue-300' : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{child.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className={`border-t border-slate-700/50 ${collapsed ? 'p-2' : 'p-3'}`}>
        <div className={`flex items-center rounded-xl hover:bg-slate-700/50 transition-all ${collapsed ? 'w-10 h-10 aspect-square justify-center mx-auto' : 'gap-3 p-2'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{currentUser.avatar}</div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{currentUser.name}</div>
                <div className="text-xs text-slate-400">{currentUser.role}</div>
              </div>
              <button type="button" onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          )}
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={handleLogout}
            className="w-10 h-10 aspect-square mx-auto mt-2 flex items-center justify-center rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-700/50 transition-colors"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  )
}
