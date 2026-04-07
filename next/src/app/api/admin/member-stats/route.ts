import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// 默认基数
const DEFAULT_BASE_COUNT = 5000;

// GET - 获取会员统计数据（管理后台用）
export async function GET() {
  try {
    const db = getDb();

    // 从 settings 表获取基数，如果没有则使用默认值
    const baseCountSetting = db.prepare("SELECT value FROM settings WHERE key = 'member_base_count'").get() as any;
    const baseCount = baseCountSetting ? parseInt(baseCountSetting.value) : DEFAULT_BASE_COUNT;

    // 真实用户总数
    const realTotal = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;

    // 展示用会员数
    const incrementSum = (db.prepare(
      'SELECT COALESCE(SUM(increment), 0) as total FROM member_count_log'
    ).get() as any).total;
    const displayTotal = Math.floor(baseCount + incrementSum);

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
      baseCount,
      dailyStats,
      recentUsers,
    });
  } catch (error) {
    console.error('Error fetching member stats:', error);
    return NextResponse.json({ error: 'Failed to fetch member stats' }, { status: 500 });
  }
}

// PUT - 更新会员基数
export async function PUT(request: NextRequest) {
  try {
    const { baseCount } = await request.json();

    if (typeof baseCount !== 'number' || baseCount < 0) {
      return NextResponse.json({ error: 'Invalid base count' }, { status: 400 });
    }

    const db = getDb();

    // 检查是否已存在该设置
    const existing = db.prepare("SELECT value FROM settings WHERE key = 'member_base_count'").get();

    if (existing) {
      db.prepare("UPDATE settings SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE key = 'member_base_count'").run(baseCount.toString());
    } else {
      db.prepare("INSERT INTO settings (key, value) VALUES ('member_base_count', ?)").run(baseCount.toString());
    }

    db.close();

    return NextResponse.json({ success: true, baseCount });
  } catch (error) {
    console.error('Error updating base count:', error);
    return NextResponse.json({ error: 'Failed to update base count' }, { status: 500 });
  }
}
