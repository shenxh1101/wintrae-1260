import React, { useState, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import Modal from '@/components/Modal'
import { useAppStore } from '@/store/useAppStore'
import type { MedicineType, DoseItem, DoseTime } from '@/types'
import styles from './index.module.scss'

interface DoseForm {
  enabled: boolean
  timePoint: string
  dosage: string
}

interface AddMedicineModalProps {
  visible: boolean
  onClose: () => void
  mode?: 'manual' | 'photo'
}

const defaultDoses: Record<DoseTime, DoseForm> = {
  morning: { enabled: false, timePoint: '08:00', dosage: '1片' },
  noon: { enabled: false, timePoint: '12:30', dosage: '1片' },
  evening: { enabled: false, timePoint: '20:00', dosage: '1片' },
  night: { enabled: false, timePoint: '22:00', dosage: '1片' }
}

const timeLabels: Record<DoseTime, { label: string; timeLabel: string; class: string }> = {
  morning: { label: '早餐后', timeLabel: '早', class: styles.timeMorning },
  noon: { label: '午餐后', timeLabel: '午', class: styles.timeNoon },
  evening: { label: '晚餐后', timeLabel: '晚', class: styles.timeEvening },
  night: { label: '睡前', timeLabel: '夜', class: styles.timeNight }
}

const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  visible,
  onClose,
  mode = 'manual'
}) => {
  const addMedicine = useAppStore(s => s.addMedicine)
  const [name, setName] = useState('')
  const [type, setType] = useState<MedicineType>('common')
  const [specification, setSpecification] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [stock, setStock] = useState('30')
  const [unit, setUnit] = useState('片')
  const [warnStock, setWarnStock] = useState('7')
  const [notes, setNotes] = useState('')
  const [doses, setDoses] = useState<Record<DoseTime, DoseForm>>(defaultDoses)
  const [isPhotoMode, setIsPhotoMode] = useState(false)

  useEffect(() => {
    if (visible) {
      setIsPhotoMode(mode === 'photo')
      if (mode === 'photo') {
        const randomNames = ['阿莫西林胶囊', '布洛芬缓释片', '奥美拉唑肠溶胶囊', '复合维生素B片']
        setName(randomNames[Math.floor(Math.random() * randomNames.length)])
        setType(['prescription', 'common', 'health'][Math.floor(Math.random() * 3)] as MedicineType)
        setSpecification(['0.25g', '0.3g', '10mg', '100mg'][Math.floor(Math.random() * 4)])
        setStock(String(Math.floor(Math.random() * 30) + 10))
        Taro.showToast({ title: '已识别药盒信息，请核对', icon: 'none' })
      } else {
        setName('')
        setType('common')
        setSpecification('')
        setManufacturer('')
        setStock('30')
        setUnit('片')
        setWarnStock('7')
        setNotes('')
        setDoses(defaultDoses)
      }
    }
  }, [visible, mode])

  const handleToggleDose = (time: DoseTime) => {
    setDoses(prev => ({
      ...prev,
      [time]: { ...prev[time], enabled: !prev[time].enabled }
    }))
  }

  const handleDoseChange = (time: DoseTime, field: 'timePoint' | 'dosage', value: string) => {
    setDoses(prev => ({
      ...prev,
      [time]: { ...prev[time], [field]: value }
    }))
  }

  const handleConfirm = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入药品名称', icon: 'none' })
      return
    }

    const validDoses: DoseItem[] = []
    const doseOrder: DoseTime[] = ['morning', 'noon', 'evening', 'night']
    doseOrder.forEach(time => {
      if (doses[time].enabled) {
        validDoses.push({
          time,
          timeLabel: timeLabels[time].timeLabel,
          timePoint: doses[time].timePoint,
          dosage: doses[time].dosage
        })
      }
    })

    if (validDoses.length === 0) {
      Taro.showToast({ title: '请至少选择一个服用时间', icon: 'none' })
      return
    }

    const typeLabels: Record<MedicineType, string> = {
      prescription: '处方药',
      health: '保健品',
      common: '常用药'
    }

    addMedicine({
      name: name.trim(),
      type,
      typeLabel: typeLabels[type],
      specification: specification.trim() || '常规规格',
      manufacturer: manufacturer.trim(),
      stock: parseInt(stock) || 0,
      unit: unit || '片',
      warnStock: parseInt(warnStock) || 7,
      doses: validDoses,
      startDate: new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
      isActive: true
    })

    Taro.showToast({ title: isPhotoMode ? '草稿已保存' : '添加成功', icon: 'success' })
    onClose()
  }

  const handleRetakePhoto = () => {
    Taro.chooseImage?.({
      count: 1,
      success: () => {
        const randomNames = ['头孢克肟片', '甲硝唑片', '辛伐他汀片', '钙片']
        setName(randomNames[Math.floor(Math.random() * randomNames.length)])
        Taro.showToast({ title: '重新识别成功', icon: 'success' })
      }
    })
  }

  return (
    <Modal
      visible={visible}
      title={isPhotoMode ? '药盒信息识别' : '添加药品'}
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmText={isPhotoMode ? '保存草稿' : '添加'}
    >
      {isPhotoMode && (
        <>
          <View className={classnames(styles.photoPreview, name && styles.hasPhoto)} onClick={handleRetakePhoto}>
            <Text className={styles.photoIcon}>📷</Text>
            <Text className={styles.photoText}>{name ? '点击重新拍摄' : '点击拍摄药盒'}</Text>
            {!name && <Text className={styles.photoSubText}>自动识别名称、规格等信息</Text>}
          </View>
          <View className={styles.draftHint}>
            <Text className={styles.draftHintText}>⚠️ 以上为识别结果草稿，请核对并补充完整信息</Text>
          </View>
        </>
      )}

      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>药品名称 *</Text>
        <View className={styles.formInput}>
          <Input
            className={styles.input}
            placeholder="请输入药品名称"
            value={name}
            onInput={(e) => setName(e.detail.value)}
            maxlength={30}
          />
        </View>
      </View>

      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>药品类型</Text>
        <View className={styles.typeOptions}>
          {([
            { key: 'prescription' as const, name: '处方药', desc: '遵医嘱' },
            { key: 'common' as const, name: '常用药', desc: '家庭常备' },
            { key: 'health' as const, name: '保健品', desc: '营养补充' }
          ]).map(opt => (
            <View
              key={opt.key}
              className={classnames(styles.typeOption, type === opt.key && styles.typeOptionActive)}
              onClick={() => setType(opt.key)}
            >
              <Text className={styles.typeOptionName}>{opt.name}</Text>
              <Text className={styles.typeOptionDesc}>{opt.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>规格</Text>
        <View className={styles.formInput}>
          <Input
            className={styles.input}
            placeholder="如：100mg/片"
            value={specification}
            onInput={(e) => setSpecification(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formRow}>
        <View className={styles.formCol}>
          <Text className={styles.formLabel}>当前库存</Text>
          <View className={styles.formInput}>
            <Input
              className={styles.input}
              type="number"
              value={stock}
              onInput={(e) => setStock(e.detail.value)}
            />
            <Text className={styles.unitSuffix}>{unit}</Text>
          </View>
        </View>
        <View className={styles.formCol}>
          <Text className={styles.formLabel}>单位</Text>
          <View className={styles.formInput}>
            <Input
              className={styles.input}
              placeholder="片/粒/袋"
              value={unit}
              onInput={(e) => setUnit(e.detail.value)}
            />
          </View>
        </View>
      </View>

      <View className={styles.formGroup} style={{ marginTop: 24 }}>
        <Text className={styles.formLabel}>库存预警线</Text>
        <View className={styles.formInput}>
          <Input
            className={styles.input}
            type="number"
            value={warnStock}
            onInput={(e) => setWarnStock(e.detail.value)}
          />
          <Text className={styles.unitSuffix}>{unit}以下提醒</Text>
        </View>
      </View>

      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>服用时间与剂量 *</Text>

        {(Object.keys(doses) as DoseTime[]).map(time => (
          <View key={time} className={styles.doseSection}>
            <View className={styles.doseHeader}>
              <View className={styles.doseTimeTag}>
                <View className={classnames(styles.timeBadge, timeLabels[time].class)}>
                  {timeLabels[time].timeLabel} {timeLabels[time].label}
                </View>
              </View>
              <View
                className={classnames(styles.doseSwitch, doses[time].enabled && styles.doseSwitchOn)}
                onClick={() => handleToggleDose(time)}
              >
                <View className={styles.doseSwitchDot} />
              </View>
            </View>
            {doses[time].enabled && (
              <View className={styles.doseInputs}>
                <View className={styles.doseInput}>
                  <Text className={styles.doseInputLabel}>提醒时间</Text>
                  <View className={styles.formInput}>
                    <Input
                      className={styles.input}
                      placeholder="HH:mm"
                      value={doses[time].timePoint}
                      onInput={(e) => handleDoseChange(time, 'timePoint', e.detail.value)}
                    />
                  </View>
                </View>
                <View className={styles.doseInput}>
                  <Text className={styles.doseInputLabel}>服用剂量</Text>
                  <View className={styles.formInput}>
                    <Input
                      className={styles.input}
                      placeholder="1片"
                      value={doses[time].dosage}
                      onInput={(e) => handleDoseChange(time, 'dosage', e.detail.value)}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>生产厂家</Text>
        <View className={styles.formInput}>
          <Input
            className={styles.input}
            placeholder="选填"
            value={manufacturer}
            onInput={(e) => setManufacturer(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formGroup}>
        <Text className={styles.formLabel}>备注说明</Text>
        <View className={styles.formInput}>
          <Input
            className={styles.input}
            placeholder="如：饭后服用、避免空腹等"
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
          />
        </View>
      </View>
    </Modal>
  )
}

export default AddMedicineModal
