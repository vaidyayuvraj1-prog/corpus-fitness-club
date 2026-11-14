import React from 'react'

export interface BadgeProps {
  variant?: 'active' | 'expired' | 'pending' | 'success' | 'warning' | 'danger' | 'info' | 'neon' | 'neutral' | 'brand'
  children: React.ReactNode
  className?: string
  dot?: boolean
}

export function Badge({ variant = 'neutral', children, className = '', dot = false }: BadgeProps) {
  const variantStyles = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    expired: 'bg-red-50 text-red-700 border-red-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neon: 'bg-red-50 text-[#E50914] border-red-200',
    brand: 'bg-red-50 text-[#E50914] border-red-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const dotColors = {
    active: 'bg-emerald-500',
    success: 'bg-emerald-500',
    expired: 'bg-red-500',
    danger: 'bg-red-500',
    pending: 'bg-amber-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    neon: 'bg-[#E50914]',
    brand: 'bg-[#E50914]',
    neutral: 'bg-gray-500',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  )
}

export default Badge
