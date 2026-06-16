import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store/useAppStore'
import CalendarGrid from '@/components/CalendarGrid'
import EmptyState from '@/components/EmptyState'
import AddRecordModal from '@/components/AddRecordModal'
import type { MedicineRecord } from '@/types'
import { formatDate, getRelativeDateLabel, getTodayStr } from '@/utils/date'
import styles from './index.module.scss'

type TabType = 'calendar' | 'records' | 'reaction'

const RecordPage: React.FC = () => {
  const records = useAppStore(s => s.records)
  const initStore = useAppStore(s => s.initStore)

  const [activeTab, setActiveTab] = useState<TabType>('calendar')
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr())
  const [showAddModal, setShowAddModal] = useState(false)

  useDidShow(() => {
    initStore()
  })

  const stats = useMemo(() => {
    let streak = 0
    const dates = new Set(records.filter(r => r.status === 'taken').map(r => r.date))
    for (let i = 0; i < 365; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = formatDate(d, 'YYYY-MM-DD')
      if (dates.has(dateStr)) streak++
      else if (i > 0) break
    }

    const thisMonth = formatDate(new Date(), 'YYYY-MM')
    const monthRecords = records.filter(r => r.date.startsWith(thisMonth))
    const totalDoses = monthRecords.length
    const takenDoses = monthRecords.filter(r => r.status === 'taken' || r.status === 'delayed').length
    const missedDoses = records.filter(r => r.status === 'missed').length
    const rate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0

    return {
      streak: Math.max(0, streak),
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
        status: items.every(r => r.status === 'taken' || r.status === 'delayed')
          ? 'allDone'
          : items.some(r => r.status === 'missed')
            ? 'missed'
            : 'partial'
      }))
  }, [records])

  const reactions = useMemo(() => {
    const result = records
      .filter(r => r.reaction)
      .map(r => {
        const match = r.reaction!.match(/\[(.+?)\]\s*(.+?)(?:\s*-\s*(.+))?$/)
        let level = 'mild'
        let levelLabel = '轻微'
        let symptoms: string[] = []
        let desc = ''

        if (match) {
          levelLabel = match[1]
          level = levelLabel.includes('严重') ? 'severe' : levelLabel.includes('中') ? 'moderate' : 'mild'
          const rest = match[2] + (match[3] ? ' - ' + match[3] : '')
          const parts = rest.split(' - ')
          symptoms = parts[0].split(/[、,，]/).map(s => s.trim()).filter(Boolean)
          desc = parts[1] || ''
        } else {
          symptoms = [r.reaction!.slice(0, 20)]
        }

        return {
          id: r.id,
          date: r.date,
          level,
          levelLabel,
          symptoms,
          description: desc || `${r.medicineName} - ${r.doseTimeLabel}`
        }
      })
    return result
  }, [records])

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
    setShowAddModal(true)
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
            <Text className={styles.statLabel}>累计漏服</Text>
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
            <Button
              className={styles.addReactionBtn}
              onClick={handleAddReaction}
              style={{
                marginTop: 24,
                width: '100%',
                height: 80,
                background: 'rgba(34,197,94,0.1)',
                color: '#22c55e',
                borderRadius: 48,
                fontWeight: 500,
                fontSize: 28,
                border: 'none'
              }}
            >
              + 补录服药记录 / 漏服 / 补服
            </Button>
          </View>
        )}

        {activeTab === 'records' && (
          <View className={styles.recordsSection}>
            {groupedRecords.length === 0 ? (
              <EmptyState
                icon="📋"
                text="暂无服药记录"
                subText="开始服药后，记录将显示在这里"
                actionText="补录记录"
                onAction={handleAddReaction}
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
                            {record.reaction && ' · 有服药反应'}
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
            {reactions.length === 0 ? (
              <EmptyState
                icon="💊"
                text="暂无服药反应记录"
                subText="如有身体不适，可在此记录以便就医时告知医生"
                actionText="记录反应"
                onAction={handleAddReaction}
              />
            ) : (
              reactions.map(reaction => (
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
              ))
            )}
            <Button
              className={styles.addReactionBtn}
              onClick={handleAddReaction}
              style={{
                width: '100%',
                height: 80,
                background: 'rgba(139,92,246,0.1)',
                color: '#8b5cf6',
                borderRadius: 48,
                fontWeight: 500,
                fontSize: 28,
                border: 'none',
                marginTop: 16
              }}
            >
              + 记录服药反应
            </Button>
          </View>
        )}
      </ScrollView>

      <AddRecordModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        defaultDate={selectedDate}
      />
    </View>
  )
}

export default RecordPage
