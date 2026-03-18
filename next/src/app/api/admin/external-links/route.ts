import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET - 获取所有外部链接
export async function GET() {
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

    const links = db.prepare('SELECT * FROM external_links ORDER BY sortOrder ASC').all();
    db.close();

    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching external links:', error);
    return NextResponse.json({ error: 'Failed to fetch external links' }, { status: 500 });
  }
}

// POST - 创建新的外部链接
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      key, label, description, icon, iconImage, iconImageActive,
      dashboardIcon, dashboardIconImage, url, position,
      sortOrder = 0, enabled = 1, hot = 0, color = 'purple'
    } = body;

    if (!key || !label || !url || !position) {
      return NextResponse.json(
        { error: 'key, label, url and position are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    const result = db.prepare(`
      INSERT INTO external_links (
        key, label, description, icon, iconImage, iconImageActive,
        dashboardIcon, dashboardIconImage, url, position, sortOrder,
        enabled, hot, color, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      key, label, description, icon, iconImage, iconImageActive,
      dashboardIcon, dashboardIconImage, url, position, sortOrder,
      enabled, hot, color
    );

    const newLink = db.prepare('SELECT * FROM external_links WHERE id = ?').get(result.lastInsertRowid);
    db.close();

    return NextResponse.json(newLink, { status: 201 });
  } catch (error: any) {
    console.error('Error creating external link:', error);
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Key already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create external link' }, { status: 500 });
  }
}

// PUT - 更新外部链接
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id, key, label, description, icon, iconImage, iconImageActive,
      dashboardIcon, dashboardIconImage, url, position, sortOrder,
      enabled, hot, color
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const db = getDb();

    db.prepare(`
      UPDATE external_links
      SET key = ?, label = ?, description = ?, icon = ?, iconImage = ?,
          iconImageActive = ?, dashboardIcon = ?, dashboardIconImage = ?,
          url = ?, position = ?, sortOrder = ?, enabled = ?, hot = ?,
          color = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      key, label, description, icon, iconImage, iconImageActive,
      dashboardIcon, dashboardIconImage, url, position, sortOrder,
      enabled, hot, color, id
    );

    const updatedLink = db.prepare('SELECT * FROM external_links WHERE id = ?').get(id);
    db.close();

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error('Error updating external link:', error);
    return NextResponse.json({ error: 'Failed to update external link' }, { status: 500 });
  }
}

// DELETE - 删除外部链接
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  try {
    const db = getDb();
    db.prepare('DELETE FROM external_links WHERE id = ?').run(id);
    db.close();

    return NextResponse.json({ message: 'External link deleted' });
  } catch (error) {
    console.error('Error deleting external link:', error);
    return NextResponse.json({ error: 'Failed to delete external link' }, { status: 500 });
  }
}
