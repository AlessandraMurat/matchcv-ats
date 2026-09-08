import { cn } from '@/lib/utils'
import { matchLabel } from '@/services/calculateMatch'

interface MatchScoreProps {
  score: number
  size?: 'sm' | 'lg'
  label?: string
}

export function MatchScore({ score, size = 'lg', label }: MatchScoreProps) {
  const radius = size === 'lg' ? 54 : 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const box = size === 'lg' ? 140 : 80
  const center = box / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: box, height: box }}>
        <svg viewBox={`0 0 ${box} ${box}`} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth={size === 'lg' ? 10 : 6}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className="stroke-primary"
            strokeWidth={size === 'lg' ? 10 : 6}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-semibold', size === 'lg' ? 'text-3xl' : 'text-lg')}>
            {score}%
          </span>
        </div>
      </div>
      <p className="text-sm font-medium">{label ?? matchLabel(score)}</p>
    </div>
  )
}
