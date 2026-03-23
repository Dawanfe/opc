import { View, Text } from '@tarojs/components'

interface FilterItem {
  id: string
  label: string
}

interface FilterBarProps {
  items: readonly FilterItem[] | FilterItem[]
  selected: string
  onSelect: (id: string) => void
}

export default function FilterBar({ items, selected, onSelect }: FilterBarProps) {
  return (
    <View className='mb-4'>
      <View className='flex flex-wrap gap-2'>
        {items.map((item) => (
          <View
            key={item.id}
            className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
              selected === item.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => onSelect(item.id)}
          >
            <Text>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
