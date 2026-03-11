import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET - 管理后台获取邀请统计数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortBy = searchParams.get('sortBy') || 'inviteCount'; // inviteCount | createdAt
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = getDb();

    // 全站统计数据
    const overallStats = db.prepare(`
      SELECT
        COUNT(DISTINCT inviterId) as totalInviters,
        COUNT(DISTINCT inviteeId) as totalInvitees,
        COUNT(*) as totalInviteRecords,
        COUNT(CASE WHEN status = 'activated' THEN 1 END) as activatedRecords
      FROM invite_records
    `).get() as {
      totalInviters: number;
      totalInvitees: number;
      totalInviteRecords: number;
      activatedRecords: number;
    };

    // 按时间维度统计（最近30天）
    const dailyStats = db.prepare(`
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as count,
        COUNT(DISTINCT inviterId) as inviterCount,
        COUNT(DISTINCT inviteeId) as inviteeCount
      FROM invite_records
      WHERE createdAt >= DATE('now', '-30 days')
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    `).all();

    // 邀请人排行榜 TOP 10
    const topInviters = db.prepare(`
      SELECT
        u.id,
        u.nickname,
        u.phone,
        u.inviteCode,
        COUNT(ir.id) as inviteCount,
        MIN(ir.createdAt) as firstInviteAt,
        MAX(ir.createdAt) as lastInviteAt
      FROM users u
      INNER JOIN invite_records ir ON u.id = ir.inviterId
      GROUP BY u.id
      ORDER BY inviteCount DESC
      LIMIT 10
    `).all();

    // 构建邀请记录查询条件
    let whereClause = '1=1';
    const params: any[] = [];

    if (startDate) {
      whereClause += ' AND DATE(ir.createdAt) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND DATE(ir.createdAt) <= ?';
      params.push(endDate);
    }

    // 获取邀请人列表（分页）
    const orderBy = sortBy === 'createdAt' ? 'MIN(ir.createdAt) DESC' : 'inviteCount DESC';

    const offset = (page - 1) * pageSize;
    const inviterList = db.prepare(`
      SELECT
        u.id,
        u.nickname,
        u.phone,
        u.inviteCode,
        u.createdAt as registeredAt,
        COUNT(ir.id) as inviteCount,
        MIN(ir.createdAt) as firstInviteAt,
        MAX(ir.createdAt) as lastInviteAt
      FROM users u
      INNER JOIN invite_records ir ON u.id = ir.inviterId
      WHERE ${whereClause}
      GROUP BY u.id
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `).all(...params, pageSize, offset);

    // 获取总数
    const totalCount = db.prepare(`
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      INNER JOIN invite_records ir ON u.id = ir.inviterId
      WHERE ${whereClause}
    `).get(...params) as { total: number };

    db.close();

    return NextResponse.json({
      overallStats: {
        totalInviters: overallStats.totalInviters || 0,
        totalInvitees: overallStats.totalInvitees || 0,
        totalInviteRecords: overallStats.totalInviteRecords || 0,
        activatedRecords: overallStats.activatedRecords || 0,
        conversionRate: overallStats.totalInviteRecords
          ? ((overallStats.activatedRecords / overallStats.totalInviteRecords) * 100).toFixed(2)
          : '0.00',
      },
      dailyStats,
      topInviters,
      inviterList,
      pagination: {
        page,
        pageSize,
        total: totalCount.total || 0,
        totalPages: Math.ceil((totalCount.total || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching invite stats:', error);
    return NextResponse.json(
      { error: '获取邀请统计失败' },
      { status: 500 }
    );
  }
}

// GET - 获取指定用户的邀请详情
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const db = getDb();

    // 用户基本信息
    const user = db.prepare(`
      SELECT id, nickname, phone, inviteCode, createdAt
      FROM users
      WHERE id = ?
    `).get(userId);

    if (!user) {
      db.close();
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 邀请详情列表
    const inviteDetails = db.prepare(`
      SELECT
        ir.id,
        ir.inviteeId,
        ir.inviteCode,
        ir.status,
        ir.createdAt,
        ir.activatedAt,
        u.nickname as inviteeName,
        u.phone as inviteePhone,
        u.createdAt as inviteeRegisteredAt
      FROM invite_records ir
      LEFT JOIN users u ON ir.inviteeId = u.id
      WHERE ir.inviterId = ?
      ORDER BY ir.createdAt DESC
    `).all(userId);

    db.close();

    return NextResponse.json({
      user,
      inviteDetails,
    });
  } catch (error) {
    console.error('Error fetching user invite details:', error);
    return NextResponse.json(
      { error: '获取用户邀请详情失败' },
      { status: 500 }
    );
  }
}
