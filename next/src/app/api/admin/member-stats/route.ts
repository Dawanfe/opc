import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const BASE_COUNT = 5001;

// GET - 获取会员统计数据（管理后台用）
export async function GET() {
  try {
    const db = getDb();

    // 真实用户总数
    const realTotal = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;

    // 展示用会员数
    const incrementSum = (db.prepare(
      'SELECT COALESCE(SUM(increment), 0) as total FROM member_count_log'
    ).get() as any).total;
    const displayTotal = Math.floor(BASE_COUNT + incrementSum);

    // 最近30天每日新增（真实 + 展示增量）
    const dailyStats = db.prepare(`
      SELECT
        DATE(u.createdAt) as date,
        COUNT(u.id) as realNew,
        COALESCE(SUM(m.increment), 0) as displayIncrement
      FROM users u
      LEFT JOIN member_count_log m ON m.userId = u.id
      WHERE u.createdAt >= DATE('now', '-30 days')
      GROUP BY DATE(u.createdAt)
      ORDER BY date DESC
    `).all() as any[];

    // 最近注册的用户列表（最近50个）
    const recentUsers = db.prepare(`
      SELECT u.id, u.phone, u.nickname, u.membershipType, u.createdAt,
             COALESCE(m.increment, 0) as displayIncrement
      FROM users u
      LEFT JOIN member_count_log m ON m.userId = u.id
      ORDER BY u.createdAt DESC
      LIMIT 50
    `).all();

    db.close();

    return NextResponse.json({
      realTotal,
      displayTotal,
      baseCount: BASE_COUNT,
      dailyStats,
      recentUsers,
    });
  } catch (error) {
    console.error('Error fetching member stats:', error);
    return NextResponse.json({ error: 'Failed to fetch member stats' }, { status: 500 });
  }
}
