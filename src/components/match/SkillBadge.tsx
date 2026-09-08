import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SkillBadgeProps {
  label: string
  tone?: 'positive' | 'partial' | 'missing' | 'neutral'
}

export function SkillBadge({ label, tone = 'neutral' }: SkillBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        tone === 'positive' && 'border-primary bg-primary/20 text-foreground shadow-[0_0_12px_-4px_var(--primary)]',
        tone === 'partial' && 'border-border bg-secondary',
        tone === 'missing' && 'border-destructive text-foreground',
      )}
    >
      {label}
    </Badge>
  )
}
