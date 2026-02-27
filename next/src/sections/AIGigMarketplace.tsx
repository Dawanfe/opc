"use client";

import { useState } from 'react';
import { Search, Plus, Clock, DollarSign, User, Briefcase, Wand2, Video, Code } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

interface Gig {
  id: string;
  title: string;
  category: 'ai-comic' | 'video-edit' | 'ai-dev' | 'other';
  budget: string;
  deadline: string;
  description: string;
  requirements: string[];
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

const sampleGigs: Gig[] = [
  {
    id: '1',
    title: 'AI漫剧《未来都市》角色设计',
    category: 'ai-comic',
    budget: '¥5,000 - ¥8,000',
    deadline: '2026-03-15',
    description: '需要为科幻题材AI漫剧设计主要角色形象，包含主角3人、配角5人，要求风格统一，适合AI生成 workflow。',
    requirements: ['熟练使用 Midjourney/Stable Diffusion', '有漫画角色设计经验', '能输出角色设定文档'],
    postedBy: '未来视界传媒',
    postedAt: '2026-02-25',
    status: 'open',
  },
  {
    id: '2',
    title: '企业宣传视频后期剪辑',
    category: 'video-edit',
    budget: '¥3,000 - ¥5,000',
    deadline: '2026-03-10',
    description: '科技公司产品发布会视频剪辑，时长约5分钟，需要添加字幕、特效和背景音乐。',
    requirements: ['熟练使用 Premiere Pro / Final Cut', '有商业视频剪辑经验', '能理解科技产品调性'],
    postedBy: '创新科技有限公司',
    postedAt: '2026-02-26',
    status: 'open',
  },
  {
    id: '3',
    title: '智能客服对话系统开发',
    category: 'ai-dev',
    budget: '¥20,000 - ¥35,000',
    deadline: '2026-04-01',
    description: '基于大语言模型的智能客服系统，需要支持多轮对话、知识库检索、工单自动创建等功能。',
    requirements: ['熟悉 Python / Node.js', '有 LLM API 集成经验', '了解 RAG 技术'],
    postedBy: '云智科技',
    postedAt: '2026-02-24',
    status: 'open',
  },
  {
    id: '4',
    title: 'AI生成短视频批量制作',
    category: 'video-edit',
    budget: '¥8,000 - ¥12,000',
    deadline: '2026-03-20',
    description: '需要制作30条电商产品推广短视频，每条15-30秒，使用AI工具辅助生成素材。',
    requirements: ['熟练使用剪映/CapCut', '了解 AI 视频生成工具', '有电商视频制作经验'],
    postedBy: '优选电商',
    postedAt: '2026-02-27',
    status: 'open',
  },
  {
    id: '5',
    title: 'AI绘本插画绘制',
    category: 'ai-comic',
    budget: '¥10,000 - ¥15,000',
    deadline: '2026-03-30',
    description: '儿童绘本项目，需要绘制20页插画，风格温馨可爱，适合3-6岁儿童。',
    requirements: ['有儿童插画经验', '熟练使用 AI 绘画工具', '能配合修改调整'],
    postedBy: '童趣出版社',
    postedAt: '2026-02-23',
    status: 'open',
  },
  {
    id: '6',
    title: 'AI Agent 自动化工作流开发',
    category: 'ai-dev',
    budget: '¥15,000 - ¥25,000',
    deadline: '2026-03-25',
    description: '开发自动化内容发布Agent，实现从选题、写作、配图到多平台发布的全流程自动化。',
    requirements: ['熟悉 LangChain / AutoGen', '有 API 集成经验', '了解内容运营流程'],
    postedBy: '自媒体工作室',
    postedAt: '2026-02-26',
    status: 'open',
  },
];

export default function AIGigMarketplace() {
  const { isLoggedIn, openLoginModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const filteredGigs = sampleGigs.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gig.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || gig.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleApply = (gig: Gig) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    setSelectedGig(gig);
    setIsApplyModalOpen(true);
  };

  const handlePostOrder = () => {
    setIsPostModalOpen(false);
    setShowSuccessMessage(true);
  };

  const getCategoryLabel = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.label || categoryId;
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
          onClick={() => isLoggedIn ? setIsPostModalOpen(true) : openLoginModal()}
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

      {/* Gig List */}
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

      {/* Empty State */}
      {filteredGigs.length === 0 && (
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">任务类别</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400">
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">截止日期</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">任务描述</label>
              <textarea 
                rows={4}
                placeholder="详细描述任务需求、交付标准..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none"
              />
            </div>
            <button
              onClick={handlePostOrder}
              className="w-full btn-primary"
            >
              发布任务
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
            <p className="text-sm text-[#6B7280]">您的订单需求已提交,将由工作人员联系您</p>
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
