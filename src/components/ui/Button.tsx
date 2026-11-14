import React from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold tracking-wide rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-sm'

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-xs px-4 py-2 gap-2',
      lg: 'text-sm px-6 py-3 gap-2.5',
    }

    const variantStyles = {
      primary:
        'bg-[#E50914] text-white hover:bg-[#B91C1C] focus:ring-[#E50914]',
      secondary:
        'bg-[#111111] text-white hover:bg-black focus:ring-black',
      outline:
        'border border-[#E50914] text-[#E50914] bg-white hover:bg-red-50 focus:ring-[#E50914]',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost:
        'bg-transparent text-gray-700 hover:text-black hover:bg-gray-100 shadow-none focus:ring-gray-300',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {rightIcon && !isLoading && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
