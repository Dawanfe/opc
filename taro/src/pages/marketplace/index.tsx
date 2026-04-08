import { useState, useEffect } from 'react'
import { View, Text, Input, Textarea, Picker, Image } from '@tarojs/components'
import Taro, { useShareAppMessage } from '@tarojs/taro'
import { useAuth } from '../../contexts/AuthContext'
import { request } from '../../utils/request'
import { DEMAND_CATEGORIES } from '../../constants'
import SearchBar from '../../components/SearchBar'
import Modal from '../../components/Modal'
import Empty from '../../components/Empty'
import LoginModal from '../../components/LoginModal'
import Icon from '../../components/Icon'

interface Gig {
  id: number
  title: string
  category: string
  budget: string
  deadline: string
  description: string
  requirements: string
  postedBy: string
  postedAt: string
  contact: string
  status: 'open' | 'in-progress' | 'completed'
}

const categoryOptions = [
  'AI 应用与系统开发',
  'AI 漫剧与短剧全案',
  'AIGC图像与视频创作',
  'AI 咨询与企业内训',
]

const categoryIdMap: Record<string, string> = {
  'ai-dev': 'AI 应用与系统开发',
  'ai-comic': 'AI 漫剧与短剧全案',
  'aigc': 'AIGC图像与视频创作',
  'ai-consult': 'AI 咨询与企业内训',
}

const filterItems = [
  { id: 'all', label: '全部', icon: 'briefcase' },
  { id: 'ai-dev', label: 'AI 应用与系统开发', icon: 'code' },
  { id: 'ai-comic', label: 'AI 漫剧与短剧全案', icon: 'wand-2' },
  { id: 'aigc', label: 'AIGC图像与视频创作', icon: 'video' },
  { id: 'ai-consult', label: 'AI 咨询与企业内训', icon: 'message-square' },
]

