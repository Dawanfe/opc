import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// POST - 用户登录（手机号+密码）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    // 验证必填字段
    if (!phone || !password) {
      return NextResponse.json(
        { error: '手机号和密码为必填项' },
        { status: 400 }
      );
    }

    const db = getDb();

    // 通过手机号查找用户
    const user = db.prepare(
      'SELECT * FROM users WHERE phone = ?'
    ).get(phone) as any;

    db.close();

    if (!user) {
      return NextResponse.json(
        { error: '手机号或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '手机号或密码错误' },
        { status: 401 }
      );
    }

    // 生成 JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 返回用户信息 (不包含密码)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: '登录成功',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
