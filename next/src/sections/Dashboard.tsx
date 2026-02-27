"use client";

import {
  Building2,
  Briefcase,
  Calendar,
  ChevronRight,
  MapPin,
  Users,
  Landmark,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NewsItem {
  id: number;
  title: string;
  source: string;
  date: string;
  summary: string;
  tag: string;
}

// Mock news data
const newsData: NewsItem[] = [
  { id: 1, title: '武汉发布十条新政：初创OPC最高资助100万元', source: '武汉市数据局', date: '2026-02-27', summary: '武汉市人民政府发布《武汉市支持人工智能OPC创新发展若干措施》，从算力、数据、人才、金融等十大维度出台专项支持政策。', tag: '政策' },
  { id: 2, title: '深圳推出"训力券"最高可申领1000万元', source: '深圳市政府', date: '2026-02-26', summary: '深圳市发布《打造人工智能OPC创业生态引领地行动计划》，推出"智能券""训力券""模型券"三重补贴。', tag: '补贴' },
  { id: 3, title: '苏州设立10亿元"青创基金群"支持OPC', source: '苏州工业园区', date: '2026-02-25', summary: '苏州将OPC发展上升为城市战略，对优质OPC项目给予最高2000万元政策性股权投资。', tag: '投资' },
  { id: 4, title: '全国OPC社区数量突破39个，覆盖26个城市', source: 'WeOPC研究院', date: '2026-02-24', summary: '截至2026年2月，全国已有39个OPC社区投入运营，覆盖20个省份、26个城市。', tag: '行业' },
  { id: 5, title: '上海临港"超级个体288"基地5个月吸引150家OPC入驻', source: '上海临港新片区', date: '2026-02-23', summary: '上海临港推出"超级个体288行动"，打造办公、住宿双免的"零界魔方"社区。', tag: '社区' },
];

// Stats data
const statsData = [
  { label: '覆盖城市', value: '26+', icon: MapPin, color: 'green' },
  { label: '合作社区', value: '39+', icon: Building2, color: 'yellow' },
  { label: '会员规模', value: '1M+', icon: Users, color: 'orange' },
  { label: '资源规模', value: '18亿+', icon: Landmark, color: 'pink' },
];

// Get status dot color
const getStatusColor = (color: string) => {
  const colors: Record<string, string> = {
    green: 'bg-[#10B981]',
    yellow: 'bg-[#F59E0B]',
    orange: 'bg-[#F97316]',
    pink: 'bg-[#EC4899]',
    blue: 'bg-[#3B82F6]',
    teal: 'bg-[#14B8A6]',
  };
  return colors[color] || 'bg-gray-400';
};

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] to-[#1F2937] p-8 md:p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1">
              <span className="status-dot status-dot-green" />
              <span className="status-dot status-dot-yellow" />
              <span className="status-dot status-dot-orange" />
              <span className="status-dot status-dot-pink" />
              <span className="status-dot status-dot-blue" />
              <span className="status-dot status-dot-teal" />
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">全国一站式OPC服务平台</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            WeOPC
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">
            连接全国OPC社区资源，为AI时代的超级个体提供政策、工位、算力、投资一站式解决方案
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              className="btn-primary"
              onClick={() => router.push('/policy')}
            >
              立即加入会员
            </Button>
            <Button
              variant="outline"
              className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white"
              onClick={() => router.push('/policy')}
            >
              探索社区
            </Button>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-purple-500 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Authority Stats - Bento Grid */}
      <div>
        <h2 className="section-title mb-6">平台数据</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="stat-card card-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(stat.color)}`} />
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-[#111827] mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <div
          className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-all cursor-pointer group"
          onClick={() => router.push('/policy')}
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-[#111827] mb-2">查找社区工位</h3>
          <p className="text-sm text-gray-500 mb-4">浏览全国39个OPC社区，找到最适合您的创业空间</p>
          <div className="flex items-center text-sm text-blue-600">
            <span>立即探索</span>
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-all cursor-pointer group"
          onClick={() => router.push('/marketplace')}
        >
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
            <Briefcase className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-[#111827] mb-2">灵工市场</h3>
          <p className="text-sm text-gray-500 mb-4">发布或承接AI相关订单，连接超级个体与企业需求</p>
          <div className="flex items-center text-sm text-green-600">
            <span>进入市场</span>
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-all cursor-pointer group"
          onClick={() => router.push('/events')}
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-[#111827] mb-2">AI社区活动</h3>
          <p className="text-sm text-gray-500 mb-4">参与线上线下活动，拓展人脉，获取最新行业资讯</p>
          <div className="flex items-center text-sm text-purple-600">
            <span>查看活动</span>
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Latest News Preview */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">最新情报</h2>
          <Link
            href="/news"
            className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {newsData.slice(0, 3).map((news) => (
            <div
              key={news.id}
              className="bg-white rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{news.tag}</Badge>
                    <span className="text-xs text-gray-400">{news.source}</span>
                  </div>
                  <h3 className="font-medium text-[#111827] mb-1 line-clamp-1">{news.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{news.summary}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{news.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