export default function MarketplacePage() {
  const { isLoggedIn, setShowLoginModal } = useAuth()

  // 分享配置
  useShareAppMessage(() => ({
    title: 'WeOPC - AI需求市场',
    path: '/pages/marketplace/index',
    imageUrl: ''
  }))
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [gigs, setGigs] = useState<Gig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [postForm, setPostForm] = useState({
    title: '',
    category: '',
    budget: '',
    deadline: '',
    description: '',
    contact: '',
  })

  useEffect(() => {
    fetchGigs()
  }, [])

  const fetchGigs = async () => {
    try {
      const data = await request<Gig[]>({ url: '/api/demands' })
      setGigs(data)
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  const filteredGigs = gigs.filter((gig) => {
    const matchesSearch =
      gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || gig.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryLabel = (categoryId: string) => categoryIdMap[categoryId] || categoryId
  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
      case 'ai-dev': return { bg: 'bg-green-50', text: 'text-green-500' }
      case 'ai-comic': return { bg: 'bg-pink-50', text: 'text-pink-500' }
      case 'aigc': return { bg: 'bg-purple-50', text: 'text-purple-500' }
      case 'ai-consult': return { bg: 'bg-yellow-50', text: 'text-yellow-500' }
      default: return { bg: 'bg-gray-100', text: 'text-gray-500' }
    }
  }

  const handleApply = (gig: Gig) => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    setSelectedGig(gig)
    setIsApplyModalOpen(true)
  }

  const handlePostOrder = async () => {
    if (!postForm.title.trim()) return
    setIsSubmitting(true)
    try {
      await request({
        url: '/api/demands',
        method: 'POST',
        data: postForm,
        needAuth: true,
      })
      setIsPostModalOpen(false)
      setPostForm({ title: '', category: '', budget: '', deadline: '', description: '', contact: '' })
      Taro.showToast({ title: '提交成功，审核后展示', icon: 'success' })
      fetchGigs()
    } catch (err: any) {
      Taro.showToast({ title: err.message || '发布失败', icon: 'none' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <View className='p-5'>
      {/* Header */}
      <View className='mb-5'>
        <View className='mb-4'>
          <Text className='block text-2xl font-semibold text-gray-900 mb-1'>需求市场</Text>
          <Text className='block text-sm text-gray-500'>发布需求或承接任务，优先找到AI时代新机遇</Text>
        </View>
        <View
          className='btn-primary w-full py-3 flex items-center justify-center'
          style={{ gap: '8px' }}
          onClick={() => (isLoggedIn ? setIsPostModalOpen(true) : setShowLoginModal(true))}
        >
          <Icon name='plus' size={16} color='#FFFFFF' />
          <Text className='text-sm text-white font-medium'>发布需求</Text>
        </View>
      </View>

      {/* Search */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder='搜索任务标题、描述...' />

      {/* Category Filter */}
      <View className='mb-4'>
        <View className='flex flex-wrap gap-2'>
          {filterItems.map((cat) => (
            <View
              key={cat.id}
              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                selectedCategory === cat.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
              style={{ gap: '6px' }}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <Icon name={cat.icon} size={16} color={selectedCategory === cat.id ? '#FFFFFF' : '#6B7280'} />
              <Text>{cat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Loading */}
      {isLoading && (
        <View className='py-12 text-center'>
          <Text className='text-sm text-gray-500'>加载中...</Text>
        </View>
      )}

      {/* Gig List */}
      {!isLoading && filteredGigs.length > 0 && (
        <View className='space-y-3'>
          {filteredGigs.map((gig) => {
            const catColor = getCategoryColor(gig.category)
            return (
              <View key={gig.id} className='bg-white rounded-xl p-5 border border-gray-100 shadow-card'>
                <View className='flex flex-col' style={{ gap: '12px' }}>
                  <View>
                    <View className='flex items-center gap-2 mb-2 flex-wrap'>
                      <View className={`${catColor.bg} px-2 rounded`} style={{ paddingTop: '2px', paddingBottom: '2px' }}>
                        <Text className={`text-xs font-medium ${catColor.text}`}>{getCategoryLabel(gig.category)}</Text>
                      </View>
                      <Text className='text-xs text-gray-400'>{gig.postedAt}</Text>
                    </View>

                    <Text className='block text-base font-medium text-gray-900 mb-2'>{gig.title}</Text>
                    <Text className='block text-sm text-gray-500 line-clamp-2 mb-3'>{gig.description}</Text>
                  </View>

                  {/* Bottom: info items + action button */}
                  <View style={{ gap: '12px' }} className='flex flex-col'>
                    {/* Info Grid */}
                    <View className='grid grid-cols-2 gap-2'>
                      <View className='inline-flex items-center' style={{ gap: '4px' }}>
                        <View style={{ width: '14px', height: '14px', flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', lineHeight: 1 }}>
                          <Image src={require('../../assets/images/price.png')} style={{ width: '14px', height: '14px' }} mode='scaleToFill' />
                        </View>
                        <Text className='text-xs text-gray-900 font-medium'>{gig.budget || '面议'}</Text>
                      </View>
                      <View className='inline-flex items-center' style={{ gap: '4px' }}>
                        <Icon name='clock' size={14} color='#F59E0B' />
                        <Text className='text-xs text-gray-900 font-medium'>{gig.deadline || '待定'}</Text>
                      </View>
                      <View className='inline-flex items-center' style={{ gap: '4px' }}>
                        <Icon name='map-pin' size={14} color='#959996' />
                        <Text className='text-xs text-gray-900 font-medium'>{gig.postedBy || '未知'}</Text>
                      </View>
                      <View className='inline-flex items-center' style={{ gap: '4px' }}>
                        <Icon name='phone' size={14} color='#00bf63' />
                        <Text className='text-xs text-gray-900 font-medium'>
                          {isLoggedIn ? (gig.contact || '暂无') : '登录查看'}
                        </Text>
                      </View>
                    </View>
                    {/* Action Button */}
                    <View className='btn-primary w-full py-2' onClick={() => handleApply(gig)}>
                      <Text className='text-xs'>我要接单</Text>
                    </View>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      )}

      {/* Empty State */}
      {!isLoading && filteredGigs.length === 0 && <Empty message='暂无匹配的任务' />}

      {/* Post Gig Modal */}
      <Modal visible={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} title='发布需求'>
        <View className='space-y-4'>
          <View>
            <Text className='block text-sm font-medium text-gray-900 mb-2'>任务标题</Text>
            <View className='rounded-lg' style={{ border: '1px solid #E5E7EB' }}>
              <Input
                className='w-full h-11 px-3 text-sm'
                placeholder='简要描述任务内容'
                value={postForm.title}
                onInput={(e) => setPostForm({ ...postForm, title: e.detail.value })}
              />
            </View>
          </View>
          <View>
            <Text className='block text-sm font-medium text-gray-900 mb-2'>任务类别</Text>
            <Picker
              mode='selector'
              range={categoryOptions}
              onChange={(e) => {
                const idx = Number(e.detail.value)
                const catIds = ['ai-dev', 'ai-comic', 'aigc', 'ai-consult']
                setPostForm({ ...postForm, category: catIds[idx] })
              }}
            >
              <View className='w-full h-11 px-3 rounded-lg flex items-center' style={{ border: '1px solid #E5E7EB' }}>
                <Text className='text-sm text-gray-500'>
                  {postForm.category ? getCategoryLabel(postForm.category) : '选择类别'}
                </Text>
              </View>
            </Picker>
          </View>
          <View>
            <Text className='block text-sm font-medium text-gray-900 mb-2'>预算范围</Text>
            <View className='rounded-lg' style={{ border: '1px solid #E5E7EB' }}>
              <Input
                className='w-full h-11 px-3 text-sm'
                placeholder='¥X,XXX - ¥X,XXX'
                value={postForm.budget}
                onInput={(e) => setPostForm({ ...postForm, budget: e.detail.value })}
              />
            </View>
          </View>
          <View>
            <Text className='block text-sm font-medium text-gray-900 mb-2'>截止日期</Text>
            <Picker
              mode='date'
              value={postForm.deadline}
              onChange={(e) => setPostForm({ ...postForm, deadline: e.detail.value })}
            >
              <View className='w-full h-11 px-3 rounded-lg flex items-center' style={{ border: '1px solid #E5E7EB' }}>
                <Text className='text-sm text-gray-500'>{postForm.deadline || '选择日期'}</Text>
              </View>
            </Picker>
          </View>
          <View>
            <Text className='block text-sm font-medium text-gray-900 mb-2'>联系方式</Text>
            <View className='rounded-lg' style={{ border: '1px solid #E5E7EB' }}>
              <Input
                className='w-full h-11 px-3 text-sm'
                placeholder='手机号/微信/邮箱'
                value={postForm.contact}
                onInput={(e) => setPostForm({ ...postForm, contact: e.detail.value })}
              />
            </View>
          </View>
          <View>
            <Text className='block text-sm font-medium text-gray-900 mb-2'>任务描述</Text>
            <View className='rounded-lg' style={{ border: '1px solid #E5E7EB' }}>
              <Textarea
                className='w-full px-3 py-2.5 text-sm'
                style={{ height: '120px' }}
                placeholder='详细描述任务需求、交付标准...'
                maxlength={500}
                value={postForm.description}
                onInput={(e) => setPostForm({ ...postForm, description: e.detail.value })}
              />
            </View>
          </View>
          <View
            className={`btn-primary w-full py-3 ${isSubmitting || !postForm.title.trim() ? 'opacity-50' : ''}`}
            onClick={isSubmitting || !postForm.title.trim() ? undefined : handlePostOrder}
          >
            <Text className='text-sm'>{isSubmitting ? '提交中...' : '发布任务'}</Text>
          </View>
        </View>
      </Modal>

      {/* Apply Modal */}
      <Modal visible={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title='申请接单'>
        {selectedGig && (
          <View className='space-y-4'>
            <View className='bg-gray-50 rounded-lg p-4'>
              <Text className='block text-sm font-medium text-gray-900 mb-1'>{selectedGig.title}</Text>
              <Text className='block text-xs text-gray-500'>{selectedGig.budget} · 截止 {selectedGig.deadline}</Text>
            </View>
            <View>
              <Text className='block text-sm font-medium text-gray-900 mb-2'>自我介绍</Text>
              <View className='rounded-lg' style={{ border: '1px solid #E5E7EB' }}>
                <Textarea
                  className='w-full px-3 py-2.5 text-sm'
                  style={{ height: '100px' }}
                  placeholder='简要介绍您的相关经验和优势...'
                />
              </View>
            </View>
            <View>
              <Text className='block text-sm font-medium text-gray-900 mb-2'>报价</Text>
              <View className='rounded-lg' style={{ border: '1px solid #E5E7EB' }}>
                <Input
                  className='w-full h-11 px-3 text-sm'
                  placeholder='您的报价金额'
                />
              </View>
            </View>
            <View>
              <Text className='block text-sm font-medium text-gray-900 mb-2'>预计交付时间</Text>
              <Picker mode='date' onChange={() => {}}>
                <View className='w-full h-11 px-3 rounded-lg flex items-center' style={{ border: '1px solid #E5E7EB' }}>
                  <Text className='text-sm text-gray-500'>选择日期</Text>
                </View>
              </Picker>
            </View>
            <View
              className='btn-primary w-full py-3'
              onClick={() => {
                setIsApplyModalOpen(false)
                Taro.showToast({ title: '提交成功', icon: 'success' })
              }}
            >
              <Text className='text-sm'>提交申请</Text>
            </View>
          </View>
        )}
      </Modal>

      <LoginModal />
    </View>
  )
}
