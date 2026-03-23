import { PropsWithChildren, ReactNode } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Icon from '../Icon'

interface ModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  headerExtra?: ReactNode
}

export default function Modal({ visible, onClose, title, headerExtra, children }: PropsWithChildren<ModalProps>) {
  if (!visible) return null

  return (
    <View
      className='flex items-end justify-center'
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
      }}
    >
      {/* Backdrop */}
      <View
        className='absolute inset-0'
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />

      {/* Content */}
      <View
        className='relative bg-white flex flex-col shadow-2xl'
        style={{
          width: '100%',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          maxHeight: '85vh',
          marginBottom: '50px',
        }}
      >
        {/* Header */}
        <View
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <View className='flex items-start justify-between'>
            <View className='flex-1' style={{ paddingRight: '16px' }}>
              {headerExtra}
              <Text className='text-lg font-semibold text-gray-900' style={{ lineHeight: '1.4' }}>{title || ''}</Text>
            </View>
            <View
              className='flex items-center justify-center rounded-full bg-gray-100'
              style={{ width: '32px', height: '32px', flexShrink: 0 }}
              onClick={onClose}
            >
              <Icon name='x' size={18} color='#6B7280' />
            </View>
          </View>
        </View>

        {/* Body */}
        <ScrollView scrollY className='flex-1' style={{ maxHeight: '70vh', padding: '20px' }}>
          <View style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
            {children}
          </View>
        </ScrollView>
      </View>
    </View>
  )
}
