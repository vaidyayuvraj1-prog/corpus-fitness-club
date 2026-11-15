# 🏋️‍♂️ Corpus Fitness Club (CFC) — Supabase Clean Database Setup

Production-ready PostgreSQL / Supabase database schema for Corpus Fitness Club (CFC).  
**100% Pure Schema — Zero Dummy / Fake Data!** (Tables remain completely clean and empty until real data is created).

---

## ⚡ 1-Click Setup Instructions (Supabase Dashboard)

1. **Supabase Dashboard Kholein:**  
   [https://supabase.com/dashboard](https://supabase.com/dashboard) par jayein aur apna project open karein (`lqhqbyetwupgpkghhtlk`).
2. **SQL Editor Me Jayein:**  
   Left sidebar menu me **"SQL Editor"** icon (`>_`) par click karein.
3. **New Query Banayein:**  
   Top me **"+ New query"** button par click karein (ya purana code poora delete kar dein).
4. **Script Copy & Paste Karein:**  
   `supabase/schema.sql` ka saara code copy karein aur paste kar dein.
5. **Select All & Run Karein:**  
   Editor me click karke `Ctrl + A` (Select All) karein aur **"Run"** (ya `Ctrl + Enter`) par click karein.
6. **Done! 🎉**  
   Console me success message aayega:  
   `"CORPUS FITNESS CLUB CLEAN DATABASE READY! ZERO DUMMY DATA. ALL 26 TABLES INITIALIZED WITH RLS & REALTIME."`

---

## 📊 Kya-kya create hoga is clean script se?

### 26 Clean Relational Tables (Pure Schema, Zero Fake Rows):
1. `cfc_store` — Multi-device real-time sync table
2. `profiles` — User & staff profile registry
3. `admin_profile` — Director settings & credentials
4. `trainers` — Gym coaches & specializations
5. `membership_plans` — Membership packages & durations
6. `members` — Gym members registry
7. `memberships` — Active member subscription contracts
8. `membership_renewals` — Renewal audit logs
9. `payments` — Fee transactions & receipts
10. `attendance` — QR & manual check-in logs
11. `exercise_library` — Exercise movements & muscle targets
12. `workout_plans` — Workout routines & plans
13. `workout_exercises` — Exercises mapped to routines
14. `member_workout_assignments` — Assigned routines to members
15. `workout_sessions` — Daily workout tracking logs
16. `diet_plans` — Daily calorie & nutrition plans
17. `meal_items` — Meals and food items
18. `enquiries` — Admission leads & inquiries
19. `expenses` — Gym operational expenditure
20. `fitness_progress` — Body measurement records
21. `notifications` — In-app alerts & broadcast notices
22. `trainer_assignments` — Coach allocation history
23. `trainer_feedback` — Performance reviews
24. `audit_logs` — Activity tracking logs
25. `gallery` — Club facility photos
26. `testimonials` — Member reviews

---

## 🔒 Security & Real-Time Sync
- **Row Level Security (RLS):** Sabhi 26 tables par public access policies configured hain taaki frontend web portal bina kisi auth block ke data read aur write kar sake.
- **Supabase Realtime:** `cfc_store`, `members`, `memberships`, `membership_renewals`, `payments`, `attendance`, `workout_plans`, `workout_exercises`, `member_workout_assignments`, `workout_sessions`, `notifications` real-time WebSocket sync ke sath connected hain.
