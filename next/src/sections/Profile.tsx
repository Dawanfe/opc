"use client";

import { useState } from 'react';
import { User, Mail, Phone, Building2, Briefcase, CheckCircle, Edit2, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const benefits = [
  { icon: Building2, title: '政策查询', desc: '全国OPC政策实时查询' },
  { icon: Briefcase, title: '工位申请', desc: '免费办公空间优先申请' },
  { icon: Phone, title: '联系方式', desc: '解锁社区联系方式' },
  { icon: CheckCircle, title: '活动优先', desc: '活动报名优先通道' },
];

export default function Profile() {
  const { isLoggedIn, user, setShowLoginModal } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-display mb-1">会员中心</h1>
          <p className="text-body">加入WeOPC会员，解锁全部权益</p>
        </div>

        {/* Hero Card */}
        <div className="opc-card bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <div className="w-[3px] h-[3px] rounded-full bg-[#22C55E]" />
                <div className="w-[3px] h-[3px] rounded-full bg-[#EAB308]" />
                <div className="w-[3px] h-[3px] rounded-full bg-[#F97316]" />
              </div>
              <span className="text-xs text-gray-400">WeOPC 会员</span>
            </div>

            <h2 className="text-2xl font-semibold mb-3">成为会员，解锁全部权益</h2>
            <p className="text-sm text-gray-400 mb-6">
              加入WeOPC会员，获取全国OPC社区联系方式、优先申请免费工位、
              参与独家活动，与百万创业者共同成长。
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowLoginModal(true)}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                立即注册
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-transparent text-white text-sm font-medium rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors"
              >
                已有账号，登录
              </button>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div>
          <h2 className="text-title mb-4">会员权益</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="opc-card p-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-[#6B7280]" />
                  </div>
                  <h3 className="text-sm font-medium text-[#111827] mb-1">{benefit.title}</h3>
                  <p className="text-xs text-[#9CA3AF]">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Logged in view
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display mb-1">会员中心</h1>
          <p className="text-body">管理您的会员信息和权益</p>
        </div>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className="btn-secondary"
        >
          {isEditMode ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              保存
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4 mr-2" />
              编辑
            </>
          )}
        </button>
      </div>

      {/* Profile Card */}
      <div className="opc-card">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.nickname || ''} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-[#6B7280]" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-[#111827]">{user?.nickname || `用户${user?.phone?.slice(-4)}`}</h2>
              <span className="px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] rounded text-xs font-medium">
                已认证
              </span>
            </div>
            <p className="text-sm text-[#6B7280] mb-3">会员 ID: WOPC{user?.id?.toString().padStart(8, '0')}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{user?.phone ? `${user.phone.slice(0, 3)}****${user.phone.slice(-4)}` : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Member Benefits */}
      <div>
        <h2 className="text-title mb-4">我的权益</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="opc-card p-5 text-center relative">
                <div className="absolute top-3 right-3">
                  <div className="w-[3px] h-[3px] rounded-full bg-[#22C55E]" />
                </div>
                <div className="w-12 h-12 rounded-full bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-[#22C55E]" />
                </div>
                <h3 className="text-sm font-medium text-[#111827] mb-1">{benefit.title}</h3>
                <p className="text-xs text-[#9CA3AF]">{benefit.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity History */}
      <div>
        <h2 className="text-title mb-4">最近活动</h2>
        <div className="opc-card">
          <div className="space-y-4">
            {[
              { action: '浏览了政策', target: '张江AI小镇 OPC孵化中心', time: '2小时前' },
              { action: '收藏了社区', target: '微软加速器 (上海)', time: '1天前' },
              { action: '报名了活动', target: '极客公园大会主舞台', time: '2天前' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                  <div>
                    <p className="text-sm text-[#111827]">{item.action}</p>
                    <p className="text-xs text-[#6B7280]">{item.target}</p>
                  </div>
                </div>
                <span className="text-xs text-[#9CA3AF]">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
