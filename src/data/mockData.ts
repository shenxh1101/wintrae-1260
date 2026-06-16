import type { Medicine, MedicineRecord, ReminderItem, Caregiver, UserProfile } from '../types'

export const mockMedicines: Medicine[] = [
  {
    id: '1',
    name: '阿司匹林肠溶片',
    type: 'prescription',
    typeLabel: '处方药',
    specification: '100mg',
    manufacturer: '拜耳医药',
    stock: 28,
    unit: '片',
    warnStock: 7,
    doses: [
      { time: 'morning', timeLabel: '早', dosage: '1片', timePoint: '08:00' }
    ],
    startDate: '2026-01-15',
    notes: '饭后服用',
    isActive: true,
    createdAt: '2026-01-10'
  },
  {
    id: '2',
    name: '二甲双胍片',
    type: 'prescription',
    typeLabel: '处方药',
    specification: '0.5g',
    manufacturer: '中美上海施贵宝',
    stock: 45,
    unit: '片',
    warnStock: 10,
    doses: [
      { time: 'morning', timeLabel: '早', dosage: '1片', timePoint: '08:00' },
      { time: 'evening', timeLabel: '晚', dosage: '1片', timePoint: '20:00' }
    ],
    startDate: '2026-02-01',
    notes: '餐中服用',
    isActive: true,
    createdAt: '2026-01-25'
  },
  {
    id: '3',
    name: '钙尔奇钙片',
    type: 'health',
    typeLabel: '保健品',
    specification: '600mg',
    manufacturer: '惠氏制药',
    stock: 60,
    unit: '粒',
    warnStock: 15,
    doses: [
      { time: 'evening', timeLabel: '晚', dosage: '1粒', timePoint: '20:00' }
    ],
    startDate: '2026-03-01',
    notes: '睡前服用',
    isActive: true,
    createdAt: '2026-02-20'
  },
  {
    id: '4',
    name: '鱼油软胶囊',
    type: 'health',
    typeLabel: '保健品',
    specification: '1000mg',
    manufacturer: '汤臣倍健',
    stock: 3,
    unit: '粒',
    warnStock: 10,
    doses: [
      { time: 'noon', timeLabel: '午', dosage: '2粒', timePoint: '12:30' }
    ],
    startDate: '2026-04-01',
    notes: '随餐服用',
    isActive: true,
    createdAt: '2026-03-15'
  },
  {
    id: '5',
    name: '维生素C片',
    type: 'common',
    typeLabel: '常用药',
    specification: '100mg',
    manufacturer: '东北制药',
    stock: 100,
    unit: '片',
    warnStock: 20,
    doses: [
      { time: 'morning', timeLabel: '早', dosage: '1片', timePoint: '08:00' }
    ],
    startDate: '2026-05-01',
    isActive: true,
    createdAt: '2026-04-20'
  },
  {
    id: '6',
    name: '氨氯地平片',
    type: 'prescription',
    typeLabel: '处方药',
    specification: '5mg',
    manufacturer: '辉瑞制药',
    stock: 5,
    unit: '片',
    warnStock: 7,
    doses: [
      { time: 'morning', timeLabel: '早', dosage: '1片', timePoint: '07:00' }
    ],
    startDate: '2026-01-10',
    notes: '晨起空腹服用',
    isActive: true,
    createdAt: '2026-01-05'
  }
]

