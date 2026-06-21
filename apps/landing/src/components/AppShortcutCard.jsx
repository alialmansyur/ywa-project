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

export function AppShortcutCard({ item }) {
  const isExternal = item.href.startsWith('http')

  return (
    <a href={item.href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noreferrer' : undefined} className="access-tile group">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-[1.6rem] bg-brand-500/10 text-brand-700 transition duration-300 group-hover:scale-105 dark:bg-brand-400/12 dark:text-brand-300">
        <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
          {iconMap[item.icon]}
        </svg>
      </span>

      <div className="mt-6">
        <p className="m-0 text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-faint)]">{item.label}</p>
        <h3 className="mt-3 font-display text-[1.7rem] font-bold tracking-tight text-[var(--text-main)]">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{item.description}</p>
      </div>

      <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-soft)] transition group-hover:gap-3 group-hover:text-[var(--text-main)]">
        {item.actionLabel}
        <span aria-hidden="true">&rarr;</span>
      </span>
    </a>
  )
}
