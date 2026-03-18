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
        iconImageActive TEXT,
        dashboardIcon TEXT,
        dashboardIconImage TEXT,
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
        INSERT INTO external_links (
          key, label, description, icon, iconImage, iconImageActive,
          dashboardIcon, dashboardIconImage, url, position, sortOrder,
          enabled, hot, color
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // 插入申请项目投资
      insertStmt.run(
        'investment',                                                    // key
        '申请项目投资',                                                  // label
        '单个OPC项目，申请10-200万投资额度，3个工作日内反馈',           // description
        null,                                                            // icon (Lucide图标名，不使用)
        '/money-rmb.png',                                               // iconImage (侧边栏默认图标)
        '/money-rmb-active.png',                                        // iconImageActive (侧边栏激活图标)
        null,                                                            // dashboardIcon (首页卡片Lucide图标，不使用)
        '/money-rmb-card.png',                                          // dashboardIconImage (首页卡片图标)
        'https://mp.weixin.qq.com/s/JS1j0fXw6Tf2t6yrOwbMuQ',          // url
        'both',                                                          // position (侧边栏+首页卡片)
        2,                                                               // sortOrder
        1,                                                               // enabled
        1,                                                               // hot
        'purple'                                                         // color
      );

      // 插入OpenClaw学习中心
      insertStmt.run(
        'openclaw',
        'OpenClaw学习中心',
        'AI开发框架教程，快速上手构建智能应用',
        'GraduationCap',
        null,
        null,
        null,
        null,
        '/openclaw',
        'sidebar',
        2.5,
        1,
        0,
        'blue'
      );

      db.close();
      return NextResponse.json({ message: 'Initialized successfully', count: 2 });
    } else {
      // 已有数据，使用 upsert 逻辑更新
      const upsertStmt = db.prepare(`
        INSERT INTO external_links (
          key, label, description, icon, iconImage, iconImageActive,
          dashboardIcon, dashboardIconImage, url, position, sortOrder,
          enabled, hot, color
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          label = excluded.label,
          description = excluded.description,
          icon = excluded.icon,
          iconImage = excluded.iconImage,
          iconImageActive = excluded.iconImageActive,
          dashboardIcon = excluded.dashboardIcon,
          dashboardIconImage = excluded.dashboardIconImage,
          url = excluded.url,
          position = excluded.position,
          sortOrder = excluded.sortOrder,
          enabled = excluded.enabled,
          hot = excluded.hot,
          color = excluded.color,
          updatedAt = CURRENT_TIMESTAMP
      `);

      // 更新申请项目投资
      upsertStmt.run(
        'investment',
        '申请项目投资',
        '单个OPC项目，申请10-200万投资额度，3个工作日内反馈',
        null,
        '/money-rmb.png',
        '/money-rmb-active.png',
        null,
        '/money-rmb-card.png',
        'https://mp.weixin.qq.com/s/JS1j0fXw6Tf2t6yrOwbMuQ',
        'both',
        2,
        1,
        1,
        'purple'
      );

      // 更新OpenClaw学习中心
      upsertStmt.run(
        'openclaw',
        'OpenClaw学习中心',
        'AI开发框架教程，快速上手构建智能应用',
        'GraduationCap',
        null,
        null,
        null,
        null,
        '/openclaw',
        'sidebar',
        2.5,
        1,
        0,
        'blue'
      );

      db.close();
      return NextResponse.json({ message: 'Updated successfully', count: existing.count });
    }
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
