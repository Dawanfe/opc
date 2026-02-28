import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET - 获取所有需求或单个需求
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const db = getDb();

    if (id) {
      const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(id);
      db.close();

      if (!demand) {
        return NextResponse.json({ error: 'Demand not found' }, { status: 404 });
      }

      return NextResponse.json(demand);
    }

    const demands = db.prepare('SELECT * FROM demands ORDER BY id DESC').all();
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

// POST - 创建新需求（单个或批量）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    // 批量创建 - 支持两种格式: { items: [...] } 或直接数组 [...]
    const itemsToCreate = body.items || (Array.isArray(body) ? body : null);

    if (itemsToCreate && Array.isArray(itemsToCreate)) {
      const insertStmt = db.prepare(`
        INSERT INTO demands (
          title, category, budget, deadline, description,
          requirements, postedBy, postedAt, contact, status, auditStatus
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMany = db.transaction((demandsList: any[]) => {
        for (const demand of demandsList) {
          insertStmt.run(
            demand.title,
            demand.category || null,
            demand.budget || null,
            demand.deadline || null,
            demand.description || null,
            demand.requirements || null,
            demand.postedBy || null,
            demand.postedAt || null,
            demand.contact || null,
            demand.status || 'open',
            'approved' // 管理员批量导入默认已审核
          );
        }
      });

      insertMany(itemsToCreate);
      db.close();

      return NextResponse.json({
        message: `Successfully created ${itemsToCreate.length} demands`,
        count: itemsToCreate.length
      });
    }

    // 单个创建 - 管理员新增默认已审核
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
      body.postedBy || null,
      body.postedAt || null,
      body.contact || null,
      body.status || 'open',
      'approved' // 管理员新增默认已审核
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

// PUT - 更新需求
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();

    const result = db.prepare(`
      UPDATE demands
      SET title = ?, category = ?, budget = ?, deadline = ?,
          description = ?, requirements = ?, postedBy = ?, postedAt = ?,
          contact = ?, status = ?, auditStatus = ?, rejectReason = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.title,
      data.category || null,
      data.budget || null,
      data.deadline || null,
      data.description || null,
      data.requirements || null,
      data.postedBy || null,
      data.postedAt || null,
      data.contact || null,
      data.status || 'open',
      data.auditStatus || 'pending',
      data.rejectReason || null,
      id
    );

    if (result.changes === 0) {
      db.close();
      return NextResponse.json({ error: 'Demand not found' }, { status: 404 });
    }

    const updatedDemand = db.prepare('SELECT * FROM demands WHERE id = ?').get(id);
    db.close();

    return NextResponse.json(updatedDemand);
  } catch (error) {
    console.error('Error updating demand:', error);
    return NextResponse.json(
      { error: 'Failed to update demand' },
      { status: 500 }
    );
  }
}

// DELETE - 删除需求（单个或批量）
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
        `DELETE FROM demands WHERE id IN (${placeholders})`
      ).run(...idArray);

      db.close();

      return NextResponse.json({
        message: `Successfully deleted ${result.changes} demands`,
        count: result.changes
      });
    }

    // 单个删除
    if (id) {
      const result = db.prepare('DELETE FROM demands WHERE id = ?').run(id);
      db.close();

      if (result.changes === 0) {
        return NextResponse.json({ error: 'Demand not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Demand deleted successfully' });
    }

    db.close();
    return NextResponse.json({ error: 'ID or IDs required' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting demand:', error);
    return NextResponse.json(
      { error: 'Failed to delete demand' },
      { status: 500 }
    );
  }
}
