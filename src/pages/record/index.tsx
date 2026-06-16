import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { mockRecords } from '@/data/mockData'
import CalendarGrid from '@/components/CalendarGrid'
import EmptyState from '@/components/EmptyState'
import type { MedicineRecord } from '@/types'
import { formatDate, getRelativeDateLabel, getTodayStr } from '@/utils/date'
import styles from './index.module.scss'

type TabType = 'calendar' | 'records' | 'reaction'

const RecordPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('calendar')
  const [records] = useState<MedicineRecord[]>(mockRecords)
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr())

  const stats = useMemo(() => {
    const thisMonth = formatDate(new Date(), 'YYYY-MM')
    const monthRecords = records.filter(r => r.date.startsWith(thisMonth))
    const totalDoses = records.length
    const takenDoses = records.filter(r => r.status === 'taken').length
    const missedDoses = records.filter(r => r.status === 'missed').length
    const rate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0

    return {
      streak: 15,
      monthRate: rate,
      missedCount: missedDoses
    }
  }, [records])

  const groupedRecords = useMemo(() => {
    const groups: Record<string, MedicineRecord[]> = {}
    records.forEach(record => {
      if (!groups[record.date]) {
        groups[record.date] = []
      }
      groups[record.date].push(record)
    })

    return Object.entries(groups)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, items]) => ({
        date,
        items,
        status: items.every(r => r.status === 'taken')
          ? 'allDone'
          : items.some(r => r.status === 'missed')
            ? 'missed'
            : 'partial'
      }))
  }, [records])

  const reactions = useMemo(() => [
    {
      id: 1,
      date: '2026-06-14',
      level: 'mild',
      levelLabel: '轻微',
      symptoms: ['头晕', '恶心'],
      description: '早上吃完药后有点头晕，休息半小时后好转。可能是空腹吃药的原因。'
    },
    {
      id: 2,
      date: '2026-06-10',
      level: 'moderate',
      levelLabel: '中度',
      symptoms: ['胃部不适', '食欲下降'],
      description: '连续两天感觉胃部不适，食欲不好。咨询医生后建议饭后服药。'
    }
  ], [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken': return '✓'
      case 'missed': return '✗'
      case 'delayed': return '⏱'
      case 'skipped': return '⊘'
      default: return '?'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'taken': return '已服用'
      case 'missed': return '漏服'
      case 'delayed': return '补服'
      case 'skipped': return '跳过'
      default: return status
    }
  }

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
    console.log('[Record] 选择日期:', date)
  }

  const handleAddReaction = () => {
    Taro.showToast({ title: '添加服药反应功能开发中', icon: 'none' })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>服药记录</Text>
        <View className={styles.tabBar}>
          <View
            className={classnames(
              styles.tabItem,
              activeTab === 'calendar' && styles.tabItemActive
            )}
            onClick={() => setActiveTab('calendar')}
          >
            日历
          </View>
          <View
            className={classnames(
              styles.tabItem,
              activeTab === 'records' && styles.tabItemActive
            )}
            onClick={() => setActiveTab('records')}
          >
            记录
          </View>
          <View
            className={classnames(
              styles.tabItem,
              activeTab === 'reaction' && styles.tabItemActive
            )}
            onClick={() => setActiveTab('reaction')}
          >
            反应
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{stats.streak}</Text>
            <Text className={styles.statLabel}>连续天数</Text>
          </View>
          <View className={styles.statCard}>
            <Text
              className={classnames(
                styles.statValue,
                stats.monthRate < 80 && styles.statValueWarning
              )}
            >
              {stats.monthRate}%
            </Text>
            <Text className={styles.statLabel}>本月完成率</Text>
          </View>
          <View className={styles.statCard}>
            <Text
              className={classnames(
                styles.statValue,
                styles.statValueError
              )}
            >
              {stats.missedCount}
            </Text>
            <Text className={styles.statLabel}>漏服次数</Text>
          </View>
        </View>

        {activeTab === 'calendar' && (
          <View className={styles.calendarSection}>
            <CalendarGrid
              records={records}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              showStatusBar
            />
          </View>
        )}

        {activeTab === 'records' && (
          <View className={styles.recordsSection}>
            {groupedRecords.length === 0 ? (
              <EmptyState
                icon="📋"
                text="暂无服药记录"
                subText="开始服药后，记录将显示在这里"
              />
            ) : (
              groupedRecords.map(group => (
                <View key={group.date} className={styles.dateGroup}>
                  <View className={styles.dateHeader}>
                    <Text className={styles.dateText}>
                      {getRelativeDateLabel(group.date)} · {formatDate(group.date, 'MM月DD日')}
                    </Text>
                    <View
                      className={classnames(
                        styles.dateStatus,
                        group.status === 'allDone' && styles.statusAllDone,
                        group.status === 'partial' && styles.statusPartial,
                        group.status === 'missed' && styles.statusMissed
                      )}
                    >
                      {group.status === 'allDone' && '全部完成'}
                      {group.status === 'partial' && '部分完成'}
                      {group.status === 'missed' && '有漏服'}
                    </View>
                  </View>
                  <View className={styles.recordList}>
                    {group.items.map(record => (
                      <View key={record.id} className={styles.recordItem}>
                        <View
                          className={classnames(
                            styles.statusIcon,
                            record.status === 'taken' && styles.statusTaken,
                            record.status === 'missed' && styles.statusMissed,
                            record.status === 'delayed' && styles.statusDelayed,
                            record.status === 'skipped' && styles.statusSkipped
                          )}
                        >
                          {getStatusIcon(record.status)}
                        </View>
                        <View className={styles.recordInfo}>
                          <Text className={styles.recordName}>{record.medicineName}</Text>
                          <Text className={styles.recordMeta}>
                            {record.doseTimeLabel} · {getStatusText(record.status)}
                          </Text>
                          {record.reason && (
                            <Text className={styles.recordReason}>原因：{record.reason}</Text>
                          )}
                        </View>
                        <Text className={styles.recordTime}>
                          {record.actualTime || '--:--'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'reaction' && (
          <View className={styles.reactionSection}>
            {reactions.map(reaction => (
              <View key={reaction.id} className={styles.reactionCard}>
                <View className={styles.reactionHeader}>
                  <Text className={styles.reactionDate}>{reaction.date}</Text>
                  <View
                    className={classnames(
                      styles.reactionLevel,
                      reaction.level === 'mild' && styles.levelMild,
                      reaction.level === 'moderate' && styles.levelModerate,
                      reaction.level === 'severe' && styles.levelSevere
                    )}
                  >
                    {reaction.levelLabel}
                  </View>
                </View>
                <View className={styles.reactionSymptoms}>
                  {reaction.symptoms.map((symptom, idx) => (
                    <View key={idx} className={styles.symptomTag}>
                      {symptom}
                    </View>
                  ))}
                </View>
                <Text className={styles.reactionDesc}>{reaction.description}</Text>
              </View>
            ))}
            <Button className={styles.addReactionBtn} onClick={handleAddReaction}>
              + 记录服药反应
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default RecordPage
