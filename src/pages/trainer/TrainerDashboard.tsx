import { motion } from 'framer-motion';
import {
  Users, Dumbbell, Apple, Calendar, CheckCircle2,
  Clock, ArrowUpRight, Sparkles, Award, ChevronRight, UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getMembers, getWorkoutPlans, getDietPlans } from '@/lib/db';
import type { Member } from '@/types/database';

export default function TrainerDashboard() {
  const { profile } = useAuth();
  const trainerName = profile?.full_name || 'Coach Rohit Deshmukh';

  const allMembers = getMembers();
  const workouts = getWorkoutPlans();
  const diets = getDietPlans();

  // Trainer's specific Personal Clients
  const myPTClients = allMembers.filter(
    (m: Member) =>
      m.trainer_name === trainerName ||
      m.trainer_id === profile?.id ||
      (m.pt_status === 'active_pt' && (!m.trainer_name || m.trainer_name === trainerName))
  );

  const todaySessions = [
    { time: '06:30 AM', member: 'Rahul Sharma', focus: 'Chest & Triceps Bench Form Check', status: 'Completed' },
    { time: '08:00 AM', member: 'Priya Deshmukh', focus: 'Core Stability & Hip Mobility', status: 'In Progress' },
    { time: '05:30 PM', member: 'Amit Kolte', focus: 'Deadlift Technique & Bar Path Check', status: 'Upcoming' },
    { time: '07:00 PM', member: 'Snehal Patil', focus: 'Barbell Squat Depth & Knee Tracking', status: 'Upcoming' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm"
      >
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E50914] bg-red-50 border border-red-200 px-3 py-1 rounded-full inline-block mb-3">
            Coach Desk · Personal Training Roster
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111]">
            Welcome back, <span className="text-[#E50914]">{trainerName}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            You currently have <strong>{myPTClients.length} enrolled Personal Training (PT) clients</strong>. Manage dedicated workouts, diet charts, and floor coaching batches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/trainer/members"
            className="px-4 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#B91C1C] text-white font-bold text-xs uppercase tracking-wide transition-colors flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Manage / Choose PT Clients
          </Link>
          <Link
            to="/trainer/workout-plans"
            className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-800 hover:border-[#E50914] hover:text-[#E50914] font-bold text-xs uppercase tracking-wide transition-colors flex items-center gap-2 shadow-sm"
          >
            <Dumbbell className="w-4 h-4" /> Workout Plans
          </Link>
        </div>
      </motion.div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              My Personal PT Clients
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-[#E50914] mt-2">{myPTClients.length}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Dedicated 1-on-1 trainees</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Gym Members
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-[#111111] mt-2">{allMembers.length}</div>
          <span className="text-[11px] text-gray-500 font-semibold mt-1 block">
            General floor pool
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Today's PT Sessions
            </span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-[#111111] mt-2">4</div>
          <span className="text-[11px] text-emerald-700 mt-1 block font-semibold">
            Morning (2) & Evening (2)
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Prescribed Routines
            </span>
            <Dumbbell className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-[#111111] mt-2">{workouts.length}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Custom workout charts</span>
        </motion.div>
      </div>

      {/* Grid: Schedule and Trainees */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E50914]" /> Today's 1-on-1 PT Slots
            </h3>
            <Link to="/trainer/schedule" className="text-xs text-[#E50914] font-semibold hover:underline">
              Shift Roster
            </Link>
          </div>

          <div className="space-y-3">
            {todaySessions.map((session, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#E50914] font-mono">{session.time}</span>
                    <span className="text-xs font-bold text-[#111111]">{session.member}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1">{session.focus}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    session.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : session.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* My Personal Trainees List */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> My Personal Training Clients
              </h3>
              <p className="text-[11px] text-gray-500">
                Members you have personally chosen and enrolled under your 1-on-1 supervision.
              </p>
            </div>
            <Link to="/trainer/members" className="text-xs text-[#E50914] font-semibold hover:underline flex items-center gap-1">
              Manage / Add PT Clients <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">PT Program</th>
                  <th className="px-4 py-3">Goal</th>
                  <th className="px-4 py-3">Custom Routine</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myPTClients.map((m: Member) => (
                  <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#111111]">
                      {m.profile?.full_name || 'Member'}
                      <span className="block text-[11px] font-mono text-[#E50914]">{m.member_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {m.pt_package || '1-on-1 PT'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.fitness_goal || 'Strength & Conditioning'}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      Classic 5-Day Hypertrophy
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/trainer/workout-plans"
                        className="inline-flex items-center gap-1 text-xs text-[#E50914] font-semibold hover:underline"
                      >
                        Prescribe Routine <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}

                {myPTClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No personal training clients enrolled yet.{' '}
                      <Link to="/trainer/members" className="text-[#E50914] font-bold hover:underline">
                        Choose clients from the gym floor pool →
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
