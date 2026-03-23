import { useState, useEffect, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { request } from '../../utils/request'
import Empty from '../../components/Empty'
import Icon from '../../components/Icon'

interface Event {
  id: number
  location: string
  organizer: string
  date: string
  name: string
  registrationLink: string
  guests: string
  guestTitles: string
  description: string
}

const PAGE_SIZE = 20

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchEvents = useCallback(async (pageNum: number, isRefresh = false) => {
    if (isLoading) return
    setIsLoading(true)
    try {
      const data = await request<{ items: Event[]; total: number; hasMore: boolean }>({
        url: `/api/admin/events?page=${pageNum}&pageSize=${PAGE_SIZE}`,
      })
      if (isRefresh || pageNum === 1) {
        setEvents(data.items || [])
      } else {
        setEvents((prev) => [...prev, ...(data.items || [])])
      }
      setTotal(data.total || 0)
      setHasMore(data.hasMore ?? false)
      setPage(pageNum)
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  useEffect(() => {
    fetchEvents(1)
  }, [])

  usePullDownRefresh(() => {
    fetchEvents(1, true).then(() => {
      Taro.stopPullDownRefresh()
    })
  })

  useReachBottom(() => {
    if (hasMore && !isLoading) {
      fetchEvents(page + 1)
    }
  })

  return (
    <View className='p-5 animate-fade-in'>
      {/* Header */}
      <View className='mb-5'>
        <Text className='block text-2xl font-semibold text-gray-900 mb-1'>AI社区活动</Text>
        <Text className='block text-sm text-gray-500'>
          参加线上线下AI活动，认识更多同道中人，获取最新行业资讯
        </Text>
        {total > 0 && (
          <Text className='block text-xs text-gray-400 mt-1'>共 {total} 个活动</Text>
        )}
      </View>

      {/* Events List */}
      <View className='space-y-4'>
        {events.map((event) => (
          <View key={event.id} className='bg-white rounded-xl p-5 border border-gray-100 shadow-card'>
            <View className='flex items-center gap-2 mb-3'>
              <Icon name='calendar' size={14} color='#6B7280' />
              <Text className='text-sm text-gray-500'>{event.date}</Text>
            </View>

            <Text className='block text-base font-semibold text-gray-900 mb-2 line-clamp-2'>
              {event.name}
            </Text>

            <View className='flex items-center gap-1 mb-2'>
              <Icon name='map-pin' size={14} color='#6B7280' />
              <Text className='text-sm text-gray-500'>{event.location || '待定'}</Text>
            </View>

            <Text className='block text-sm text-gray-400 mb-1'>主办方：{event.organizer}</Text>

            {event.guestTitles && (
              <Text className='block text-sm text-gray-400 line-clamp-1'>嘉宾：{event.guestTitles}</Text>
            )}

            {event.registrationLink && (
              <View className='mt-4 pt-4 border-t border-gray-100'>
                <View
                  className='flex items-center gap-1'
                  onClick={() => Taro.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(event.registrationLink)}` })}
                >
                  <Text className='text-sm font-medium text-blue-600'>立即报名</Text>
                  <Icon name='chevron-right' size={16} color='#2563EB' />
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Bottom Status */}
      <View className='py-6 text-center'>
        {isLoading && (
          <Text className='text-sm text-gray-400'>加载中...</Text>
        )}
        {!isLoading && !hasMore && events.length > 0 && (
          <Text className='text-xs text-gray-300'>— 已加载全部活动 —</Text>
        )}
        {!isLoading && events.length === 0 && <Empty message='暂无活动' />}
      </View>
    </View>
  )
}
