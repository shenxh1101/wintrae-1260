import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface SectionHeaderProps {
  title: string
  actionText?: string
  onAction?: () => void
  showAccent?: boolean
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onAction,
  showAccent = true
}) => {
  return (
    <View className={styles.sectionHeader}>
      <View className={styles.titleWrapper}>
        {showAccent && <View className={styles.titleAccent} />}
        <Text className={styles.title}>{title}</Text>
      </View>
      {actionText && (
        <View className={styles.action} onClick={onAction}>
          <Text>{actionText}</Text>
          <Text className={styles.arrow}>›</Text>
        </View>
      )}
    </View>
  )
}

export default SectionHeader
