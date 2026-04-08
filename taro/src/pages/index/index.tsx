import { useState, useEffect, useMemo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro, { useShareAppMessage } from '@tarojs/taro'
import { useAuth } from '../../contexts/AuthContext'
import { request } from '../../utils/request'
import { ASSET_URL } from '../../constants'
import AnimatedCounter from '../../components/AnimatedCounter'
import LoginModal from '../../components/LoginModal'
import Icon from '../../components/Icon'

export default function Index() {
  const { setShowLoginModal } = useAuth()
  const [memberCount, setMemberCount] = useState<number | string>(5001)
  const [cityCount, setCityCount] = useState(26)
  const [communityCount, setCommunityCount] = useState(39)
  const [partnerCount, setPartnerCount] = useState(300)
  const [externalLinks, setExternalLinks] = useState<any[]>([])

  // 分享配置
  useShareAppMessage(() => ({
    title: 'WeOPC - 全国一站式OPC服务平台',
    path: '/pages/index/index',
    imageUrl: ''
  }))

  const features = useMemo(() => {
    const staticFeatures = [
      {
        title: '免费工位与政策红利',
        desc: `覆盖全国${communityCount}个OPC社区，提供零成本办公空间和政策补贴`,
        color: 'green',
        link: '/pages/policy/index',
        isInternal: true,
        sortOrder: 0,
      },
      {
        title: '算力支持与AI工具',
        desc: '最高1000万算力券补贴，免费使用主流AI开发工具',
        color: 'blue',
        link: '/pages/policy/index',
        isInternal: true,
        sortOrder: 1,
      },
      {
        title: '订单市场与资源对接',
        desc: `连接${partnerCount}+生态伙伴，获取AI漫剧、开发、设计等订单`,
        color: 'orange',
        link: '/pages/marketplace/index',
        isInternal: true,
        sortOrder: 3,
      },
    ]

    const externalFeatures = externalLinks
      .filter((link) => link.position === 'dashboard' || link.position === 'both')
      .map((link) => ({
        title: link.label,
        desc: link.description || '',
        iconImage: link.dashboardIconImage || link.iconImage,
        color: link.color || 'purple',
        link: link.url,
        isInternal: false,
        sortOrder: link.sortOrder,
      }))

    return [...staticFeatures, ...externalFeatures].sort((a, b) => a.sortOrder - b.sortOrder)
  }, [communityCount, partnerCount, externalLinks])

  useEffect(() => {
    request<{ displayCount: number; formattedCount: string }>({ url: '/api/member-count' })
      .then((data) => {
        if (data.formattedCount) setMemberCount(data.formattedCount)
        else if (data.displayCount) setMemberCount(data.displayCount)
      })
      .catch(() => {})

    request<{ cityCount: number; communityCount: number; partnerCount: number }>({ url: '/api/stats' })
      .then((data) => {
        if (data.cityCount) setCityCount(data.cityCount)
        if (data.communityCount) setCommunityCount(data.communityCount)
        if (data.partnerCount) setPartnerCount(data.partnerCount)
      })
      .catch(() => {})

    request<any[]>({ url: '/api/external-links' })
      .then((data) => setExternalLinks(data))
      .catch(() => {})
  }, [])

  const colorMap: Record<string, { bg: string; text: string; icon: string; iconColor: string }> = {
    green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'building-2', iconColor: '#16A34A' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'zap', iconColor: '#2563EB' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'handshake', iconColor: '#EA580C' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'link', iconColor: '#9333EA' },
  }

  const handleFeatureClick = (feature: any) => {
    if (feature.isInternal) {
      Taro.switchTab({ url: feature.link })
    } else {
      Taro.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(feature.link)}` })
    }
  }

  return (
    <View>
      {/* Hero Section */}
      <View className='text-center px-5' style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        {/* Alliance Badge */}
        <View className='flex justify-center' style={{ marginBottom: '32px' }}>
          <View className='inline-flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 shadow-card'>
            <Text className='text-sm font-medium text-gray-600'>Global AI Alumni Alliance</Text>
          </View>
        </View>

        {/* Logo */}
        <View className='flex flex-col items-center mb-8' style={{ gap: '24px' }}>
          <View style={{ width: '96px', height: '96px' }}>
            <Image src={`${ASSET_URL}/logo.GIF`} style={{ width: '96px', height: '96px' }} mode='scaleToFill' />
          </View>
          <Text className='text-4xl font-bold tracking-tight' style={{ color: '#3a3a3a' }}>WeOPC</Text>
        </View>

        {/* Subtitle */}
        <Text className='block text-xl font-medium text-gray-700 mb-3'>全国一站式OPC服务平台</Text>
        <Text className='block text-base text-gray-500 mb-12 px-4'>
          为新一代AI创业者提供工位、算力、资金、政策等全周期创业支持
        </Text>

        {/* Stats Dashboard */}
        <View className='grid grid-cols-2 gap-4'>
          <View className='bg-white p-6 rounded-xl border border-gray-200 shadow-card'>
            <View className='text-3xl font-bold text-emerald-500 mb-1'>
              <AnimatedCounter target={cityCount} />
            </View>
            <Text className='text-sm text-gray-500'>覆盖城市</Text>
          </View>
          <View className='bg-white p-6 rounded-xl border border-gray-200 shadow-card'>
            <View className='text-3xl font-bold text-yellow-500 mb-1'>
              <AnimatedCounter target={communityCount} />
            </View>
            <Text className='text-sm text-gray-500'>OPC社区</Text>
          </View>
          <View className='bg-white p-6 rounded-xl border border-gray-200 shadow-card'>
            <View className='text-3xl font-bold text-pink-500 mb-1'>
              {typeof memberCount === 'string' ? (
                <Text>{memberCount}</Text>
              ) : (
                <AnimatedCounter target={memberCount} />
              )}
            </View>
            <Text className='text-sm text-gray-500'>OPC会员</Text>
          </View>
          <View className='bg-white p-6 rounded-xl border border-gray-200 shadow-card'>
            <View className='text-3xl font-bold text-blue-500 mb-1'>
              <AnimatedCounter target={partnerCount} suffix='+' />
            </View>
            <Text className='text-sm text-gray-500'>生态伙伴</Text>
          </View>
        </View>
      </View>

      {/* Features Section */}
      <View className='px-5 mb-8'>
        <View className='text-center mb-8'>
          <Text className='block text-2xl font-bold text-gray-900 mb-4'>全周期创业服务</Text>
          <Text className='block text-base text-gray-500'>从注册到成长，WeOPC为您提供一站式支持</Text>
        </View>

        <View className='space-y-4'>
          {features.map((feature: any) => {
            const colors = colorMap[feature.color] || colorMap.purple
            return (
              <View
                key={feature.title}
                className='bg-white border border-gray-100 rounded-2xl p-6 shadow-card'
                onClick={() => handleFeatureClick(feature)}
              >
                <View className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                  {feature.iconImage ? (
                    <Image src={`${ASSET_URL}${feature.iconImage}`} className='w-7 h-7' mode='aspectFit' />
                  ) : (
                    <Icon name={colors.icon} size={22} color={colors.iconColor} />
                  )}
                </View>
                <Text className='block text-lg font-semibold text-gray-900 mb-2'>{feature.title}</Text>
                <Text className='block text-sm text-gray-500'>{feature.desc}</Text>
              </View>
            )
          })}
        </View>
      </View>

      {/* Quick Nav - News entry */}
      <View className='px-5 mb-6'>
        <View
          className='bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-card'
          onClick={() => Taro.navigateTo({ url: '/pages/news/index' })}
        >
          <View className='flex items-center gap-3'>
            <View className='w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center'>
              <Icon name='newspaper' size={20} color='#2563EB' />
            </View>
            <View>
              <Text className='block text-sm font-semibold text-gray-900'>每日AI新闻</Text>
              <Text className='block text-xs text-gray-500'>查看最新AI资讯</Text>
            </View>
          </View>
          <Text className='text-gray-400 text-lg'>
            <Icon name='chevron-right' size={18} color='#9CA3AF' />
          </Text>
        </View>
      </View>

      {/* CTA Section */}
      <View className='px-5 mb-8'>
        <View className='rounded-3xl overflow-hidden relative' style={{ background: 'linear-gradient(135deg, #1F2937, #111827)' }}>
          <View className='px-8 py-14 text-center'>
            <Text className='block text-2xl font-bold text-white mb-4'>
              准备好开启您的OPC之旅了吗？
            </Text>
            <Text className='block text-base text-gray-400 mb-8'>
              加入WeOPC，享受政策红利、算力支持、订单对接等全周期创业服务
            </Text>
            <View className='flex justify-center'>
              <View
                className='flex items-center px-8 py-3 bg-white rounded-xl shadow-lg'
                onClick={() => setShowLoginModal(true)}
              >
                <Text className='text-base font-medium text-gray-900' style={{ marginRight: '8px' }}>立即免费注册</Text>
                <Icon name='arrow-right' size={16} color='#111827' />
              </View>
            </View>
          </View>
        </View>
      </View>

      <LoginModal />
    </View>
  )
}
