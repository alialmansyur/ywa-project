export function HeroSection({ appTitle }) {
  return (
    <section id="hero" className="relative mx-auto flex min-h-[82svh] w-full max-w-6xl items-center justify-center py-20 text-center sm:py-24">
      <div className="relative w-full max-w-4xl">
        <div className="relative z-10">
          <div className="mb-8 flex items-center justify-center gap-4 sm:gap-6">
            <img src="/logo-tap.png" alt="Logo TAP" className="h-8 w-auto object-contain sm:h-10 dark:hidden" />
            <img src="/logo-tap-dark.png" alt="Logo TAP" className="hidden h-8 w-auto object-contain sm:h-10 dark:block" />
            <div className="h-8 w-px bg-[var(--line-soft)] sm:h-10" />
            <img src="/logo-ywa.png" alt="Logo YWA" className="h-8 w-auto object-contain sm:h-10" />
          </div>

          <span className="section-eyebrow animate-fade-in-up">YWA Maintenance Portal</span>
          <div className="animate-fade-in-up" style={{animationDelay: '100ms'}}>
            <h1 className="mx-auto mt-7 max-w-4xl pb-4 font-display text-5xl font-bold leading-normal tracking-[-0.05em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-600 dark:from-emerald-400 dark:via-emerald-200 dark:to-white animate-text-gradient sm:text-6xl lg:text-7xl">
              Sistem Digitalisasi Workshop
            </h1>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--text-muted)] sm:text-lg animate-fade-in-up" style={{animationDelay: '200ms'}}>
            Portal terpusat untuk mempermudah operasional workshop Anda. Akses sistem administrasi, monitor kinerja, dan unduh rilis aplikasi terbaru dalam satu tempat.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-in-up" style={{animationDelay: '300ms'}}>
            <a href="#access" className="primary-action group relative overflow-hidden">
              Lihat Akses Utama
              <div className="absolute inset-0 -z-10 bg-brand-500 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-40"></div>
            </a>
            <a href="#footer" className="secondary-action">
              Informasi Portal
            </a>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-60 transition-opacity hover:opacity-100 hidden sm:block">
        <a href="#access" aria-label="Scroll down">
          <svg className="h-6 w-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </div>
    </section>
  )
}
