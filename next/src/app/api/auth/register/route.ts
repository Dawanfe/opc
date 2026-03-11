import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { generateUniqueInviteCode, checkInviteCodeExists } from '@/lib/utils/invite';

// POST - 用户注册（手机号+密码）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password, nickname, inviteCode } = body;

    // 验证必填字段
    if (!phone || !password) {
      return NextResponse.json(
        { error: '手机号和密码为必填项' },
        { status: 400 }
      );
    }

    // 验证手机号格式（11位数字）
    if (!/^1\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: '请输入正确的手机号' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // 如果提供了邀请码，验证其有效性
    let inviterId: number | null = null;
    if (inviteCode) {
      const inviter = checkInviteCodeExists(inviteCode);
      if (!inviter) {
        return NextResponse.json(
          { error: '邀请码无效或不存在' },
          { status: 400 }
        );
      }
      inviterId = inviter.id;
    }

    // 为新用户生成唯一邀请码（在打开主数据库连接之前）
    const newUserInviteCode = generateUniqueInviteCode();

    const db = getDb();

    try {
      // 检查手机号是否已注册
      const existingUser = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
      if (existingUser) {
        db.close();
        return NextResponse.json(
          { error: '该手机号已注册' },
          { status: 409 }
        );
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 插入新用户
      const result = db.prepare(`
        INSERT INTO users (phone, password, nickname, membershipType, inviteCode, invitedBy)
        VALUES (?, ?, ?, 'free', ?, ?)
      `).run(
        phone,
        hashedPassword,
        nickname || `用户${phone.slice(-4)}`,
        newUserInviteCode,
        inviterId
      );

      const newUserId = result.lastInsertRowid as number;

      // 如果有邀请人，记录邀请关系
      if (inviterId && inviteCode) {
        db.prepare(`
          INSERT INTO invite_records (inviterId, inviteeId, inviteCode, status, activatedAt)
          VALUES (?, ?, ?, 'activated', CURRENT_TIMESTAMP)
        `).run(inviterId, newUserId, inviteCode);
      }

      const newUser = db.prepare(
        'SELECT id, phone, nickname, membershipType, inviteCode, createdAt FROM users WHERE id = ?'
      ).get(newUserId);

      // 生成正态分布随机增量 [1.3, 10]，均值约4.5
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const rawIncrement = 4.5 + z * 1.8; // 均值4.5，标准差1.8
      const increment = Math.min(10, Math.max(1.3, rawIncrement));

      // 记录增量日志
      db.prepare(
        'INSERT INTO member_count_log (userId, increment) VALUES (?, ?)'
      ).run(newUserId, increment);

      return NextResponse.json({
        message: '注册成功',
        user: newUser,
      }, { status: 201 });
    } finally {
      db.close();
    }
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
