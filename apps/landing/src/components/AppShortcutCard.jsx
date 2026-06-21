const iconMap = {
  shield: (
    <path
      d="M12 3l7 3v6c0 4.4-2.9 8.4-7 9-4.1-.6-7-4.6-7-9V6l7-3zm0 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm0-3.5L8 6.7v4.7c0 3 1.8 5.7 4 6.5 2.2-.8 4-3.5 4-6.5V6.7L12 5z"
      fill="currentColor"
    />
  ),
  chart: (
    <path
      d="M5 19h14v2H3V5h2v14zm3-2V9h3v8H8zm5 0V5h3v12h-3zm5 0v-6h3v6h-3z"
      fill="currentColor"
    />
  ),
  download: (
    <path
      d="M11 3h2v9.17l2.59-2.58L17 11l-5 5-5-5 1.41-1.41L11 12.17V3zm-6 14h14v4H5v-4z"
      fill="currentColor"
    />
  ),
}

export function AppShortcutCard({ item, index = 0 }) {
  const isExternal = item.href.startsWith('http')

  return (
    <a
      href={item.href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer' : undefined}
      download={item.download}
      className="group flex h-36 w-36 flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-white/40 bg-white/40 p-4 shadow-lg shadow-emerald-900/5 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-emerald-400/60 hover:bg-white/60 hover:shadow-2xl hover:shadow-emerald-600/20 dark:border-white/10 dark:bg-black/20 dark:shadow-black/50 dark:hover:border-emerald-500/40 dark:hover:bg-black/40 dark:hover:shadow-emerald-500/20 animate-fade-in-up"
      style={{ animationDelay: `${400 + index * 150}ms` }}
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-700 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-md dark:text-emerald-300 dark:group-hover:text-white">
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
          {iconMap[item.icon]}
        </svg>
      </span>
      <span className="text-center font-display text-sm font-bold text-[var(--text-main)]">{item.title}</span>
    </a>
  )
}
