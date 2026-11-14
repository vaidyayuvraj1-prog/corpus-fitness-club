import { useState, useEffect } from 'react'
import { TrendingUp, Plus, Calendar, Scale, Activity, CheckCircle2 } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/db'
import type { FitnessProgress } from '@/types/database'
import { format } from 'date-fns'

export default function MemberProgress() {
  const { profile } = useAuth()
  const [progressLogs, setProgressLogs] = useState<FitnessProgress[]>([])
  const [showLogModal, setShowLogModal] = useState(false)

  const [form, setForm] = useState({
    weight_kg: 78,
    body_fat_pct: 15,
    chest_cm: 106,
    waist_cm: 82,
    biceps_cm: 38,
    notes: '',
  })

  useEffect(() => {
    loadProgress()
  }, [profile])

  function loadProgress() {
    const allMembers = db.getMembers()
    const matched =
      allMembers.find((m) => m.profile?.email === profile?.email || m.profile_id === profile?.id) ||
      allMembers[0]

    if (matched) {
      setProgressLogs(db.getProgress(matched.id))
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const allMembers = db.getMembers()
    const matched =
      allMembers.find((m) => m.profile?.email === profile?.email || m.profile_id === profile?.id) ||
      allMembers[0]

    if (!matched) return

    try {
      db.saveProgress({
        member_id: matched.id,
        weight_kg: Number(form.weight_kg),
        body_fat_pct: Number(form.body_fat_pct),
        chest_cm: Number(form.chest_cm),
        waist_cm: Number(form.waist_cm),
        biceps_cm: Number(form.biceps_cm),
        notes: form.notes,
      })
      toast.success('Body measurement log saved!')
      setShowLogModal(false)
      loadProgress()
    } catch {
      toast.error('Failed to log progress')
    }
  }

  const latest = progressLogs[progressLogs.length - 1]
  const earliest = progressLogs[0]
  const weightChange = latest && earliest ? +(latest.weight_kg - earliest.weight_kg).toFixed(1) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-[#111111] uppercase">
            FITNESS & BODY COMPOSITION PROGRESS
          </h2>
          <p className="text-xs text-gray-500">
            Track weight, body fat %, chest, waist, and bicep changes over time
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Log New Measurement
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Current Weight</span>
          <p className="text-3xl font-extrabold text-[#111111] mt-1">{latest?.weight_kg || 78} kg</p>
          <span className="text-[10px] text-gray-400">Baseline: {earliest?.weight_kg || 84.5} kg</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Net Weight Delta</span>
          <p className={`text-3xl font-extrabold mt-1 ${weightChange < 0 ? 'text-green-600' : 'text-blue-600'}`}>
            {weightChange} kg
          </p>
          <span className="text-[10px] text-green-600 font-bold">Consistent Progress</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Body Fat</span>
          <p className="text-3xl font-extrabold text-[#E50914] mt-1">{latest?.body_fat_pct || 15}%</p>
          <span className="text-[10px] text-gray-400">Target: 12-14%</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Biceps Size</span>
          <p className="text-3xl font-extrabold text-[#111111] mt-1">{latest?.biceps_cm || 38} cm</p>
          <span className="text-[10px] text-gray-400">Chest: {latest?.chest_cm || 106} cm</span>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm">
        <h3 className="font-bold text-base text-[#111111] mb-1">Body Weight Transformation Trend (kg)</h3>
        <p className="text-xs text-gray-400 mb-6">Recorded over training milestones at Corpus Fitness Club</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressLogs}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="recorded_date" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip formatter={(val: any) => [`${val} kg`, 'Weight']} />
              <Line type="monotone" dataKey="weight_kg" stroke="#E50914" strokeWidth={3} dot={{ r: 5, fill: '#E50914' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
            Measurement Log History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b text-gray-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Weight</th>
                <th className="py-2.5 px-4">Body Fat %</th>
                <th className="py-2.5 px-4">Chest</th>
                <th className="py-2.5 px-4">Waist</th>
                <th className="py-2.5 px-4">Biceps</th>
                <th className="py-2.5 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {progressLogs.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono font-bold">{p.recorded_date}</td>
                  <td className="py-3 px-4 font-bold text-[#E50914]">{p.weight_kg} kg</td>
                  <td className="py-3 px-4">{p.body_fat_pct ? `${p.body_fat_pct}%` : '—'}</td>
                  <td className="py-3 px-4">{p.chest_cm ? `${p.chest_cm} cm` : '—'}</td>
                  <td className="py-3 px-4">{p.waist_cm ? `${p.waist_cm} cm` : '—'}</td>
                  <td className="py-3 px-4">{p.biceps_cm ? `${p.biceps_cm} cm` : '—'}</td>
                  <td className="py-3 px-4 text-gray-500">{p.notes || 'Routine check'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="font-bold text-base text-gray-900 mb-4 uppercase">Log Body Measurements</h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Body Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={form.weight_kg}
                  onChange={(e) => setForm({ ...form, weight_kg: Number(e.target.value) })}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Body Fat %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.body_fat_pct}
                    onChange={(e) => setForm({ ...form, body_fat_pct: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Biceps (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.biceps_cm}
                    onChange={(e) => setForm({ ...form, biceps_cm: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.chest_cm}
                    onChange={(e) => setForm({ ...form, chest_cm: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.waist_cm}
                    onChange={(e) => setForm({ ...form, waist_cm: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Feeling lighter and energetic"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-[#E50914] text-white font-bold">
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
