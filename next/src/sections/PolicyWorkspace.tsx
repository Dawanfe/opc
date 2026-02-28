"use client";

import { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Building2, Cpu, Briefcase, Phone, ChevronRight, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/lib/utils';

interface PolicyItem {
  id: number;
  province: string;
  city: string;
  district: string;
  name: string;
  address: string;
  policySummary: string;
  freeWorkspace: string;
  freeAccommodation: string;
  computingSupport: string;
  investmentSupport: string;
  registrationSupport: string;
  otherServices: string;
  contact: string;
  benefitCount: number;
}

const cities = ['全部', '北京', '上海', '深圳', '杭州', '广州', '南京', '成都', '武汉', '厦门'];

export default function PolicyWorkspace() {
  const { isLoggedIn, setShowLoginModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('全部');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [policies, setPolicies] = useState<PolicyItem[]>([]);

  useEffect(() => {
    fetch(apiUrl('/api/admin/communities'))
      .then(res => res.json())
      .then(data => setPolicies(data))
      .catch(err => console.error('Failed to load policies:', err));
  }, []);

  const filteredPolicies = useMemo(() => {
    let filtered = policies;

    if (selectedCity !== '全部') {
      filtered = filtered.filter(p => p.city === selectedCity);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [policies, searchQuery, selectedCity]);

  const handlePolicyClick = (policy: PolicyItem) => {
    setSelectedPolicy(policy);
    setIsModalOpen(true);
  };

  const getBenefitCount = (policy: PolicyItem) => {
    const benefits = [
      policy.freeWorkspace && policy.freeWorkspace !== '未明确提及' && policy.freeWorkspace !== '否',
      policy.freeAccommodation && policy.freeAccommodation !== '未明确提及' && policy.freeAccommodation !== '否',
      policy.computingSupport && policy.computingSupport !== '未明确提及' && policy.computingSupport !== '否',
      policy.investmentSupport && policy.investmentSupport !== '未明确提及' && policy.investmentSupport !== '否',
      policy.registrationSupport && policy.registrationSupport !== '未明确提及' && policy.registrationSupport !== '否',
    ];
    return benefits.filter(Boolean).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display mb-1">优惠政策与免费工位</h1>
          <p className="text-body">全国OPC社区政策查询,申请免费工位与其他政策福利</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#6B7280]">
            共 <span className="font-medium text-[#111827]">{filteredPolicies.length}</span> 个社区
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="搜索社区名称"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150
                ${selectedCity === city
                  ? 'bg-[#111827] text-white'
                  : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                }
              `}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Policy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPolicies.map((policy) => {
          const benefitCount = getBenefitCount(policy);

          return (
            <div
              key={policy.id}
              onClick={() => handlePolicyClick(policy)}
              className="opc-card p-5 cursor-pointer group hover:border-gray-200 transition-all duration-150"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-[#6B7280]">
                    {policy.city}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(benefitCount, 4) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[3px] h-[3px] rounded-full bg-[#22C55E]"
                    />
                  ))}
                </div>
              </div>

              <h3 className="text-base font-medium text-[#111827] mb-2 group-hover:text-[#3B82F6] transition-colors">
                {policy.name}
              </h3>

              <div className="flex items-center gap-1 text-xs text-[#6B7280] mb-3">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{policy.address}</span>
              </div>

              <p className="text-sm text-[#6B7280] line-clamp-2 mb-4">
                {policy.policySummary || '暂无政策概述'}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {policy.freeWorkspace && policy.freeWorkspace !== '未明确提及' && policy.freeWorkspace !== '否' && (
                    <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                      <Building2 className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>免费工位</span>
                    </div>
                  )}
                  {policy.computingSupport && policy.computingSupport !== '未明确提及' && policy.computingSupport !== '否' && (
                    <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                      <Cpu className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span>算力支持</span>
                    </div>
                  )}
                  {policy.investmentSupport && policy.investmentSupport !== '未明确提及' && policy.investmentSupport !== '否' && (
                    <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                      <Briefcase className="w-3.5 h-3.5 text-[#F97316]" />
                      <span>创业投资</span>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#111827] transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {selectedPolicy && (
            <>
              <DialogHeader className="p-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-[#6B7280]">
                        {selectedPolicy.district ? `${selectedPolicy.city}·${selectedPolicy.district}` : selectedPolicy.city}
                      </span>
                    </div>
                    <DialogTitle className="text-xl font-semibold text-[#111827]">
                      {selectedPolicy.name}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-6 space-y-6">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#6B7280]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111827] mb-0.5">详细地址</p>
                    <p className="text-sm text-[#6B7280]">{selectedPolicy.address}</p>
                  </div>
                </div>

                {/* Policy Overview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-[#111827] mb-2">政策概述</p>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    {selectedPolicy.policySummary || '暂无政策概述'}
                  </p>
                </div>

                {/* Benefits Grid */}
                <div>
                  <p className="text-sm font-medium text-[#111827] mb-3">支持政策</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <BenefitItem
                      icon={Building2}
                      label="免费工位"
                      value={selectedPolicy.freeWorkspace}
                      color="green"
                    />
                    <BenefitItem
                      icon={Cpu}
                      label="算力支持"
                      value={selectedPolicy.computingSupport}
                      color="blue"
                    />
                    <BenefitItem
                      icon={Briefcase}
                      label="创业投资"
                      value={selectedPolicy.investmentSupport}
                      color="orange"
                    />
                    <BenefitItem
                      icon={Building2}
                      label="工商注册"
                      value={selectedPolicy.registrationSupport}
                      color="pink"
                    />
                  </div>
                </div>

                {/* Other Services */}
                {selectedPolicy.otherServices && selectedPolicy.otherServices !== '未明确提及' && (
                  <div>
                    <p className="text-sm font-medium text-[#111827] mb-2">其他配套</p>
                    <p className="text-sm text-[#6B7280]">{selectedPolicy.otherServices}</p>
                  </div>
                )}

                {/* Contact Info - Locked for non-members */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="w-4 h-4 text-[#6B7280]" />
                    <p className="text-sm font-medium text-[#111827]">联系方式</p>
                    {!isLoggedIn && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-xs font-medium">
                        会员专享
                      </span>
                    )}
                  </div>

                  {isLoggedIn ? (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {selectedPolicy.contact?.split('；').map((contact, i) => (
                        <p key={i} className="text-sm text-[#6B7280]">{contact.trim()}</p>
                      ))}
                    </div>
                  ) : (
                    <div className="relative bg-gray-50 rounded-lg p-4 overflow-hidden">
                      <div className="blur-sm select-none">
                        <p className="text-sm text-[#6B7280]">电话: 0XX-XXXX XXXX</p>
                        <p className="text-sm text-[#6B7280]">邮箱: contact@example.com</p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                        <button
                          onClick={() => setShowLoginModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          <Lock className="w-4 h-4" />
                          注册解锁联系方式
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BenefitItem({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    green: { bg: 'bg-[#22C55E]/5', text: 'text-[#22C55E]' },
    blue: { bg: 'bg-[#3B82F6]/5', text: 'text-[#3B82F6]' },
    orange: { bg: 'bg-[#F97316]/5', text: 'text-[#F97316]' },
    pink: { bg: 'bg-[#EC4899]/5', text: 'text-[#EC4899]' },
  };

  const hasValue = value && value !== '未明确提及' && value !== '否';

  return (
    <div className={`p-3 rounded-lg ${hasValue ? colorMap[color].bg : 'bg-gray-50'}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${hasValue ? colorMap[color].text : 'text-[#9CA3AF]'}`} />
        <span className={`text-xs font-medium ${hasValue ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>
          {label}
        </span>
      </div>
      <p className={`text-sm ${hasValue ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
        {hasValue ? value : '未明确'}
      </p>
    </div>
  );
}
