import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET - 获取配置项（支持单个key或多个key）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const keys = searchParams.get('keys');

  try {
    const db = getDb();

    if (key) {
      const setting = db.prepare('SELECT * FROM settings WHERE key = ?').get(key) as any;
      db.close();
      return NextResponse.json(setting || { key, value: null });
    }

    if (keys) {
      const keyList = keys.split(',');
      const placeholders = keyList.map(() => '?').join(',');
      const settings = db.prepare(
        `SELECT * FROM settings WHERE key IN (${placeholders})`
      ).all(...keyList);
      db.close();
      return NextResponse.json(settings);
    }

    const allSettings = db.prepare('SELECT * FROM settings').all();
    db.close();
    return NextResponse.json(allSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - 更新配置项
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const db = getDb();

    db.prepare(`
      INSERT INTO settings (key, value, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = CURRENT_TIMESTAMP
    `).run(key, value);

    db.close();

    return NextResponse.json({ key, value, message: 'Setting updated' });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
