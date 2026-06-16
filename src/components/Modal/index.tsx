import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface ModalProps {
  visible: boolean
  title: string
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  showFooter?: boolean
  children: React.ReactNode
  center?: boolean
  confirmDisabled?: boolean
}

const Modal: React.FC<ModalProps> = ({
  visible,
  title,
  onClose,
  onConfirm,
  confirmText = '确定',
  cancelText = '取消',
  showFooter = true,
  children,
  center = false,
  confirmDisabled = false
}) => {
  return (
    <View
      className={classnames(
        styles.modalMask,
        center && styles.modalCenter,
        visible && styles.modalVisible
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <View className={styles.modalContainer}>
        <View className={styles.modalHeader}>
          <View style={{ width: 56 }} />
          <Text className={styles.modalTitle}>{title}</Text>
          <View className={styles.modalClose} onClick={onClose}>
            ×
          </View>
        </View>
        <View className={styles.modalBody}>{children}</View>
        {showFooter && (
          <View className={styles.modalFooter}>
            <Button
              className={classnames(styles.modalBtn, styles.btnCancel)}
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              className={classnames(styles.modalBtn, styles.btnConfirm)}
              onClick={onConfirm}
              disabled={confirmDisabled}
            >
              {confirmText}
            </Button>
          </View>
        )}
      </View>
    </View>
  )
}

export default Modal
