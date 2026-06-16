import React, { useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import Modal from '@/components/Modal'
import { useAppStore } from '@/store/useAppStore'
import { formatDate, getWeekdayLabel } from '@/utils/date'
import type { DoseTime, Medicine } from '@/types'
import styles from './index.module.scss'

interface WeeklyListModalProps {
  visible: boolean
  onClose: () => void
}

const timeClass: Record<DoseTime, string> = {
  morning: styles.timeMorning,
  noon: styles.timeNoon,
  evening: styles.timeEvening,
  night: styles.timeNight
}

const WeeklyListModal: React.FC<WeeklyListModalProps> = ({ visible, onClose }) => {
  const medicines = useAppStore(s => s.medicines.filter(m => m.isActive))
  const records = useAppStore(s => s.records)

  const weekData = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayDate = new Date(today)
    mondayDate.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

    const days: Array<{
      date: string
      dateLabel: string
      weekdayLabel: string
      isToday: boolean
      items: Array<{
        medicineId: string
        medicineName: string
        doseTime: DoseTime
        timeLabel: string
        timePoint: string
        dosage: string
        status: 'taken' | 'missed' | 'delayed' | 'pending'
      }>
      missedList: string[]
    }> = []

    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayDate)
      d.setDate(mondayDate.getDate() + i)
      const dateStr = formatDate(d, 'YYYY-MM-DD')
      const isToday = formatDate(today, 'YYYY-MM-DD') === dateStr

      const items: typeof days[0]['items'] = []
      const missedList: string[] = []

      medicines.forEach(med => {
        med.doses.forEach(dose => {
          const record = records.find(
            r => r.medicineId === med.id && r.date === dateStr && r.doseTime === dose.time
          )
          let status: 'taken' | 'missed' | 'delayed' | 'pending' = 'pending'
          const dayDiff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

          if (record) {
            status = record.status === 'skipped' ? 'pending' : record.status as any
            if (status === 'missed') {
              missedList.push(`${dose.timeLabel} ${med.name}${record.reason ? `（${record.reason}）` : ''}`)
            }
          } else if (dayDiff > 0) {
            status = 'missed'
            missedList.push(`${dose.timeLabel} ${med.name}`)
          }

          items.push({
            medicineId: med.id,
            medicineName: med.name,
            doseTime: dose.time,
            timeLabel: dose.timeLabel,
            timePoint: dose.timePoint,
            dosage: dose.dosage,
            status
          })
        })
      })

      days.push({
        date: dateStr,
        dateLabel: formatDate(d, 'MM月DD日'),
        weekdayLabel: '周' + getWeekdayLabel(d.getDay()),
        isToday,
        items,
        missedList
      })
    }

    return {
      startDate: days[0].dateLabel,
      endDate: days[6].dateLabel,
      days
    }
  }, [medicines, records])

  const stats = useMemo(() => {
    let total = 0
    let taken = 0
    let missed = 0
    weekData.days.forEach(d => {
      d.items.forEach(it => {
        total++
        if (it.status === 'taken' || it.status === 'delayed') taken++
        if (it.status === 'missed') missed++
      })
    })
    const rate = total > 0 ? Math.round((taken / total) * 100) : 0
    return { total, taken, missed, rate }
  }, [weekData])

  const allMissed = useMemo(() => {
    const result: string[] = []
    weekData.days.forEach(d => {
      d.missedList.forEach(m => result.push(`${d.dateLabel} ${d.weekdayLabel} ${m}`))
    })
    return result
  }, [weekData])

  const generateText = () => {
    const lines: string[] = []
    lines.push(`📋 用药清单（${weekData.startDate} - ${weekData.endDate}）`)
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━`)
    lines.push(`✅ 完成率：${stats.rate}%（${stats.taken}/${stats.total}）`)
    if (stats.missed > 0) lines.push(`❌ 漏服：${stats.missed}次`)
    lines.push('')

    weekData.days.forEach(d => {
      const dateLine = `${d.dateLabel} ${d.weekdayLabel}${d.isToday ? '（今天）' : ''}`
      lines.push(`【${dateLine}】`)

      if (d.items.length === 0) {
        lines.push('  · 无用药安排')
      } else {
        d.items.forEach(it => {
          const statusMap: Record<string, string> = {
            taken: '✓已服',
            delayed: '⏱补服',
            missed: '✗漏服',
            pending: '○待服'
          }
          lines.push(`  · ${it.timeLabel}${it.timePoint} ${it.medicineName} ${it.dosage} [${statusMap[it.status]}]`)
        })
      }
      lines.push('')
    })

    if (allMissed.length > 0) {
      lines.push('❌ 漏服记录：')
      allMissed.forEach(m => lines.push(`  · ${m}`))
    }

    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('由「健康用药」App生成')
    return lines.join('\n')
  }

  const handleCopy = () => {
    Taro.setClipboardData({
      data: generateText(),
      success: () => {
        Taro.showToast({ title: '已复制到剪贴板', icon: 'success' })
      }
    })
  }

  const handleShare = () => {
    handleCopy()
    Taro.showToast({ title: '清单已复制，可粘贴分享给家属', icon: 'none', duration: 2500 })
  }

  return (
    <Modal
      visible={visible}
      title="一周用药清单"
      onClose={onClose}
      showFooter={false}
    >
      <View className={styles.header}>
        <Text style={{ fontSize: 28, fontWeight: 600, color: '#1f2937' }}>
          📋 本周用药情况
        </Text>
        <Text className={styles.dateRange}>
          {weekData.startDate} ~ {weekData.endDate}
        </Text>
      </View>

      <View className={styles.summary}>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{stats.rate}%</Text>
          <Text className={styles.summaryLabel}>完成率</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{stats.taken}/{stats.total}</Text>
          <Text className={styles.summaryLabel}>已完成</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.summaryValue, stats.missed > 0 && styles.summaryValueWarn)}>
            {stats.missed}
          </Text>
          <Text className={styles.summaryLabel}>漏服次数</Text>
        </View>
      </View>

      {allMissed.length > 0 && (
        <View className={styles.missedSummary}>
          <Text className={styles.missedTitle}>⚠️ 本周漏服{allMissed.length}次</Text>
          {allMissed.slice(0, 3).map((m, i) => (
            <Text key={i} className={styles.missedItem}>· {m}</Text>
          ))}
          {allMissed.length > 3 && (
            <Text className={styles.missedItem}>... 另有{allMissed.length - 3}次漏服记录</Text>
          )}
        </View>
      )}

      <ScrollView scrollY style={{ maxHeight: 500 }}>
        {weekData.days.map((day, idx) => {
          const takenCount = day.items.filter(i => i.status === 'taken' || i.status === 'delayed').length
          const missedCount = day.items.filter(i => i.status === 'missed').length
          const pendingCount = day.items.filter(i => i.status === 'pending').length

          let dayStatus = ''
          if (missedCount > 0) dayStatus = 'statusBad'
          else if (pendingCount > 0) dayStatus = 'statusNormal'
          else dayStatus = 'statusPerfect'

          return (
            <View key={idx} className={styles.daySection}>
              <View className={styles.dayHeader}>
                <Text className={styles.dayTitle}>
                  {day.weekdayLabel} {day.dateLabel}
                  {day.isToday && ' （今天）'}
                </Text>
                <View className={classnames(styles.dayStatus, styles[dayStatus])}>
                  {missedCount > 0 ? `${missedCount}次漏服` : pendingCount > 0 ? `待服${pendingCount}` : '全部完成'}
                </View>
              </View>

              {day.items.length === 0 ? (
                <View className={styles.emptyDay}>无用药安排</View>
              ) : (
                <View className={styles.medicineList}>
                  {day.items.map((it, iIdx) => (
                    <View key={iIdx} className={styles.medicineRow}>
                      <View className={classnames(styles.timeBadge, timeClass[it.doseTime])}>
                        {it.timeLabel} {it.timePoint}
                      </View>
                      <View className={styles.medicineDetail}>
                        <Text className={styles.medicineName}>{it.medicineName}</Text>
                        <Text className={styles.medicineInfo}>剂量：{it.dosage}</Text>
                      </View>
                      <View className={classnames(
                        styles.statusBadge,
                        it.status === 'taken' && styles.statusTaken,
                        it.status === 'missed' && styles.statusMissed,
                        it.status === 'delayed' && styles.statusDelayed,
                        it.status === 'pending' && styles.statusPending
                      )}>
                        {it.status === 'taken' && '已服'}
                        {it.status === 'delayed' && '补服'}
                        {it.status === 'missed' && '漏服'}
                        {it.status === 'pending' && '待服'}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )
        })}
      </ScrollView>

      <View className={styles.actionRow}>
        <Button className={classnames(styles.actionBtn, styles.btnCopy)} onClick={handleCopy}>
          📋 复制清单
        </Button>
        <Button className={classnames(styles.actionBtn, styles.btnShare)} onClick={handleShare}>
          📤 分享给家属
        </Button>
      </View>
    </Modal>
  )
}

export default WeeklyListModal
