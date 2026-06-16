import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { mockMedicines } from '@/data/mockData'
import MedicineCard from '@/components/MedicineCard'
import EmptyState from '@/components/EmptyState'
import type { Medicine, MedicineType } from '@/types'
import styles from './index.module.scss'

type FilterType = 'all' | MedicineType

const PlanPage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [showAddSheet, setShowAddSheet] = useState(false)

  const filteredMedicines = useMemo(() => {
    if (filterType === 'all') {
      return medicines
    }
    return medicines.filter(m => m.type === filterType)
  }, [medicines, filterType])

  const filterOptions = [
    { key: 'all', label: '全部' },
    { key: 'prescription', label: '处方药' },
    { key: 'health', label: '保健品' },
    { key: 'common', label: '常用药' }
  ]

  const stats = useMemo(() => {
    const active = medicines.filter(m => m.isActive)
    const lowStock = active.filter(m => m.stock <= m.warnStock)
    const prescription = active.filter(m => m.type === 'prescription')
    return {
      total: active.length,
      lowStock: lowStock.length,
      prescription: prescription.length
    }
  }, [medicines])

  const handleAddMedicine = (type: 'manual' | 'photo') => {
    setShowAddSheet(false)
    if (type === 'photo') {
      Taro.chooseImage?.({
        count: 1,
        success: () => {
          Taro.showToast({ title: '识别中...', icon: 'loading' })
          setTimeout(() => {
            Taro.showToast({ title: '识别成功', icon: 'success' })
          }, 1500)
        }
      })
    } else {
      Taro.showToast({ title: '手动添加功能开发中', icon: 'none' })
    }
  }

  const handleMedicineClick = (medicine: Medicine) => {
    console.log('[Plan] 点击药品:', medicine.name)
    Taro.showToast({ title: `查看${medicine.name}详情`, icon: 'none' })
  }

  const handleCheckIn = (medicine: Medicine) => {
    console.log('[Plan] 打卡药品:', medicine.name)
    Taro.showToast({ title: '打卡成功', icon: 'success' })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>用药计划</Text>
        <ScrollView scrollX className={styles.filterTabs}>
          {filterOptions.map(opt => (
            <View
              key={opt.key}
              className={classnames(
                styles.filterTab,
                filterType === opt.key && styles.filterTabActive
              )}
              onClick={() => setFilterType(opt.key as FilterType)}
            >
              {opt.label}
              <Text className={styles.filterCount}>
                ({opt.key === 'all'
                  ? stats.total
                  : medicines.filter(m => m.type === opt.key).length})
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.statsBar}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.total}</Text>
            <Text className={styles.statLabel}>在用药品</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue} style={{ color: '#f59e0b' }}>
              {stats.lowStock}
            </Text>
            <Text className={styles.statLabel}>库存不足</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue} style={{ color: '#ef4444' }}>
              {stats.prescription}
            </Text>
            <Text className={styles.statLabel}>处方药</Text>
          </View>
        </View>

        <View className={styles.medicineList}>
          {filteredMedicines.length === 0 ? (
            <EmptyState
              icon="💊"
              text="暂无药品"
              subText="点击下方按钮添加你的第一个药品"
              actionText="添加药品"
              onAction={() => setShowAddSheet(true)}
            />
          ) : (
            filteredMedicines.map(medicine => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                showAction
                actionText="打卡"
                onClick={() => handleMedicineClick(medicine)}
                onAction={() => handleCheckIn(medicine)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <View className={styles.addBtn} onClick={() => setShowAddSheet(true)}>
        <Text className={styles.addIcon}>+</Text>
        <Text className={styles.addText}>添加</Text>
      </View>

      <View
        className={classnames(styles.sheetMask, showAddSheet && styles.sheetMaskVisible)}
        onClick={() => setShowAddSheet(false)}
      />

      <View className={classnames(styles.addSheet, showAddSheet && styles.addSheetVisible)}>
        <Text className={styles.sheetTitle}>添加药品</Text>
        <View className={styles.sheetOptions}>
          <View className={styles.sheetOption} onClick={() => handleAddMedicine('photo')}>
            <Text className={styles.sheetOptionIcon}>📷</Text>
            <Text className={styles.sheetOptionText}>拍照录入</Text>
            <Text className={styles.sheetOptionDesc}>自动识别药盒信息</Text>
          </View>
          <View className={styles.sheetOption} onClick={() => handleAddMedicine('manual')}>
            <Text className={styles.sheetOptionIcon}>✏️</Text>
            <Text className={styles.sheetOptionText}>手动添加</Text>
            <Text className={styles.sheetOptionDesc}>手动填写药品信息</Text>
          </View>
        </View>
        <Button className={styles.cancelBtn} onClick={() => setShowAddSheet(false)}>
          取消
        </Button>
      </View>
    </View>
  )
}

export default PlanPage
