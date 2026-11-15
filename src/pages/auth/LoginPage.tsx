import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Dumbbell, Loader2, Mail, Lock, ShieldCheck, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types/database'

const loginSchema = z.object({
  email: z.string().min(1, 'Please enter your @corpuss.com email or Member ID'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, role } = useAuth()

  const from = (location.state as any)?.from?.pathname || null

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const getRoleRedirect = (userRole: string | null) => {
    switch (userRole) {
      case 'super_admin':
      case 'admin':
      case 'receptionist':
        return '/admin'
      case 'trainer':
        return '/trainer'
      case 'member':
        return '/member'
      default:
        return '/admin'
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    const { error } = await login(data.email, data.password)
    if (error) {
      toast.error(error)
      return
    }

    toast.success('Login successful!')
    const targetPath = from || getRoleRedirect(useAuthStore.getState().role)
    navigate(targetPath, { replace: true })
  }

  React.useEffect(() => {
    if (isAuthenticated && role) {
      navigate(getRoleRedirect(role), { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-xl bg-[#E50914] flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
            <Dumbbell className="h-7 w-7 transform -rotate-45" />
          </div>
          <span className="font-display text-3xl tracking-wider text-[#111111]">
            CORPUS <span className="text-[#E50914]">FITNESS</span>
          </span>
        </Link>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">
          Amravati Gym ERP & Member Portal
        </p>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
        {/* Title */}
        <div className="mb-5 text-center">
          <h2 className="text-xl font-black text-[#111111] uppercase tracking-wide">
            Portal Sign In
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Access your Member Pass, Workouts, or Gym Management Desk.
          </p>
        </div>

        {/* Admin Managed Registration Notice */}
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-left">
          <ShieldCheck className="h-5 w-5 text-[#E50914] shrink-0 mt-0.5" />
          <div className="text-[11px] text-red-950 leading-relaxed">
            <strong className="text-[#E50914] block mb-0.5 uppercase tracking-wide">
              Official Gym Credentials
            </strong>
            Enter your official <strong>@corpuss.com</strong> email and default password (<strong>2026@cfc</strong>) or Member ID (e.g. <strong>CFC-2026-0001</strong>). Admin login: <strong>admin@corpuss.com</strong>.
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Official @corpuss.com Email or Member ID
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                {...register('email')}
                type="text"
                placeholder="e.g. rahul.sharma@corpuss.com or CFC-2026-0001"
                className="input-field pl-10"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                Admin-Assigned Password
              </label>
              <Link to="/contact" className="text-[11px] text-[#E50914] hover:underline font-semibold flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> Need Help?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="input-field pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#E50914] text-white font-bold text-sm py-3.5 rounded-lg hover:bg-[#B91C1C] transition-all shadow-md shadow-red-500/20 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying Credentials...
              </span>
            ) : (
              'Sign In to Portal'
            )}
          </button>
        </form>

        {/* Prompt for Non-Members */}
        <div className="mt-5 text-center pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Want to join Corpus Fitness Club?{' '}
            <Link to="/contact" className="text-[#E50914] font-bold hover:underline">
              Submit Admission Enquiry →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
