import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store/useAppStore'
import MedicineCard from '@/components/MedicineCard'
import EmptyState from '@/components/EmptyState'
import AddMedicineModal from '@/components/AddMedicineModal'
import type { Medicine, MedicineType, MedicineRecord, DoseTime } from '@/types'
import { getTodayStr, formatDate } from '@/utils/date'
import styles from './index.module.scss'

type FilterType = 'all' | MedicineType

const PlanPage: React.FC = () => {
  const medicines = useAppStore(s => s.medicines)
  const records = useAppStore(s => s.records)
  const addRecord = useAppStore(s => s.addRecord)
  const decreaseMedicineStock = useAppStore(s => s.decreaseMedicineStock)

  const [filterType, setFilterType] = useState<FilterType>('all')
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addMode, setAddMode] = useState<'manual' | 'photo'>('manual')

  const filteredMedicines = useMemo(() => {
    const activeMeds = medicines.filter(m => m.isActive)
    if (filterType === 'all') return activeMeds
    return activeMeds.filter(m => m.type === filterType)
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

  const todayStr = getTodayStr()

  const handleAddMedicine = (type: 'manual' | 'photo') => {
    setShowAddSheet(false)
    setAddMode(type)
    setTimeout(() => setShowAddModal(true), 100)
  }

  const handleMedicineClick = (medicine: Medicine) => {
    console.log('[Plan] 点击药品:', medicine.name)
    Taro.showToast({ title: `查看${medicine.name}详情`, icon: 'none' })
  }

  const handleCheckIn = (medicine: Medicine) => {
    const todayRecs = records.filter(
      r => r.medicineId === medicine.id && r.date === todayStr
    )

    if (todayRecs.length >= medicine.doses.length) {
      Taro.showToast({ title: '今日已全部打卡', icon: 'none' })
      return
    }

    const doseOrder: DoseTime[] = ['morning', 'noon', 'evening', 'night']
    let nextDose = medicine.doses.find(
      d => !todayRecs.some(r => r.doseTime === d.time)
    )

    if (!nextDose) {
      nextDose = medicine.doses[0]
    }

    addRecord({
      medicineId: medicine.id,
      medicineName: medicine.name,
      date: todayStr,
      doseTime: nextDose.time,
      doseTimeLabel: nextDose.timeLabel,
      status: 'taken',
      actualTime: formatDate(new Date(), 'HH:mm')
    })

    decreaseMedicineStock(medicine.id, 1)

    Taro.showToast({ title: `${nextDose.timeLabel}打卡成功`, icon: 'success' })
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
                  : medicines.filter(m => m.type === opt.key && m.isActive).length})
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

      <AddMedicineModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        mode={addMode}
      />
    </View>
  )
}

export default PlanPage
