import { clsx, type ClassValue } from 'clsx'

// Simple clsx replacement without the dependency
export function cn(...inputs: ClassValue[]) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

export function getBMICategory(bmi: number): {
  category: string
  color: string
  description: string
} {
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-400', description: 'You are below the healthy weight range.' }
  if (bmi < 25) return { category: 'Normal Weight', color: 'text-green-400', description: 'You are within the healthy weight range.' }
  if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-400', description: 'You are above the healthy weight range.' }
  if (bmi < 35) return { category: 'Obese (Class I)', color: 'text-orange-400', description: 'Consider consulting a doctor.' }
  return { category: 'Obese (Class II+)', color: 'text-red-400', description: 'Consult a healthcare professional.' }
}

export function calculateTDEE(params: {
  age: number
  gender: 'male' | 'female'
  weightKg: number
  heightCm: number
  activityLevel: string
}): number {
  const { age, gender, weightKg, heightCm, activityLevel } = params

  // Mifflin-St Jeor Equation
  let bmr: number
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  }

  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.55))
}

export function generateMemberId(): string {
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.floor(1000 + Math.random() * 9000)
  return `CFC${year}${random}`
}

export function generateReceiptNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(100 + Math.random() * 900)
  return `RCP${year}${month}${random}`
}

export function getDaysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate)
  const today = new Date()
  const diff = expiry.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getMembershipStatus(expiryDate: string): 'active' | 'expiring' | 'expired' {
  const days = getDaysUntilExpiry(expiryDate)
  if (days < 0) return 'expired'
  if (days <= 7) return 'expiring'
  return 'active'
}

export function truncate(str: string, length: number): string {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '…' : str
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
