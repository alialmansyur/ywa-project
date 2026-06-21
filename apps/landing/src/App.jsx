import { useEffect, useState } from 'react'
import { HeroSection } from './components/HeroSection'
import { AppShortcutCard } from './components/AppShortcutCard'
import { FooterInfo } from './components/FooterInfo'
import { Navbar } from './components/Navbar'
import { shortcuts } from './data/shortcuts'

const STORAGE_KEY = 'ywa-landing-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'

  const storedTheme = window.localStorage.getItem(STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function App() {
  const [theme, setTheme] = useState(getInitialTheme)
  const appTitle = 'YWA'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.title = appTitle
  }, [appTitle])

  const shortcutItems = shortcuts.map((item) => ({
    ...item,
    href: import.meta.env[item.envKey] || item.fallbackHref,
  }))

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--page-bg)] text-[var(--text-main)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(13,148,136,0.18),_transparent_26%),radial-gradient(circle_at_20%_24%,_rgba(14,165,233,0.1),_transparent_20%),linear-gradient(180deg,_transparent,_rgba(15,23,42,0.06))]" />
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

        <section id="access" className="mx-auto flex w-full max-w-6xl items-center py-16 sm:py-20">
          <div className="w-full">
            <div className="mx-auto max-w-3xl text-center">
              <span className="section-eyebrow">Quick Access</span>
              <h2 className="mt-5 font-display text-4xl font-bold tracking-tight text-[var(--text-main)] sm:text-5xl">
                Tiga pintu utama, satu halaman yang rapi.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--text-muted)] sm:text-lg">
                Akses admin, monitoring, dan distribusi mobile tanpa elemen yang tidak perlu.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shortcutItems.map((item) => (
                <AppShortcutCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </section>

        <FooterInfo adminUrl={shortcutItems[0].href} dashboardUrl={shortcutItems[1].href} apkUrl={shortcutItems[2].href} />
      </main>
    </div>
  )
}
