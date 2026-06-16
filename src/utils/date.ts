export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
}

export const getTodayStr = (): string => {
  return formatDate(new Date(), 'YYYY-MM-DD')
}

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate()
}

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month - 1, 1).getDay()
}

export const getWeekdayLabel = (day: number): string => {
  const labels = ['日', '一', '二', '三', '四', '五', '六']
  return labels[day]
}

export const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2
}

export const isToday = (dateStr: string): boolean => {
  return dateStr === getTodayStr()
}

export const getRelativeDateLabel = (dateStr: string): string => {
  const today = getTodayStr()
  if (dateStr === today) return '今天'

  const d = new Date(dateStr)
  const t = new Date(today)
  const diff = Math.floor((t.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

  if (diff === 1) return '昨天'
  if (diff === -1) return '明天'
  if (diff > 1 && diff < 7) return `${diff}天前`
  if (diff < -1 && diff > -7) return `${Math.abs(diff)}天后`

  return formatDate(d, 'MM月DD日')
}

export const generateCalendarDays = (year: number, month: number): Array<{
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
}> => {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = getTodayStr()

  const days: Array<{
    date: string
    day: number
    isCurrentMonth: boolean
    isToday: boolean
  }> = []

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = formatDate(new Date(prevYear, prevMonth - 1, day), 'YYYY-MM-DD')
    days.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: date === today
    })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = formatDate(new Date(year, month - 1, i), 'YYYY-MM-DD')
    days.push({
      date,
      day: i,
      isCurrentMonth: true,
      isToday: date === today
    })
  }

  const remaining = 42 - days.length
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year

  for (let i = 1; i <= remaining; i++) {
    const date = formatDate(new Date(nextYear, nextMonth - 1, i), 'YYYY-MM-DD')
    days.push({
      date,
      day: i,
      isCurrentMonth: false,
      isToday: date === today
    })
  }

  return days
}
