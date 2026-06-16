import React, { useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store/useAppStore'
import { getTodayStr, formatDate } from '@/utils/date'
import StatCard from '@/components/StatCard'
import WeeklyListModal from '@/components/WeeklyListModal'
import AddMedicineModal from '@/components/AddMedicineModal'
import AddRecordModal from '@/components/AddRecordModal'
import type { Medicine, DoseTime, MedicineRecord } from '@/types'
import styles from './index.module.scss'

interface TodayDoseItem {
  medicine: Medicine
  time: DoseTime
  timeLabel: string
  timePoint: string
  dosage: string
  isTaken: boolean
  recordId?: string
}

interface DoseGroup {
  time: DoseTime
  timeLabel: string
  timePoint: string
  items: TodayDoseItem[]
  isAllTaken: boolean
}

const HomePage: React.FC = () => {
  const medicines = useAppStore(s => s.medicines)
  const records = useAppStore(s => s.records)
  const addRecord = useAppStore(s => s.addRecord)
  const removeRecord = useAppStore(s => s.removeRecord)
  const decreaseMedicineStock = useAppStore(s => s.decreaseMedicineStock)
  const updateMedicine = useAppStore(s => s.updateMedicine)
  const initStore = useAppStore(s => s.initStore)

  const [showWeeklyList, setShowWeeklyList] = React.useState(false)
  const [showAddMedicine, setShowAddMedicine] = React.useState(false)
  const [showAddRecord, setShowAddRecord] = React.useState(false)

  const todayStr = getTodayStr()

  useDidShow(() => {
    initStore()
    console.log('[Home] 页面显示，记录数:', records.length)
  })

  const todayRecords = useMemo(() => {
    return records.filter(r => r.date === todayStr)
  }, [records, todayStr])

  const todayDoses = useMemo(() => {
    const activeMedicines = medicines.filter(m => m.isActive)
    const doses: TodayDoseItem[] = []

    activeMedicines.forEach(medicine => {
      medicine.doses.forEach(dose => {
        const record = todayRecords.find(
          r => r.medicineId === medicine.id && r.doseTime === dose.time
        )
        doses.push({
          medicine,
          time: dose.time,
          timeLabel: dose.timeLabel,
          timePoint: dose.timePoint,
          dosage: dose.dosage,
          isTaken: record?.status === 'taken' || record?.status === 'delayed',
          recordId: record?.id
        })
      })
    })

    return doses
  }, [todayRecords, medicines])

  const doseGroups = useMemo((): DoseGroup[] => {
    const timeOrder: DoseTime[] = ['morning', 'noon', 'evening', 'night']
    const timeLabels: Record<DoseTime, string> = {
      morning: '早',
      noon: '午',
      evening: '晚',
      night: '夜'
    }

    const groups: DoseGroup[] = []

    timeOrder.forEach(time => {
      const items = todayDoses
        .filter(d => d.time === time)
        .sort((a, b) => a.timePoint.localeCompare(b.timePoint))

      if (items.length > 0) {
        const timePoint = items[0]?.timePoint || ''
        groups.push({
          time,
          timeLabel: timeLabels[time],
          timePoint,
          items,
          isAllTaken: items.every(i => i.isTaken)
        })
      }
    })

    return groups
  }, [todayDoses])

  const streakDays = useMemo(() => {
    let count = 0
    const dates = new Set(records.filter(r => r.status === 'taken').map(r => r.date))
    for (let i = 0; i < 365; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = formatDate(d, 'YYYY-MM-DD')
      if (dates.has(dateStr)) count++
      else if (i > 0) break
    }
    return Math.max(1, count)
  }, [records])

  const weekRate = useMemo(() => {
    const today = new Date()
    let total = 0
    let taken = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = formatDate(d, 'YYYY-MM-DD')
      medicines.filter(m => m.isActive).forEach(m => {
        m.doses.forEach(() => {
          total++
        })
      })
      const dayRecs = records.filter(r => r.date === dateStr)
      taken += dayRecs.filter(r => r.status === 'taken' || r.status === 'delayed').length
    }
    return total > 0 ? Math.round((taken / total) * 100) : 0
  }, [medicines, records])

  const stats = useMemo(() => {
    const total = todayDoses.length
    const taken = todayDoses.filter(d => d.isTaken).length
    const progress = total > 0 ? Math.round((taken / total) * 360) : 0
    const percent = total > 0 ? Math.round((taken / total) * 100) : 0

    const lowStockMeds = medicines.filter(
      m => m.isActive && m.stock <= m.warnStock
    )

    return {
      total,
      taken,
      progress,
      percent,
      streak: streakDays,
      weekRate,
      lowStockCount: lowStockMeds.length,
      lowStockMeds
    }
  }, [todayDoses, medicines, streakDays, weekRate])

  const handleToggleDose = (item: TodayDoseItem) => {
    if (item.isTaken && item.recordId) {
      removeRecord(item.recordId)
      updateMedicine(item.medicine.id, {
        stock: item.medicine.stock + 1
      })
      Taro.showToast({ title: '已取消打卡', icon: 'none' })
      console.log('[Home] 取消打卡:', item.medicine.name, item.timeLabel)
    } else {
      addRecord({
        medicineId: item.medicine.id,
        medicineName: item.medicine.name,
        date: todayStr,
        doseTime: item.time,
        doseTimeLabel: item.timeLabel,
        status: 'taken',
        actualTime: formatDate(new Date(), 'HH:mm')
      })
      decreaseMedicineStock(item.medicine.id, 1)
      Taro.showToast({ title: '打卡成功', icon: 'success' })
      console.log('[Home] 打卡:', item.medicine.name, item.timeLabel)
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case '拍照录入':
        setShowAddMedicine(true)
        break
      case '临时加药':
        Taro.switchTab?.({ url: '/pages/reminder/index' })
        break
      case '服药反应':
        setShowAddRecord(true)
        break
      case '一周清单':
        setShowWeeklyList(true)
        break
      default:
        Taro.showToast({ title: `${action}功能开发中`, icon: 'none' })
    }
  }

  const handleBuyStock = (medicineName: string) => {
    Taro.showToast({ title: `已添加${medicineName}到购物清单`, icon: 'none' })
  }

  const getTimeClass = (time: string) => {
    switch (time) {
      case 'morning': return styles.timeMorning
      case 'noon': return styles.timeNoon
      case 'evening': return styles.timeEvening
      case 'night': return styles.timeNight
      default: return ''
    }
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.heroSection}>
        <View className={styles.heroBgCircle} />
        <View className={styles.heroBgCircle2} />
        <Text className={styles.greeting}>早上好，张大爷</Text>
        <View className={styles.streakRow}>
          <Text className={styles.streakNumber}>{stats.streak}</Text>
          <Text className={styles.streakText}>天连续服药</Text>
        </View>
        <Text className={styles.heroSub}>坚持就是胜利，今天也要记得按时吃药哦～</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.todayCard}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardTitle}>💊 今日用药</Text>
            <Text className={styles.dateText}>{todayStr}</Text>
          </View>

          <View className={styles.progressRow}>
            <View
              className={styles.progressRing}
              style={{ ['--progress' as any]: `${stats.progress}deg` }}
            >
              <View className={styles.progressInner}>
                <Text className={styles.progressText}>{stats.percent}%</Text>
              </View>
            </View>
            <View className={styles.progressInfo}>
              <Text className={styles.progressDesc}>
                {stats.taken === stats.total && stats.total > 0
                  ? '太棒了，今日用药全部完成！'
                  : `还有 ${stats.total - stats.taken} 次用药等待打卡`}
              </Text>
              <Text className={styles.progressCount}>
                共 {stats.total} 次 · 已完成 {stats.taken} 次
              </Text>
            </View>
          </View>

          <View className={styles.doseGroups}>
            {doseGroups.map(group => (
              <View key={group.time} className={styles.doseGroup}>
                <View className={styles.doseGroupHeader}>
                  <View className={styles.doseTimeLabel}>
                    <View className={classnames(styles.timeBadge, getTimeClass(group.time))}>
                      {group.timeLabel} {group.timePoint}
                    </View>
                  </View>
                  <View
                    className={classnames(
                      styles.doseStatus,
                      group.isAllTaken ? styles.statusDone : styles.statusPending
                    )}
                  >
                    {group.isAllTaken ? '已完成' : `${group.items.filter(i => i.isTaken).length}/${group.items.length}`}
                  </View>
                </View>

                <View className={styles.doseItems}>
                  {group.items.map((item, idx) => (
                    <View
                      key={`${item.medicine.id}-${item.time}-${idx}`}
                      className={classnames(
                        styles.doseItem,
                        item.isTaken && styles.medicineTaken
                      )}
                      onClick={() => handleToggleDose(item)}
                    >
                      <View
                        className={classnames(
                          styles.checkbox,
                          item.isTaken && styles.checkboxChecked
                        )}
                      >
                        {item.isTaken && <Text className={styles.checkIcon}>✓</Text>}
                      </View>
                      <View className={styles.medicineInfo}>
                        <Text className={styles.medicineName}>{item.medicine.name}</Text>
                        <Text className={styles.medicineDosage}>{item.dosage} · {item.medicine.specification}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.quickActions}>
          <View className={styles.actionItem} onClick={() => handleQuickAction('拍照录入')}>
            <View className={classnames(styles.actionIcon, styles.iconGreen)}>📷</View>
            <Text className={styles.actionLabel}>拍照录入</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleQuickAction('临时加药')}>
            <View className={classnames(styles.actionIcon, styles.iconBlue)}>➕</View>
            <Text className={styles.actionLabel}>临时加药</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleQuickAction('服药反应')}>
            <View className={classnames(styles.actionIcon, styles.iconOrange)}>📝</View>
            <Text className={styles.actionLabel}>服药反应</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleQuickAction('一周清单')}>
            <View className={classnames(styles.actionIcon, styles.iconPurple)}>📋</View>
            <Text className={styles.actionLabel}>一周清单</Text>
          </View>
        </View>

        <View className={styles.statsGrid}>
          <StatCard
            label="本周完成率"
            value={stats.weekRate}
            unit="%"
            subText={stats.weekRate >= 80 ? '表现优秀，继续保持！' : '还有提升空间'}
            variant="primary"
            icon="📈"
          />
          <StatCard
            label="库存预警"
            value={stats.lowStockCount}
            unit="种"
            subText="药品库存不足"
            variant="warning"
            icon="⚠️"
          />
        </View>

        {stats.lowStockMeds.length > 0 && (
          <View className={styles.sectionCard}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.titleIcon}>🔔</Text>
              库存预警
            </Text>
            <View className={styles.stockWarnList}>
              {stats.lowStockMeds.slice(0, 3).map(med => (
                <View key={med.id} className={styles.stockWarnItem}>
                  <View className={styles.stockWarnInfo}>
                    <Text className={styles.stockWarnName}>{med.name}</Text>
                    <Text className={styles.stockWarnDesc}>
                      仅剩 {med.stock} {med.unit}，低于预警线 {med.warnStock} {med.unit}
                    </Text>
                  </View>
                  <Button
                    className={styles.stockWarnBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBuyStock(med.name)
                    }}
                  >
                    去购买
                  </Button>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <WeeklyListModal
        visible={showWeeklyList}
        onClose={() => setShowWeeklyList(false)}
      />

      <AddMedicineModal
        visible={showAddMedicine}
        onClose={() => setShowAddMedicine(false)}
        mode="photo"
      />

      <AddRecordModal
        visible={showAddRecord}
        onClose={() => setShowAddRecord(false)}
      />
    </ScrollView>
  )
}

export default HomePage
