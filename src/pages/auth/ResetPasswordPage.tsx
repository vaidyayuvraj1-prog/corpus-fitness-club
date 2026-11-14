import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dumbbell, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    setSubmitted(true)
    toast.success('Password reset link sent to your email!')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-xl bg-[#E50914] flex items-center justify-center text-white shadow-md">
            <Dumbbell className="h-7 w-7 transform -rotate-45" />
          </div>
          <span className="font-display text-3xl tracking-wider text-[#111111]">
            CORPUS <span className="text-[#E50914]">FITNESS</span>
          </span>
        </Link>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
        <h2 className="font-display text-2xl tracking-wider text-[#111111] mb-2 uppercase">Reset Password</h2>
        <p className="text-xs text-gray-500 mb-6">
          Enter your registered email address and we'll send you instructions to reset your password.
        </p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
            <h4 className="font-bold text-sm text-green-900">Check Your Inbox</h4>
            <p className="text-xs text-green-700">
              We have sent password recovery instructions to <strong>{email}</strong>.
            </p>
            <Link
              to="/auth/login"
              className="inline-block mt-4 text-xs font-bold text-[#E50914] hover:underline"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@corpuss.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#E50914] text-white font-bold text-sm py-3.5 rounded-lg hover:bg-[#B91C1C] transition-all shadow-md shadow-red-500/20"
            >
              Send Reset Link
            </button>

            <div className="text-center pt-2">
              <Link to="/auth/login" className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-[#E50914]">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
