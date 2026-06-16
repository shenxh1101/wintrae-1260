export type MedicineType = 'prescription' | 'health' | 'common'

export type DoseTime = 'morning' | 'noon' | 'evening' | 'night'

export interface DoseItem {
  time: DoseTime
  timeLabel: string
  dosage: string
  timePoint: string
}

export interface Medicine {
  id: string
  name: string
  type: MedicineType
  typeLabel: string
  specification: string
  manufacturer?: string
  stock: number
  unit: string
  warnStock: number
  doses: DoseItem[]
  startDate: string
  duration?: number
  notes?: string
  photoUrl?: string
  isActive: boolean
  createdAt: string
}

export interface MedicineRecord {
  id: string
  medicineId: string
  medicineName: string
  date: string
  doseTime: DoseTime
  doseTimeLabel: string
  status: 'taken' | 'missed' | 'delayed' | 'skipped'
  actualTime?: string
  reason?: string
  reaction?: string
  notes?: string
}

export interface ReminderItem {
  id: string
  type: 'medicine' | 'visit' | 'lab' | 'temporary'
  typeLabel: string
  title: string
  date: string
  time: string
  description?: string
  isEnabled: boolean
  repeat?: 'daily' | 'weekly' | 'monthly' | 'once'
  relatedId?: string
}

export interface Caregiver {
  id: string
  name: string
  relationship: string
  phone: string
  isShareEnabled: boolean
}

export interface UserProfile {
  name: string
  avatar?: string
  age: number
  gender: string
  diseases: string[]
}
