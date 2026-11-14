# 🏋️ CORPUS FITNESS CLUB (CFC) — Gym Website + ERP Management System

> **Business:** Corpus Fitness Club  
> **Location:** 3rd Floor, Above State Bank of India, Harshraj Colony – Vidyut Nagar Square, VMV Road, Amravati, Maharashtra 444604  
> **Contact / WhatsApp:** +91 76206 83995 · https://wa.me/917620683995  
> **Established:** 2019 | **Rating:** 4.7★ (126 Reviews)  

---

## 🚀 Quick Start Guide

### 1. Requirements
- Node.js (v18 or newer)
- npm or yarn

### 2. Installation
Open your terminal in this extracted directory:
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to:
👉 **http://localhost:5173/**

### 4. Build for Production
```bash
npm run build
```
The compiled, optimized static files will be generated in `/dist` ready for 1-click deployment on Vercel / Netlify (Free Tier).

---

## 🔑 Demo Access & Login Credentials

Go to `http://localhost:5173/auth/login`.  
For quick testing without typing, click any of the **Instant Demo Portal Access** buttons at the bottom of the card:

| Role | Email | Password | Direct URL |
| :--- | :--- | :--- | :--- |
| **Admin ERP** | `admin@corpusfitness.com` | `admin123` | `http://localhost:5173/admin` |
| **Trainer Portal** | `trainer@corpusfitness.com` | `trainer123` | `http://localhost:5173/trainer` |
| **Member Portal** | `member@corpusfitness.com` | `member123` | `http://localhost:5173/member` |
| **Public Website** | *(No login required)* | — | `http://localhost:5173/` |

---

## 📁 Project Structure

```
corpus-fitness-club/
├── public/                 # Static assets & SVG icons
├── src/
│   ├── assets/             # Brand logos & graphics
│   ├── components/
│   │   ├── auth/           # Protected routes guard
│   │   ├── layout/         # PublicNavbar, PublicFooter, AdminLayout, MemberLayout, TrainerLayout
│   │   └── ui/             # Reusable UI primitives (Button, Modal, Badge, StatCard, Table...)
│   ├── hooks/              # Custom hooks (useAuth)
│   ├── lib/                # api.ts, constants.ts, supabase.ts, utils.ts
│   ├── pages/
│   │   ├── admin/          # Admin ERP (13 modules: Members, Payments, QR Attendance, Reports...)
│   │   ├── auth/           # LoginPage, ResetPasswordPage
│   │   ├── member/         # Member Dashboard, Workout, Diet, Attendance, Progress, Payments
│   │   ├── public/         # All 14 Public Pages (Home, About, Pricing, Timetable, BMI, Calorie...)
│   │   └── trainer/        # Trainer Dashboard, Trainees, Routines, Schedule
│   ├── store/              # Zustand state stores (authStore, notificationStore)
│   ├── types/              # Database schema TypeScript types
│   ├── App.tsx             # Master React Router v6 routing
│   ├── index.css           # Tailwind CSS base styles & neon glowing utilities
│   └── main.tsx            # Vite entry point
├── supabase/
│   └── migrations/         # 001_initial_schema.sql (19 PostgreSQL tables with RLS)
├── .env.example            # Supabase environment variables template
├── package.json
├── tailwind.config.ts      # Custom athletic neon green (#39FF14) theme
└── vite.config.ts
```

---

## 🗄️ Database Setup (Optional - Live Supabase)

To connect your live Supabase Free Tier account:
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard and run the entire file:
   `supabase/migrations/001_initial_schema.sql`
3. Copy your Project URL and Anon Public Key from **Project Settings > API**.
4. Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. Restart `npm run dev`. The system will automatically switch from demo fallback data to live PostgreSQL database operations!

---

## 📄 License & Attribution
Designed & Built for **Corpus Fitness Club**, Amravati, Maharashtra.  
All technologies used are 100% Free and Open-Source.
