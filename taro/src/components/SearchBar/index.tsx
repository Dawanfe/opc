import { View, Input } from '@tarojs/components'
import Icon from '../Icon'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = '搜索' }: SearchBarProps) {
  return (
    <View className='relative mb-4'>
      <View className='absolute left-3 top-1/2 -translate-y-1/2 z-10'>
        <Icon name='search' size={16} color='#9CA3AF' />
      </View>
      <Input
        placeholder={placeholder}
        placeholderClass='text-gray-400'
        value={value}
        onInput={(e) => onChange(e.detail.value)}
        style={{
          width: '100%',
          height: '44px',
          lineHeight: '44px',
          paddingLeft: '40px',
          paddingRight: '16px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#111827',
          boxSizing: 'border-box' as const,
        }}
      />
    </View>
  )
}
