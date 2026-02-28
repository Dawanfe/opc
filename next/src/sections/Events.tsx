"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Calendar,
  MapPin,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { apiUrl } from '@/lib/utils';

interface Event {
  id: number;
  location: string;
  organizer: string;
  date: string;
  name: string;
  registrationLink: string;
  guests: string;
  guestTitles: string;
  description: string;
}

const PAGE_SIZE = 20;

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [total, setTotal] = useState(0);

  // 下拉刷新相关
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const isPulling = useRef(false);
  const PULL_THRESHOLD = 60;

  // 上拉加载 sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchEvents = useCallback(async (pageNum: number, isRefresh = false) => {
    if (isLoading) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await fetch(apiUrl(`/api/admin/events?page=${pageNum}&pageSize=${PAGE_SIZE}`));
      const data = await res.json();

      if (isRefresh) {
        setEvents(data.items || []);
      } else {
        setEvents(prev => pageNum === 1 ? (data.items || []) : [...prev, ...(data.items || [])]);
      }
      setTotal(data.total || 0);
      setHasMore(data.hasMore ?? false);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isLoading]);

  // 初始加载
  useEffect(() => {
    fetchEvents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 下拉刷新
  const handleRefresh = useCallback(() => {
    fetchEvents(1, true);
  }, [fetchEvents]);

  // 上拉加载更多
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading && !isRefreshing) {
      fetchEvents(page + 1);
    }
  }, [hasMore, isLoading, isRefreshing, page, fetchEvents]);

  // IntersectionObserver 监听底部 sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isRefreshing) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isRefreshing, handleLoadMore]);

  // 触摸下拉刷新
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    // 只在滚动到顶部时允许下拉刷新
    if (container.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current) return;
    const container = scrollContainerRef.current;
    if (!container || container.scrollTop > 0) {
      isPulling.current = false;
      setPullDistance(0);
      return;
    }
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) {
      // 阻尼效果
      setPullDistance(Math.min(deltaY * 0.4, 100));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      handleRefresh();
    }
    isPulling.current = false;
    setPullDistance(0);
  }, [pullDistance, isRefreshing, handleRefresh]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">AI社区活动</h2>
          <p className="text-sm text-gray-500 mt-1">参加线上线下AI活动,认识更多同道中人,获取最新行业资讯</p>
        </div>
        {total > 0 && (
          <span className="text-xs text-gray-400">共 {total} 个活动</span>
        )}
      </div>

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="relative overflow-y-auto -mx-1 px-1"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull-to-refresh indicator */}
        <div
          className="flex items-center justify-center overflow-hidden transition-all duration-200"
          style={{ height: pullDistance > 0 ? `${pullDistance}px` : isRefreshing ? '48px' : '0px' }}
        >
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''} ${pullDistance >= PULL_THRESHOLD ? 'text-gray-600' : ''}`} />
            <span>
              {isRefreshing
                ? '正在刷新...'
                : pullDistance >= PULL_THRESHOLD
                  ? '松手刷新'
                  : '下拉刷新'}
            </span>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{event.date}</span>
                  </div>
                  <h3 className="font-semibold text-[#111827] mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {event.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{event.location || '待定'}</span>
                  </div>
                  <p className="text-xs text-gray-400">主办方：{event.organizer}</p>
                  {event.guestTitles && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                      嘉宾：{event.guestTitles}
                    </p>
                  )}
                </div>
              </div>

              {event.registrationLink && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href={event.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    立即报名
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom sentinel & status */}
        <div ref={sentinelRef} className="py-6 flex items-center justify-center">
          {isLoading && !isRefreshing && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>加载中...</span>
            </div>
          )}
          {!isLoading && !hasMore && events.length > 0 && (
            <span className="text-xs text-gray-300">— 已加载全部活动 —</span>
          )}
          {!isLoading && events.length === 0 && (
            <span className="text-sm text-gray-400">暂无活动</span>
          )}
        </div>
      </div>
    </div>
  );
}
