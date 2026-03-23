import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../utils/request'
import { NEWS_CATEGORIES } from '../../constants'
import FilterBar from '../../components/FilterBar'
import Modal from '../../components/Modal'
import Icon from '../../components/Icon'

interface NewsItem {
  id: number
  title: string
  content: string
  source: string
  url: string
  category: string
  date: string
  createdAt?: string
}

function categorizeNews(title: string): string {
  if (!title) return 'news'
  if (title.includes('政策') || title.includes('汇总')) return 'policy'
  if (title.includes('分析') || title.includes('解读')) return 'analysis'
  return 'news'
}

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  policy: { bg: 'bg-blue-50', text: 'text-blue-600', label: '政策' },
  news: { bg: 'bg-green-50', text: 'text-green-600', label: '新闻' },
  analysis: { bg: 'bg-orange-50', text: 'text-orange-600', label: '分析' },
}

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    request<NewsItem[]>({ url: '/api/admin/news' })
      .then((data) => {
        const validNews = data.filter((n) => n.title && n.title !== 'NaN')
        setNews(validNews)
      })
      .catch(() => {})
  }, [])

  const filteredNews =
    selectedCategory === 'all' ? news : news.filter((n) => categorizeNews(n.title) === selectedCategory)

  return (
    <View className='p-5'>
      {/* Header */}
      <View className='mb-5'>
        <Text className='block text-2xl font-semibold text-gray-900 mb-1'>每日AI新闻</Text>
        <Text className='block text-sm text-gray-500'>OPC与AI领域每日最新政策、新闻与分析</Text>
      </View>

      {/* Category Filter */}
      <FilterBar
        items={NEWS_CATEGORIES as any}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* News Feed */}
      <View className='space-y-3'>
        {filteredNews.map((item) => {
          const category = categorizeNews(item.title)
          const colors = categoryColors[category]

          return (
            <View
              key={item.id}
              className='bg-white rounded-xl p-5 border border-gray-100 shadow-card'
              onClick={() => { setSelectedNews(item); setIsModalOpen(true) }}
            >
              <View className='flex items-start gap-4'>
                {/* Icon */}
                <View className='flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center'>
                  <Icon name='newspaper' size={20} color='#6B7280' />
                </View>

                {/* Content */}
                <View className='flex-1 min-w-0'>
                  <View className='flex items-center gap-2 mb-2'>
                    <View className={`${colors.bg} px-2 rounded`} style={{ paddingTop: '2px', paddingBottom: '2px' }}>
                      <Text className={`text-xs font-medium ${colors.text}`}>{colors.label}</Text>
                    </View>
                    <Text className='text-xs text-gray-400'>{item.source}</Text>
                  </View>

                  <Text className='block text-base font-medium text-gray-900 mb-2 line-clamp-2'>
                    {item.title}
                  </Text>

                  <Text className='block text-sm text-gray-500 line-clamp-2 mb-3'>
                    {item.content?.slice(0, 120)}...
                  </Text>

                  <View className='flex items-center justify-between'>
                    <Text className='text-xs text-gray-400'>{item.date || item.createdAt?.slice(0, 10) || ''}</Text>
                    <Icon name='chevron-right' size={16} color='#9CA3AF' />
                  </View>
                </View>
              </View>
            </View>
          )
        })}
      </View>

      {/* News Detail Modal */}
      <Modal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedNews?.title || ''}
        headerExtra={selectedNews ? (() => {
          const cat = categorizeNews(selectedNews.title)
          const colors = categoryColors[cat]
          return (
            <View className='flex items-center gap-2' style={{ marginBottom: '8px' }}>
              <View className={`${colors.bg} px-2 rounded`} style={{ paddingTop: '2px', paddingBottom: '2px' }}>
                <Text className={`text-xs font-medium ${colors.text}`}>{colors.label}</Text>
              </View>
              <Text className='text-xs text-gray-400'>{selectedNews.source}</Text>
            </View>
          )
        })() : undefined}
      >
        {selectedNews && (
          <View className='space-y-6'>
            {/* Content */}
            <View>
              <Text className='text-sm text-gray-500 leading-relaxed' style={{ whiteSpace: 'pre-line' }}>
                {selectedNews.content}
              </Text>
            </View>

            {/* Source Link */}
            {selectedNews.url && selectedNews.url !== 'NaN' && (
              <View style={{ paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
                <View
                  className='flex items-center justify-center gap-2 bg-gray-100 rounded-lg'
                  style={{ padding: '10px 16px' }}
                  onClick={() => Taro.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(selectedNews.url)}` })}
                >
                  <Icon name='external-link' size={16} color='#6B7280' />
                  <Text className='text-sm font-medium text-gray-700'>阅读原文</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </Modal>
    </View>
  )
}
