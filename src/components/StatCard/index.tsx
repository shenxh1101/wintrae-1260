import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  subText?: string
  variant?: 'default' | 'primary' | 'warning' | 'info'
  icon?: string
  onClick?: () => void
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  subText,
  variant = 'default',
  icon,
  onClick
}) => {
  return (
    <View
      className={classnames(
        styles.statCard,
        variant === 'primary' && styles.statCardPrimary,
        variant === 'warning' && styles.statCardWarning,
        variant === 'info' && styles.statCardInfo
      )}
      onClick={onClick}
    >
      <Text className={styles.label}>{label}</Text>
      <View className={styles.valueRow}>
        <Text className={styles.value}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
      {subText && <Text className={styles.subText}>{subText}</Text>}
      {icon && <View className={styles.iconBg}>{icon}</View>}
    </View>
  )
}

export default StatCard
