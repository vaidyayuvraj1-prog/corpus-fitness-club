import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  allowedRoles: string[]
  children: React.ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { isAuthenticated, role, loading, initialized } = useAuth()
  const location = useLocation()

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 text-sm font-medium">Verifying access...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Super admin has access to everything
  if (role === 'super_admin') {
    return <>{children}</>
  }

  // Receptionist has access to admin modules
  const normalizedAllowed = [...allowedRoles]
  if (allowedRoles.includes('admin')) {
    normalizedAllowed.push('super_admin', 'receptionist')
  }

  if (role && !normalizedAllowed.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
