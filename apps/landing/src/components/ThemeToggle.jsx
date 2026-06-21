export function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-white/75 px-3 py-2 text-sm font-medium text-[var(--text-main)] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
      aria-label="Toggle color theme"
    >
      <span className={`h-2.5 w-2.5 rounded-full ${theme === 'dark' ? 'bg-sky-400' : 'bg-amber-400'}`} />
      <span className="hidden sm:inline">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
    </button>
  )
}
