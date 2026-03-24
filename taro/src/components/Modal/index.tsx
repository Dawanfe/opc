import { PropsWithChildren, ReactNode, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import Icon from '../Icon'

interface ModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  headerExtra?: ReactNode
}

export default function Modal({ visible, onClose, title, headerExtra, children }: PropsWithChildren<ModalProps>) {
  // 打开时隐藏 TabBar，关闭时恢复
  useEffect(() => {
    if (visible) {
      Taro.hideTabBar({ animation: false })
    } else {
      Taro.showTabBar({ animation: false })
    }
    return () => {
      Taro.showTabBar({ animation: false })
    }
  }, [visible])

  if (!visible) return null

  return (
    <View
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        boxSizing: 'border-box',
      }}
    >
      {/* Backdrop */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.4)',
        }}
        onClick={onClose}
      />

      {/* Content */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          maxHeight: '85vh',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <View
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flex: 1, paddingRight: '16px' }}>
              {headerExtra}
              <Text className='text-lg font-semibold text-gray-900' style={{ lineHeight: '1.4' }}>{title || ''}</Text>
            </View>
            <View
              style={{
                width: '32px',
                height: '32px',
                flexShrink: 0,
                borderRadius: '50%',
                backgroundColor: '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={onClose}
            >
              <Icon name='x' size={18} color='#6B7280' />
            </View>
          </View>
        </View>

        {/* Body */}
        <ScrollView scrollY enhanced showScrollbar={false} style={{ maxHeight: '70vh' }}>
          <View style={{ padding: '20px', paddingBottom: '60px', boxSizing: 'border-box' }}>
            {children}
          </View>
        </ScrollView>
      </View>
    </View>
  )
}
