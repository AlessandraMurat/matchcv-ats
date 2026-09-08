import { Link } from 'react-router-dom'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 text-inherit">
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground shadow-[0_0_18px_-2px_var(--primary)]">
        M
      </span>
      <span className={compact ? 'text-sm font-semibold' : 'text-base font-semibold tracking-tight'}>
        MatchCV
      </span>
    </Link>
  )
}
