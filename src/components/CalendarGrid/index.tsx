import React, { useState, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import classnames from 'classnames'
import { generateCalendarDays, getWeekdayLabel, formatDate } from '@/utils/date'
import type { MedicineRecord } from '@/types'
import styles from './index.module.scss'

interface CalendarGridProps {
  records?: MedicineRecord[]
  selectedDate?: string
  onSelectDate?: (date: string) => void
  showStatusBar?: boolean
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  records = [],
  selectedDate,
  onSelectDate,
  showStatusBar = true
}) => {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1)
  const [selected, setSelected] = useState(selectedDate || formatDate(today, 'YYYY-MM-DD'))

  const calendarDays = useMemo(() => {
    return generateCalendarDays(currentYear, currentMonth)
  }, [currentYear, currentMonth])

  const weekdays = [0, 1, 2, 3, 4, 5, 6].map(d => getWeekdayLabel(d))

  const getDayStatus = (date: string) => {
    const dayRecords = records.filter(r => r.date === date)
    if (dayRecords.length === 0) return 'empty'

    const takenCount = dayRecords.filter(r => r.status === 'taken').length
    const missedCount = dayRecords.filter(r => r.status === 'missed').length

    if (missedCount > 0) return 'missed'
    if (takenCount === dayRecords.length) return 'taken'
    return 'partial'
  }

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(y => y - 1)
      setCurrentMonth(12)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(y => y + 1)
      setCurrentMonth(1)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  const handleSelectDay = (date: string) => {
    setSelected(date)
    onSelectDate?.(date)
  }

  return (
    <View className={styles.calendarGrid}>
      <View className={styles.header}>
        <Button className={styles.navBtn} onClick={handlePrevMonth}>‹</Button>
        <Text className={styles.monthTitle}>{currentYear}年{currentMonth}月</Text>
        <Button className={styles.navBtn} onClick={handleNextMonth}>›</Button>
      </View>

      <View className={styles.weekdayRow}>
        {weekdays.map((day, idx) => (
          <Text key={idx} className={styles.weekdayCell}>{day}</Text>
        ))}
      </View>

      <View className={styles.daysGrid}>
        {calendarDays.map((day, idx) => {
          const status = getDayStatus(day.date)
          const isSelected = day.date === selected

          return (
            <View
              key={idx}
              className={classnames(
                styles.dayCell,
                !day.isCurrentMonth && styles.dayOtherMonth,
                day.isToday && styles.dayToday,
                isSelected && styles.daySelected,
                status === 'taken' && styles.dayTaken,
                status === 'missed' && styles.dayMissed,
                status === 'partial' && styles.dayPartial,
                status === 'empty' && styles.dayEmpty
              )}
              onClick={() => day.isCurrentMonth && handleSelectDay(day.date)}
            >
              <Text className={styles.dayNumber}>{day.day}</Text>
              <View className={styles.dayDot} />
            </View>
          )
        })}
      </View>

      {showStatusBar && (
        <View className={styles.statusBar}>
          <View className={styles.statusItem}>
            <View className={classnames(styles.statusDot, styles.dotTaken)} />
            <Text className={styles.statusLabel}>全部按时</Text>
          </View>
          <View className={styles.statusItem}>
            <View className={classnames(styles.statusDot, styles.dotPartial)} />
            <Text className={styles.statusLabel}>部分完成</Text>
          </View>
          <View className={styles.statusItem}>
            <View className={classnames(styles.statusDot, styles.dotMissed)} />
            <Text className={styles.statusLabel}>有漏服</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default CalendarGrid
