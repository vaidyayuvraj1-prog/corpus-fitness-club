// Business constants for CORPUS FITNESS CLUB (CFC), Amravati, Maharashtra

export const GYM_INFO = {
  name: 'CORPUS FITNESS CLUB',
  shortName: 'CFC',
  tagline: 'TRANSFORM YOUR BODY. TRANSFORM YOUR LIFE.',
  subheadline: 'Your Fitness Journey Starts at CORPUS FITNESS CLUB.',
  established: '2019',
  rating: 4.8,
  reviews: 142,
  phone: '+91 76206 83995',
  whatsappNumber: '917620683995',
  whatsapp: 'https://wa.me/917620683995',
  instagram: 'https://instagram.com/corpus_fitnessclub',
  instagramHandle: 'corpus_fitnessclub',
  email: 'info@corpusfitness.com',
  currency: '₹',
  timezone: 'Asia/Kolkata',
  address: {
    line1: '3rd Floor, Above State Bank of India',
    line2: 'Harshraj Colony – Vidyut Nagar Square',
    line3: 'VMV Road, Amravati, Maharashtra 444604',
    city: 'Amravati',
    state: 'Maharashtra',
    pincode: '444604',
    full: '3rd Floor, Above State Bank of India, Harshraj Colony – Vidyut Nagar Square, VMV Road, Amravati, Maharashtra 444604',
  },
  hours: {
    weekdays: {
      morning: '6:00 AM – 11:00 AM',
      evening: '5:00 PM – 10:00 PM',
      days: 'Monday to Saturday',
    },
    sunday: 'Closed',
  },
  googleMapsEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3726.685375549065!2d77.755409!3d20.932829!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd6a4ba23386629%3A0x64cf5177265a947!2sVMV%20Road%2C%20Amravati%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000',
  colors: {
    mainBg: '#FFFFFF',
    secondaryBg: '#F8FAFC',
    cardBg: '#FFFFFF',
    primaryRed: '#E50914',
    darkRed: '#B91C1C',
    primaryText: '#171717',
    secondaryText: '#666666',
    border: '#E5E7EB',
    blackAccent: '#111111',
  },
}

export const MEMBERSHIP_PLANS_DEFAULT = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    duration_months: 1,
    duration_type: '1 Month',
    price_men: 700,
    price_women: 500,
    price: 700,
    description: 'Perfect starting plan with full facility access.',
    features: [
      'Full Gym & Cardio Access',
      'Locker & Shower Facility',
      'General Floor Trainer Support',
      'Free Fitness Assessment',
      'Access During All Shifts',
    ],
    popular: false,
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    duration_months: 3,
    duration_type: '3 Months',
    price_men: 1800,
    price_women: 1400,
    price: 1800,
    description: '3 months of consistent training with moderate savings.',
    features: [
      'Full Gym & Cardio Access',
      'Locker Room Access',
      'Custom Workout Routine Card',
      'Basic Diet Guidelines',
      'Monthly Body Composition Check',
    ],
    popular: false,
  },
  {
    id: 'half-yearly',
    name: 'Half-Yearly Plan',
    duration_months: 6,
    duration_type: '6 Months',
    price_men: 3200,
    price_women: 2500,
    price: 3200,
    description: 'Our most popular plan! Best value for building habit & physique.',
    features: [
      'Full Gym & Cardio Zone Access',
      'Zumba & Aerobics Classes Included',
      'Personalized Workout Plan',
      'Custom Diet Chart & Nutrition Consult',
      'Bi-weekly Body Measurements',
      'Dedicated Locker Storage',
    ],
    popular: true,
  },
  {
    id: 'annual',
    name: 'Yearly Plan',
    duration_months: 12,
    duration_type: '12 Months',
    price_men: 5000,
    price_women: 4000,
    price: 5000,
    description: 'Maximum savings for serious fitness enthusiasts. Complete transformation.',
    features: [
      '365 Days Unlimited Gym Access',
      'Zumba & Aerobics Batches Included',
      'Dedicated Trainer Consultation',
      'Advanced Nutrition & Diet Schedule',
      'Free CFC Branded Gym Kit & Shaker',
      '1 Month Membership Freeze Option',
      'Priority Locker Allotment',
    ],
    popular: false,
  },
]

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  RECEPTIONIST: 'receptionist',
  TRAINER: 'trainer',
  MEMBER: 'member',
} as const

