import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/helpers'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:border-gray-600 dark:border-gray-600 bg-white dark:bg-gray-900 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-100',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-gray-400 dark:placeholder:text-gray-500 dark:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:bg-gray-950 dark:disabled:bg-gray-800',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
export type { InputProps }