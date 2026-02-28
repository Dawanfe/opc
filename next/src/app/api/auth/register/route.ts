import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

// POST - 用户注册（手机号+密码）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password, nickname } = body;

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

    const db = getDb();

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
      INSERT INTO users (phone, password, nickname, membershipType)
      VALUES (?, ?, ?, 'free')
    `).run(phone, hashedPassword, nickname || `用户${phone.slice(-4)}`);

    const newUser = db.prepare(
      'SELECT id, phone, nickname, membershipType, createdAt FROM users WHERE id = ?'
    ).get(result.lastInsertRowid);

    db.close();

    return NextResponse.json({
      message: '注册成功',
      user: newUser,
    }, { status: 201 });
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
