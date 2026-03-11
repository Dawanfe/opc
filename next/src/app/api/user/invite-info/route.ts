import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 从请求头获取并验证用户身份
function getUserFromToken(request: NextRequest): number | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

// GET - 获取当前用户的邀请信息
export async function GET(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const db = getDb();

    // 获取用户基本信息和邀请码
    const user = db.prepare(`
      SELECT id, phone, nickname, inviteCode, invitedBy, createdAt
      FROM users
      WHERE id = ?
    `).get(userId) as {
      id: number;
      phone: string;
      nickname: string;
      inviteCode: string;
      invitedBy: number | null;
      createdAt: string;
    };

    if (!user) {
      db.close();
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取邀请人信息（如果有）
    let inviter = null;
    if (user.invitedBy) {
      inviter = db.prepare(`
        SELECT id, nickname, phone
        FROM users
        WHERE id = ?
      `).get(user.invitedBy) as { id: number; nickname: string; phone: string } | undefined;
    }

    // 统计邀请数据
    const stats = db.prepare(`
      SELECT
        COUNT(*) as totalInvites,
        COUNT(CASE WHEN status = 'activated' THEN 1 END) as activatedInvites
      FROM invite_records
      WHERE inviterId = ?
    `).get(userId) as {
      totalInvites: number;
      activatedInvites: number;
    };

    // 获取邀请记录列表（最近20条）
    const inviteList = db.prepare(`
      SELECT
        ir.id,
        ir.inviteeId,
        ir.inviteCode,
        ir.status,
        ir.createdAt,
        ir.activatedAt,
        u.nickname as inviteeName,
        u.phone as inviteePhone
      FROM invite_records ir
      LEFT JOIN users u ON ir.inviteeId = u.id
      WHERE ir.inviterId = ?
      ORDER BY ir.createdAt DESC
      LIMIT 20
    `).all(userId);

    db.close();

    return NextResponse.json({
      user: {
        id: user.id,
        nickname: user.nickname,
        phone: user.phone,
        inviteCode: user.inviteCode,
      },
      inviter: inviter || null,
      stats: {
        totalInvites: stats.totalInvites || 0,
        activatedInvites: stats.activatedInvites || 0,
      },
      inviteList,
    });
  } catch (error) {
    console.error('Error fetching invite info:', error);
    return NextResponse.json(
      { error: '获取邀请信息失败' },
      { status: 500 }
    );
  }
}
