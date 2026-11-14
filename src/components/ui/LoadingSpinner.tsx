import React from 'react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeMap[size]} border-gray-200 border-t-[#E50914] rounded-full animate-spin`}
      />
      {text && <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
