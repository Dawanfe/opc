"use client";

import {useState, useEffect} from 'react';
import {
  Building2,
  Zap,
  Handshake,
  ArrowRight,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {apiUrl} from '@/lib/utils';
import {useAuth} from '@/contexts/AuthContext';

const features = [
  {
    title: '免费工位与政策红利',
    desc: '覆盖全国39+ OPC社区，提供零成本办公空间和政策补贴',
    icon: Building2,
    color: 'green',
  },
  {
    title: '算力支持与AI工具',
    desc: '最高1000万算力券补贴，免费使用主流AI开发工具',
    icon: Zap,
    color: 'blue',
  },
  {
    title: '订单市场与资源对接',
    desc: '连接300+生态伙伴，获取AI漫剧、开发、设计等订单',
    icon: Handshake,
    color: 'orange',
  },
];

// Animated Counter Component
function AnimatedCounter({target, suffix = ''}: {target: number; suffix?: string;}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function Dashboard() {
  const {setShowLoginModal} = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center py-10 md:py-16">
        {/* Alliance Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border mb-8">
          <span className="text-sm font-medium text-gray-600">Global AI Alumni Alliance</span>
        </div>

        {/* Logo: GIF animation + text */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <img
            src={apiUrl("/logo.GIF")}
            alt="WeOPC Logo"
            className="w-24 h-24 md:w-32 md:h-32"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#3a3a3a] tracking-tight">
            W<span className="text-[#3a3a3a]">e</span>OPC
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl font-medium text-gray-700 mb-3">
          全国一站式OPC服务平台
        </p>
        <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto mb-12">
          为新一代AI创业者提供工位、算力、资金、政策等全周期创业支持
        </p>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-3xl md:text-4xl font-bold text-emerald-500 mb-1">
              <AnimatedCounter target={26} suffix="+" />
            </div>
            <div className="text-sm text-gray-500">覆盖城市</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-1">
              <AnimatedCounter target={39} suffix="+" />
            </div>
            <div className="text-sm text-gray-500">OPC社区</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-3xl md:text-4xl font-bold text-pink-500 mb-1">
              <AnimatedCounter target={5000} suffix="+" />
            </div>
            <div className="text-sm text-gray-500">OPC会员</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-3xl md:text-4xl font-bold text-blue-500 mb-1">
              <AnimatedCounter target={300} suffix="+" />
            </div>
            <div className="text-sm text-gray-500">生态伙伴</div>
          </div>
        </div>
      </div>

      {/* Features Section - 全周期创业服务 */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">全周期创业服务</h2>
          <p className="text-gray-500">从注册到成长，WeOPC为您提供一站式支持</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const colorMap: Record<string, string> = {
              green: 'bg-green-50 text-green-600',
              blue: 'bg-blue-50 text-blue-600',
              orange: 'bg-orange-50 text-orange-600',
            };

            return (
              <div
                key={feature.title}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 ${colorMap[feature.color]} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gray-900 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl" />

        <div className="relative px-8 py-16 lg:px-16 lg:py-20 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            准备好开启您的OPC之旅了吗？
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            加入WeOPC，享受政策红利、算力支持、订单对接等全周期创业服务
          </p>
          <Button
            onClick={() => setShowLoginModal(true)}
            className="h-12 px-8 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-xl"
          >
            立即免费注册
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
