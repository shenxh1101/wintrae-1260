import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import classnames from 'classnames'
import type { Medicine } from '@/types'
import styles from './index.module.scss'

interface MedicineCardProps {
  medicine: Medicine
  showAction?: boolean
  actionText?: string
  onAction?: () => void
  onClick?: () => void
}

const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  showAction = false,
  actionText = '打卡',
  onAction,
  onClick
}) => {
  const isLowStock = medicine.stock <= medicine.warnStock
  const stockPercent = Math.min(100, (medicine.stock / (medicine.warnStock * 3)) * 100)

  const getTypeClass = (type: string) => {
    switch (type) {
      case 'prescription': return styles.typePrescription
      case 'health': return styles.typeHealth
      default: return styles.typeCommon
    }
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
    <View className={styles.medicineCard} onClick={onClick}>
      <View className={styles.header}>
        <View style={{ flex: 1 }}>
          <View className={styles.nameRow}>
            <Text className={styles.name}>{medicine.name}</Text>
            <View className={classnames(styles.typeTag, getTypeClass(medicine.type))}>
              {medicine.typeLabel}
            </View>
          </View>
          <Text className={styles.spec}>{medicine.specification} · {medicine.manufacturer}</Text>
        </View>
      </View>

      <View className={styles.dosesSection}>
        {medicine.doses.map((dose) => (
          <View key={dose.time} className={styles.doseItem}>
            <View className={classnames(styles.doseTime, getTimeClass(dose.time))}>
              {dose.timeLabel} {dose.timePoint}
            </View>
            <Text className={styles.doseAmount}>{dose.dosage}</Text>
          </View>
        ))}
      </View>

      <View className={styles.footer}>
        <View className={styles.stockInfo}>
          <Text className={styles.stockLabel}>库存</Text>
          <Text className={classnames(styles.stockValue, isLowStock && styles.stockLow)}>
            {medicine.stock}
          </Text>
          <Text className={styles.stockUnit}>{medicine.unit}</Text>
          <View className={styles.stockBar}>
            <View
              className={classnames(
                styles.stockBarFill,
                isLowStock && styles.stockBarFillLow
              )}
              style={{ width: `${stockPercent}%` }}
            />
          </View>
        </View>
        {showAction && (
          <Button className={styles.actionBtn} onClick={(e) => {
            e.stopPropagation()
            onAction?.()
          }}>
            {actionText}
          </Button>
        )}
      </View>
    </View>
  )
}

export default MedicineCard
