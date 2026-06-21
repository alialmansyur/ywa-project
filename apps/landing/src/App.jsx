import { useEffect, useState } from 'react'
import { HeroSection } from './components/HeroSection'
import { AppShortcutCard } from './components/AppShortcutCard'
import { FooterInfo } from './components/FooterInfo'
import { Navbar } from './components/Navbar'
import { shortcuts } from './data/shortcuts'

const STORAGE_KEY = 'ywa-landing-theme'

function resolveShortcutHref(item) {
  const envValue = import.meta.env[item.envKey]

  if (item.download) {
    const basePath = envValue || item.fallbackHref
    const normalizedBasePath = `${basePath}`.replace(/\/+$/, '')
    return normalizedBasePath.endsWith(`/${item.download}`)
      ? normalizedBasePath
      : `${normalizedBasePath}/${item.download}`.replace(/([^:]\/)\/+/g, '$1')
  }

  return envValue || item.fallbackHref
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'

  const storedTheme = window.localStorage.getItem(STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function App() {
  const [theme, setTheme] = useState(getInitialTheme)
  const appTitle = 'YWA Landing Page'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.title = appTitle
  }, [appTitle])

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const shortcutItems = shortcuts.map((item) => ({
    ...item,
    href: resolveShortcutHref(item),
  }))

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--page-bg)] text-[var(--text-main)]">
      {/* Animated Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-4 -left-4 h-96 w-96 rounded-full bg-brand-500/10 mix-blend-multiply blur-3xl filter dark:bg-brand-500/10 dark:mix-blend-screen" />
        <div className="animate-blob animation-delay-2000 absolute top-0 -right-4 h-96 w-96 rounded-full bg-emerald-400/10 mix-blend-multiply blur-3xl filter dark:bg-emerald-700/10 dark:mix-blend-screen" />
        <div className="animate-blob animation-delay-4000 absolute -bottom-8 left-40 h-96 w-96 rounded-full bg-brand-400/10 mix-blend-multiply blur-3xl filter dark:bg-brand-800/10 dark:mix-blend-screen" />
      </div>
      
      {/* Animated Arc & Rounded Square Lines with Parallax */}
      <div 
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-30 transition-transform duration-700 ease-out dark:opacity-20"
        style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
      >
        <svg className="animate-spin-slow absolute h-[150vh] w-[150vw]" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
           <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.1" fill="none" className="text-brand-500/30" strokeDasharray="10 5" />
           <rect x="15" y="15" width="70" height="70" rx="12" stroke="currentColor" strokeWidth="0.1" fill="none" className="text-emerald-500/20" strokeDasharray="15 10" transform="rotate(45 50 50)" />
           <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.1" fill="none" className="text-sky-500/30" strokeDasharray="20 10" />
           <rect x="25" y="25" width="50" height="50" rx="8" stroke="currentColor" strokeWidth="0.15" fill="none" className="text-brand-400/20" strokeDasharray="30 15" transform="rotate(15 50 50)" />
           <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.2" fill="none" className="text-emerald-500/30" strokeDasharray="50 20" />
        </svg>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[linear-gradient(180deg,_rgba(255,255,255,0.7),_transparent)] dark:bg-[linear-gradient(180deg,_rgba(2,6,23,0.24),_transparent)]" />

      <Navbar
        appTitle={appTitle}
        theme={theme}
        onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        adminUrl={shortcutItems[0].href}
        dashboardUrl={shortcutItems[1].href}
      />

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-10 pt-24 sm:px-8 sm:pt-28 lg:px-10">
        <HeroSection appTitle={appTitle} />

        <section id="access" className="mx-auto flex min-h-[100svh] w-full max-w-6xl items-center py-16 sm:py-20">
          <div className="w-full">
            <div className="mx-auto max-w-3xl text-center">
              <span className="section-eyebrow">Quick Access</span>
              <h2 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-[var(--text-main)] sm:text-5xl">
                Tiga pintu utama,<br />
                satu halaman yang rapi.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--text-muted)] sm:text-lg">
                Akses admin, monitoring, dan distribusi mobile tanpa elemen yang tidak perlu.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              {shortcutItems.map((item, index) => (
                <AppShortcutCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </div>
        </section>

        <FooterInfo adminUrl={shortcutItems[0].href} dashboardUrl={shortcutItems[1].href} apkUrl={shortcutItems[2].href} />
      </main>
    </div>
  )
}
