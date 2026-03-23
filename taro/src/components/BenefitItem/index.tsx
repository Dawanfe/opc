import { View, Text } from '@tarojs/components'
import Icon from '../Icon'

interface BenefitItemProps {
  label: string
  value: string
  color: 'green' | 'blue' | 'orange' | 'pink'
  icon?: string
}

const colorMap = {
  green: { bg: 'rgba(34,197,94,0.05)', text: '#22C55E', activeText: '#111827' },
  blue: { bg: 'rgba(59,130,246,0.05)', text: '#3B82F6', activeText: '#111827' },
  orange: { bg: 'rgba(249,115,22,0.05)', text: '#F97316', activeText: '#111827' },
  pink: { bg: 'rgba(236,72,153,0.05)', text: '#EC4899', activeText: '#111827' },
}

const iconMap = {
  green: 'building-2',
  blue: 'cpu',
  orange: 'briefcase',
  pink: 'building-2',
}

export default function BenefitItem({ label, value, color, icon }: BenefitItemProps) {
  const colors = colorMap[color]
  const isAvailable = value && value !== '未明确提及' && value !== '否'
  const iconName = icon || iconMap[color]

  return (
    <View
      className='rounded-lg'
      style={{
        padding: '12px',
        backgroundColor: isAvailable ? colors.bg : '#F9FAFB',
      }}
    >
      <View className='flex items-center mb-1' style={{ gap: '8px' }}>
        <Icon name={iconName} size={16} color={isAvailable ? colors.text : '#9CA3AF'} />
        <Text
          className='text-xs font-medium'
          style={{ color: isAvailable ? colors.activeText : '#9CA3AF' }}
        >
          {label}
        </Text>
      </View>
      <Text
        className='block text-sm'
        style={{ color: isAvailable ? '#6B7280' : '#9CA3AF' }}
      >
        {isAvailable ? value : '未明确'}
      </Text>
    </View>
  )
}
