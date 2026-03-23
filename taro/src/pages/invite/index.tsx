import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '../../contexts/AuthContext'
import { request } from '../../utils/request'
import { WEB_URL } from '../../constants'
import { formatDate } from '../../utils/format'
import LoginModal from '../../components/LoginModal'
import Empty from '../../components/Empty'
import Icon from '../../components/Icon'

interface InviteInfo {
  user: {
    id: number
    nickname: string
    phone: string
    inviteCode: string
  }
  inviter: {
    id: number
    nickname: string
    phone: string
  } | null
  stats: {
    totalInvites: number
    activatedInvites: number
  }
  inviteList: {
    id: number
    inviteeId: number
    inviteCode: string
    status: string
    createdAt: string
    activatedAt: string
    inviteeName: string
    inviteePhone: string
  }[]
}

export default function InvitePage() {
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (isLoggedIn) {
      fetchInviteInfo()
    } else {
      setIsLoading(false)
    }
  }, [isLoggedIn])

  const fetchInviteInfo = async () => {
    try {
      setIsLoading(true)
      const data = await request<InviteInfo>({
        url: '/api/user/invite-info',
        needAuth: true,
      })
      setInviteInfo(data)
    } catch {
      Taro.showToast({ title: '获取邀请信息失败', icon: 'none' })
    } finally {
      setIsLoading(false)
    }
  }

  const generateInviteCode = async () => {
    try {
      setIsGenerating(true)
      await request({
        url: '/api/user/generate-invite-code',
        method: 'POST',
        needAuth: true,
      })
      Taro.showToast({ title: '邀请码生成成功', icon: 'success' })
      fetchInviteInfo()
    } catch (err: any) {
      Taro.showToast({ title: err.message || '生成失败', icon: 'none' })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyInviteCode = () => {
    if (!inviteInfo?.user.inviteCode) return
    Taro.setClipboardData({
      data: inviteInfo.user.inviteCode,
      success: () => Taro.showToast({ title: '邀请码已复制', icon: 'success' }),
    })
  }

  const copyInviteLink = () => {
    if (!inviteInfo?.user.inviteCode) return
    const link = `${WEB_URL}/register?invite=${inviteInfo.user.inviteCode}`
    Taro.setClipboardData({
      data: link,
      success: () => Taro.showToast({ title: '邀请链接已复制', icon: 'success' }),
    })
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <View className='p-5'>
        <View className='mb-5'>
          <Text className='block text-2xl font-semibold text-gray-900 mb-1'>我的邀请</Text>
          <Text className='block text-sm text-gray-500'>邀请好友加入WeOPC，共同成长</Text>
        </View>

        <View className='rounded-2xl p-8' style={{ background: 'linear-gradient(135deg, #1F2937, #111827)' }}>
          <Text className='block text-2xl font-bold text-white mb-4'>邀请好友，共享权益</Text>
          <Text className='block text-base text-gray-300 mb-6'>
            登录后即可获得专属邀请码，邀请好友注册后可查看邀请记录和统计数据
          </Text>
          <View
            className='inline-flex px-6 py-3 bg-white rounded-lg'
            onClick={() => setShowLoginModal(true)}
          >
            <Text className='text-sm font-medium text-gray-900'>立即登录</Text>
          </View>
        </View>

        <LoginModal />
      </View>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <View className='p-5'>
        <Text className='block text-2xl font-semibold text-gray-900 mb-1'>我的邀请</Text>
        <Text className='block text-sm text-gray-500'>加载中...</Text>
      </View>
    )
  }

  // Logged in
  return (
    <View className='p-5'>
      {/* Header */}
      <View className='mb-5'>
        <Text className='block text-2xl font-semibold text-gray-900 mb-1'>我的邀请</Text>
        <Text className='block text-sm text-gray-500'>邀请好友加入WeOPC，共同成长</Text>
      </View>

      {/* Invite Code Card */}
      <View className='bg-white rounded-xl p-5 border-2 border-gray-900 shadow-card mb-5'>
        <View className='flex items-center gap-2 mb-4'>
          <Icon name='gift' size={20} color='#111827' />
          <Text className='text-base font-semibold text-gray-900'>我的邀请码</Text>
        </View>

        <View className='bg-gray-50 rounded-lg p-4 mb-4'>
          <Text className='block text-xs text-gray-500 mb-1'>您的专属邀请码</Text>
          {inviteInfo?.user.inviteCode ? (
            <Text className='block text-3xl font-bold font-mono tracking-wider text-gray-900'>
              {inviteInfo.user.inviteCode}
            </Text>
          ) : (
            <View>
              <Text className='block text-sm text-gray-500 mb-3'>您还没有邀请码</Text>
              <View
                className={`inline-flex px-4 py-2 border border-gray-200 rounded-lg ${isGenerating ? 'opacity-50' : ''}`}
                onClick={isGenerating ? undefined : generateInviteCode}
              >
                <Text className='text-sm'>{isGenerating ? '生成中...' : '立即生成邀请码'}</Text>
              </View>
            </View>
          )}
        </View>

        {inviteInfo?.user.inviteCode && (
          <View className='flex gap-3'>
            <View className='flex-1 btn-secondary py-2.5 text-center' onClick={copyInviteCode}>
              <View className='flex items-center justify-center gap-1'>
                <Icon name='copy' size={14} color='#111827' />
                <Text className='text-sm'>复制邀请码</Text>
              </View>
            </View>
            <View className='flex-1 btn-primary py-2.5 text-center' onClick={copyInviteLink}>
              <View className='flex items-center justify-center gap-1'>
                <Icon name='user-plus' size={14} color='#FFFFFF' />
                <Text className='text-sm'>复制邀请链接</Text>
              </View>
            </View>
          </View>
        )}

        {inviteInfo?.inviter && (
          <View className='mt-4'>
            <Text className='text-sm text-gray-500'>
              您是由 <Text className='font-semibold'>{inviteInfo.inviter.nickname}</Text> 邀请加入的
            </Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View className='grid grid-cols-2 gap-4 mb-5'>
        <View className='bg-white rounded-xl p-5 border border-gray-100 shadow-card'>
          <View className='flex items-center justify-between mb-2'>
            <Text className='text-sm font-medium text-gray-900'>总邀请人数</Text>
            <Icon name='users' size={18} color='#9CA3AF' />
          </View>
          <Text className='block text-3xl font-bold text-gray-900'>
            {inviteInfo?.stats.totalInvites || 0}
          </Text>
          <Text className='block text-xs text-gray-500 mt-1'>累计邀请的好友数量</Text>
        </View>
        <View className='bg-white rounded-xl p-5 border border-gray-100 shadow-card'>
          <View className='flex items-center justify-between mb-2'>
            <Text className='text-sm font-medium text-gray-900'>已激活</Text>
            <Icon name='check-circle' size={18} color='#9CA3AF' />
          </View>
          <Text className='block text-3xl font-bold text-gray-900'>
            {inviteInfo?.stats.activatedInvites || 0}
          </Text>
          <Text className='block text-xs text-gray-500 mt-1'>已成功注册的好友数量</Text>
        </View>
      </View>

      {/* Invite Records */}
      <View className='bg-white rounded-xl p-5 border border-gray-100 shadow-card mb-5'>
        <View className='flex items-center gap-2 mb-4'>
          <Icon name='trending-up' size={16} color='#6B7280' />
          <Text className='text-base font-semibold text-gray-900'>邀请记录（最近20条）</Text>
        </View>

        {!inviteInfo?.inviteList || inviteInfo.inviteList.length === 0 ? (
          <Empty message='还没有邀请记录' />
        ) : (
          <View className='space-y-3'>
            {inviteInfo.inviteList.map((record) => (
              <View key={record.id} className='flex items-center justify-between py-3 border-b border-gray-200'>
                <View>
                  <Text className='block text-sm font-medium text-gray-900'>
                    {record.inviteeName || '-'}
                  </Text>
                  <Text className='block text-xs text-gray-400 mt-0.5'>
                    {record.inviteePhone || '-'} · {formatDate(record.createdAt)}
                  </Text>
                </View>
                <View className={`px-2.5 py-1 rounded-full ${
                  record.status === 'activated'
                    ? 'bg-green-100'
                    : 'bg-yellow-100'
                }`}>
                  <Text className={`text-xs font-medium ${
                    record.status === 'activated'
                      ? 'text-green-700'
                      : 'text-yellow-700'
                  }`}>
                    {record.status === 'activated' ? '已激活' : '待激活'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* How to invite */}
      <View className='bg-white rounded-xl p-5 border border-gray-100 shadow-card mb-6'>
        <Text className='block text-base font-semibold text-gray-900 mb-4'>如何邀请好友</Text>
        <View className='space-y-4'>
          {[
            { step: '1', title: '复制邀请码或链接', desc: '点击上方按钮复制您的专属邀请码或邀请链接' },
            { step: '2', title: '分享给好友', desc: '将邀请码或链接分享给您的好友，邀请他们注册WeOPC' },
            { step: '3', title: '查看邀请记录', desc: '好友注册成功后，您可以在邀请记录中查看详情' },
          ].map((item) => (
            <View key={item.step} className='flex gap-3'>
              <View className='w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0'>
                <Text className='text-xs text-white font-bold'>{item.step}</Text>
              </View>
              <View>
                <Text className='block text-sm font-medium text-gray-900'>{item.title}</Text>
                <Text className='block text-xs text-gray-500 mt-0.5'>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <LoginModal />
    </View>
  )
}
