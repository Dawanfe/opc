import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET - 获取所有新闻或单个新闻
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const db = getDb();

    if (id) {
      const news = db.prepare('SELECT * FROM news WHERE id = ?').get(id);
      db.close();

      if (!news) {
        return NextResponse.json({ error: 'News not found' }, { status: 404 });
      }

      return NextResponse.json(news);
    }

    const newsList = db.prepare('SELECT * FROM news ORDER BY id DESC').all();
    db.close();

    return NextResponse.json(newsList);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// POST - 创建新新闻（单个或批量）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    // 批量创建 - 支持两种格式: { items: [...] } 或直接数组 [...]
    const itemsToCreate = body.items || (Array.isArray(body) ? body : null);

    if (itemsToCreate && Array.isArray(itemsToCreate)) {
      const insertStmt = db.prepare(`
        INSERT INTO news (
          title, category, date, source, url, summary, content, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMany = db.transaction((newsList) => {
        for (const news of newsList) {
          insertStmt.run(
            news.title,
            news.category || null,
            news.date || null,
            news.source || null,
            news.url || null,
            news.summary || null,
            news.content || null,
            news.tags || null
          );
        }
      });

      insertMany(itemsToCreate);
      db.close();

      return NextResponse.json({
        message: `Successfully created ${itemsToCreate.length} news items`,
        count: itemsToCreate.length
      });
    }

    // 单个创建
    const result = db.prepare(`
      INSERT INTO news (
        title, category, date, source, url, summary, content, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      body.title,
      body.category || null,
      body.date || null,
      body.source || null,
      body.url || null,
      body.summary || null,
      body.content || null,
      body.tags || null
    );

    const newNews = db.prepare('SELECT * FROM news WHERE id = ?').get(result.lastInsertRowid);
    db.close();

    return NextResponse.json(newNews, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { error: 'Failed to create news' },
      { status: 500 }
    );
  }
}

// PUT - 更新新闻
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();

    const result = db.prepare(`
      UPDATE news
      SET title = ?, category = ?, date = ?, source = ?,
          url = ?, summary = ?, content = ?, tags = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.title,
      data.category || null,
      data.date || null,
      data.source || null,
      data.url || null,
      data.summary || null,
      data.content || null,
      data.tags || null,
      id
    );

    if (result.changes === 0) {
      db.close();
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    const updatedNews = db.prepare('SELECT * FROM news WHERE id = ?').get(id);
    db.close();

    return NextResponse.json(updatedNews);
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      { error: 'Failed to update news' },
      { status: 500 }
    );
  }
}

// DELETE - 删除新闻（单个或批量）
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
        `DELETE FROM news WHERE id IN (${placeholders})`
      ).run(...idArray);

      db.close();

      return NextResponse.json({
        message: `Successfully deleted ${result.changes} news items`,
        count: result.changes
      });
    }

    // 单个删除
    if (id) {
      const result = db.prepare('DELETE FROM news WHERE id = ?').run(id);
      db.close();

      if (result.changes === 0) {
        return NextResponse.json({ error: 'News not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'News deleted successfully' });
    }

    db.close();
    return NextResponse.json({ error: 'ID or IDs required' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { error: 'Failed to delete news' },
      { status: 500 }
    );
  }
}
