"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Clock, DollarSign, User, Briefcase, Wand2, Video, Code } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/lib/utils';

interface Gig {
  id: number;
  title: string;
  category: 'ai-comic' | 'video-edit' | 'ai-dev' | 'other';
  budget: string;
  deadline: string;
  description: string;
  requirements: string;
  postedBy: string;
  postedAt: string;
  status: 'open' | 'in-progress' | 'completed';
}

const categories = [
  { id: 'all', label: '全部', icon: Briefcase },
  { id: 'ai-comic', label: 'AI漫剧制作', icon: Wand2 },
  { id: 'video-edit', label: '视频剪辑', icon: Video },
  { id: 'ai-dev', label: 'AI技术开发', icon: Code },
  { id: 'other', label: '其他', icon: Briefcase },
];

export default function AIGigMarketplace() {
  const { isLoggedIn, setShowLoginModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 发布订单表单状态
  const [postForm, setPostForm] = useState({
    title: '',
    category: '',
    budget: '',
    deadline: '',
    description: '',
    contact: '',
  });

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      const res = await fetch(apiUrl('/api/demands'));
      if (res.ok) {
        const data = await res.json();
        setGigs(data);
      }
    } catch (error) {
      console.error('获取需求列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gig.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || gig.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleApply = (gig: Gig) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setSelectedGig(gig);
    setIsApplyModalOpen(true);
  };

  const handlePostOrder = async () => {
    if (!postForm.title.trim()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('user_token');
      const res = await fetch(apiUrl('/api/demands'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postForm),
      });

      if (res.ok) {
        setIsPostModalOpen(false);
        setShowSuccessMessage(true);
        setPostForm({ title: '', category: '', budget: '', deadline: '', description: '', contact: '' });
      }
    } catch (error) {
      console.error('发布订单失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.label || categoryId;
  };

  const getRequirementsList = (requirements: string): string[] => {
    if (!requirements) return [];
    return requirements.split(',').map(r => r.trim()).filter(Boolean);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display mb-1">订单市场</h1>
          <p className="text-body">发布订单或承接任务,优先找到AI时代新机遇</p>
        </div>
        <button
          onClick={() => isLoggedIn ? setIsPostModalOpen(true) : setShowLoginModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          发布订单
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="搜索任务标题、描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150
                  ${selectedCategory === cat.id
                    ? 'bg-[#111827] text-white'
                    : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-[#6B7280]">加载中...</p>
        </div>
      )}

      {/* Gig List */}
      {!isLoading && (
        <div className="space-y-3">
          {filteredGigs.map((gig) => (
              <div
                key={gig.id}
                className="opc-card p-5 hover:border-gray-200 transition-all duration-150"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`
                        px-2 py-0.5 rounded text-xs font-medium
                        ${gig.category === 'ai-comic' ? 'bg-[#EC4899]/10 text-[#EC4899]' : ''}
                        ${gig.category === 'video-edit' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : ''}
                        ${gig.category === 'ai-dev' ? 'bg-[#22C55E]/10 text-[#22C55E]' : ''}
                        ${gig.category === 'other' ? 'bg-gray-100 text-[#6B7280]' : ''}
                      `}>
                        {getCategoryLabel(gig.category)}
                      </span>
                      <span className="text-xs text-[#9CA3AF]">{gig.postedAt} 发布</span>
                    </div>

                    <h3 className="text-base font-medium text-[#111827] mb-2">
                      {gig.title}
                    </h3>

                    <p className="text-sm text-[#6B7280] line-clamp-2 mb-3">
                      {gig.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-[#111827]">
                        <DollarSign className="w-4 h-4 text-[#22C55E]" />
                        <span className="font-medium">{gig.budget}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#6B7280]">
                        <Clock className="w-4 h-4 text-[#9CA3AF]" />
                        <span>截止 {gig.deadline}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#6B7280]">
                        <User className="w-4 h-4 text-[#9CA3AF]" />
                        <span>{gig.postedBy}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApply(gig)}
                    className="btn-primary whitespace-nowrap"
                  >
                    我要接单
                  </button>
                </div>
              </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredGigs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#6B7280]">暂无匹配的任务</p>
          <p className="text-sm text-[#9CA3AF]">尝试调整搜索条件或筛选类别</p>
        </div>
      )}

      {/* Post Gig Modal */}
      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#111827]">发布订单</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">任务标题</label>
              <input
                type="text"
                placeholder="简要描述任务内容"
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">任务类别</label>
              <select
                value={postForm.category}
                onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              >
                <option value="">选择类别</option>
                <option value="ai-comic">AI漫剧制作</option>
                <option value="video-edit">视频剪辑</option>
                <option value="ai-dev">AI技术开发</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">预算范围</label>
                <input
                  type="text"
                  placeholder="¥X,XXX - ¥X,XXX"
                  value={postForm.budget}
                  onChange={(e) => setPostForm({ ...postForm, budget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">截止日期</label>
                <input
                  type="date"
                  value={postForm.deadline}
                  onChange={(e) => setPostForm({ ...postForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">联系方式</label>
              <input
                type="text"
                placeholder="手机号/微信/邮箱"
                value={postForm.contact}
                onChange={(e) => setPostForm({ ...postForm, contact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">任务描述</label>
              <textarea
                rows={4}
                placeholder="详细描述任务需求、交付标准..."
                value={postForm.description}
                onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none"
              />
            </div>
            <button
              onClick={handlePostOrder}
              disabled={isSubmitting || !postForm.title.trim()}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isSubmitting ? '提交中...' : '发布任务'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#111827]">申请接单</DialogTitle>
          </DialogHeader>
          {selectedGig && (
            <div className="space-y-4 pt-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-[#111827] mb-1">{selectedGig.title}</p>
                <p className="text-sm text-[#6B7280]">{selectedGig.budget} · 截止 {selectedGig.deadline}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">自我介绍</label>
                <textarea
                  rows={3}
                  placeholder="简要介绍您的相关经验和优势..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">报价</label>
                <input
                  type="text"
                  placeholder="您的报价金额"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">预计交付时间</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="w-full btn-primary"
              >
                提交申请
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Message Modal */}
      <Dialog open={showSuccessMessage} onOpenChange={setShowSuccessMessage}>
        <DialogContent className="max-w-md">
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#111827] mb-2">提交成功</h3>
            <p className="text-sm text-[#6B7280]">您的订单需求已提交，审核通过后将在需求广场展示</p>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="mt-6 w-full btn-primary"
            >
              知道了
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
