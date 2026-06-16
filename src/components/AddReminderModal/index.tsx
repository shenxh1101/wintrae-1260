import React, { useState, useEffect } from 'react'
import { View, Text, Input, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import Modal from '@/components/Modal'
import { useAppStore } from '@/store/useAppStore'
import type { ReminderItem } from '@/types'
import styles from './index.module.scss'

interface AddReminderModalProps {
  visible: boolean
  onClose: () => void
  defaultType?: ReminderItem['type']
}

const typeConfig = {
  medicine: { label: '用药提醒', icon: '💊', defaultTitle: '用药提醒' },
  visit: { label: '复诊提醒', icon: '🏥', defaultTitle: '医院复诊' },
  lab: { label: '化验提醒', icon: '🧪', defaultTitle: '化验检查' },
  temporary: { label: '临时加药', icon: '⏰', defaultTitle: '临时加药' }
} as const

const repeatOptions = [
  { key: 'once', label: '仅一次' },
  { key: 'daily', label: '每天' },
  { key: 'weekly', label: '每周' },
  { key: 'monthly', label: '每月' }
] as const

const AddReminderModal: React.FC<AddReminderModalProps> = ({
  visible,
  onClose,
  defaultType = 'visit'
}) => {
  const addReminder = useAppStore(s => s.addReminder)

  const [type, setType] = useState<ReminderItem['type']>(defaultType)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [description, setDescription] = useState('')
  const [repeat, setRepeat] = useState<ReminderItem['repeat']>('once')
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    if (visible) {
      setType(defaultType)
      setTitle(typeConfig[defaultType].defaultTitle)
      const today = new Date()
      const nextDate = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      setDate(nextDate.toISOString().split('T')[0])
      setTime(
        defaultType === 'visit' ? '09:30' :
        defaultType === 'lab' ? '07:00' :
        defaultType === 'temporary' ? '14:00' : '08:00'
      )
      setDescription('')
      setRepeat(defaultType === 'medicine' ? 'daily' : 'once')
      setIsEnabled(true)
    }
  }, [visible, defaultType])

  const handleConfirm = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入提醒标题', icon: 'none' })
      return
    }
    if (!date) {
      Taro.showToast({ title: '请选择日期', icon: 'none' })
      return
    }
    if (!time) {
      Taro.showToast({ title: '请选择时间', icon: 'none' })
      return
    }

    addReminder({
      type,
      typeLabel: typeConfig[type].label,
      title: title.trim(),
      date,
      time,
      description: description.trim() || undefined,
      isEnabled,
      repeat
    })

    Taro.showToast({ title: '提醒已添加', icon: 'success' })
    onClose()
  }

  return (
    <Modal
      visible={visible}
      title={`新建${typeConfig[type].label}`}
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmText="添加提醒"
    >
      <View className={styles.typeSelector}>
        {(Object.keys(typeConfig) as Array<keyof typeof typeConfig>).map(key => (
          <View
            key={key}
            className={classnames(styles.typeItem, type === key && styles.typeItemActive)}
            onClick={() => {
              setType(key)
              setTitle(typeConfig[key].defaultTitle)
              setRepeat(key === 'medicine' ? 'daily' : 'once')
            }}
          >
            <Text className={styles.typeItemIcon}>{typeConfig[key].icon}</Text>
            <Text className={styles.typeItemName}>{typeConfig[key].label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>提醒标题 *</Text>
        <View className={styles.formInput}>
          <Input
            className={styles.input}
            placeholder="如：心内科复诊、空腹血糖检测"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={30}
          />
        </View>
      </View>

      <View className={styles.formRow}>
        <View className={styles.formCol}>
          <Text className={styles.formLabel}>日期 *</Text>
          <View className={styles.formInput}>
            <Input
              className={styles.input}
              type="text"
              placeholder="YYYY-MM-DD"
              value={date}
              onInput={(e) => setDate(e.detail.value)}
            />
          </View>
        </View>
        <View className={styles.formCol}>
          <Text className={styles.formLabel}>时间 *</Text>
          <View className={styles.formInput}>
            <Input
              className={styles.input}
              type="text"
              placeholder="HH:mm"
              value={time}
              onInput={(e) => setTime(e.detail.value)}
            />
          </View>
        </View>
      </View>

      <View className={styles.formGroup} style={{ marginTop: 24 }}>
        <Text className={styles.formLabel}>重复频率</Text>
        <View className={styles.repeatOptions}>
          {repeatOptions.map(opt => (
            <View
              key={opt.key}
              className={classnames(
                styles.repeatOption,
                repeat === opt.key && styles.repeatOptionActive
              )}
              onClick={() => setRepeat(opt.key)}
            >
              {opt.label}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>详细说明</Text>
        <Textarea
          className={styles.textarea}
          placeholder="填写地点、科室、注意事项等说明"
          value={description}
          onInput={(e) => setDescription(e.detail.value)}
          maxlength={200}
        />
      </View>

      <View className={styles.enabledRow}>
        <Text className={styles.enabledLabel}>创建后立即开启提醒</Text>
        <View
          className={classnames(styles.enabledSwitch, isEnabled && styles.enabledSwitchOn)}
          onClick={() => setIsEnabled(!isEnabled)}
        >
          <View className={styles.enabledSwitchDot} />
        </View>
      </View>

      <View className={styles.shareHint}>
        <Text className={styles.shareHintText}>
          💡 保存后可在提醒中心设置共享给照护人
        </Text>
      </View>
    </Modal>
  )
}

export default AddReminderModal
