import { useState, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '../../contexts/AuthContext'
import { getPendingInviteCode, clearPendingInviteCode } from '../../utils/storage'
import Icon from '../Icon'

type Tab = 'login' | 'register'

const inputStyle = {
  width: '100%',
  height: '48px',
  lineHeight: '48px',
  paddingLeft: '16px',
  paddingRight: '16px',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  fontSize: '14px',
  backgroundColor: '#fff',
  boxSizing: 'border-box' as const,
}

const inputFocusStyle = {
  ...inputStyle,
  borderColor: '#111827',
  outline: 'none',
}

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal, login, register } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('login')

  // Login form
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [regPhone, setRegPhone] = useState('')
  const [regNickname, setRegNickname] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regInviteCode, setRegInviteCode] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState('')

  useEffect(() => {
    if (showLoginModal) {
      const code = getPendingInviteCode()
      if (code) {
        setRegInviteCode(code)
        setActiveTab('register')
        clearPendingInviteCode()
      }
    }
  }, [showLoginModal])

  const resetForm = () => {
    setLoginPhone('')
    setLoginPassword('')
    setRegPhone('')
    setRegNickname('')
    setRegPassword('')
    setRegConfirmPassword('')
    setRegInviteCode('')
    setError('')
    setFocusedField('')
  }

  const switchTab = (tab: Tab) => {
    setActiveTab(tab)
    resetForm()
  }

  const handleLogin = async () => {
    const phone = loginPhone.replace(/\D/g, '')
    if (phone.length !== 11) {
      setError('请输入正确的手机号')
      return
    }
    if (loginPassword.length < 6) {
      setError('请输入密码（至少6位）')
      return
    }
    setLoading(true)
    setError('')
    const result = await login(phone, loginPassword)
    setLoading(false)
    if (!result.success) {
      setError(result.error || '登录失败')
    } else {
      resetForm()
    }
  }

  const handleRegister = async () => {
    const phone = regPhone.replace(/\D/g, '')
    if (phone.length !== 11) {
      setError('请输入正确的手机号')
      return
    }
    if (regPassword.length < 6) {
      setError('密码长度至少为6位')
      return
    }
    if (regPassword !== regConfirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    setLoading(true)
    setError('')
    const result = await register(regPhone, regPassword, regNickname || undefined, regInviteCode || undefined)
    setLoading(false)
    if (!result.success) {
      setError(result.error || '注册失败')
    } else {
      resetForm()
    }
  }

  const getStyle = (field: string) => focusedField === field ? inputFocusStyle : inputStyle

  if (!showLoginModal) return null

  return (
    <View className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <View
        className='absolute inset-0 bg-black bg-opacity-40'
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={() => setShowLoginModal(false)}
      />

      {/* Modal content */}
      <View className='relative w-[85vw] bg-white rounded-2xl overflow-hidden shadow-2xl' style={{ maxWidth: '400px' }}>
        {/* Close button */}
        <View
          className='absolute top-4 right-4 w-8 h-8 flex items-center justify-center z-10 rounded-full'
          onClick={() => setShowLoginModal(false)}
        >
          <Text className='text-gray-400 text-lg'>
            <Icon name='x' size={20} color='#9CA3AF' />
          </Text>
        </View>

        {/* Header */}
        <View className='px-8 pt-8 pb-6 text-center'>
          <Text className='block text-2xl font-bold text-gray-900'>欢迎加入WeOPC</Text>
          <Text className='block text-sm text-gray-500 mt-2'>登录解锁OPC政策红利</Text>
        </View>

        {/* Tabs */}
        <View className='flex border-b border-gray-100 px-8'>
          <View
            className={`flex-1 pb-3 text-sm font-medium relative ${activeTab === 'login' ? 'text-gray-900' : 'text-gray-400'}`}
            onClick={() => switchTab('login')}
          >
            <View className='flex items-center justify-center gap-1'>
              <Icon name='smartphone' size={16} color={activeTab === 'login' ? '#111827' : '#9CA3AF'} />
              <Text>手机号登录</Text>
            </View>
            {activeTab === 'login' && <View className='absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full' />}
          </View>
          <View
            className={`flex-1 pb-3 text-sm font-medium relative ${activeTab === 'register' ? 'text-gray-900' : 'text-gray-400'}`}
            onClick={() => switchTab('register')}
          >
            <View className='flex items-center justify-center gap-1'>
              <Icon name='user-plus' size={16} color={activeTab === 'register' ? '#111827' : '#9CA3AF'} />
              <Text>注册账号</Text>
            </View>
            {activeTab === 'register' && <View className='absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full' />}
          </View>
        </View>

        {/* Form */}
        <View className='p-8'>
          {error && (
            <View className='mb-4 p-3 bg-red-50 rounded-lg'>
              <Text className='text-sm text-red-500'>{error}</Text>
            </View>
          )}

          {activeTab === 'login' ? (
            <View className='space-y-5'>
              <View>
                <Text className='block text-sm font-medium text-gray-700 mb-2'>手机号码</Text>
                <Input
                  type='number'
                  placeholder='请输入11位手机号'
                  maxlength={11}
                  value={loginPhone}
                  onInput={(e) => setLoginPhone(e.detail.value)}
                  onFocus={() => setFocusedField('loginPhone')}
                  onBlur={() => setFocusedField('')}
                  style={getStyle('loginPhone')}
                />
              </View>
              <View>
                <Text className='block text-sm font-medium text-gray-700 mb-2'>密码</Text>
                <Input
                  password
                  placeholder='请输入密码'
                  value={loginPassword}
                  onInput={(e) => setLoginPassword(e.detail.value)}
                  onFocus={() => setFocusedField('loginPassword')}
                  onBlur={() => setFocusedField('')}
                  style={getStyle('loginPassword')}
                />
              </View>
              <View
                className={`w-full flex items-center justify-center rounded-lg text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-gray-900'}`}
                style={{ height: '48px' }}
                onClick={loading ? undefined : handleLogin}
              >
                <Text>{loading ? '登录中...' : '登录'}</Text>
              </View>
              <Text className='block text-xs text-gray-400 text-center'>
                验证码登录即将上线，敬请期待
              </Text>
            </View>
          ) : (
            <View className='space-y-4'>
              <View>
                <Text className='block text-sm font-medium text-gray-700 mb-2'>
                  手机号码 <Text className='text-red-500'>*</Text>
                </Text>
                <Input
                  type='number'
                  placeholder='请输入11位手机号'
                  maxlength={11}
                  value={regPhone}
                  onInput={(e) => setRegPhone(e.detail.value)}
                  onFocus={() => setFocusedField('regPhone')}
                  onBlur={() => setFocusedField('')}
                  style={getStyle('regPhone')}
                />
              </View>
              <View>
                <Text className='block text-sm font-medium text-gray-700 mb-2'>昵称</Text>
                <Input
                  placeholder='请输入昵称（可选）'
                  value={regNickname}
                  onInput={(e) => setRegNickname(e.detail.value)}
                  onFocus={() => setFocusedField('regNickname')}
                  onBlur={() => setFocusedField('')}
                  style={getStyle('regNickname')}
                />
              </View>
              <View>
                <Text className='block text-sm font-medium text-gray-700 mb-2'>
                  密码 <Text className='text-red-500'>*</Text>
                </Text>
                <Input
                  password
                  placeholder='请输入密码（至少6位）'
                  value={regPassword}
                  onInput={(e) => setRegPassword(e.detail.value)}
                  onFocus={() => setFocusedField('regPassword')}
                  onBlur={() => setFocusedField('')}
                  style={getStyle('regPassword')}
                />
              </View>
              <View>
                <Text className='block text-sm font-medium text-gray-700 mb-2'>
                  确认密码 <Text className='text-red-500'>*</Text>
                </Text>
                <Input
                  password
                  placeholder='请再次输入密码'
                  value={regConfirmPassword}
                  onInput={(e) => setRegConfirmPassword(e.detail.value)}
                  onFocus={() => setFocusedField('regConfirmPassword')}
                  onBlur={() => setFocusedField('')}
                  style={getStyle('regConfirmPassword')}
                />
              </View>
              <View>
                <Text className='block text-sm font-medium text-gray-700 mb-2'>邀请码（可选）</Text>
                <Input
                  placeholder='请输入邀请码（选填）'
                  maxlength={8}
                  value={regInviteCode}
                  onInput={(e) => setRegInviteCode(e.detail.value.toUpperCase())}
                  onFocus={() => setFocusedField('regInviteCode')}
                  onBlur={() => setFocusedField('')}
                  style={getStyle('regInviteCode')}
                />
                <Text className='block text-xs text-gray-500 mt-1'>
                  如果您有朋友的邀请码，可以在此填写
                </Text>
              </View>
              <View
                className={`w-full flex items-center justify-center rounded-lg text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-gray-900'}`}
                style={{ height: '48px' }}
                onClick={loading ? undefined : handleRegister}
              >
                <Text>{loading ? '注册中...' : '注册'}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View className='px-8 pb-8'>
          <View className='flex items-center justify-center gap-1'>
            <Icon name='check' size={12} color='#6B7280' />
            <Text className='text-xs text-gray-400'>登录即表示同意</Text>
            <Text className='text-xs text-gray-600 underline'>用户协议</Text>
            <Text className='text-xs text-gray-400'>和</Text>
            <Text className='text-xs text-gray-600 underline'>隐私政策</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
