import { View, Text } from '@tarojs/components'
import Icon from '../Icon'

interface EmptyProps {
  message?: string
}

export default function Empty({ message = '暂无数据' }: EmptyProps) {
  return (
    <View className='flex flex-col items-center justify-center py-20'>
      <View className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
        <Icon name='briefcase' size={28} color='#D1D5DB' />
      </View>
      <Text className='text-sm text-gray-400'>{message}</Text>
    </View>
  )
}
