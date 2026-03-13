import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET - 获取启用的外部链接（公开API）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const position = searchParams.get('position'); // sidebar, dashboard

  try {
    const db = getDb();

    let query = 'SELECT * FROM external_links WHERE enabled = 1';
    const params: any[] = [];

    if (position) {
      query += ' AND position = ?';
      params.push(position);
    }

    query += ' ORDER BY sortOrder ASC';

    const links = params.length > 0
      ? db.prepare(query).all(...params)
      : db.prepare(query).all();

    db.close();

    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching external links:', error);
    return NextResponse.json({ error: 'Failed to fetch external links' }, { status: 500 });
  }
}
