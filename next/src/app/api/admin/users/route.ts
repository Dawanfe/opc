import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET - 获取所有用户或单个用户
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const db = getDb();

    if (id) {
      const user = db.prepare('SELECT id, phone, username, email, nickname, avatar, membershipType, createdAt, updatedAt FROM users WHERE id = ?').get(id);
      db.close();

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(user);
    }

    const users = db.prepare('SELECT id, phone, username, email, nickname, avatar, membershipType, createdAt, updatedAt FROM users ORDER BY id DESC').all();
    db.close();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - 创建新用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    // 检查手机号是否已存在
    const existingUser = db.prepare('SELECT id FROM users WHERE phone = ?').get(body.phone);
    if (existingUser) {
      db.close();
      return NextResponse.json({ error: '该手机号已注册' }, { status: 400 });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(body.password || '123456', 10);

    const result = db.prepare(`
      INSERT INTO users (
        phone, username, email, password, nickname, avatar, membershipType
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      body.phone,
      body.username || null,
      body.email || null,
      hashedPassword,
      body.nickname || null,
      body.avatar || null,
      body.membershipType || 'free'
    );

    const newUser = db.prepare('SELECT id, phone, username, email, nickname, avatar, membershipType, createdAt, updatedAt FROM users WHERE id = ?').get(result.lastInsertRowid);
    db.close();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT - 更新用户
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();

    // 如果提供了新密码，则加密
    let updateQuery = `
      UPDATE users
      SET phone = ?, username = ?, email = ?, nickname = ?, avatar = ?, membershipType = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    let params = [
      data.phone,
      data.username || null,
      data.email || null,
      data.nickname || null,
      data.avatar || null,
      data.membershipType || 'free',
      id
    ];

    // 如果提供了密码，更新密码
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = `
        UPDATE users
        SET phone = ?, username = ?, email = ?, password = ?, nickname = ?, avatar = ?, membershipType = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      params = [
        data.phone,
        data.username || null,
        data.email || null,
        hashedPassword,
        data.nickname || null,
        data.avatar || null,
        data.membershipType || 'free',
        id
      ];
    }

    const result = db.prepare(updateQuery).run(...params);

    if (result.changes === 0) {
      db.close();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = db.prepare('SELECT id, phone, username, email, nickname, avatar, membershipType, createdAt, updatedAt FROM users WHERE id = ?').get(id);
    db.close();

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - 删除用户（单个或批量）
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids');

    const db = getDb();

    // 批量删除
    if (ids) {
      const idArray = ids.split(',').map(id => parseInt(id));
      const placeholders = idArray.map(() => '?').join(',');
      const result = db.prepare(
        `DELETE FROM users WHERE id IN (${placeholders})`
      ).run(...idArray);

      db.close();

      return NextResponse.json({
        message: `Successfully deleted ${result.changes} users`,
        count: result.changes
      });
    }

    // 单个删除
    if (id) {
      const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
      db.close();

      if (result.changes === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'User deleted successfully' });
    }

    db.close();
    return NextResponse.json({ error: 'ID or IDs required' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
