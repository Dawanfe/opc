"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Clock, MapPin, Phone, Briefcase, Wand2, Video, Code, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/lib/utils';

interface Gig {
  id: number;
  title: string;
  category: string;
  budget: string;
  deadline: string;
  description: string;
  requirements: string;
  postedBy: string;
  postedAt: string;
  contact: string;
  status: 'open' | 'in-progress' | 'completed';
}

const categories = [
  { id: 'all', label: '全部', icon: Briefcase },
  { id: 'ai-dev', label: 'AI 应用与系统开发', icon: Code },
  { id: 'ai-comic', label: 'AI 漫剧与短剧全案', icon: Wand2 },
  { id: 'aigc', label: 'AIGC图像与视频创作', icon: Video },
  { id: 'ai-consult', label: 'AI 咨询与企业内训', icon: MessageSquare },
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
      console.error('发布需求失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.label || categoryId;
  };

  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
      case 'ai-dev': return 'bg-[#22C55E]/10 text-[#22C55E]';
      case 'ai-comic': return 'bg-[#EC4899]/10 text-[#EC4899]';
      case 'aigc': return 'bg-[#8B5CF6]/10 text-[#8B5CF6]';
      case 'ai-consult': return 'bg-[#F59E0B]/10 text-[#F59E0B]';
      case 'video-edit': return 'bg-[#3B82F6]/10 text-[#3B82F6]';
      default: return 'bg-gray-100 text-[#6B7280]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display mb-1">需求市场</h1>
          <p className="text-body">发布需求或承接任务,优先找到AI时代新机遇</p>
        </div>
        <button
          onClick={() => isLoggedIn ? setIsPostModalOpen(true) : setShowLoginModal(true)}
          className="btn-primary whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-2" />
          发布需求
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
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150
                  ${selectedCategory === cat.id
                    ? 'bg-[#111827] text-white'
                    : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
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
                className="opc-card p-4 sm:p-5 hover:border-gray-200 transition-all duration-150"
              >
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(gig.category)}`}>
                        {getCategoryLabel(gig.category)}
                      </span>
                      <span className="text-xs text-[#9CA3AF]">{gig.postedAt}</span>
                    </div>

                    <h3 className="text-base font-medium text-[#111827] mb-2">
                      {gig.title}
                    </h3>

                    <p className="text-sm text-[#6B7280] line-clamp-2 mb-3">
                      {gig.description}
                    </p>
                  </div>

                  {/* Bottom: info items + action button */}
                  <div className="space-y-3">
                    {/* Info Grid - 2x2 on mobile, inline on desktop */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 sm:gap-x-4 sm:gap-y-2">
                      <span className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-[#111827]">
                        <img src={apiUrl("/price.png")} alt="价格" className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-[#6B7280] hidden sm:inline">价格</span>
                        <span className="font-medium truncate">{gig.budget || '面议'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-[#111827]">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F59E0B] flex-shrink-0" />
                        <span className="text-[#6B7280] hidden sm:inline">截止</span>
                        <span className="font-medium truncate">{gig.deadline || '待定'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-[#111827]">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#959996] flex-shrink-0" />
                        <span className="text-[#6B7280] hidden sm:inline">地点</span>
                        <span className="font-medium truncate">{gig.postedBy || '未知'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-[#111827]">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00bf63] flex-shrink-0" />
                        <span className="text-[#6B7280] hidden sm:inline">联系人</span>
                        <span className="font-medium truncate">{isLoggedIn ? (gig.contact || '暂无') : '登录查看'}</span>
                      </span>
                    </div>
                    {/* Action Button - full width on mobile */}
                    <button
                      onClick={() => handleApply(gig)}
                      className="w-full sm:w-auto sm:ml-auto btn-primary text-xs sm:text-sm px-4 py-2 whitespace-nowrap"
                    >
                      我要接单
                    </button>
                  </div>
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
        <DialogContent className="max-w-lg mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#111827]">发布需求</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">任务标题</label>
              <input
                type="text"
                placeholder="简要描述任务内容"
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">任务类别</label>
              <select
                value={postForm.category}
                onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              >
                <option value="">选择类别</option>
                <option value="ai-dev">AI 应用与系统开发</option>
                <option value="ai-comic">AI 漫剧与短剧全案</option>
                <option value="aigc">AIGC图像与视频创作</option>
                <option value="ai-consult">AI 咨询、方案与企业内训</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">预算范围</label>
                <input
                  type="text"
                  placeholder="¥X,XXX - ¥X,XXX"
                  value={postForm.budget}
                  onChange={(e) => setPostForm({ ...postForm, budget: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">截止日期</label>
                <input
                  type="date"
                  value={postForm.deadline}
                  onChange={(e) => setPostForm({ ...postForm, deadline: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
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
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">任务描述</label>
              <textarea
                rows={4}
                placeholder="详细描述任务需求、交付标准..."
                value={postForm.description}
                onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none"
              />
            </div>
            <button
              onClick={handlePostOrder}
              disabled={isSubmitting || !postForm.title.trim()}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {isSubmitting ? '提交中...' : '发布任务'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-lg mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#111827]">申请接单</DialogTitle>
          </DialogHeader>
          {selectedGig && (
            <div className="space-y-4 pt-4">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="text-sm font-medium text-[#111827] mb-1">{selectedGig.title}</p>
                <p className="text-xs sm:text-sm text-[#6B7280]">{selectedGig.budget} · 截止 {selectedGig.deadline}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">自我介绍</label>
                <textarea
                  rows={3}
                  placeholder="简要介绍您的相关经验和优势..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">报价</label>
                <input
                  type="text"
                  placeholder="您的报价金额"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">预计交付时间</label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="w-full btn-primary py-3"
              >
                提交申请
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Message Modal */}
      <Dialog open={showSuccessMessage} onOpenChange={setShowSuccessMessage}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <div className="text-center py-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#111827] mb-2">提交成功</h3>
            <p className="text-sm text-[#6B7280]">您的需求已提交，审核通过后将在需求市场展示</p>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="mt-6 w-full btn-primary py-3"
            >
              知道了
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
