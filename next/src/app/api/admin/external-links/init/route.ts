import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET & POST - 初始化外部链接数据
async function initializeData() {
  try {
    const db = getDb();

    // 确保表存在
    db.exec(`
      CREATE TABLE IF NOT EXISTS external_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        iconImage TEXT,
        url TEXT NOT NULL,
        position TEXT NOT NULL,
        sortOrder INTEGER DEFAULT 0,
        enabled INTEGER DEFAULT 1,
        hot INTEGER DEFAULT 0,
        color TEXT DEFAULT 'purple',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 检查是否已有数据
    const existing = db.prepare('SELECT COUNT(*) as count FROM external_links').get() as any;

    if (existing.count === 0) {
      // 插入初始数据
      const insertStmt = db.prepare(`
        INSERT INTO external_links (key, label, description, icon, iconImage, url, position, sortOrder, enabled, hot, color)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // 插入申请项目投资
      insertStmt.run(
        'investment',
        '申请项目投资',
        '单个OPC项目，申请10-200万投资额度，3个工作日内反馈',
        null,
        '/money-rmb.png',
        'https://mp.weixin.qq.com/s/JS1j0fXw6Tf2t6yrOwbMuQ',
        'both',
        2,
        1,
        1,
        'purple'
      );

      // 插入OpenClaw学习中心
      insertStmt.run(
        'openclaw',
        'OpenClaw学习中心',
        'AI开发框架教程，快速上手构建智能应用',
        'GraduationCap',
        null,
        'https://weopc.com.cn/openclaw',
        'sidebar',
        2.5,
        1,
        0,
        'blue'
      );

      db.close();
      return NextResponse.json({ message: 'Initialized successfully', count: 2 });
    }

    db.close();
    return NextResponse.json({ message: 'Already initialized', count: existing.count });
  } catch (error) {
    console.error('Error initializing external links:', error);
    return NextResponse.json({ error: 'Failed to initialize' }, { status: 500 });
  }
}

export async function GET() {
  return initializeData();
}

export async function POST(request: NextRequest) {
  return initializeData();
}
