import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/helpers'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-gray-900 dark:bg-gray-900',
      bordered: 'bg-white dark:bg-gray-900 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 dark:border-gray-700',
      elevated: 'bg-white dark:bg-gray-900 dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50',
    }

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl',
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card }
export type { CardProps }