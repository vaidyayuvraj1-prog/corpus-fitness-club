# 🏋️‍♂️ Corpus Fitness Club (CFC) — Supabase Database Setup Guide

Complete, production-ready PostgreSQL / Supabase database setup for Corpus Fitness Club (CFC).

---

## ⚡ 1-Click Setup Instructions (Supabase Dashboard)

Aapko bas **1 minute** lagega is database ko Supabase me live karne ke liye:

1. **Supabase Dashboard Kholo:**  
   Apne browser me [https://supabase.com/dashboard](https://supabase.com/dashboard) par jao aur apna project open karo (`lqhqbyetwupgpkghhtlk`).
2. **SQL Editor Me Jao:**  
   Left sidebar menu me **"SQL Editor"** icon (terminal icon `>_`) par click karo.
3. **New Query Banayein:**  
   Top me **"+ New query"** button par click karo.
4. **Script Copy & Paste Karo:**  
   Project ke andar `supabase/schema.sql` (ya `supabase/complete_database.sql`) ki poori file copy karo aur Supabase SQL Editor me paste kar do.
5. **Run Click Karo:**  
   Neeche ya upar diye gaye **"Run"** (green button ya `Ctrl + Enter`) par click karo.
6. **Done! 🎉**  
   Console me aayega:  
   `"CORPUS FITNESS CLUB DATABASE INITIALIZED SUCCESSFULLY! 26 TABLES READY WITH ROW LEVEL SECURITY & REALTIME SYNC."`

---

## 📊 Kya-kya create hoga is single script se?

### 1. 26 Relational Tables:
| # | Table Name | Description |
|---|---|---|
| 1 | `cfc_store` | Multi-device cloud sync engine (JSON key-value store) |
| 2 | `profiles` | User profiles with role (`super_admin`, `admin`, `trainer`, `member`, `receptionist`) |
| 3 | `admin_profile` | Club Director profile (`Yuvraj Vaidya (Director)` & credentials) |
| 4 | `trainers` | Professional gym coaches (certifications, bio, photo, specializations) |
| 5 | `membership_plans` | Monthly, Quarterly, Half-Yearly & Yearly plans with prices |
| 6 | `members` | Gym members registry with personal, medical & emergency details |
| 7 | `memberships` | Active member subscription records with start & expiry dates |
| 8 | `membership_renewals`| Immutable renewal history & audit logs |
| 9 | `payments` | Fee collections, receipts, modes (UPI/Cash), transaction refs |
| 10 | `attendance` | QR code & manual gate check-ins with timestamps |
| 11 | `exercise_library` | 30 standard exercise library with sets, reps, equipment & instructions |
| 12 | `workout_plans` | 7 core workout templates & custom created routines |
| 13 | `workout_exercises` | All 39 exercises linked to workout routines |
| 14 | `member_workout_assignments` | Routines assigned to specific members by Admin/Trainers |
| 15 | `workout_sessions` | Daily workout logs, logged weights, reps, and volume |
| 16 | `diet_plans` | Daily nutritional goals, target calories, and macros |
| 17 | `meal_items` | Individual meals (Breakfast, Lunch, Dinner, Post-Workout) |
| 18 | `enquiries` | New walk-in admissions & lead tracking |
| 19 | `expenses` | Gym operational expenditures (Rent, Electricity, Equipment) |
| 20 | `fitness_progress` | Weight, Body Fat %, Chest, Waist, Biceps tracking |
| 21 | `notifications` | In-app announcements & club broadcast alerts |
| 22 | `trainer_assignments`| Personal trainer allocation history |
| 23 | `trainer_feedback` | Monthly performance reviews & star ratings from coaches |
| 24 | `audit_logs` | Security & administrative activity tracking |
| 25 | `gallery` | High-definition club facility photos |
| 26 | `testimonials` | Real verified member reviews & PR achievements |

---

## 🔒 Security & Real-Time Sync
- **Row Level Security (RLS):** Har table par RLS enabled hai with safe permissive policies taaki website aur mobile dono bina kisi auth blocking ke real-time me update ho sakein.
- **Supabase Realtime:** `cfc_store`, `members`, `payments`, `attendance`, `workout_plans`, `workout_exercises`, `member_workout_assignments` sabhi `supabase_realtime` publication me added hain. Dusre phone ya laptop par ek second ke andar updates visible honge!

---

## 🏋️ Pre-Seeded Default Data
1. **4 Membership Plans:**
   - Monthly Plan: ₹700 (Men) / ₹500 (Women)
   - Quarterly Plan: ₹1,800 (Men) / ₹1,400 (Women)
   - Half-Yearly Plan: ₹3,200 (Men) / ₹2,500 (Women) *(Most Popular)*
   - Yearly Plan: ₹5,000 (Men) / ₹4,000 (Women)
2. **4 Certified Coaches:**
   - Rohit Deshmukh (Head Strength Coach)
   - Priya Bhagat (Senior Female Trainer)
   - Amit Thakre (Nutrition & Conditioning)
   - Sneha More (Zumba & Flexibility)
3. **7 Core Workout Templates:**
   - Push Pull Legs – Elite Split (6-Day)
   - Beginner Workout – Foundation Protocol (3-Day)
   - Muscle Building – Hypertrophy Program (4-Day)
   - Weight Loss – Fat Burning Program (4-Day)
   - Strength Training – Power Protocol (4-Day)
   - Full Body – Functional Conditioning (3-Day)
   - Home Workout – No Equipment (4-Day)
4. **Director Profile & VIP Member:**
   - Admin Director: `admin@corpuss.com` / `Admin@2026`
   - Active Member: `Yuvraj Vaidya` (`CFC-2026-0001` / `yuvraj.vaidya@corpuss.com`, Password: `CFC@2026`)
