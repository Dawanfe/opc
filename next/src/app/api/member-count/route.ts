import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const DEFAULT_BASE_COUNT = 5000;

// GET - 获取对外展示的会员数
export async function GET() {
  try {
    const db = getDb();

    // 从 settings 表获取基数，如果没有则使用默认值
    const baseCountSetting = db.prepare("SELECT value FROM settings WHERE key = 'member_base_count'").get() as any;
    const baseCount = baseCountSetting ? parseInt(baseCountSetting.value) : DEFAULT_BASE_COUNT;

    // 获取所有随机增量的总和
    const result = db.prepare(
      'SELECT COALESCE(SUM(increment), 0) as totalIncrement FROM member_count_log'
    ).get() as any;

    const realCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;

    db.close();

    const displayCount = Math.floor(baseCount + result.totalIncrement);

    // 格式化展示数量：过万显示为 xx万+
    let formattedCount: string | number;
    if (displayCount >= 10000) {
      const wan = Math.floor(displayCount / 10000);
      formattedCount = `${wan}万+`;
    } else {
      formattedCount = displayCount;
    }

    return NextResponse.json({
      displayCount,
      formattedCount,
      realCount,
    });
  } catch (error) {
    console.error('Error fetching member count:', error);
    return NextResponse.json({
      displayCount: DEFAULT_BASE_COUNT,
      formattedCount: `${(DEFAULT_BASE_COUNT / 10000).toFixed(1)}万+`,
      realCount: 0
    });
  }
}
