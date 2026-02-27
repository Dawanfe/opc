"use client";

import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiUrl } from '@/lib/utils';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  source: string;
  url: string;
  category: string;
  date: string;
}

const newsCategories = [
  { id: 'all', label: '全部' },
  { id: 'policy', label: '政策' },
  { id: 'news', label: '新闻' },
  { id: 'analysis', label: '分析' },
];

function categorizeNews(title: string): string {
  if (title.includes('政策') || title.includes('汇总')) return 'policy';
  if (title.includes('分析') || title.includes('解读')) return 'analysis';
  return 'news';
}

function getCategoryLabel(categoryId: string): string {
  const cat = newsCategories.find(c => c.id === categoryId);
  return cat?.label || categoryId;
}

export default function DailyNews() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch(apiUrl('/api/admin/news'))
      .then(res => res.json())
      .then(data => {
        const validNews = data.filter((n: NewsItem) => n.title && n.title !== 'NaN');
        setNews(validNews);
      })
      .catch(err => console.error('Failed to load news:', err));
  }, []);

  const filteredNews = selectedCategory === 'all'
    ? news
    : news.filter(n => categorizeNews(n.title) === selectedCategory);

  const handleNewsClick = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display mb-1">每日AI新闻</h1>
        <p className="text-body">OPC与AI领域每日最新政策、新闻与分析</p>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {newsCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150
              ${selectedCategory === cat.id
                ? 'bg-[#111827] text-white'
                : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* News Feed */}
      <div className="space-y-3">
        {filteredNews.map((item) => {
          const category = categorizeNews(item.title);
          const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
            policy: { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]', label: '政策' },
            news: { bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]', label: '新闻' },
            analysis: { bg: 'bg-[#F97316]/10', text: 'text-[#F97316]', label: '分析' },
          };
          const colors = categoryColors[category];

          return (
            <div
              key={item.id}
              onClick={() => handleNewsClick(item)}
              className="opc-card p-5 cursor-pointer group hover:border-gray-200 transition-all duration-150"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Newspaper className="w-5 h-5 text-[#6B7280]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                      {colors.label}
                    </span>
                    <span className="text-xs text-[#9CA3AF]">{item.source}</span>
                  </div>

                  <h3 className="text-base font-medium text-[#111827] mb-2 group-hover:text-[#3B82F6] transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-[#6B7280] line-clamp-2 mb-3">
                    {item.content?.slice(0, 120)}...
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9CA3AF]">{item.date || '2026-02-27'}</span>
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#111827] transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* News Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedNews && (
            <>
              <DialogHeader className="pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`
                    px-2 py-0.5 rounded text-xs font-medium
                    ${categorizeNews(selectedNews.title) === 'policy' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : ''}
                    ${categorizeNews(selectedNews.title) === 'news' ? 'bg-[#22C55E]/10 text-[#22C55E]' : ''}
                    ${categorizeNews(selectedNews.title) === 'analysis' ? 'bg-[#F97316]/10 text-[#F97316]' : ''}
                  `}>
                    {getCategoryLabel(categorizeNews(selectedNews.title))}
                  </span>
                  <span className="text-xs text-[#9CA3AF]">{selectedNews.source}</span>
                </div>
                <DialogTitle className="text-xl font-semibold text-[#111827]">
                  {selectedNews.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Content */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm text-[#6B7280] leading-relaxed whitespace-pre-line">
                    {selectedNews.content}
                  </p>
                </div>

                {/* Source Link */}
                {selectedNews.url && selectedNews.url !== 'NaN' && (
                  <div className="pt-4 border-t border-gray-100">
                    <a
                      href={selectedNews.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      阅读原文
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
