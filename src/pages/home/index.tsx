import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { mockMedicines, mockRecords } from '@/data/mockData'
import { getTodayStr, formatDate } from '@/utils/date'
import StatCard from '@/components/StatCard'
import SectionHeader from '@/components/SectionHeader'
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
  const [todayRecords, setTodayRecords] = useState<MedicineRecord[]>([])
  const todayStr = getTodayStr()

  useEffect(() => {
    const todayRecs = mockRecords.filter(r => r.date === todayStr)
    setTodayRecords(todayRecs)
  }, [todayStr])

  useDidShow(() => {
    console.log('[Home] 页面显示')
  })

  const todayDoses = useMemo(() => {
    const activeMedicines = mockMedicines.filter(m => m.isActive)
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
  }, [todayRecords])

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

  const stats = useMemo(() => {
    const total = todayDoses.length
    const taken = todayDoses.filter(d => d.isTaken).length
    const progress = total > 0 ? Math.round((taken / total) * 360) : 0
    const percent = total > 0 ? Math.round((taken / total) * 100) : 0

    const lowStockMeds = mockMedicines.filter(
      m => m.isActive && m.stock <= m.warnStock
    )

    return {
      total,
      taken,
      progress,
      percent,
      streak: 15,
      weekRate: 87,
      lowStockCount: lowStockMeds.length,
      lowStockMeds
    }
  }, [todayDoses])

  const handleToggleDose = (item: TodayDoseItem) => {
    if (item.isTaken) {
      Taro.showToast({ title: '已取消打卡', icon: 'none' })
      setTodayRecords(prev => prev.filter(r => r.id !== item.recordId))
    } else {
      const newRecord: MedicineRecord = {
        id: `r_${Date.now()}`,
        medicineId: item.medicine.id,
        medicineName: item.medicine.name,
        date: todayStr,
        doseTime: item.time,
        doseTimeLabel: item.timeLabel,
        status: 'taken',
        actualTime: formatDate(new Date(), 'HH:mm')
      }
      setTodayRecords(prev => [...prev, newRecord])
      Taro.showToast({ title: '打卡成功', icon: 'success' })
    }
  }

  const handleQuickAction = (action: string) => {
    Taro.showToast({ title: `${action}功能开发中`, icon: 'none' })
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
            subText="较上周提升3%"
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
    </ScrollView>
  )
}

export default HomePage
