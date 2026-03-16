import Dashboard from '@/sections/Dashboard';
import StructuredData from '@/components/StructuredData';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WeOPC - 全国一站式OPC服务平台 | 免费工位、算力补贴、项目投资',
  description: '连接全国39个OPC社区，为AI创业者提供免费工位、算力补贴、项目投资、需求对接等一站式服务。覆盖26个城市，服务5000+超级个体，连接300+生态伙伴。',
  keywords: ['OPC社区', 'AI创业', '免费工位', '算力补贴', '项目投资', '超级个体', '创业政策'],
  openGraph: {
    title: 'WeOPC - 全国一站式OPC服务平台',
    description: '连接全国39个OPC社区，为AI创业者提供免费工位、算力补贴、项目投资等一站式服务',
    url: 'https://weopc.com.cn',
    images: [
      {
        url: 'https://weopc.com.cn/logo.png',
        width: 430,
        height: 105,
        alt: 'WeOPC Logo',
      },
    ],
  },
};

export default function HomePage() {
  // 结构化数据 - Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WeOPC',
    url: 'https://weopc.com.cn',
    logo: 'https://weopc.com.cn/logo.png',
    description: '连接全国OPC社区资源，为AI时代的超级个体提供政策、工位、算力、投资一站式解决方案',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CN',
    },
    sameAs: [
      'https://weopc.com.cn',
    ],
  };

  // 结构化数据 - WebSite Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WeOPC',
    url: 'https://weopc.com.cn',
    description: '全国一站式OPC服务平台',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://weopc.com.cn/marketplace?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />
      <Dashboard />
    </>
  );
}
