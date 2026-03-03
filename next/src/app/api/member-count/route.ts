import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const BASE_COUNT = 5001;

// GET - 获取对外展示的会员数
export async function GET() {
  try {
    const db = getDb();

    // 获取所有随机增量的总和
    const result = db.prepare(
      'SELECT COALESCE(SUM(increment), 0) as totalIncrement FROM member_count_log'
    ).get() as any;

    const realCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;

    db.close();

    const displayCount = Math.floor(BASE_COUNT + result.totalIncrement);

    return NextResponse.json({
      displayCount,
      realCount,
    });
  } catch (error) {
    console.error('Error fetching member count:', error);
    return NextResponse.json({ displayCount: BASE_COUNT, realCount: 0 });
  }
}