export const FACILITIES = [
  {
    id: 'modern-equipment',
    title: 'Modern Gym Equipment',
    desc: 'Heavy duty biomechanically engineered pin-loaded and plate-loaded resistance machines from leading brands.',
    icon: 'Dumbbell',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'strength-training',
    title: 'Strength Training Zone',
    desc: 'Power cages, Olympic lifting platforms, heavy barbells, and dumb-bells ranging from 2.5 kg to 50 kg.',
    icon: 'Zap',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cardio-training',
    title: 'Cardio Training Section',
    desc: 'Motorized treadmills, cross-trainers, assault bikes, and rowing machines for heart health and fat loss.',
    icon: 'Activity',
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'personal-training',
    title: 'Personal Training',
    desc: '1-on-1 certified coaching dedicated to your physique goals, form correction, and accountability.',
    icon: 'Award',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'zumba',
    title: 'Zumba & Dance Fitness',
    desc: 'High-energy rhythmic cardio dance sessions that burn 500+ calories while having incredible fun.',
    icon: 'Flame',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'aerobics',
    title: 'Aerobics & HIIT Zone',
    desc: 'Dynamic group aerobic conditioning classes to enhance stamina, speed, agility, and core strength.',
    icon: 'Heart',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'spacious-workout',
    title: 'Spacious Workout Area',
    desc: 'Well-ventilated, hygienic 3rd floor training arena with natural sunlight, rubber flooring, and full mirrors.',
    icon: 'Maximize',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'professional-trainers',
    title: 'Professional Trainers',
    desc: 'Certified fitness coaches who prioritize injury prevention, scientific programming, and real results.',
    icon: 'Users',
    image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=800&q=80',
  },
]

export const PROGRAMS = [
  {
    id: 'weight-loss',
    title: 'Weight Loss & Fat Reduction',
    tag: 'High Demand',
    desc: 'Calorie-burning workouts combined with tailored nutrition guidance to shed stubborn fat and tone muscles.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'muscle-building',
    title: 'Muscle Building & Hypertrophy',
    tag: 'Popular',
    desc: 'Progressive overload training, hypertrophy-focused volume splits, and high-protein diet schedules.',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'strength-training',
    title: 'Strength Training',
    tag: 'Performance',
    desc: 'Master the compound lifts: squat, bench press, deadlift, overhead press. Build raw physical strength.',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'personal-training',
    title: 'Personal Training (1-on-1)',
    tag: 'VIP Coaching',
    desc: 'Private customized workouts, continuous motivation, technique auditing, and weekly progress audits.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cardio-fitness',
    title: 'Cardio Fitness & Stamina',
    tag: 'Endurance',
    desc: 'Build cardiovascular endurance, lower resting heart rate, and maintain vibrant daily energy levels.',
    image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'zumba',
    title: 'Zumba Dance Fitness',
    tag: 'Fun & Calorie Burn',
    desc: 'Exciting Latin and Bollywood rhythms designed to energize the spirit and torch hundreds of calories.',
    image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'aerobics',
    title: 'Aerobics & Calisthenics',
    tag: 'Agility',
    desc: 'Bodyweight conditioning, step aerobics, and agility circuits for functional mobility and joint health.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'general-fitness',
    title: 'General Fitness & Wellness',
    tag: 'All Ages',
    desc: 'Holistic workout regimens designed for beginners and working professionals to stay healthy, active, and stress-free.',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
  },
]

export const WHY_CHOOSE_US = [
  {
    title: 'Modern Equipment',
    desc: 'High-standard imported machines and diverse free weights engineered for optimal muscle stimulation.',
    icon: 'Dumbbell',
  },
  {
    title: 'Experienced Trainers',
    desc: 'Certified coaches with 5+ years of real transformation experience ready to guide you step-by-step.',
    icon: 'Award',
  },
  {
    title: 'Supportive Environment',
    desc: 'A positive, energetic, zero-ego gym atmosphere where beginners and seasoned lifters thrive alike.',
    icon: 'Users',
  },
  {
    title: 'Flexible Membership Plans',
    desc: 'Affordable monthly, quarterly, 6-month, and annual plans with student & female-friendly rates.',
    icon: 'CreditCard',
  },
  {
    title: 'Fitness Guidance & Diet',
    desc: 'Detailed exercise routines and practical Indian diet planning included with every membership.',
    icon: 'Target',
  },
  {
    title: 'Convenient Timings',
    desc: 'Early morning (6:00 AM – 11:00 AM) and evening (5:00 PM – 10:00 PM) shifts to fit any work schedule.',
    icon: 'Clock',
  },
]

export const TRAINERS_DEMO = [
  {
    id: 'trainer-1',
    name: 'Rohit Deshmukh',
    role: 'Head Strength Coach',
    specialization: 'Strength Training, Powerlifting & Body Transformation',
    experience: '8+ Years',
    bio: 'Former district powerlifter with extensive certifications in biomechanics and injury-free hypertrophy training.',
    photo: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80',
    phone: '+91 98220 12345',
  },
  {
    id: 'trainer-2',
    name: 'Priya Bhagat',
    role: 'Senior Female Trainer',
    specialization: 'Aerobics, Weight Loss & Female Toning',
    experience: '5+ Years',
    bio: 'Specialist in postpartum fitness, aerobic endurance, and sustainable fat-loss regimens for women.',
    photo: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80',
    phone: '+91 94231 67890',
  },
  {
    id: 'trainer-3',
    name: 'Amit Thakre',
    role: 'Nutrition & Conditioning Specialist',
    specialization: 'Contest Prep, Dietetics & Muscle Hypertrophy',
    experience: '6+ Years',
    bio: 'Certified sports nutritionist helping members fuel their workouts with practical Indian nutrition plans.',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    phone: '+91 97654 32109',
  },
  {
    id: 'trainer-4',
    name: 'Sneha More',
    role: 'Zumba & Flexibility Instructor',
    specialization: 'Zumba Fitness, HIIT & Mobility Coaching',
    experience: '4+ Years',
    bio: 'Licensed Zumba instructor bringing infectious energy to every session. Expert in joint flexibility and stamina.',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    phone: '+91 98810 54321',
  },
]

