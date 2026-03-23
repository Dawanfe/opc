import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '../../contexts/AuthContext'
import { request } from '../../utils/request'
import { maskPhone, formatMemberId } from '../../utils/format'
import LoginModal from '../../components/LoginModal'
import Icon from '../../components/Icon'

const benefits = [
  { icon: 'building-2', iconColor: '#16A34A', title: '政策查询', desc: '全国OPC政策实时查询' },
  { icon: 'briefcase', iconColor: '#F97316', title: '工位申请', desc: '免费办公空间优先申请' },
  { icon: 'phone', iconColor: '#3B82F6', title: '联系方式', desc: '解锁社区联系方式' },
  { icon: 'check-circle', iconColor: '#22C55E', title: '活动优先', desc: '活动报名优先通道' },
]

function ContactUs() {
  const [groupQr, setGroupQr] = useState('')
  const [wechatQr, setWechatQr] = useState('')

  useEffect(() => {
    request<{ key: string; value: string }[]>({
      url: '/api/admin/settings?keys=group_qr_url,wechat_qr_url',
    })
      .then((data) => {
        data.forEach((item) => {
          if (item.key === 'group_qr_url') setGroupQr(item.value || '')
          if (item.key === 'wechat_qr_url') setWechatQr(item.value || '')
        })
      })
      .catch(() => {})
  }, [])

  return (
    <View className='mb-6'>
      <Text className='block text-lg font-medium text-gray-900 mb-3'>联系我们</Text>
      <View className='bg-white rounded-xl p-6 border border-gray-100 shadow-card'>
        <View className='flex items-center gap-2 mb-4'>
          <Text className='text-sm'>
            <Icon name='message-circle' size={16} color='#6B7280' />
          </Text>
          <Text className='text-sm font-medium text-gray-900'>添加微信加入WeOPC社群</Text>
        </View>
        <View className='flex gap-4'>
          <View className='flex-1 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden' style={{ height: '180px' }}>
            {groupQr ? (
              <Image src={groupQr} className='w-full h-full' mode='aspectFit' />
            ) : (
              <Text className='text-sm text-gray-400'>群二维码</Text>
            )}
          </View>
          <View className='flex-1 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden' style={{ height: '180px' }}>
            {wechatQr ? (
              <Image src={wechatQr} className='w-full h-full' mode='aspectFit' />
            ) : (
              <Text className='text-sm text-gray-400'>微信二维码</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

export default function ProfilePage() {
  const { isLoggedIn, user, setShowLoginModal, logout } = useAuth()

  if (!isLoggedIn) {
    return (
      <View className='p-5'>
        {/* Header */}
        <View className='mb-5'>
          <Text className='block text-2xl font-semibold text-gray-900 mb-1'>会员中心</Text>
          <Text className='block text-sm text-gray-500'>加入WeOPC会员，解锁全部权益</Text>
        </View>

        {/* Hero Card */}
        <View className='rounded-2xl p-8 mb-6' style={{ background: 'linear-gradient(135deg, #1F2937, #111827)' }}>
          <View className='flex items-center gap-1 mb-3'>
            <View className='rounded-full bg-green-500' style={{ width: '3px', height: '3px' }} />
            <View className='rounded-full bg-yellow-500' style={{ width: '3px', height: '3px' }} />
            <View className='rounded-full bg-orange-500' style={{ width: '3px', height: '3px' }} />
            <Text className='text-xs text-gray-400 ml-1'>WeOPC 会员</Text>
          </View>
          <Text className='block text-2xl font-semibold text-white mb-3'>成为会员，解锁全部权益</Text>
          <Text className='block text-sm text-gray-300 mb-6'>
            加入WeOPC会员，获取全国OPC社区联系方式、优先申请免费工位、参与独家活动，与百万创业者共同成长。
          </Text>
          <View className='flex gap-3'>
            <View
              className='px-5 py-2.5 bg-white rounded-lg'
              onClick={() => setShowLoginModal(true)}
            >
              <Text className='text-sm font-medium text-gray-900'>立即注册</Text>
            </View>
            <View
              className='px-5 py-2.5 rounded-lg'
              style={{ border: '1px solid rgba(255,255,255,0.4)' }}
              onClick={() => setShowLoginModal(true)}
            >
              <Text className='text-sm font-medium text-white'>已有账号，登录</Text>
            </View>
          </View>
        </View>

        {/* Benefits */}
        <View className='mb-6'>
          <Text className='block text-lg font-medium text-gray-900 mb-3'>会员权益</Text>
          <View className='grid grid-cols-2 gap-4'>
            {benefits.map((benefit) => (
              <View key={benefit.title} className='bg-white rounded-xl p-5 border border-gray-100 shadow-card text-center'>
                <View className='w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3'>
                  <Icon name={benefit.icon} size={22} color={benefit.iconColor} />
                </View>
                <Text className='block text-sm font-medium text-gray-900 mb-1'>{benefit.title}</Text>
                <Text className='block text-xs text-gray-500'>{benefit.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <ContactUs />
        <LoginModal />
      </View>
    )
  }

  // Logged in view
  return (
    <View className='p-5'>
      {/* Header */}
      <View className='mb-5'>
        <Text className='block text-2xl font-semibold text-gray-900 mb-1'>会员中心</Text>
        <Text className='block text-sm text-gray-500'>管理您的会员信息和权益</Text>
      </View>

      {/* Profile Card */}
      <View className='bg-white rounded-xl p-5 border border-gray-100 shadow-card mb-6'>
        <View className='flex items-start gap-4'>
          <View className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0'>
            {user?.avatar ? (
              <Image src={user.avatar} className='w-full h-full rounded-full' mode='aspectFill' />
            ) : (
              <Icon name='user' size={28} color='#9CA3AF' />
            )}
          </View>
          <View className='flex-1'>
            <View className='flex items-center gap-2 mb-1'>
              <Text className='text-lg font-semibold text-gray-900'>
                {user?.nickname || `用户${user?.phone?.slice(-4)}`}
              </Text>
              <View className='px-2 py-0.5 bg-green-50 rounded'>
                <Text className='text-xs font-medium text-green-600'>已认证</Text>
              </View>
            </View>
            <Text className='block text-sm text-gray-500 mb-2'>
              会员 ID: {user?.id ? formatMemberId(user.id) : '-'}
            </Text>
            <View className='flex items-center gap-1'>
              <Icon name='phone' size={14} color='#6B7280' />
              <Text className='text-sm text-gray-500'>{user?.phone ? maskPhone(user.phone) : '-'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Member Benefits */}
      <View className='mb-6'>
        <Text className='block text-lg font-medium text-gray-900 mb-3'>我的权益</Text>
        <View className='grid grid-cols-2 gap-4'>
          {benefits.map((benefit) => (
            <View key={benefit.title} className='bg-white rounded-xl p-5 border border-gray-100 shadow-card text-center relative'>
              <View className='absolute top-3 right-3'>
                <View className='rounded-full bg-green-500' style={{ width: '3px', height: '3px' }} />
              </View>
              <View className='w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3'>
                <Icon name={benefit.icon} size={22} color={benefit.iconColor} />
              </View>
              <Text className='block text-sm font-medium text-gray-900 mb-1'>{benefit.title}</Text>
              <Text className='block text-xs text-gray-500'>{benefit.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Invite Card */}
      <View className='mb-6'>
        <Text className='block text-lg font-medium text-gray-900 mb-3'>邀请好友</Text>
        <View
          className='bg-white rounded-xl p-5 border border-gray-100 shadow-card'
          onClick={() => Taro.navigateTo({ url: '/pages/invite/index' })}
        >
          <View className='flex items-center justify-between'>
            <View className='flex items-center gap-3'>
              <View className='w-12 h-12 rounded-full flex items-center justify-center' style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(234,179,8,0.15))' }}>
                <Text className='text-xl'>
                  <Icon name='gift' size={22} color='#22C55E' />
                </Text>
              </View>
              <View>
                <Text className='block text-sm font-semibold text-gray-900 mb-0.5'>邀请好友加入 WeOPC</Text>
                <Text className='block text-xs text-gray-500'>分享您的专属邀请码，与好友一起成长</Text>
              </View>
            </View>
            <Text className='text-green-500 text-xl'>
              <Icon name='chevron-right' size={20} color='#22C55E' />
            </Text>
          </View>
        </View>
      </View>

      <ContactUs />

      {/* Logout */}
      <View className='mb-8'>
        <View
          className='w-full py-3 text-center rounded-lg bg-white'
          style={{ border: '1px solid #E5E7EB' }}
          onClick={() => {
            logout()
            Taro.showToast({ title: '已退出登录', icon: 'success' })
          }}
        >
          <Text className='text-sm text-gray-500'>退出登录</Text>
        </View>
      </View>

      <LoginModal />
    </View>
  )
}
