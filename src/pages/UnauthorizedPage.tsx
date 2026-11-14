import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-100 text-[#E50914] flex items-center justify-center mb-6">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="font-display text-3xl tracking-wider text-[#111111] mb-2 uppercase">Access Restricted</h1>
      <p className="text-sm text-gray-600 max-w-md mb-8">
        You do not have the necessary security permissions to view this section of the Corpus Fitness Club ERP.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-[#E50914] text-white font-bold text-sm px-6 py-3 rounded-lg hover:bg-[#B91C1C] transition-all shadow-md"
      >
        <ArrowLeft className="h-4 w-4" /> Return to Home
      </Link>
    </div>
  )
}
