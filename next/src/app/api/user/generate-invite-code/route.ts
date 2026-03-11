import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateInviteCode } from '@/lib/utils/invite';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: Request) {
  try {
    // 验证用户登录
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userId: number;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      userId = decoded.userId;
    } catch {
      return NextResponse.json(
        { error: '无效的token' },
        { status: 401 }
      );
    }

    const db = getDb();

    try {
      // 检查用户是否已有邀请码
      const user = db.prepare('SELECT id, inviteCode FROM users WHERE id = ?').get(userId) as { id: number; inviteCode: string | null } | undefined;

      if (!user) {
        return NextResponse.json(
          { error: '用户不存在' },
          { status: 404 }
        );
      }

      if (user.inviteCode) {
        return NextResponse.json(
          { error: '您已经有邀请码了', inviteCode: user.inviteCode },
          { status: 400 }
        );
      }

      // 生成唯一邀请码（在同一个数据库连接中）
      let newInviteCode: string;
      const maxRetries = 10;
      let retries = 0;

      while (retries < maxRetries) {
        newInviteCode = generateInviteCode();

        // 检查邀请码是否已存在
        const existing = db.prepare('SELECT id FROM users WHERE inviteCode = ?').get(newInviteCode);

        if (!existing) {
          // 找到唯一邀请码，更新数据库
          db.prepare('UPDATE users SET inviteCode = ? WHERE id = ?').run(newInviteCode, userId);

          return NextResponse.json({
            message: '邀请码生成成功',
            inviteCode: newInviteCode
          });
        }

        retries++;
      }

      // 如果重试次数用完还没找到唯一邀请码
      return NextResponse.json(
        { error: '生成邀请码失败，请稍后重试' },
        { status: 500 }
      );
    } finally {
      db.close();
    }
  } catch (error) {
    console.error('Generate invite code error:', error);
    return NextResponse.json(
      { error: '生成邀请码失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
