import Pioneers from '@/sections/Pioneers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OPC先锋档案 - AI时代的超级个体',
  description: '汇聚全国AI时代的超级个体与创新项目，记录每一位OPC先锋的创业历程。涵盖AI动画、AI短剧、跨境电商、AI编程等多个赛道。',
  keywords: ['OPC先锋', 'AI创业', '超级个体', 'AI动画', 'AI短剧', '跨境电商', 'AI编程', '一人公司'],
};

export default function PioneersPage() {
  return <Pioneers />;
}
