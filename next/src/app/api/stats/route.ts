import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET - 获取首页统计数据
export async function GET() {
  try {
    const db = getDb();

    // 获取社区总数
    const communityCount = (db.prepare('SELECT COUNT(*) as count FROM communities').get() as any).count;

    // 获取不重复的城市数
    const cityCount = (db.prepare('SELECT COUNT(DISTINCT city) as count FROM communities').get() as any).count;

    // 获取生态伙伴数（暂时硬编码，后续可从数据库获取）
    const partnerCount = 300;

    db.close();

    return NextResponse.json({
      cityCount,
      communityCount,
      partnerCount,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({
      cityCount: 26,
      communityCount: 39,
      partnerCount: 300,
    });
  }
}