export const GALLERY_CATEGORIES = [
  'All',
  'Gym Interior',
  'Equipment',
  'Training',
  'Activities',
  'Events',
]

export const GALLERY_ITEMS_DEFAULT = [
  {
    id: 'g1',
    category: 'Gym Interior',
    title: 'Spacious 3rd Floor Main Floor',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'g2',
    category: 'Equipment',
    title: 'Heavy Free Weights & Dumbbell Rack',
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'g3',
    category: 'Training',
    title: 'Olympic Barbell Deadlift Session',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'g4',
    category: 'Equipment',
    title: 'Plate Loaded Leg Press & Hack Squat',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'g5',
    category: 'Activities',
    title: 'Evening Zumba Group Batch',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'g6',
    category: 'Training',
    title: '1-on-1 Personal Coaching Session',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'g7',
    category: 'Gym Interior',
    title: 'Dedicated Cardio & Cycling Arena',
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'g8',
    category: 'Events',
    title: 'Annual Fitness Challenge 2025 Amravati',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'g9',
    category: 'Activities',
    title: 'High Intensity Aerobic Conditioning',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80',
  },
]

export const TESTIMONIALS_DEFAULT = [
  {
    id: 't1',
    name: 'Sanket Deshmukh',
    role: 'Member since 2022',
    rating: 5,
    text: 'Joined Corpus Fitness Club with 88 kg weight and low stamina. With coach Rohit’s guidance and clean diet plan, I lost 16 kg in 6 months! Best gym on VMV road.',
    achievement: 'Lost 16 kg & gained lean strength',
  },
  {
    id: 't2',
    name: 'Kavita Joshi',
    role: 'Member since 2023',
    rating: 5,
    text: 'The women-friendly environment, dedicated trainers, and separate shifting times make CFC the safest and most comfortable gym in Amravati. Zumba classes are super energetic!',
    achievement: 'Toned physique & healthy habits',
  },
  {
    id: 't3',
    name: 'Akash Wankhade',
    role: 'Member since 2021',
    rating: 5,
    text: 'Equipment is very well maintained, heavy weights up to 50kg, and great ventilation. The QR attendance and mobile portal make tracking workouts very easy.',
    achievement: 'Squat PR: 160 kg, Bench PR: 110 kg',
  },
]

export const FAQ_LIST = [
  {
    question: 'What are the membership plans and fees?',
    answer: 'We provide Monthly (₹700 men / ₹500 women), Quarterly (₹1800 men / ₹1400 women), Half-Yearly (₹3200 men / ₹2500 women), and Yearly (₹5000 men / ₹4000 women) packages. We also offer special student discounts with valid college ID.',
  },
  {
    question: 'What are the gym operating hours?',
    answer: 'We operate Monday through Saturday in two flexible shifts: Morning Shift from 6:00 AM to 11:00 AM, and Evening Shift from 5:00 PM to 10:00 PM. The gym remains closed on Sundays for sanitization and maintenance.',
  },
  {
    question: 'Can beginners join with zero workout experience?',
    answer: 'Absolutely! More than 60% of our members started as complete beginners. Our certified floor trainers guide you on proper machine adjustment, safe lifting technique, warm-up routines, and beginner workout schedules.',
  },
  {
    question: 'Do you provide personal training?',
    answer: 'Yes! We offer dedicated 1-on-1 Personal Training with certified coaches. Your trainer customizes every workout session, tracks your form, plans your nutritional calories, and monitors your weekly progress.',
  },
  {
    question: 'Is a trainer always available on the floor?',
    answer: 'Yes, certified trainers are present during all morning and evening operating hours to assist with spot checks, form correction, equipment setup, and general fitness inquiries.',
  },
  {
    question: 'How can I contact Corpus Fitness Club or book a trial?',
    answer: 'You can fill out our online Admission & Enquiry form, call us directly at +91 76206 83995, message us on WhatsApp, or visit us on the 3rd Floor, Above State Bank of India, Harshraj Colony – Vidyut Nagar Square, VMV Road, Amravati.',
  },
]

export const FITNESS_GOALS = [
  'Weight Loss',
  'Muscle Building & Bulking',
  'Strength & Powerlifting',
  'Cardio Fitness & Stamina',
  'Body Recomposition & Toning',
  'General Fitness & Health',
  'Flexibility & Mobility',
  'Zumba & Aerobics Conditioning',
]

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other']

export const EXPENSE_CATEGORIES = [
  'Rent',
  'Electricity',
  'Equipment',
  'Maintenance',
  'Salary',
  'Marketing',
  'Supplements',
  'Cleaning & Sanitization',
  'Other',
]

// Official Gate Check-In QR payload for members to scan on gym entrance wall
export const OFFICIAL_GYM_GATE_QR = 'CFC-GATE-CHECKIN:AMRAVATI:VMV-ROAD:2026'
