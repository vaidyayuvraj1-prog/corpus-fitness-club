import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Dumbbell,
  Apple,
  Phone,
  Mail,
  Award,
  Target,
  UserPlus,
  UserMinus,
  Sparkles,
  CheckCircle2,
  Shield,
  X,
  Star,
  FileText,
  Activity,
  Clock,
  Calendar,
  ChevronRight,
  Eye,
  Check,
  TrendingUp,
  Flame,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { db } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';
import MemberMonthlyReport from '@/pages/member/MemberMonthlyReport';
import type { Member, WorkoutSession } from '@/types/database';

export default function TrainerMembers() {
  const { profile } = useAuth();
  const trainerName = profile?.full_name || 'Coach Rohit Deshmukh';

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'my_clients' | 'all_members'>('my_clients');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [ptPackage, setPtPackage] = useState('1-on-1 Personal Transformation');

  // Modals for workout history, trainer feedback, and certified monthly report
  const [workoutHistoryMember, setWorkoutHistoryMember] = useState<Member | null>(null);
  const [feedbackMember, setFeedbackMember] = useState<Member | null>(null);
  const [reportMember, setReportMember] = useState<Member | null>(null);

  // Feedback form state
  const [feedbackMonth, setFeedbackMonth] = useState<number>(11);
  const [feedbackYear, setFeedbackYear] = useState<number>(2026);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [focusAreas, setFocusAreas] = useState<string>('Squat Depth, Compound Overload, Post-Workout Nutrition');
  const [recommendations, setRecommendations] = useState<string>('Maintain 140g protein daily, ensure 8 hours recovery sleep, increase working weight by 2.5kg next cycle.');

  const [members, setMembers] = useState<Member[]>(db.getMembers());

  function reloadData() {
    setMembers(db.getMembers());
  }

  // Open feedback modal and prefill existing feedback if available
  const handleOpenFeedback = (member: Member) => {
    setFeedbackMember(member);
    const existingList = db.getTrainerFeedback(member.id, feedbackMonth, feedbackYear);
    const existing = existingList.length > 0 ? existingList[0] : null;
    if (existing) {
      setFeedbackRating(existing.rating);
      setFeedbackText(existing.feedback);
      setFocusAreas(existing.focus_areas.join(', '));
      setRecommendations(existing.recommendations);
    } else {
      setFeedbackRating(5);
      setFeedbackText(
        `Great dedication shown by ${member.profile?.full_name || 'trainee'} this month! Compound lifts are advancing steadily with commendable workout consistency.`
      );
      setFocusAreas('Squat Depth, Progressive Overload, Post-Workout Nutrition');
      setRecommendations(
        'Maintain 140g protein intake daily, aim for 8 hours recovery sleep, and increase working weight by 2.5kg in next microcycle.'
      );
    }
  };

  // Submit feedback
  const handleSaveFeedback = () => {
    if (!feedbackMember) return;
    try {
      db.saveTrainerFeedback({
        member_id: feedbackMember.id,
        trainer_id: profile?.id || 'tr-1',
        trainer_name: trainerName,
        month: feedbackMonth,
        year: feedbackYear,
        rating: feedbackRating,
        feedback: feedbackText,
        focus_areas: focusAreas.split(',').map((s) => s.trim()).filter(Boolean),
        recommendations,
      });
      toast.success(`Monthly feedback recorded for ${feedbackMember.profile?.full_name || 'Member'}!`);
      setFeedbackMember(null);
    } catch {
      toast.error('Failed to save monthly feedback');
    }
  };

  // Personal Clients belonging to this coach
  const myClients = members.filter(
    (m: Member) =>
      m.trainer_name === trainerName ||
      m.trainer_id === profile?.id ||
      (m.pt_status === 'active_pt' && (!m.trainer_name || m.trainer_name === trainerName))
  );

  // General Floor Members (not currently assigned to any personal trainer)
  const floorMembers = members.filter(
    (m: Member) => m.trainer_name !== trainerName && m.pt_status !== 'active_pt'
  );

  // Search filter
  const currentList = activeTab === 'my_clients' ? myClients : floorMembers;
  const filtered = currentList.filter(
    (m: Member) =>
      (m.profile?.full_name && m.profile.full_name.toLowerCase().includes(search.toLowerCase())) ||
      (m.member_id && m.member_id.toLowerCase().includes(search.toLowerCase())) ||
      (m.fitness_goal && m.fitness_goal.toLowerCase().includes(search.toLowerCase())) ||
      (m.profile?.phone && m.profile.phone.includes(search))
  );

  // Trainer enrolls/chooses a client
  const handleEnrollClient = (member: Member) => {
    try {
      db.assignPTClient(member.id, profile?.id || 'tr-1', trainerName, ptPackage);
      toast.success(`${member.profile?.full_name || 'Member'} enrolled as your Personal Client!`);
      setShowEnrollModal(false);
      setSelectedMember(null);
      reloadData();
    } catch {
      toast.error('Failed to enroll client');
    }
  };

  // Trainer releases a client when PT finishes
  const handleReleaseClient = (member: Member) => {
    try {
      db.assignPTClient(member.id, null, null);
      toast.success(`${member.profile?.full_name || 'Member'} released from your PT roster`);
      reloadData();
    } catch {
      toast.error('Failed to release client');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#111111] uppercase tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-[#E50914]" /> Personal Training (PT) Roster
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-[#E50914] border border-red-200">
              Coach: {trainerName}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            General gym training is for everyone, but Personal Training is 1-on-1. Choose and manage your dedicated personal clients below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-3.5 py-2 rounded-lg bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" /> + Choose / Enroll PT Client
          </button>
          <Link
            to="/trainer/workout-plans"
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:border-[#E50914] text-gray-700 hover:text-[#E50914] text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Dumbbell className="w-3.5 h-3.5" /> Workout Routines
          </Link>
          <Link
            to="/trainer/diet-plans"
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:border-[#E50914] text-gray-700 hover:text-[#E50914] text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Apple className="w-3.5 h-3.5" /> Diet Schedules
          </Link>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Toggle Tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('my_clients')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'my_clients'
                ? 'bg-white text-[#E50914] shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            My Personal PT Clients ({myClients.length})
          </button>

          <button
            onClick={() => setActiveTab('all_members')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'all_members'
                ? 'bg-white text-[#E50914] shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Gym Floor Pool ({floorMembers.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === 'my_clients'
                ? 'Search your personal clients...'
                : 'Search floor members to enroll...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#E50914] text-[#111111]"
          />
        </div>
      </div>

      {/* Trainees Cards / Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-gray-600 uppercase text-[11px] font-bold border-b border-[#E5E7EB]">
              <tr>
                <th className="px-5 py-3.5">Client / Member</th>
                <th className="px-5 py-3.5">Training Status</th>
                <th className="px-5 py-3.5">Fitness Goal</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Custom Programs</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((m: Member) => {
                const isMyClient = m.trainer_name === trainerName || m.pt_status === 'active_pt';

                return (
                  <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Member Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 text-[#E50914] font-bold text-xs flex items-center justify-center border border-red-200 shrink-0">
                          {m.photo_url ? (
                            <img src={m.photo_url} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            m.profile?.full_name ? m.profile.full_name.slice(0, 2).toUpperCase() : 'CFC'
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-[#111111] block">
                            {m.profile?.full_name || 'Member'}
                          </span>
                          <span className="text-[11px] font-mono text-[#E50914] font-semibold flex items-center gap-1">
                            <Award className="w-3 h-3" /> {m.member_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="px-5 py-4">
                      {isMyClient ? (
                        <div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" /> My Personal Client (PT)
                          </span>
                          <span className="block text-[10px] text-gray-500 mt-0.5">
                            {m.pt_package || '1-on-1 PT Program'}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                            General Floor Member
                          </span>
                          <span className="block text-[10px] text-gray-400 mt-0.5">
                            No Dedicated PT Assigned
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Fitness Goal */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                        <Target className="w-3.5 h-3.5 text-[#E50914]" />
                        <span>{m.fitness_goal || 'Strength & Conditioning'}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        Gender: {m.gender?.toUpperCase()} • {m.address}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4 text-gray-600">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-gray-400" /> {m.profile?.phone || m.emergency_phone || '+91 76206 83995'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                        <Mail className="w-3 h-3 text-gray-400" /> {m.profile?.email || 'member@corpusfitness.in'}
                      </div>
                    </td>

                    {/* Assigned Plans */}
                    <td className="px-5 py-4 text-gray-700 font-medium">
                      {isMyClient ? (
                        <>
                          <div className="text-[11px] font-bold text-gray-900">Push-Pull-Legs 5-Day</div>
                          <span className="text-[10px] text-emerald-700">Diet: 2400 kcal High Protein</span>
                        </>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">General gym routine</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {isMyClient ? (
                          <>
                            <button
                              onClick={() => setWorkoutHistoryMember(m)}
                              className="px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="View Logged Workout Sessions"
                            >
                              <Activity className="w-3.5 h-3.5 text-[#E50914]" /> Logs
                            </button>
                            <button
                              onClick={() => handleOpenFeedback(m)}
                              className="px-2.5 py-1 rounded-md bg-red-50 hover:bg-red-100 text-[#E50914] text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer border border-red-200"
                              title="Submit / Edit Monthly Trainer Review"
                            >
                              <Star className="w-3.5 h-3.5 fill-[#E50914]" /> Feedback
                            </button>
                            <button
                              onClick={() => setReportMember(m)}
                              className="px-2.5 py-1 rounded-md bg-[#111111] text-white hover:bg-black text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                              title="View & Print Certified Monthly Fitness Report"
                            >
                              <FileText className="w-3.5 h-3.5" /> Report
                            </button>
                            <Link
                              to="/trainer/workout-plans"
                              className="px-2 py-1 rounded-md border border-gray-200 hover:border-[#E50914] hover:text-[#E50914] text-xs font-semibold transition-colors"
                              title="Assign Workout"
                            >
                              Workout
                            </Link>
                            <button
                              onClick={() => handleReleaseClient(m)}
                              className="px-2 py-1 rounded-md border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs font-semibold transition-colors cursor-pointer"
                              title="Release from PT roster"
                            >
                              <UserMinus className="w-3.5 h-3.5 inline mr-1" /> Release
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedMember(m);
                              setShowEnrollModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#E50914] text-white hover:bg-[#B91C1C] text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" /> Choose as My Client
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    {activeTab === 'my_clients'
                      ? 'You have not enrolled any personal training clients yet. Click "Choose / Enroll PT Client" to select a member from the floor.'
                      : 'No floor members found matching your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ENROLL PT CLIENT MODAL ───────────────────────────────── */}
      <AnimatePresence>
        {showEnrollModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-[#E50914] flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#111111]">
                      Choose Personal Training Client
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Enroll a gym member under your 1-on-1 supervision
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEnrollModal(false);
                    setSelectedMember(null);
                  }}
                  className="text-gray-400 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Select Member dropdown if not preselected */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Select Gym Member *
                  </label>
                  <select
                    value={selectedMember?.id || ''}
                    onChange={(e) => {
                      const found = members.find((m) => m.id === e.target.value);
                      setSelectedMember(found || null);
                    }}
                    className="input-field"
                  >
                    <option value="">-- Choose Member from Gym Floor --</option>
                    {floorMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.profile?.full_name} ({m.member_id}) · {m.fitness_goal}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PT Program Package */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Personal Training Package *
                  </label>
                  <select
                    value={ptPackage}
                    onChange={(e) => setPtPackage(e.target.value)}
                    className="input-field"
                  >
                    <option value="1-on-1 Personal Transformation">1-on-1 Personal Transformation (Daily Spotting & Form)</option>
                    <option value="Fat Loss & Body Recomposition PT">Fat Loss & Body Recomposition PT</option>
                    <option value="Muscle Hypertrophy & Bulking PT">Muscle Hypertrophy & Bulking PT</option>
                    <option value="Strength & Powerlifting Protocol">Strength & Powerlifting Protocol</option>
                    <option value="PCOS / Mobility Special Care PT">PCOS / Mobility Special Care PT</option>
                  </select>
                </div>

                {selectedMember && (
                  <div className="p-3 bg-red-50/60 rounded-xl border border-red-200">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#E50914]" />
                      <span className="font-bold text-[#111111]">
                        Goal: {selectedMember.fitness_goal}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1">
                      Member Phone: {selectedMember.profile?.phone || selectedMember.emergency_phone}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEnrollModal(false);
                      setSelectedMember(null);
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedMember}
                    onClick={() => selectedMember && handleEnrollClient(selectedMember)}
                    className="px-5 py-2 rounded-lg bg-[#E50914] text-white font-bold hover:bg-[#B91C1C] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Confirm & Enroll as My Client
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── WORKOUT HISTORY & LOGS MODAL ────────────────────────── */}
        {workoutHistoryMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-[#E50914] flex items-center justify-center font-bold">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#111111]">
                      Workout Sessions & Progress Log
                    </h3>
                    <p className="text-xs text-gray-500">
                      Trainee: <strong className="text-gray-900">{workoutHistoryMember.profile?.full_name}</strong> ({workoutHistoryMember.member_id})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setWorkoutHistoryMember(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sessions List */}
              {(() => {
                const sessions = db.getWorkoutSessions(workoutHistoryMember.id)
                const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
                const totalVolume = sessions.reduce(
                  (sum, s) =>
                    sum +
                    s.completed_sets.reduce(
                      (v, set) => v + (set.completed ? (set.weight_kg || 0) * (set.reps || 0) : 0),
                      0
                    ),
                  0
                )

                return (
                  <div className="overflow-y-auto space-y-4 pr-1">
                    {/* Summary Badges */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Workouts</span>
                        <span className="text-xl font-black text-[#111111]">{sessions.length}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Duration</span>
                        <span className="text-xl font-black text-[#E50914]">{totalMinutes} <span className="text-xs font-normal">min</span></span>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Volume Lifted</span>
                        <span className="text-xl font-black text-[#111111]">{(totalVolume / 1000).toFixed(1)}k <span className="text-xs font-normal">kg</span></span>
                      </div>
                    </div>

                    {sessions.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-xs">
                        No workout sessions logged yet for this member. Workouts will appear here as the member tracks their daily routines.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sessions.map((s) => {
                          const sessionVolume = s.completed_sets.reduce(
                            (v, set) => v + (set.completed ? (set.weight_kg || 0) * (set.reps || 0) : 0),
                            0
                          )

                          // Group by exercise
                          const exerciseMap: { [name: string]: { sets: number; maxWeight: number; reps: number; muscle: string } } = {}
                          s.completed_sets.forEach((set) => {
                            if (!exerciseMap[set.exercise_name]) {
                              exerciseMap[set.exercise_name] = {
                                sets: 0,
                                maxWeight: 0,
                                reps: set.reps,
                                muscle: set.muscle_group,
                              }
                            }
                            exerciseMap[set.exercise_name].sets++
                            if (set.weight_kg > exerciseMap[set.exercise_name].maxWeight) {
                              exerciseMap[set.exercise_name].maxWeight = set.weight_kg
                            }
                          })
                          const exerciseItems = Object.entries(exerciseMap)

                          return (
                            <div key={s.id} className="p-4 rounded-xl border border-gray-200 bg-white hover:border-[#E50914]/40 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <span className="font-bold text-sm text-[#111111] block">{s.plan_name || 'Workout Session'}</span>
                                  <span className="text-[11px] text-gray-500 font-mono flex items-center gap-2">
                                    <span>📅 {s.date}</span>
                                    <span>⏱️ {s.duration_minutes} min</span>
                                    {sessionVolume > 0 && <span>🏋️ {sessionVolume} kg volume</span>}
                                  </span>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Completed
                                </span>
                              </div>

                              {s.notes && (
                                <p className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded mb-2 italic">
                                  "{s.notes}"
                                </p>
                              )}

                              {exerciseItems.length > 0 && (
                                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                  <span className="text-[10px] font-bold uppercase text-gray-400 block">
                                    Exercises Performed ({exerciseItems.length})
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {exerciseItems.map(([exName, info], i) => (
                                      <div key={i} className="p-2 rounded-lg bg-gray-50 text-[11px]">
                                        <span className="font-bold text-gray-900 block">{exName}</span>
                                        <span className="text-gray-500 font-mono">
                                          {info.sets} sets · {info.reps} reps
                                          {info.maxWeight > 0 ? ` · ${info.maxWeight} kg` : ''}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })()}

              <div className="pt-4 border-t border-gray-100 flex justify-end shrink-0 mt-4">
                <button
                  onClick={() => setWorkoutHistoryMember(null)}
                  className="px-4 py-2 rounded-lg bg-[#111111] text-white text-xs font-bold hover:bg-black cursor-pointer"
                >
                  Close Log
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TRAINER FEEDBACK MODAL ──────────────────────────────── */}
        {feedbackMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-[#E50914] flex items-center justify-center">
                    <Star className="w-4 h-4 fill-[#E50914]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#111111]">
                      Monthly Trainer Feedback & Review
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Trainee: <strong className="text-gray-900">{feedbackMember.profile?.full_name}</strong> ({feedbackMember.member_id})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFeedbackMember(null)}
                  className="text-gray-400 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Month and Year */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Audit Month</label>
                    <select
                      value={feedbackMonth}
                      onChange={(e) => {
                        const mo = Number(e.target.value)
                        setFeedbackMonth(mo)
                        const exList = db.getTrainerFeedback(feedbackMember.id, mo, feedbackYear)
                        const ex = exList.length > 0 ? exList[0] : null
                        if (ex) {
                          setFeedbackRating(ex.rating)
                          setFeedbackText(ex.feedback)
                          setFocusAreas(ex.focus_areas.join(', '))
                          setRecommendations(ex.recommendations)
                        }
                      }}
                      className="input-field"
                    >
                      {[
                        { v: 1, l: 'January' }, { v: 2, l: 'February' }, { v: 3, l: 'March' },
                        { v: 4, l: 'April' }, { v: 5, l: 'May' }, { v: 6, l: 'June' },
                        { v: 7, l: 'July' }, { v: 8, l: 'August' }, { v: 9, l: 'September' },
                        { v: 10, l: 'October' }, { v: 11, l: 'November' }, { v: 12, l: 'December' },
                      ].map((m) => (
                        <option key={m.v} value={m.v}>{m.l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Year</label>
                    <input
                      type="number"
                      value={feedbackYear}
                      onChange={(e) => setFeedbackYear(Number(e.target.value))}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Rating (1-5 stars) */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Coach Rating & Consistency Score (1 - 5 Stars)
                  </label>
                  <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-200">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= feedbackRating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-2">
                      {feedbackRating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Feedback Review */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Coach Evaluation & Progress Review *
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Describe trainee discipline, compound lift progress, form improvements..."
                    className="input-field"
                  />
                </div>

                {/* Focus Areas */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Key Focus Areas for Next Month (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={focusAreas}
                    onChange={(e) => setFocusAreas(e.target.value)}
                    placeholder="e.g. Squat Depth, Compound Overload, Rest Intervals"
                    className="input-field"
                  />
                </div>

                {/* Recommendations */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Coach Recommendations (Diet, Sleep, Recovery)
                  </label>
                  <textarea
                    rows={2}
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    placeholder="e.g. 140g protein daily, creatine 5g post-workout, 8 hrs sleep..."
                    className="input-field"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackMember(null)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveFeedback}
                    className="px-5 py-2 rounded-lg bg-[#E50914] text-white font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer"
                  >
                    Save Trainer Feedback
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CERTIFIED MONTHLY REPORT MODAL ──────────────────────── */}
        {reportMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-gray-200 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-[#E50914] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#111111]">
                      Official Monthly Fitness Report: {reportMember.profile?.full_name}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      ID: {reportMember.member_id} · Supervised by Coach {trainerName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReportMember(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <MemberMonthlyReport
                memberIdOverride={reportMember.id}
                showMemberSelector={false}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