export const mockRecords: MedicineRecord[] = [
  {
    id: 'r1',
    medicineId: '1',
    medicineName: '阿司匹林肠溶片',
    date: '2026-06-16',
    doseTime: 'morning',
    doseTimeLabel: '早',
    status: 'taken',
    actualTime: '08:05',
    notes: '按时服用'
  },
  {
    id: 'r2',
    medicineId: '2',
    medicineName: '二甲双胍片',
    date: '2026-06-16',
    doseTime: 'morning',
    doseTimeLabel: '早',
    status: 'taken',
    actualTime: '08:10',
    notes: '早餐时服用'
  },
  {
    id: 'r3',
    medicineId: '5',
    medicineName: '维生素C片',
    date: '2026-06-16',
    doseTime: 'morning',
    doseTimeLabel: '早',
    status: 'taken',
    actualTime: '08:08'
  },
  {
    id: 'r4',
    medicineId: '6',
    medicineName: '氨氯地平片',
    date: '2026-06-16',
    doseTime: 'morning',
    doseTimeLabel: '早',
    status: 'delayed',
    actualTime: '07:45',
    reason: '起晚了'
  },
  {
    id: 'r5',
    medicineId: '1',
    medicineName: '阿司匹林肠溶片',
    date: '2026-06-15',
    doseTime: 'morning',
    doseTimeLabel: '早',
    status: 'taken',
    actualTime: '08:00'
  },
  {
    id: 'r6',
    medicineId: '2',
    medicineName: '二甲双胍片',
    date: '2026-06-15',
    doseTime: 'morning',
    doseTimeLabel: '早',
    status: 'taken',
    actualTime: '08:05'
  },
  {
    id: 'r7',
    medicineId: '2',
    medicineName: '二甲双胍片',
    date: '2026-06-15',
    doseTime: 'evening',
    doseTimeLabel: '晚',
    status: 'missed',
    reason: '忘记了'
  },
  {
    id: 'r8',
    medicineId: '3',
    medicineName: '钙尔奇钙片',
    date: '2026-06-15',
    doseTime: 'evening',
    doseTimeLabel: '晚',
    status: 'taken',
    actualTime: '20:00'
  }
]

export const mockReminders: ReminderItem[] = [
  {
    id: 'rem1',
    type: 'medicine',
    typeLabel: '用药提醒',
    title: '早间用药',
    date: '2026-06-16',
    time: '08:00',
    description: '阿司匹林、二甲双胍、维生素C、氨氯地平',
    isEnabled: true,
    repeat: 'daily'
  },
  {
    id: 'rem2',
    type: 'medicine',
    typeLabel: '用药提醒',
    title: '午间用药',
    date: '2026-06-16',
    time: '12:30',
    description: '鱼油软胶囊',
    isEnabled: true,
    repeat: 'daily'
  },
  {
    id: 'rem3',
    type: 'medicine',
    typeLabel: '用药提醒',
    title: '晚间用药',
    date: '2026-06-16',
    time: '20:00',
    description: '二甲双胍、钙片',
    isEnabled: true,
    repeat: 'daily'
  },
  {
    id: 'rem4',
    type: 'visit',
    typeLabel: '复诊提醒',
    title: '心内科复诊',
    date: '2026-06-20',
    time: '09:30',
    description: '市人民医院心内科，张医生',
    isEnabled: true,
    repeat: 'monthly'
  },
  {
    id: 'rem5',
    type: 'lab',
    typeLabel: '化验提醒',
    title: '血糖检测',
    date: '2026-06-18',
    time: '07:00',
    description: '空腹血糖检测',
    isEnabled: true,
    repeat: 'weekly'
  },
  {
    id: 'rem6',
    type: 'temporary',
    typeLabel: '临时加药',
    title: '补充服用',
    date: '2026-06-17',
    time: '14:00',
    description: '昨天漏服的二甲双胍补服',
    isEnabled: true,
    repeat: 'once'
  }
]

export const mockCaregivers: Caregiver[] = [
  {
    id: 'c1',
    name: '王女士',
    relationship: '女儿',
    phone: '138****5678',
    isShareEnabled: true
  },
  {
    id: 'c2',
    name: '李先生',
    relationship: '儿子',
    phone: '139****1234',
    isShareEnabled: false
  }
]

export const mockUserProfile: UserProfile = {
  name: '张大爷',
  age: 68,
  gender: '男',
  diseases: ['高血压', '糖尿病', '高血脂']
}
