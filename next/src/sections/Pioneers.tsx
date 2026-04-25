"use client";

import { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Rocket, Users, Filter, ChevronDown, ChevronLeft, ChevronRight, Building2, Sparkles, Globe, X } from 'lucide-react';

const PAGE_SIZE = 18;
import pioneersData from '@/data/pioneers.json';

// 定义先锋数据类型
interface Pioneer {
  赛道: string | null;
  OPC人名: string | null;
  '公司/项目名': string | null;
  省份: string | null;
  城市: string | null;
  项目概要: string | null;
}

// 赛道颜色映射
const trackColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'AI动画制作': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  '建筑设计': { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200', dot: 'bg-stone-500' },
  '民乐AI': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  'AI企业服务': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  '政企AI应用': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  'AI服装设计': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', dot: 'bg-pink-500' },
  'AI漫剧': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', dot: 'bg-fuchsia-500' },
  'AI语音合成': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  '机器人': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'AI情感助手': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  'AI游戏音乐': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  '游戏开发': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200', dot: 'bg-lime-500' },
  'AI视觉创意': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  'AI短剧': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  '软件开发': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  '数据智能': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
  '脑机接口': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  'AI智能外呼': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  '机器人平台': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  '个人成长APP': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  'AI教育': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  '设计创意': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', dot: 'bg-pink-500' },
  '创业服务': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'AI编程教育': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  'AI音乐': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', dot: 'bg-fuchsia-500' },
  'AI游戏': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  '极简工具': { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200', dot: 'bg-stone-500' },
  'AI+跨境电商': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'TikTok Shop': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  'AI编程工具': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  'AI产品出海': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'AI Agent': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  'AI视频': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
};

// 默认颜色
const defaultTrackColor = { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' };

function getTrackColor(track: string | null) {
  if (!track) return defaultTrackColor;
  // 精确匹配
  if (trackColors[track]) return trackColors[track];
  // 部分匹配
  for (const key of Object.keys(trackColors)) {
    if (track.includes(key) || key.includes(track)) return trackColors[key];
  }
  return defaultTrackColor;
}

// 生成头像颜色（基于名称的hash）
function getAvatarColor(name: string | null): string {
  const colors = [
    'from-violet-400 to-purple-500',
    'from-blue-400 to-indigo-500',
    'from-cyan-400 to-teal-500',
    'from-emerald-400 to-green-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-pink-500',
    'from-fuchsia-400 to-purple-500',
    'from-sky-400 to-blue-500',
    'from-teal-400 to-cyan-500',
    'from-indigo-400 to-violet-500',
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function Pioneers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('全部');
  const [selectedCity, setSelectedCity] = useState<string>('全部');
  const [showTrackFilter, setShowTrackFilter] = useState(false);
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const pioneers: Pioneer[] = pioneersData as Pioneer[];

  // 提取所有赛道和城市列表
  const tracks = useMemo(() => {
    const trackSet = new Set<string>();
    pioneers.forEach(p => { if (p.赛道) trackSet.add(p.赛道); });
    return ['全部', ...Array.from(trackSet).sort()];
  }, [pioneers]);

  const cities = useMemo(() => {
    const citySet = new Set<string>();
    pioneers.forEach(p => {
      if (p.城市) citySet.add(p.城市);
      else if (p.省份) citySet.add(p.省份);
    });
    return ['全部', ...Array.from(citySet).sort()];
  }, [pioneers]);

  // 过滤逻辑
  const filteredPioneers = useMemo(() => {
    return pioneers.filter(p => {
      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchFields = [p.赛道, p.OPC人名, p['公司/项目名'], p.省份, p.城市, p.项目概要];
        const match = matchFields.some(f => f && f.toLowerCase().includes(query));
        if (!match) return false;
      }
      // 赛道过滤
      if (selectedTrack !== '全部' && p.赛道 !== selectedTrack) return false;
      // 城市过滤
      if (selectedCity !== '全部') {
        if (p.城市 !== selectedCity && p.省份 !== selectedCity) return false;
      }
      return true;
    });
  }, [pioneers, searchQuery, selectedTrack, selectedCity]);

  // 筛选条件变化时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTrack, selectedCity]);

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredPioneers.length / PAGE_SIZE));
  const paginatedPioneers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPioneers.slice(start, start + PAGE_SIZE);
  }, [filteredPioneers, currentPage]);

  // 生成页码按钮列表
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  // 统计数据
  const stats = useMemo(() => {
    const trackCount = new Set(pioneers.map(p => p.赛道).filter(Boolean)).size;
    const cityCount = new Set(pioneers.map(p => p.城市).filter(Boolean)).size;
    const namedCount = pioneers.filter(p => p.OPC人名).length;
    return { total: pioneers.length, trackCount, cityCount, namedCount };
  }, [pioneers]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 md:p-10">
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-amber-400 text-sm font-medium tracking-wide uppercase">OPC Pioneer Archives</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            OPC 先锋档案
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl">
            汇聚全国 AI 时代的超级个体与创新项目，记录每一位 OPC 先锋的创业历程
          </p>

          {/* 统计数据 */}
          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-gray-400">先锋总数</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Rocket className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stats.trackCount}</div>
                <div className="text-xs text-gray-400">创业赛道</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stats.cityCount}</div>
                <div className="text-xs text-gray-400">覆盖城市</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stats.namedCount}</div>
                <div className="text-xs text-gray-400">实名先锋</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和过滤栏 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索先锋姓名、赛道、公司、城市..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 赛道过滤 */}
        <div className="relative">
          <button
            onClick={() => { setShowTrackFilter(!showTrackFilter); setShowCityFilter(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              selectedTrack !== '全部'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>{selectedTrack === '全部' ? '赛道' : selectedTrack}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTrackFilter ? 'rotate-180' : ''}`} />
          </button>
          {showTrackFilter && (
            <div className="absolute top-full mt-2 right-0 w-64 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
              {tracks.map(track => (
                <button
                  key={track}
                  onClick={() => { setSelectedTrack(track); setShowTrackFilter(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    selectedTrack === track ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {track}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 城市过滤 */}
        <div className="relative">
          <button
            onClick={() => { setShowCityFilter(!showCityFilter); setShowTrackFilter(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              selectedCity !== '全部'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{selectedCity === '全部' ? '城市' : selectedCity}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCityFilter ? 'rotate-180' : ''}`} />
          </button>
          {showCityFilter && (
            <div className="absolute top-full mt-2 right-0 w-48 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => { setSelectedCity(city); setShowCityFilter(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    selectedCity === city ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 活跃过滤器标签 */}
      {(selectedTrack !== '全部' || selectedCity !== '全部' || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">当前筛选：</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              搜索: {searchQuery}
              <button onClick={() => setSearchQuery('')} className="hover:text-gray-900"><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedTrack !== '全部' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-full">
              {selectedTrack}
              <button onClick={() => setSelectedTrack('全部')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedCity !== '全部' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-full">
              {selectedCity}
              <button onClick={() => setSelectedCity('全部')}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={() => { setSearchQuery(''); setSelectedTrack('全部'); setSelectedCity('全部'); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            清除全部
          </button>
        </div>
      )}

      {/* 结果计数 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          共 <span className="font-semibold text-gray-900">{filteredPioneers.length}</span> 位先锋
          {filteredPioneers.length !== pioneers.length && (
            <span className="text-gray-400">（共 {pioneers.length} 位）</span>
          )}
        </p>
        {totalPages > 1 && (
          <p className="text-sm text-gray-400">
            第 {currentPage}/{totalPages} 页
          </p>
        )}
      </div>

      {/* 先锋卡片网格 */}
      {filteredPioneers.length > 0 ? (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedPioneers.map((pioneer, index) => {
            const trackColor = getTrackColor(pioneer.赛道);
            const avatarGradient = getAvatarColor(pioneer.OPC人名 || pioneer['公司/项目名']);
            const displayName = pioneer.OPC人名 || '匿名先锋';
            const initial = displayName.charAt(0);

            return (
              <div
                key={`${pioneer.OPC人名}-${pioneer.赛道}-${index}`}
                className="group bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-md transition-all duration-300 cursor-default"
              >
                {/* 顶部：头像 + 基本信息 */}
                <div className="flex items-start gap-3.5 mb-3.5">
                  {/* 头像 */}
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-sm`}>
                    <span className="text-white text-sm font-bold">{initial}</span>
                  </div>
                  {/* 名称和公司 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-gray-900 truncate">
                      {displayName}
                    </h3>
                    {pioneer['公司/项目名'] && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {pioneer['公司/项目名']}
                      </p>
                    )}
                  </div>
                </div>

                {/* 赛道标签 */}
                {pioneer.赛道 && (
                  <div className="mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${trackColor.bg} ${trackColor.text} border ${trackColor.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${trackColor.dot}`} />
                      {pioneer.赛道}
                    </span>
                  </div>
                )}

                {/* 项目概要 */}
                {pioneer.项目概要 && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                    {pioneer.项目概要}
                  </p>
                )}

                {/* 底部：地区信息 */}
                {(pioneer.省份 || pioneer.城市) && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{[pioneer.省份, pioneer.城市].filter(Boolean).join(' · ')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 分页控件 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-4 pb-2">
            {/* 上一页 */}
            <button
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={currentPage === 1}
              className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-all ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* 页码 */}
            {pageNumbers.map((page, i) =>
              page === 'ellipsis' ? (
                <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => { setCurrentPage(page as number); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {/* 下一页 */}
            <button
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={currentPage === totalPages}
              className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-all ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        </>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的先锋</h3>
          <p className="text-sm text-gray-500">尝试调整搜索关键词或筛选条件</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedTrack('全部'); setSelectedCity('全部'); }}
            className="mt-4 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            重置筛选
          </button>
        </div>
      )}
    </div>
  );
}
