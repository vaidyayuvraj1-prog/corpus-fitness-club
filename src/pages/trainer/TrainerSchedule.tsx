import { motion } from 'framer-motion';
import { Clock, Calendar, CheckCircle2, Dumbbell, ShieldAlert } from 'lucide-react';

export default function TrainerSchedule() {
  const shifts = [
    {
      shift: 'Morning Shift',
      time: '06:00 AM – 11:00 AM',
      days: 'Monday – Saturday',
      role: 'Head Strength Coach & Floor Form Supervision',
      trainees: 16,
      badge: 'Peak Morning Batch',
    },
    {
      shift: 'Evening Shift',
      time: '05:00 PM – 10:00 PM',
      days: 'Monday – Saturday',
      role: 'Hypertrophy Guidance, Cardio & Spotting',
      trainees: 22,
      badge: 'Peak Evening Batch',
    },
  ];

  const weeklySchedule = [
    { day: 'Monday', morning: 'Chest & Triceps Group Spotting', evening: 'Flat Bench Press & Heavy Dumbbell Checks' },
    { day: 'Tuesday', morning: 'Deadlift & Posterior Chain Form', evening: 'Back Hypertrophy, Lat Pulldown & Row Coaching' },
    { day: 'Wednesday', morning: 'Active Core & Mobility Assessment', evening: 'HIIT Circuit & Functional Conditioning' },
    { day: 'Thursday', morning: 'Shoulder Press Form & Rotator Cuff Drills', evening: 'Deltoid Isolation & Trapezius Hypertrophy' },
    { day: 'Friday', morning: 'Barbell Squats & Quad Floor Coaching', evening: 'Leg Press, Romanian Deadlift & Hamstrings' },
    { day: 'Saturday', morning: 'Endurance Conditioning & Battle Ropes', evening: 'Weekly Form Review & Diet Calibrations' },
    { day: 'Sunday', morning: 'Closed (Facility Sanitization & Rest)', evening: 'Closed (Rest Day)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#111111] uppercase tracking-tight flex items-center gap-2">
          <Clock className="w-6 h-6 text-[#E50914]" /> Trainer Floor Shift & Batch Schedule
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Weekly duty roster for Corpus Fitness Club Amravati facility (3rd Floor, Above SBI, Harshraj Colony – Vidyut Nagar Square).
        </p>
      </div>

      {/* Shifts Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {shifts.map((s, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold text-[#E50914] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                {s.shift}
              </span>
              <span className="text-xs font-semibold text-gray-500">{s.badge}</span>
            </div>

            <div className="text-2xl font-black text-[#111111] mb-2">{s.time}</div>
            <p className="text-xs text-gray-600 mb-4">{s.role}</p>

            <div className="flex items-center justify-between text-xs pt-4 border-t border-gray-100">
              <span className="text-gray-500 font-medium">{s.days}</span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-gray-100 text-[#111111]">
                {s.trainees} Trainees
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Breakdown Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm p-6"
      >
        <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#E50914]" /> Weekly Floor Duty Focus & Training Modules
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-gray-600 uppercase text-[11px] font-bold border-b border-[#E5E7EB]">
              <tr>
                <th className="px-5 py-3.5 w-32">Day</th>
                <th className="px-5 py-3.5">Morning Shift (06:00 AM – 11:00 AM)</th>
                <th className="px-5 py-3.5">Evening Shift (05:00 PM – 10:00 PM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {weeklySchedule.map((row, idx) => {
                const isSunday = row.day === 'Sunday';
                return (
                  <tr key={idx} className={isSunday ? 'bg-red-50/30' : 'hover:bg-gray-50/70 transition-colors'}>
                    <td className={`px-5 py-3.5 font-bold ${isSunday ? 'text-red-700' : 'text-[#111111]'}`}>
                      {row.day}
                    </td>
                    <td className={`px-5 py-3.5 ${isSunday ? 'text-red-600 italic font-medium' : 'text-gray-700'}`}>
                      {row.morning}
                    </td>
                    <td className={`px-5 py-3.5 ${isSunday ? 'text-red-600 italic font-medium' : 'text-gray-700'}`}>
                      {row.evening}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Facility Notice Banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#E50914] shrink-0 mt-0.5" />
        <div className="text-xs text-red-950">
          <strong>Trainer Floor Protocol:</strong> All personal trainers must arrive 15 minutes prior to shift commencement. Ensure all free weights and dumbbells are racked, cardio machines are disinfected, and member attendance QR codes are scanned upon entry.
        </div>
      </div>
    </div>
  );
}
