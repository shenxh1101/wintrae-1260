import React from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { mockUserProfile, mockMedicines, mockCaregivers } from '@/data/mockData'
import styles from './index.module.scss'

const ProfilePage: React.FC = () => {
  const user = mockUserProfile
  const medicines = mockMedicines.filter(m => m.isActive)
  const caregivers = mockCaregivers
  const lowStockCount = medicines.filter(m => m.stock <= m.warnStock).length

  const handleMenuClick = (key: string) => {
    console.log('[Profile] 点击菜单:', key)
    const messages: Record<string, string> = {
      'export': '正在生成一周用药清单...',
      'share': '照护人管理',
      'settings': '用药设置',
      'stock': '库存管理',
      'about': '关于健康用药',
      'feedback': '意见反馈',
      'help': '使用帮助'
    }
    Taro.showToast({ title: messages[key] || '功能开发中', icon: 'none' })
  }

  const handleExportList = () => {
    Taro.showActionSheet({
      itemList: ['导出为图片', '发送给微信好友', '复制文本', '保存到相册'],
      success: () => {
        Taro.showToast({ title: '导出成功', icon: 'success' })
      }
    })
  }

  const menuGroups = [
    {
      title: '用药管理',
      icon: '💊',
      items: [
        { key: 'export', icon: '📋', label: '一周用药清单', desc: '导出给家属查看', badge: '', iconClass: styles.iconGreen },
        { key: 'stock', icon: '📦', label: '药品库存', desc: `共${medicines.length}种，${lowStockCount}种不足`, badge: lowStockCount > 0 ? `${lowStockCount}种预警` : '', iconClass: styles.iconOrange },
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
      </View>

      <View className={styles.content}>
        <View className={styles.card}>
          <View className={styles.statSummary}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{medicines.length}</Text>
              <Text className={styles.statLabel}>在用药品</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue} style={{ color: '#f59e0b' }}>
                {lowStockCount}
              </Text>
              <Text className={styles.statLabel}>库存不足</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue} style={{ color: '#3b82f6' }}>
                {caregivers.length}
              </Text>
              <Text className={styles.statLabel}>照护人</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue} style={{ color: '#8b5cf6' }}>
                15
              </Text>
              <Text className={styles.statLabel}>连续天数</Text>
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.quickActions}>
            <View className={styles.quickItem} onClick={handleExportList}>
              <Text className={styles.quickIcon}>📤</Text>
              <Text className={styles.quickLabel}>导出清单</Text>
            </View>
            <View className={styles.quickItem} onClick={() => handleMenuClick('share')}>
              <Text className={styles.quickIcon}>🔗</Text>
              <Text className={styles.quickLabel}>共享提醒</Text>
            </View>
            <View className={styles.quickItem} onClick={() => handleMenuClick('stock')}>
              <Text className={styles.quickIcon}>🛒</Text>
              <Text className={styles.quickLabel}>一键补购</Text>
            </View>
            <View className={styles.quickItem} onClick={() => handleMenuClick('settings')}>
              <Text className={styles.quickIcon}>⚙️</Text>
              <Text className={styles.quickLabel}>提醒设置</Text>
            </View>
          </View>
        </View>

        {menuGroups.map((group, gIdx) => (
          <View key={gIdx} className={styles.card}>
            <View className={styles.cardHeader}>
              <Text className={styles.cardHeaderIcon}>{group.icon}</Text>
              {group.title}
            </View>
            <View className={styles.menuList}>
              {group.items.map((item) => (
                <View
                  key={item.key}
                  className={styles.menuItem}
                  onClick={() => {
                    if (item.key === 'export') {
                      handleExportList()
                    } else {
                      handleMenuClick(item.key)
                    }
                  }}
                >
                  <View className={`${styles.menuIcon} ${item.iconClass}`}>
                    {item.icon}
                  </View>
                  <View className={styles.menuContent}>
                    <Text className={styles.menuTitle}>{item.label}</Text>
                    {item.desc && <Text className={styles.menuDesc}>{item.desc}</Text>}
                  </View>
                  {item.badge && (
                    <View className={styles.menuBadge}>{item.badge}</View>
                  )}
                  <Text className={styles.menuArrow}>›</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text className={styles.version}>健康用药 v1.0.0</Text>
      </View>
    </ScrollView>
  )
}

export default ProfilePage
