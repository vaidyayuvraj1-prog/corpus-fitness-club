import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export interface StatCardProps {
  label: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color?: string
  loading?: boolean
  subtext?: string
}

export function StatCard({
  label,
  value,
  change,
  icon,
  color = 'bg-red-50 text-[#E50914]',
  loading = false,
  subtext,
}: StatCardProps) {
  if (loading) {
    return <div className="h-32 bg-gray-100 border border-gray-200 rounded-xl animate-pulse" />
  }

  const isPositive = (change ?? 0) >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white border border-[#E5E7EB] hover:border-red-300 rounded-xl p-5 transition-all duration-300 shadow-sm relative overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider font-bold text-gray-500">{label}</span>
        <div className={`p-2.5 rounded-lg shrink-0 ${color}`}>{icon}</div>
      </div>

      <div className="text-3xl font-black text-[#111111] tracking-tight mb-1">{value}</div>

      {change !== undefined && (
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(change)}% vs last month</span>
        </div>
      )}

      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </motion.div>
  )
}

export default StatCard
