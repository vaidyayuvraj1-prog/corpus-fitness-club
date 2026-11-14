import React from 'react'
import { Dumbbell } from 'lucide-react'
import { Button } from './Button'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-[#E50914] mb-4">
        {icon || <Dumbbell className="w-7 h-7" />}
      </div>
      <h4 className="text-sm font-bold text-[#111111] mb-1.5">{title}</h4>
      {description && <p className="text-xs text-gray-500 max-w-sm mb-5">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
