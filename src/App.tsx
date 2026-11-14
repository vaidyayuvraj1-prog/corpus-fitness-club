import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Layouts
import PublicLayout from '@/components/layout/PublicLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import MemberLayout from '@/components/layout/MemberLayout'
import TrainerLayout from '@/components/layout/TrainerLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Public Pages (All 14)
import HomePage from '@/pages/public/HomePage'
import AboutPage from '@/pages/public/AboutPage'
import MembershipPage from '@/pages/public/MembershipPage'
import TrainersPage from '@/pages/public/TrainersPage'
import ProgramsPage from '@/pages/public/ProgramsPage'
import NutritionPage from '@/pages/public/NutritionPage'
import FacilitiesPage from '@/pages/public/FacilitiesPage'
import GalleryPage from '@/pages/public/GalleryPage'
import SuccessStoriesPage from '@/pages/public/SuccessStoriesPage'
import TimetablePage from '@/pages/public/TimetablePage'
import BMICalculatorPage from '@/pages/public/BMICalculatorPage'
import CalorieCalculatorPage from '@/pages/public/CalorieCalculatorPage'
import ContactPage from '@/pages/public/ContactPage'
import FAQPage from '@/pages/public/FAQPage'

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'

// Admin Dashboard Pages (All 13 Modules)
import AdminDashboard from '@/pages/admin/AdminDashboard'
import MembersPage from '@/pages/admin/MembersPage'
import MembershipsPage from '@/pages/admin/MembershipsPage'
import PaymentsPage from '@/pages/admin/PaymentsPage'
import AttendancePage from '@/pages/admin/AttendancePage'
import AdminTrainersPage from '@/pages/admin/TrainersPage'
import WorkoutPlansPage from '@/pages/admin/WorkoutPlansPage'
import DietPlansPage from '@/pages/admin/DietPlansPage'
import EnquiriesPage from '@/pages/admin/EnquiriesPage'
import ExpensesPage from '@/pages/admin/ExpensesPage'
import ReportsPage from '@/pages/admin/ReportsPage'
import AdminGalleryPage from '@/pages/admin/GalleryPage'
import SettingsPage from '@/pages/admin/SettingsPage'
import AdminNotificationsPage from '@/pages/admin/NotificationsPage'

// Member Dashboard Pages
import MemberDashboard from '@/pages/member/MemberDashboard'
import MemberProfile from '@/pages/member/MemberProfile'
import MemberAttendance from '@/pages/member/MemberAttendance'
import MemberWorkout from '@/pages/member/MemberWorkout'
import MemberDiet from '@/pages/member/MemberDiet'
import MemberProgress from '@/pages/member/MemberProgress'
import MemberPayments from '@/pages/member/MemberPayments'
import MemberNotifications from '@/pages/member/MemberNotifications'
import MemberMonthlyReport from '@/pages/member/MemberMonthlyReport'

// Trainer Dashboard Pages
import TrainerDashboard from '@/pages/trainer/TrainerDashboard'
import TrainerMembers from '@/pages/trainer/TrainerMembers'
import TrainerWorkoutPlans from '@/pages/trainer/TrainerWorkoutPlans'
import TrainerDietPlans from '@/pages/trainer/TrainerDietPlans'
import TrainerSchedule from '@/pages/trainer/TrainerSchedule'

export default function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#171717',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            fontSize: '13px',
            fontWeight: 500,
          },
          success: {
            iconTheme: {
              primary: '#E50914',
              secondary: '#FFFFFF',
            },
          },
        }}
      />

      <Routes>
        {/* Public Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/trainers" element={<TrainersPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/success-stories" element={<SuccessStoriesPage />} />
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/bmi" element={<BMICalculatorPage />} />
          <Route path="/bmi-calculator" element={<BMICalculatorPage />} />
          <Route path="/calorie" element={<CalorieCalculatorPage />} />
          <Route path="/calorie-calculator" element={<CalorieCalculatorPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Admin Dashboard Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="memberships" element={<MembershipsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="trainers" element={<AdminTrainersPage />} />
          <Route path="workout-plans" element={<WorkoutPlansPage />} />
          <Route path="diet-plans" element={<DietPlansPage />} />
          <Route path="enquiries" element={<EnquiriesPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Member Dashboard Protected Routes */}
        <Route
          path="/member"
          element={
            <ProtectedRoute allowedRoles={['member', 'admin']}>
              <MemberLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MemberDashboard />} />
          <Route path="profile" element={<MemberProfile />} />
          <Route path="settings" element={<MemberProfile />} />
          <Route path="attendance" element={<MemberAttendance />} />
          <Route path="workout" element={<MemberWorkout />} />
          <Route path="monthly-report" element={<MemberMonthlyReport />} />
          <Route path="diet" element={<MemberDiet />} />
          <Route path="progress" element={<MemberProgress />} />
          <Route path="payments" element={<MemberPayments />} />
          <Route path="notifications" element={<MemberNotifications />} />
        </Route>

        {/* Trainer Dashboard Protected Routes */}
        <Route
          path="/trainer"
          element={
            <ProtectedRoute allowedRoles={['trainer', 'admin']}>
              <TrainerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TrainerDashboard />} />
          <Route path="members" element={<TrainerMembers />} />
          <Route path="workout-plans" element={<TrainerWorkoutPlans />} />
          <Route path="diet-plans" element={<TrainerDietPlans />} />
          <Route path="schedule" element={<TrainerSchedule />} />
        </Route>

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
