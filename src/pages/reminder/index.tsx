import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store/useAppStore'
import { mockCaregivers } from '@/data/mockData'
import EmptyState from '@/components/EmptyState'
import AddReminderModal from '@/components/AddReminderModal'
import type { ReminderItem, Caregiver } from '@/types'
import { getRelativeDateLabel } from '@/utils/date'
import styles from './index.module.scss'

type FilterType = 'all' | 'medicine' | 'visit' | 'lab' | 'temporary'

const ReminderPage: React.FC = () => {
  const reminders = useAppStore(s => s.reminders)
  const toggleReminder = useAppStore(s => s.toggleReminder)
  const initStore = useAppStore(s => s.initStore)

  const [caregivers] = useState<Caregiver[]>(mockCaregivers)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addType, setAddType] = useState<ReminderItem['type']>('visit')

  useDidShow(() => {
    initStore()
  })

  const filterOptions = [
    { key: 'all', label: '全部' },
    { key: 'medicine', label: '用药' },
    { key: 'visit', label: '复诊' },
    { key: 'lab', label: '化验' },
    { key: 'temporary', label: '临时' }
  ]

  const filteredReminders = useMemo(() => {
    if (filterType === 'all') return reminders
    return reminders.filter(r => r.type === filterType)
  }, [reminders, filterType])

  const sortedReminders = useMemo(() => {
    return [...filteredReminders].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.time.localeCompare(b.time)
    })
  }, [filteredReminders])

  const sharedCount = useMemo(
    () => caregivers.filter(c => c.isShareEnabled).length,
    [caregivers]
  )

  const getIconClass = (type: string) => {
    switch (type) {
      case 'medicine': return styles.iconMedicine
      case 'visit': return styles.iconVisit
      case 'lab': return styles.iconLab
      case 'temporary': return styles.iconTemporary
      default: return ''
    }
  }

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'medicine': return styles.badgeMedicine
      case 'visit': return styles.badgeVisit
      case 'lab': return styles.badgeLab
      case 'temporary': return styles.badgeTemporary
      default: return ''
    }
  }

  const getIconEmoji = (type: string) => {
    switch (type) {
      case 'medicine': return '💊'
      case 'visit': return '🏥'
      case 'lab': return '🧪'
      case 'temporary': return '⏰'
      default: return '📌'
    }
  }

  const getRepeatText = (repeat?: string) => {
    switch (repeat) {
      case 'daily': return '每天'
      case 'weekly': return '每周'
      case 'monthly': return '每月'
      case 'once': return '仅一次'
      default: return '不重复'
    }
  }

  const handleAddReminder = () => {
    Taro.showActionSheet({
      itemList: ['用药提醒', '复诊提醒', '化验提醒', '临时加药'],
      success: (res) => {
        const types: ReminderItem['type'][] = ['medicine', 'visit', 'lab', 'temporary']
        setAddType(types[res.tapIndex])
        setTimeout(() => setShowAddModal(true), 100)
      }
    })
  }

  const handleToggleReminder = (id: string) => {
    toggleReminder(id)
    const reminder = reminders.find(r => r.id === id)
    if (reminder) {
      Taro.showToast({
        title: reminder.isEnabled ? '已关闭提醒' : '已开启提醒',
        icon: 'none'
      })
    }
  }

  const handleReminderClick = (reminder: ReminderItem) => {
    console.log('[Reminder] 点击提醒:', reminder.title)
    Taro.showToast({ title: `查看${reminder.title}详情`, icon: 'none' })
  }

  const handleShareToggle = (caregiver: Caregiver) => {
    Taro.showToast({
      title: caregiver.isShareEnabled ? '已取消共享' : '已开启共享',
      icon: 'none'
    })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>提醒中心</Text>
        <ScrollView scrollX className={styles.tabBar}>
          {filterOptions.map(opt => (
            <View
              key={opt.key}
              className={classnames(
                styles.tabItem,
                filterType === opt.key && styles.tabItemActive
              )}
              onClick={() => setFilterType(opt.key as FilterType)}
            >
              {opt.label}
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView scrollY className={styles.content}>
        {sharedCount > 0 && (
          <View className={styles.shareSection}>
            <Text className={styles.shareTitle}>
              👨‍👩‍👧 照护人共享（{sharedCount}位）
            </Text>
            <View className={styles.caregiverList}>
              {caregivers.map(cg => (
                <View key={cg.id} className={styles.caregiverItem}>
                  <View className={styles.caregiverAvatar}>
                    {cg.name[0]}
                  </View>
                  <View className={styles.caregiverInfo}>
                    <Text className={styles.caregiverName}>{cg.name}</Text>
                    <Text className={styles.caregiverRelation}>
                      {cg.relationship} · {cg.phone}
                    </Text>
                  </View>
                  <View
                    className={classnames(
                      styles.switch,
                      cg.isShareEnabled && styles.switchOn
                    )}
                    onClick={() => handleShareToggle(cg)}
                  >
                    <View className={styles.switchDot} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.reminderList}>
          {sortedReminders.length === 0 ? (
            <EmptyState
              icon="⏰"
              text="暂无提醒"
              subText="点击右下角按钮添加提醒"
              actionText="添加提醒"
              onAction={handleAddReminder}
            />
          ) : (
            sortedReminders.map(reminder => (
              <View
                key={reminder.id}
                className={styles.reminderCard}
                onClick={() => handleReminderClick(reminder)}
              >
                <View className={styles.reminderHeader}>
                  <View className={classnames(styles.reminderIcon, getIconClass(reminder.type))}>
                    {getIconEmoji(reminder.type)}
                  </View>
                  <View className={styles.reminderInfo}>
                    <View style={{ display: 'flex', alignItems: 'center' }}>
                      <View className={classnames(styles.typeBadge, getBadgeClass(reminder.type))}>
                        {reminder.typeLabel}
                      </View>
                      {!reminder.isEnabled && (
                        <View
                          className={styles.typeBadge}
                          style={{ background: 'rgba(156,163,175,0.1)', color: '#9ca3af' }}
                        >
                          已关闭
                        </View>
                      )}
                    </View>
                    <Text className={styles.reminderTitle}>{reminder.title}</Text>
                    <View className={styles.reminderTime}>
                      <Text className={styles.timeText}>{reminder.time}</Text>
                      <View className={styles.repeatTag}>
                        {getRelativeDateLabel(reminder.date)}
                      </View>
                      <View className={styles.repeatTag}>
                        {getRepeatText(reminder.repeat)}
                      </View>
                    </View>
                  </View>
                </View>

                {reminder.description && (
                  <Text className={styles.reminderDesc}>{reminder.description}</Text>
                )}

                <View className={styles.reminderFooter}>
                  <View className={styles.shareInfo}>
                    <Text className={styles.shareIcon}>👥</Text>
                    <Text>
                      已共享给 {sharedCount} 位照护人
                      {reminder.isEnabled ? '' : '（提醒已关闭）'}
                    </Text>
                  </View>
                  <View
                    className={classnames(
                      styles.switch,
                      reminder.isEnabled && styles.switchOn
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleReminder(reminder.id)
                    }}
                  >
                    <View className={styles.switchDot} />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View className={styles.addBtn} onClick={handleAddReminder}>
        <Text className={styles.addIcon}>+</Text>
        <Text className={styles.addText}>添加</Text>
      </View>

      <AddReminderModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        defaultType={addType}
      />
    </View>
  )
}

export default ReminderPage
