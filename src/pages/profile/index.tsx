import React, { useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useAppStore } from '@/store/useAppStore'
import { mockUserProfile, mockCaregivers } from '@/data/mockData'
import WeeklyListModal from '@/components/WeeklyListModal'
import styles from './index.module.scss'

const ProfilePage: React.FC = () => {
  const medicines = useAppStore(s => s.medicines)
  const initStore = useAppStore(s => s.initStore)

  const user = mockUserProfile
  const caregivers = mockCaregivers
  const activeMedicines = medicines.filter(m => m.isActive)
  const lowStockCount = activeMedicines.filter(m => m.stock <= m.warnStock).length

  const [showWeeklyModal, setShowWeeklyModal] = useState(false)

  useDidShow(() => {
    initStore()
  })

  const handleMenuClick = (key: string) => {
    console.log('[Profile] 点击菜单:', key)
    if (key === 'export') {
      setShowWeeklyModal(true)
      return
    }
    const messages: Record<string, string> = {
      'share': '照护人管理',
      'settings': '用药设置',
      'stock': '库存管理',
      'about': '关于健康用药',
      'feedback': '意见反馈',
      'help': '使用帮助'
    }
    Taro.showToast({ title: messages[key] || '功能开发中', icon: 'none' })
  }

  const menuGroups = [
    {
      title: '用药管理',
      icon: '💊',
      items: [
        { key: 'export', icon: '📋', label: '一周用药清单', desc: '导出给家属查看', badge: 'NEW', iconClass: styles.iconGreen },
        { key: 'stock', icon: '📦', label: '药品库存', desc: `共${activeMedicines.length}种，${lowStockCount}种不足`, badge: lowStockCount > 0 ? `${lowStockCount}种预警` : '', iconClass: styles.iconOrange },
        { key: 'share', icon: '👨‍👩‍👧', label: '照护人管理', desc: `已设置${caregivers.length}位照护人`, badge: '', iconClass: styles.iconBlue }
      ]
    },
    {
      title: '提醒与设置',
      icon: '⚙️',
      items: [
        { key: 'settings', icon: '🔔', label: '提醒设置', desc: '铃声、震动、提前提醒', badge: '', iconClass: styles.iconPurple },
        { key: 'feedback', icon: '💬', label: '意见反馈', desc: '帮助我们做得更好', badge: '', iconClass: styles.iconGray }
      ]
    },
    {
      title: '其他',
      icon: 'ℹ️',
      items: [
        { key: 'help', icon: '❓', label: '使用帮助', desc: '常见问题解答', badge: '', iconClass: styles.iconGray },
        { key: 'about', icon: 'ℹ️', label: '关于我们', desc: '版本 v1.0.0', badge: '', iconClass: styles.iconGray }
      ]
    }
  ]

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.profileHeader}>
        <View className={styles.bgCircle} />
        <View className={styles.bgCircle2} />
        <View className={styles.userInfo}>
          <View className={styles.avatar}>
            {user.name[0]}
          </View>
          <View className={styles.userDetail}>
            <Text className={styles.userName}>{user.name}</Text>
            <Text className={styles.userMeta}>
              {user.gender} · {user.age}岁
            </Text>
            <View className={styles.userDiseases}>
              {user.diseases.map((d, idx) => (
                <View key={idx} className={styles.diseaseTag}>
                  {d}
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.summaryRow}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>{activeMedicines.length}</Text>
            <Text className={styles.summaryLabel}>在服药品</Text>
          </View>
          <View className={styles.summaryDivider} />
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>{caregivers.length}</Text>
            <Text className={styles.summaryLabel}>照护人</Text>
          </View>
          <View className={styles.summaryDivider} />
          <View className={styles.summaryItem}>
            <Text
              className={styles.summaryValue}
              style={{ color: lowStockCount > 0 ? '#f97316' : '#1f2937' }}
            >
              {lowStockCount}
            </Text>
            <Text className={styles.summaryLabel}>库存预警</Text>
          </View>
        </View>

        <View className={styles.quickActions}>
          <View className={styles.quickAction} onClick={() => setShowWeeklyModal(true)}>
            <View className={styles.quickIcon}>�</View>
            <Text className={styles.quickText}>导出清单</Text>
          </View>
          <View className={styles.quickAction} onClick={() => handleMenuClick('share')}>
            <View className={styles.quickIcon}>�</View>
            <Text className={styles.quickText}>添加照护人</Text>
          </View>
          <View className={styles.quickAction} onClick={() => handleMenuClick('stock')}>
            <View className={styles.quickIcon}>�</View>
            <Text className={styles.quickText}>补购药品</Text>
          </View>
        </View>
      </View>

      <View className={styles.menuContainer}>
        {menuGroups.map(group => (
          <View key={group.title} className={styles.menuGroup}>
            <Text className={styles.groupTitle}>{group.title}</Text>
            <View className={styles.menuList}>
              {group.items.map(item => (
                <View
                  key={item.key}
                  className={styles.menuItem}
                  onClick={() => handleMenuClick(item.key)}
                >
                  <View
                    className={styles.menuIcon}
                    style={{
                      background: item.key === 'export' ? 'rgba(34,197,94,0.1)' :
                        item.key === 'stock' ? 'rgba(249,115,22,0.1)' :
                        item.key === 'share' ? 'rgba(59,130,246,0.1)' :
                        item.key === 'settings' ? 'rgba(139,92,246,0.1)' :
                        'rgba(156,163,175,0.1)'
                    }}
                  >
                    {item.icon}
                  </View>
                  <View className={styles.menuContent}>
                    <View className={styles.menuLeft}>
                      <Text className={styles.menuLabel}>{item.label}</Text>
                      {item.desc && (
                        <Text className={styles.menuDesc}>{item.desc}</Text>
                      )}
                    </View>
                    <View className={styles.menuRight}>
                      {item.badge && (
                        <View className={styles.badge}>
                          {item.badge}
                        </View>
                      )}
                      <Text className={styles.arrowIcon}>›</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <WeeklyListModal
        visible={showWeeklyModal}
        onClose={() => setShowWeeklyModal(false)}
      />
    </ScrollView>
  )
}

export default ProfilePage
