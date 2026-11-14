import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { AlertTriangle } from 'lucide-react'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: 'danger' | 'primary'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center p-2">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            variant === 'danger'
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-red-50 text-[#E50914] border border-red-200'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-[#111111] mb-2">{title}</h3>
        <p className="text-xs text-gray-500 mb-6">{description}</p>

        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
