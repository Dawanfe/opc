import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - 获取已审核通过的需求（用户侧）
export async function GET() {
  try {
    const db = getDb();
    const demands = db.prepare(
      "SELECT * FROM demands WHERE auditStatus = 'approved' ORDER BY id DESC"
    ).all();
    db.close();

    return NextResponse.json(demands);
  } catch (error) {
    console.error('Error fetching demands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demands' },
      { status: 500 }
    );
  }
}

// POST - 用户发布新需求（需登录，默认待审核）
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: '登录已过期，请重新登录' }, { status: 401 });
    }

    const body = await request.json();
    const db = getDb();

    // 获取用户信息作为发布者
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId) as any;
    const postedBy = user?.nickname || user?.username || user?.phone || '匿名用户';

    const today = new Date().toISOString().split('T')[0];

    const result = db.prepare(`
      INSERT INTO demands (
        title, category, budget, deadline, description,
        requirements, postedBy, postedAt, contact, status, auditStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      body.title,
      body.category || null,
      body.budget || null,
      body.deadline || null,
      body.description || null,
      body.requirements || null,
      postedBy,
      today,
      body.contact || null,
      'open',
      'pending' // 用户提交默认待审核
    );

    const newDemand = db.prepare('SELECT * FROM demands WHERE id = ?').get(result.lastInsertRowid);
    db.close();

    return NextResponse.json(newDemand, { status: 201 });
  } catch (error) {
    console.error('Error creating demand:', error);
    return NextResponse.json(
      { error: 'Failed to create demand' },
      { status: 500 }
    );
  }
}
