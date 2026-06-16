import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Input, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import Modal from '@/components/Modal'
import { useAppStore } from '@/store/useAppStore'
import type { Medicine, MedicineRecord, DoseTime } from '@/types'
import styles from './index.module.scss'

interface AddRecordModalProps {
  visible: boolean
  onClose: () => void
  defaultDate?: string
}

const timeOptions: Array<{ key: DoseTime; label: string; defaultTime: string }> = [
  { key: 'morning', label: '早', defaultTime: '08:00' },
  { key: 'noon', label: '午', defaultTime: '12:30' },
  { key: 'evening', label: '晚', defaultTime: '20:00' },
  { key: 'night', label: '夜', defaultTime: '22:00' }
]

const statusOptions = [
  { key: 'missed' as const, label: '漏服', icon: '❌', desc: '未按时服用' },
  { key: 'delayed' as const, label: '补服', icon: '⏱', desc: '晚于时间服用' },
  { key: 'taken' as const, label: '已服', icon: '✓', desc: '正常服用' }
]

const reactionOptions = [
  '头晕', '恶心', '胃部不适', '嗜睡', '失眠',
  '皮疹', '食欲下降', '口干', '腹泻', '便秘',
  '心慌', '乏力', '无不适'
]

const AddRecordModal: React.FC<AddRecordModalProps> = ({
  visible,
  onClose,
  defaultDate
}) => {
  const medicines = useAppStore(s => s.medicines.filter(m => m.isActive))
  const addRecord = useAppStore(s => s.addRecord)

  const [medicineId, setMedicineId] = useState('')
  const [doseTime, setDoseTime] = useState<DoseTime>('morning')
  const [actualTime, setActualTime] = useState('')
  const [status, setStatus] = useState<MedicineRecord['status']>('missed')
  const [reason, setReason] = useState('')
  const [selectedReactions, setSelectedReactions] = useState<string[]>([])
  const [reactionLevel, setReactionLevel] = useState<'mild' | 'moderate' | 'severe'>('mild')
  const [reactionDesc, setReactionDesc] = useState('')

  useEffect(() => {
    if (visible) {
      setMedicineId(medicines[0]?.id || '')
      setDoseTime('morning')
      setActualTime('08:00')
      setStatus('missed')
      setReason('')
      setSelectedReactions([])
      setReactionLevel('mild')
      setReactionDesc('')
    }
  }, [visible, medicines])

  const selectedMedicine = useMemo<Medicine | undefined>(
    () => medicines.find(m => m.id === medicineId),
    [medicines, medicineId]
  )

  const handleTimeChange = (time: DoseTime) => {
    setDoseTime(time)
    const opt = timeOptions.find(t => t.key === time)
    if (opt) setActualTime(opt.defaultTime)
  }

  const toggleReaction = (reaction: string) => {
    setSelectedReactions(prev =>
      prev.includes(reaction)
        ? prev.filter(r => r !== reaction)
        : [...prev, reaction]
    )
  }

  const handleConfirm = () => {
    if (!medicineId) {
      Taro.showToast({ title: '请选择药品', icon: 'none' })
      return
    }
    if (!selectedMedicine) return

    const timeLabel = timeOptions.find(t => t.key === doseTime)?.label || doseTime
    const reactionText = selectedReactions.length > 0
      ? `[${reactionLevel === 'mild' ? '轻微' : reactionLevel === 'moderate' ? '中度' : '严重'}] ${selectedReactions.join('、')}${reactionDesc ? ' - ' + reactionDesc : ''}`
      : undefined

    addRecord({
      medicineId: selectedMedicine.id,
      medicineName: selectedMedicine.name,
      date: defaultDate || new Date().toISOString().split('T')[0],
      doseTime,
      doseTimeLabel: timeLabel,
      status,
      actualTime: status !== 'missed' ? actualTime : undefined,
      reason: reason || undefined,
      reaction: reactionText
    })

    Taro.showToast({ title: '记录已添加', icon: 'success' })
    onClose()
  }

  return (
    <Modal
      visible={visible}
      title="补录服药记录"
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmText="保存记录"
    >
      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>选择药品 *</Text>
        <View className={styles.medicinePicker}>
          {medicines.length === 0 ? (
            <Text style={{ color: '#9ca3af', fontSize: 24, padding: 24 }}>暂无药品，请先添加</Text>
          ) : (
            medicines.map(med => (
              <View
                key={med.id}
                className={classnames(
                  styles.medicineOption,
                  medicineId === med.id && styles.medicineOptionActive
                )}
                onClick={() => setMedicineId(med.id)}
              >
                <View>
                  <Text className={styles.medicineName}>{med.name}</Text>
                  <Text className={styles.medicineSpec}>{med.specification} · 库存{med.stock}{med.unit}</Text>
                </View>
                <View className={styles.checkMark}>✓</View>
              </View>
            ))
          )}
        </View>
      </View>

      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>服用时段 *</Text>
        <View className={styles.timeOptions}>
          {timeOptions.map(opt => (
            <View
              key={opt.key}
              className={classnames(
                styles.timeOption,
                doseTime === opt.key && styles.timeOptionActive
              )}
              onClick={() => handleTimeChange(opt.key)}
            >
              <Text className={styles.timeLabel}>{opt.label}</Text>
              <Text className={styles.timePoint}>{opt.defaultTime}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>服药状态 *</Text>
        <View className={styles.statusOptions}>
          {statusOptions.map(opt => (
            <View
              key={opt.key}
              className={classnames(
                styles.statusOption,
                status === opt.key && styles.statusOptionActive
              )}
              onClick={() => setStatus(opt.key)}
            >
              <Text className={styles.statusIcon}>{opt.icon}</Text>
              <Text className={styles.statusName}>{opt.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {status !== 'taken' && (
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            {status === 'missed' ? '漏服原因' : '延迟原因'}
          </Text>
          <View className={styles.formInput}>
            <Input
              className={styles.input}
              placeholder={status === 'missed' ? '如：忘记了、外出等' : '如：起晚了、忙碌等'}
              value={reason}
              onInput={(e) => setReason(e.detail.value)}
              maxlength={30}
            />
          </View>
        </View>
      )}

      {status !== 'missed' && (
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>实际服用时间</Text>
          <View className={styles.formInput}>
            <Input
              className={styles.input}
              placeholder="HH:mm"
              value={actualTime}
              onInput={(e) => setActualTime(e.detail.value)}
            />
          </View>
        </View>
      )}

      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>服药反应（选填）</Text>
        <View className={styles.reactionTags}>
          {reactionOptions.map(r => (
            <View
              key={r}
              className={classnames(
                styles.reactionTag,
                selectedReactions.includes(r) && styles.reactionTagActive
              )}
              onClick={() => toggleReaction(r)}
            >
              {r}
            </View>
          ))}
        </View>
      </View>

      {selectedReactions.length > 0 && (
        <>
          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>严重程度</Text>
            <View className={styles.levelOptions}>
              {(['mild', 'moderate', 'severe'] as const).map(lv => (
                <View
                  key={lv}
                  className={classnames(
                    styles.levelOption,
                    styles[`level${lv.charAt(0).toUpperCase() + lv.slice(1)}`],
                    reactionLevel === lv && styles.levelOptionActive
                  )}
                  onClick={() => setReactionLevel(lv)}
                >
                  <Text className={styles.levelName}>
                    {lv === 'mild' ? '轻微' : lv === 'moderate' ? '中度' : '严重'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>详细描述</Text>
            <Textarea
              className={styles.textarea}
              placeholder="描述具体的反应症状、持续时间等"
              value={reactionDesc}
              onInput={(e) => setReactionDesc(e.detail.value)}
              maxlength={200}
            />
          </View>
        </>
      )}
    </Modal>
  )
}

export default AddRecordModal
