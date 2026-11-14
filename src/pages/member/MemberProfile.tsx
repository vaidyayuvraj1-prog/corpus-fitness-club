import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { User, Phone, Mail, MapPin, Target, Camera, Lock, Eye, EyeOff, Save, ShieldAlert, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { db, getMembers } from '@/lib/db';
import type { Member } from '@/types/database';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid 10-digit mobile number'),
  email: z.string().email('Enter a valid email address'),
  emergency_contact: z.string().min(10, 'Enter a valid emergency contact number'),
  address: z.string().min(5, 'Address too short'),
  fitness_goal: z.string().min(3, 'Describe your fitness goal'),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string(),
}).refine(d => d.new_password === d.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function MemberProfile() {
  const { profile, updateProfile } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Look up full member record from DB
  const allMembers: Member[] = getMembers();
  const memberRecord = allMembers.find((m: Member) => m.profile_id === profile?.id || m.profile?.email === profile?.email) || allMembers[0];

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || memberRecord?.profile?.full_name || 'Rahul Sharma',
      phone: profile?.phone || memberRecord?.profile?.phone || '+91 98765 43210',
      email: profile?.email || memberRecord?.email || memberRecord?.profile?.email || 'rahul.sharma@corpuss.com',
      emergency_contact: memberRecord?.emergency_phone || memberRecord?.emergency_contact || '+91 98765 00000',
      address: memberRecord?.address || 'Harshraj Colony, VMV Road, Amravati, Maharashtra 444604',
      fitness_goal: memberRecord?.fitness_goal || 'Hypertrophy & Strength Training',
    },
  });

  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, formState: { errors: pwdErrors, isSubmitting: pwdSubmitting } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      if (updateProfile) {
        await updateProfile({
          full_name: data.full_name,
          phone: data.phone,
          email: data.email,
        });
      }
      toast.success('Member profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      if (!memberRecord?.id) {
        toast.error('Member record not found');
        return;
      }
      const res = db.changeMemberPassword(
        memberRecord.id,
        data.current_password,
        data.new_password
      );
      toast.success(res.message);
      resetPwd();
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    }
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'RS';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-[#111111] uppercase tracking-tight">
          Member Profile & Account Settings
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage your personal details, emergency contact, fitness goals, and portal security credentials.
        </p>
      </div>

      {/* Top Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row items-center gap-6"
      >
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-2xl font-black bg-red-50 text-[#E50914] border-2 border-[#E50914]">
            {memberRecord?.photo_url ? (
              <img src={memberRecord.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <button
            onClick={() => toast('Photo upload is available via Admin Front Desk', { icon: '📷' })}
            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white cursor-pointer"
            title="Update Photo"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-[#111111]">{profile?.full_name || 'Rahul Sharma'}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Active Member
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{profile?.email || 'member@corpusfitness.in'}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#E50914] bg-red-50 px-2 py-0.5 rounded">
              <Award className="w-3.5 h-3.5" /> ID: {memberRecord?.member_id || 'CFC-2026-0001'}
            </span>
            <span>Joined: {memberRecord?.registration_date || '15 Jan 2026'}</span>
            <span>Blood Group: O+</span>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Form and Security */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Details Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm"
        >
          <h2 className="text-base font-bold text-[#111111] uppercase tracking-wide mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-[#E50914]" /> Personal Information
          </h2>

          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('full_name')}
                    type="text"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#E50914] text-[#111111]"
                  />
                </div>
                {errors.full_name && <p className="text-red-500 text-[11px] mt-1">{errors.full_name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#E50914] text-[#111111]"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Official Gym Email (@corpuss.com)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    readOnly
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E7EB] bg-gray-50 text-gray-700 font-mono font-bold cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Admin-assigned official portal login ID.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Emergency Contact</label>
                <div className="relative">
                  <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('emergency_contact')}
                    type="tel"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#E50914] text-[#111111]"
                  />
                </div>
                {errors.emergency_contact && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.emergency_contact.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Residential Address (Amravati)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <textarea
                  {...register('address')}
                  rows={2}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#E50914] text-[#111111] resize-none"
                />
              </div>
              {errors.address && <p className="text-red-500 text-[11px] mt-1">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Primary Fitness Goal</label>
              <div className="relative">
                <Target className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <textarea
                  {...register('fitness_goal')}
                  rows={2}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#E50914] text-[#111111] resize-none"
                />
              </div>
              {errors.fitness_goal && <p className="text-red-500 text-[11px] mt-1">{errors.fitness_goal.message}</p>}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Change Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm flex flex-col justify-between"
        >
          <div>
            <h2 className="text-base font-bold text-[#111111] uppercase tracking-wide mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#E50914]" /> Portal Security & Password
            </h2>

            {/* Info Notice */}
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 leading-relaxed">
              <strong className="block text-amber-900 font-bold mb-0.5 uppercase tracking-wide">
                Admin-Issued Password
              </strong>
              Upon enrollment, the Gym Admin generated your official initial password (default: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-950">CFC@2026</code>). You can change it anytime below to your own confidential password.
            </div>

            <div className="mb-4 flex items-center justify-between text-xs p-2.5 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-gray-600 font-semibold text-[11px]">Password Status:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                {memberRecord?.password && memberRecord.password !== 'CFC@2026'
                  ? '🔒 Custom Password Active'
                  : '🔑 Admin Default Active'}
              </span>
            </div>

            <form onSubmit={handlePwd(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...regPwd('current_password')}
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#E50914] text-[#111111]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwdErrors.current_password && (
                  <p className="text-red-500 text-[11px] mt-1">{pwdErrors.current_password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...regPwd('new_password')}
                    type={showNew ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#E50914] text-[#111111]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwdErrors.new_password && (
                  <p className="text-red-500 text-[11px] mt-1">{pwdErrors.new_password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...regPwd('confirm_password')}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#E50914] text-[#111111]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwdErrors.confirm_password && (
                  <p className="text-red-500 text-[11px] mt-1">{pwdErrors.confirm_password.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pwdSubmitting}
                  className="w-full py-2.5 rounded-lg border border-[#E50914] text-[#E50914] hover:bg-red-50 text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {pwdSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-gray-500">
            For identity updates or branch transfer, please consult the Corpus Fitness Club reception desk.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
