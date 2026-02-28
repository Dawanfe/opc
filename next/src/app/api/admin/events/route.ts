import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET - 获取所有活动或单个活动（支持分页）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const page = searchParams.get('page');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  try {
    const db = getDb();

    if (id) {
      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
      db.close();

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      return NextResponse.json(event);
    }

    // 分页模式
    if (page) {
      const pageNum = Math.max(1, parseInt(page));
      const offset = (pageNum - 1) * pageSize;
      const total = (db.prepare('SELECT COUNT(*) as count FROM events').get() as any).count;
      const events = db.prepare('SELECT * FROM events ORDER BY date DESC, id DESC LIMIT ? OFFSET ?').all(pageSize, offset);
      db.close();

      return NextResponse.json({
        items: events,
        total,
        page: pageNum,
        pageSize,
        hasMore: offset + pageSize < total,
      });
    }

    // 不带分页参数：返回全部（兼容管理后台）
    const events = db.prepare('SELECT * FROM events ORDER BY id DESC').all();
    db.close();

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST - 创建新活动（单个或批量）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    // 批量创建 - 支持两种格式: { items: [...] } 或直接数组 [...]
    const itemsToCreate = body.items || (Array.isArray(body) ? body : null);

    if (itemsToCreate && Array.isArray(itemsToCreate)) {
      const insertStmt = db.prepare(`
        INSERT INTO events (
          location, organizer, date, name, registrationLink,
          guests, guestTitles, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMany = db.transaction((events) => {
        for (const event of events) {
          insertStmt.run(
            event.location || null,
            event.organizer || null,
            event.date || null,
            event.name,
            event.registrationLink || null,
            event.guests || null,
            event.guestTitles || null,
            event.description || null
          );
        }
      });

      insertMany(itemsToCreate);
      db.close();

      return NextResponse.json({
        message: `Successfully created ${itemsToCreate.length} events`,
        count: itemsToCreate.length
      });
    }

    // 单个创建
    const result = db.prepare(`
      INSERT INTO events (
        location, organizer, date, name, registrationLink,
        guests, guestTitles, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      body.location || null,
      body.organizer || null,
      body.date || null,
      body.name,
      body.registrationLink || null,
      body.guests || null,
      body.guestTitles || null,
      body.description || null
    );

    const newEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
    db.close();

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// PUT - 更新活动
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();

    const result = db.prepare(`
      UPDATE events
      SET location = ?, organizer = ?, date = ?, name = ?,
          registrationLink = ?, guests = ?, guestTitles = ?,
          description = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.location || null,
      data.organizer || null,
      data.date || null,
      data.name,
      data.registrationLink || null,
      data.guests || null,
      data.guestTitles || null,
      data.description || null,
      id
    );

    if (result.changes === 0) {
      db.close();
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updatedEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    db.close();

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE - 删除活动（单个或批量）
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
        `DELETE FROM events WHERE id IN (${placeholders})`
      ).run(...idArray);

      db.close();

      return NextResponse.json({
        message: `Successfully deleted ${result.changes} events`,
        count: result.changes
      });
    }

    // 单个删除
    if (id) {
      const result = db.prepare('DELETE FROM events WHERE id = ?').run(id);
      db.close();

      if (result.changes === 0) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Event deleted successfully' });
    }

    db.close();
    return NextResponse.json({ error: 'ID or IDs required' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
