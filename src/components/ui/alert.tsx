import * as React from 'react'
import { cn } from 'cn'

function Alert({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="status"
      className={cn(
        'rounded-xl border-2 border-border bg-card px-4 py-3 text-base text-card-foreground',
        className,
      )}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('font-medium', className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('text-foreground', className)} {...props} />
  )
}

export { Alert, AlertTitle, AlertDescription }
