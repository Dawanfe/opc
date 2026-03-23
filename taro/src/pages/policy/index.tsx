import { useState, useMemo, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { useAuth } from '../../contexts/AuthContext'
import { request } from '../../utils/request'
import { CITY_FILTERS } from '../../constants'
import SearchBar from '../../components/SearchBar'
import FilterBar from '../../components/FilterBar'
import Modal from '../../components/Modal'
import BenefitItem from '../../components/BenefitItem'
import LoginModal from '../../components/LoginModal'
import Icon from '../../components/Icon'

interface PolicyItem {
  id: number
  province: string
  city: string
  district: string
  name: string
  address: string
  policySummary: string
  freeWorkspace: string
  freeAccommodation: string
  computingSupport: string
  investmentSupport: string
  registrationSupport: string
  otherServices: string
  contact: string
  benefitCount: number
}

const cityFilterItems = CITY_FILTERS.map((c) => ({ id: c, label: c }))

export default function PolicyPage() {
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('全部')
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [policies, setPolicies] = useState<PolicyItem[]>([])

  useEffect(() => {
    request<PolicyItem[]>({ url: '/api/admin/communities' })
      .then((data) => setPolicies(data))
      .catch(() => {})
  }, [])

  const filteredPolicies = useMemo(() => {
    let filtered = policies
    if (selectedCity !== '全部') {
      filtered = filtered.filter((p) => p.city === selectedCity)
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query))
    }
    return filtered
  }, [policies, searchQuery, selectedCity])

  const getBenefitCount = (policy: PolicyItem) => {
    const benefits = [
      policy.freeWorkspace && policy.freeWorkspace !== '未明确提及' && policy.freeWorkspace !== '否',
      policy.freeAccommodation && policy.freeAccommodation !== '未明确提及' && policy.freeAccommodation !== '否',
      policy.computingSupport && policy.computingSupport !== '未明确提及' && policy.computingSupport !== '否',
      policy.investmentSupport && policy.investmentSupport !== '未明确提及' && policy.investmentSupport !== '否',
      policy.registrationSupport && policy.registrationSupport !== '未明确提及' && policy.registrationSupport !== '否',
    ]
    return benefits.filter(Boolean).length
  }

  const isAvailable = (value: string) => value && value !== '未明确提及' && value !== '否'

  return (
    <View className='p-5'>
      {/* Header */}
      <View className='mb-5'>
        <Text className='block text-2xl font-semibold text-gray-900 mb-1'>优惠政策与免费工位</Text>
        <Text className='block text-sm text-gray-500 mb-1'>全国OPC社区政策查询，申请免费工位与其他政策福利</Text>
        <Text className='block text-sm text-gray-500'>
          共 <Text className='font-medium text-gray-900'>{filteredPolicies.length}</Text> 个社区
        </Text>
      </View>

      {/* Search */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder='搜索社区名称' />

      {/* City Filter */}
      <FilterBar items={cityFilterItems} selected={selectedCity} onSelect={setSelectedCity} />

      {/* Policy List */}
      <View className='space-y-4'>
        {filteredPolicies.map((policy) => {
          const benefitCount = getBenefitCount(policy)
          return (
            <View
              key={policy.id}
              className='bg-white rounded-xl p-5 border border-gray-100 shadow-card'
              onClick={() => { setSelectedPolicy(policy); setIsModalOpen(true) }}
            >
              <View className='flex items-center justify-between mb-3'>
                <View className='px-2.5 py-1 bg-gray-100 rounded'>
                  <Text className='text-xs font-medium text-gray-500'>
                    {policy.district ? `${policy.city}·${policy.district}` : policy.city}
                  </Text>
                </View>
                <View className='flex items-center' style={{ gap: '2px' }}>
                  {Array.from({ length: Math.min(benefitCount, 4) }).map((_, i) => (
                    <View key={i} className='rounded-full bg-green-500' style={{ width: '3px', height: '3px' }} />
                  ))}
                </View>
              </View>

              <Text className='block text-base font-medium text-gray-900 mb-2'>{policy.name}</Text>

              <View className='flex items-center gap-1 mb-2'>
                <Icon name='map-pin' size={14} color='#9CA3AF' />
                <Text className='text-sm text-gray-500 line-clamp-1'>{policy.address}</Text>
              </View>

              <Text className='block text-sm text-gray-500 line-clamp-2 mb-4'>
                {policy.policySummary || '暂无政策概述'}
              </Text>

              <View className='flex items-center justify-between'>
                <View className='flex items-center gap-3'>
                  {isAvailable(policy.freeWorkspace) && (
                    <View className='flex items-center gap-1'>
                      <Icon name='building-2' size={14} color='#22C55E' />
                      <Text className='text-xs text-gray-500'>免费工位</Text>
                    </View>
                  )}
                  {isAvailable(policy.computingSupport) && (
                    <View className='flex items-center gap-1'>
                      <Icon name='cpu' size={14} color='#3B82F6' />
                      <Text className='text-xs text-gray-500'>算力支持</Text>
                    </View>
                  )}
                  {isAvailable(policy.investmentSupport) && (
                    <View className='flex items-center gap-1'>
                      <Icon name='briefcase' size={14} color='#F97316' />
                      <Text className='text-xs text-gray-500'>创业投资</Text>
                    </View>
                  )}
                </View>
                <Text className='text-gray-400 text-lg'>
                  <Icon name='chevron-right' size={18} color='#9CA3AF' />
                </Text>
              </View>
            </View>
          )
        })}
      </View>

      {/* Detail Modal */}
      <Modal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPolicy?.name || ''}
        headerExtra={selectedPolicy ? (
          <View className='flex' style={{ marginBottom: '8px' }}>
            <View className='px-2 py-0.5 bg-gray-100 rounded'>
              <Text className='text-xs font-medium text-gray-500'>
                {selectedPolicy.district ? `${selectedPolicy.city}·${selectedPolicy.district}` : selectedPolicy.city}
              </Text>
            </View>
          </View>
        ) : undefined}
      >
        {selectedPolicy && (
          <View className='space-y-5'>
            {/* Address */}
            <View className='flex items-start' style={{ gap: '12px' }}>
              <View
                className='rounded-lg bg-gray-100 flex items-center justify-center'
                style={{ width: '32px', height: '32px', flexShrink: 0 }}
              >
                <Icon name='map-pin' size={16} color='#6B7280' />
              </View>
              <View>
                <Text className='block text-sm font-medium text-gray-900' style={{ marginBottom: '2px' }}>详细地址</Text>
                <Text className='block text-sm text-gray-500'>{selectedPolicy.address}</Text>
              </View>
            </View>

            {/* Policy Overview */}
            <View className='bg-gray-50 rounded-lg p-4'>
              <Text className='block text-sm font-medium text-gray-900 mb-2'>政策概述</Text>
              <Text className='block text-sm text-gray-500 leading-relaxed'>
                {selectedPolicy.policySummary || '暂无政策概述'}
              </Text>
            </View>

            {/* Benefits Grid */}
            <View>
              <Text className='block text-sm font-medium text-gray-900 mb-3'>支持政策</Text>
              <View className='grid grid-cols-2 gap-3'>
                <BenefitItem label='免费工位' value={selectedPolicy.freeWorkspace} color='green' />
                <BenefitItem label='算力支持' value={selectedPolicy.computingSupport} color='blue' />
                <BenefitItem label='创业投资' value={selectedPolicy.investmentSupport} color='orange' />
                <BenefitItem label='工商注册' value={selectedPolicy.registrationSupport} color='pink' />
              </View>
            </View>

            {/* Other Services */}
            {selectedPolicy.otherServices && selectedPolicy.otherServices !== '未明确提及' && (
              <View>
                <Text className='block text-sm font-medium text-gray-900 mb-2'>其他配套</Text>
                <Text className='block text-sm text-gray-500'>{selectedPolicy.otherServices}</Text>
              </View>
            )}

            {/* Contact Info */}
            <View>
              <View className='flex items-center mb-3' style={{ gap: '8px' }}>
                <Icon name='phone' size={16} color='#6B7280' />
                <Text className='text-sm font-medium text-gray-900'>联系方式</Text>
                {!isLoggedIn && (
                  <View className='px-2 py-0.5 bg-amber-50 rounded'>
                    <Text className='text-xs font-medium text-amber-600'>会员专享</Text>
                  </View>
                )}
              </View>

              {isLoggedIn ? (
                <View className='bg-gray-50 rounded-lg p-4 space-y-2'>
                  {selectedPolicy.contact?.split('；').map((contact, i) => (
                    <Text key={i} className='block text-sm text-gray-500'>{contact.trim()}</Text>
                  ))}
                </View>
              ) : (
                <View className='relative bg-gray-50 rounded-lg p-4 overflow-hidden'>
                  <View className='blur-locked'>
                    <Text className='block text-sm text-gray-500'>电话: 0XX-XXXX XXXX</Text>
                    <Text className='block text-sm text-gray-500'>邮箱: contact@example.com</Text>
                  </View>
                  <View className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-60'>
                    <View
                      className='flex items-center bg-gray-900 rounded-lg'
                      style={{ gap: '8px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px' }}
                      onClick={() => { setIsModalOpen(false); setShowLoginModal(true) }}
                    >
                      <Icon name='lock' size={14} color='#FFFFFF' />
                      <Text className='text-sm font-medium text-white'>注册解锁联系方式</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </Modal>

      <LoginModal />
    </View>
  )
}
