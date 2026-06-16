import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type { Medicine, MedicineRecord, ReminderItem } from '@/types'
import { mockMedicines, mockRecords, mockReminders } from '@/data/mockData'

const STORAGE_KEYS = {
  MEDICINES: 'app_medicines_v1',
  RECORDS: 'app_records_v1',
  REMINDERS: 'app_reminders_v1'
}

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const data = Taro.getStorageSync(key)
    if (data && data !== '') {
      return JSON.parse(data) as T
    }
  } catch (e) {
    console.error('[Store] 读取本地存储失败:', key, e)
  }
  return defaultValue
}

const saveToStorage = <T>(key: string, value: T): void => {
  try {
    Taro.setStorageSync(key, JSON.stringify(value))
  } catch (e) {
    console.error('[Store] 写入本地存储失败:', key, e)
  }
}

interface AppState {
  medicines: Medicine[]
  records: MedicineRecord[]
  reminders: ReminderItem[]
  initialized: boolean

  initStore: () => void

  addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt'>) => Medicine
  updateMedicine: (id: string, updates: Partial<Medicine>) => void
  removeMedicine: (id: string) => void
  decreaseMedicineStock: (medicineId: string, amount?: number) => void

  addRecord: (record: Omit<MedicineRecord, 'id'>) => MedicineRecord
  updateRecord: (id: string, updates: Partial<MedicineRecord>) => void
  removeRecord: (id: string) => void
  removeRecordByFilter: (filter: {
    medicineId?: string
    date?: string
    doseTime?: string
  }) => void

  addReminder: (reminder: Omit<ReminderItem, 'id'>) => ReminderItem
  updateReminder: (id: string, updates: Partial<ReminderItem>) => void
  toggleReminder: (id: string) => void
  removeReminder: (id: string) => void
}

const generateId = (prefix = '') => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const useAppStore = create<AppState>((set, get) => ({
  medicines: [],
  records: [],
  reminders: [],
  initialized: false,

  initStore: () => {
    if (get().initialized) return

    const storedMedicines = loadFromStorage<Medicine[]>(STORAGE_KEYS.MEDICINES, mockMedicines)
    const storedRecords = loadFromStorage<MedicineRecord[]>(STORAGE_KEYS.RECORDS, mockRecords)
    const storedReminders = loadFromStorage<ReminderItem[]>(STORAGE_KEYS.REMINDERS, mockReminders)

    set({
      medicines: storedMedicines,
      records: storedRecords,
      reminders: storedReminders,
      initialized: true
    })

    console.log('[Store] 初始化完成:', {
      medicines: storedMedicines.length,
      records: storedRecords.length,
      reminders: storedReminders.length
    })
  },

  addMedicine: (medicine) => {
    const newMedicine: Medicine = {
      ...medicine,
      id: generateId('med_'),
      createdAt: new Date().toISOString().split('T')[0]
    }
    const newMedicines = [...get().medicines, newMedicine]
    set({ medicines: newMedicines })
    saveToStorage(STORAGE_KEYS.MEDICINES, newMedicines)
    console.log('[Store] 添加药品:', newMedicine.name)
    return newMedicine
  },

  updateMedicine: (id, updates) => {
    const newMedicines = get().medicines.map(m =>
      m.id === id ? { ...m, ...updates } : m
    )
    set({ medicines: newMedicines })
    saveToStorage(STORAGE_KEYS.MEDICINES, newMedicines)
    console.log('[Store] 更新药品:', id)
  },

  removeMedicine: (id) => {
    const newMedicines = get().medicines.filter(m => m.id !== id)
    set({ medicines: newMedicines })
    saveToStorage(STORAGE_KEYS.MEDICINES, newMedicines)
    console.log('[Store] 删除药品:', id)
  },

  decreaseMedicineStock: (medicineId, amount = 1) => {
    const newMedicines = get().medicines.map(m =>
      m.id === medicineId
        ? { ...m, stock: Math.max(0, m.stock - amount) }
        : m
    )
    set({ medicines: newMedicines })
    saveToStorage(STORAGE_KEYS.MEDICINES, newMedicines)
    console.log('[Store] 扣减库存:', medicineId, `-${amount}`)
  },

  addRecord: (record) => {
    const newRecord: MedicineRecord = {
      ...record,
      id: generateId('rec_')
    }
    const newRecords = [...get().records, newRecord]
    set({ records: newRecords })
    saveToStorage(STORAGE_KEYS.RECORDS, newRecords)
    console.log('[Store] 添加记录:', newRecord.medicineName, newRecord.status)
    return newRecord
  },

  updateRecord: (id, updates) => {
    const newRecords = get().records.map(r =>
      r.id === id ? { ...r, ...updates } : r
    )
    set({ records: newRecords })
    saveToStorage(STORAGE_KEYS.RECORDS, newRecords)
    console.log('[Store] 更新记录:', id)
  },

  removeRecord: (id) => {
    const newRecords = get().records.filter(r => r.id !== id)
    set({ records: newRecords })
    saveToStorage(STORAGE_KEYS.RECORDS, newRecords)
    console.log('[Store] 删除记录:', id)
  },

  removeRecordByFilter: (filter) => {
    const newRecords = get().records.filter(r => {
      if (filter.medicineId && r.medicineId !== filter.medicineId) return true
      if (filter.date && r.date !== filter.date) return true
      if (filter.doseTime && r.doseTime !== filter.doseTime) return true
      return false
    })
    set({ records: newRecords })
    saveToStorage(STORAGE_KEYS.RECORDS, newRecords)
    console.log('[Store] 按条件删除记录:', filter)
  },

  addReminder: (reminder) => {
    const newReminder: ReminderItem = {
      ...reminder,
      id: generateId('rem_')
    }
    const newReminders = [...get().reminders, newReminder]
    set({ reminders: newReminders })
    saveToStorage(STORAGE_KEYS.REMINDERS, newReminders)
    console.log('[Store] 添加提醒:', newReminder.title)
    return newReminder
  },

  updateReminder: (id, updates) => {
    const newReminders = get().reminders.map(r =>
      r.id === id ? { ...r, ...updates } : r
    )
    set({ reminders: newReminders })
    saveToStorage(STORAGE_KEYS.REMINDERS, newReminders)
    console.log('[Store] 更新提醒:', id)
  },

  toggleReminder: (id) => {
    const reminder = get().reminders.find(r => r.id === id)
    if (reminder) {
      get().updateReminder(id, { isEnabled: !reminder.isEnabled })
    }
  },

  removeReminder: (id) => {
    const newReminders = get().reminders.filter(r => r.id !== id)
    set({ reminders: newReminders })
    saveToStorage(STORAGE_KEYS.REMINDERS, newReminders)
    console.log('[Store] 删除提醒:', id)
  }
}))
