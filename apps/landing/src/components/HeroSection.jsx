export function HeroSection({ appTitle }) {
  return (
    <section id="hero" className="mx-auto flex min-h-[82svh] w-full max-w-6xl items-center justify-center py-20 text-center sm:py-24">
      <div className="relative w-full max-w-4xl">
        <div className="pointer-events-none absolute left-1/2 top-10 h-44 w-44 -translate-x-[140%] rounded-full bg-[var(--accent-soft)] blur-3xl" />
        <div className="pointer-events-none absolute right-1/2 top-0 h-48 w-48 translate-x-[145%] rounded-full bg-[var(--accent-sky)] blur-3xl" />

        <div className="relative z-10">
          <div className="mb-8 flex items-center justify-center gap-4 sm:gap-6">
            <img src="/logo-tap.png" alt="Logo TAP" className="h-8 w-auto object-contain sm:h-10" />
            <div className="h-8 w-px bg-[var(--line-soft)] sm:h-10" />
            <img src="/logo-ywa.png" alt="Logo YWA" className="h-8 w-auto object-contain sm:h-10" />
          </div>

          <span className="section-eyebrow">{appTitle} Maintenance Portal</span>
          <h1 className="mx-auto mt-7 max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-[-0.05em] text-[var(--text-main)] sm:text-6xl lg:text-7xl">
            Landing page internal yang ringkas, modern, dan langsung ke inti.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--text-muted)] sm:text-lg">
            Satu pintu untuk operasional admin, dashboard monitoring, dan distribusi aplikasi mobile.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#access" className="primary-action">
              Lihat Akses Utama
            </a>
            <a href="#footer" className="secondary-action">
              Informasi Portal
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
