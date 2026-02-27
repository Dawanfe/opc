import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET - 获取所有社区或单个社区
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const db = getDb();

    if (id) {
      const community = db.prepare('SELECT * FROM communities WHERE id = ?').get(id);
      db.close();

      if (!community) {
        return NextResponse.json({ error: 'Community not found' }, { status: 404 });
      }

      return NextResponse.json(community);
    }

    const communities = db.prepare('SELECT * FROM communities ORDER BY id DESC').all();
    db.close();

    return NextResponse.json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}

// POST - 创建新社区（单个或批量）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    // 批量创建 - 支持两种格式: { items: [...] } 或直接数组 [...]
    const itemsToCreate = body.items || (Array.isArray(body) ? body : null);

    if (itemsToCreate && Array.isArray(itemsToCreate)) {
      const insertStmt = db.prepare(`
        INSERT INTO communities (
          province, city, district, name, address, policySummary,
          freeWorkspace, freeAccommodation, computingSupport, investmentSupport,
          registrationSupport, otherServices, benefitCount, contact,
          verificationStatus, confidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMany = db.transaction((communities) => {
        for (const community of communities) {
          insertStmt.run(
            community.province,
            community.city,
            community.district || null,
            community.name,
            community.address || null,
            community.policySummary || null,
            community.freeWorkspace || null,
            community.freeAccommodation || null,
            community.computingSupport || null,
            community.investmentSupport || null,
            community.registrationSupport || null,
            community.otherServices || null,
            community.benefitCount || 0,
            community.contact || null,
            community.verificationStatus || null,
            community.confidence || null
          );
        }
      });

      insertMany(itemsToCreate);
      db.close();

      return NextResponse.json({
        message: `Successfully created ${itemsToCreate.length} communities`,
        count: itemsToCreate.length
      });
    }

    // 单个创建
    const result = db.prepare(`
      INSERT INTO communities (
        province, city, district, name, address, policySummary,
        freeWorkspace, freeAccommodation, computingSupport, investmentSupport,
        registrationSupport, otherServices, benefitCount, contact,
        verificationStatus, confidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      body.province,
      body.city,
      body.district || null,
      body.name,
      body.address || null,
      body.policySummary || null,
      body.freeWorkspace || null,
      body.freeAccommodation || null,
      body.computingSupport || null,
      body.investmentSupport || null,
      body.registrationSupport || null,
      body.otherServices || null,
      body.benefitCount || 0,
      body.contact || null,
      body.verificationStatus || null,
      body.confidence || null
    );

    const newCommunity = db.prepare('SELECT * FROM communities WHERE id = ?').get(result.lastInsertRowid);
    db.close();

    return NextResponse.json(newCommunity, { status: 201 });
  } catch (error) {
    console.error('Error creating community:', error);
    return NextResponse.json(
      { error: 'Failed to create community' },
      { status: 500 }
    );
  }
}

// PUT - 更新社区
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();

    const result = db.prepare(`
      UPDATE communities
      SET province = ?, city = ?, district = ?, name = ?, address = ?,
          policySummary = ?, freeWorkspace = ?, freeAccommodation = ?,
          computingSupport = ?, investmentSupport = ?, registrationSupport = ?,
          otherServices = ?, benefitCount = ?, contact = ?,
          verificationStatus = ?, confidence = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.province,
      data.city,
      data.district || null,
      data.name,
      data.address || null,
      data.policySummary || null,
      data.freeWorkspace || null,
      data.freeAccommodation || null,
      data.computingSupport || null,
      data.investmentSupport || null,
      data.registrationSupport || null,
      data.otherServices || null,
      data.benefitCount || 0,
      data.contact || null,
      data.verificationStatus || null,
      data.confidence || null,
      id
    );

    if (result.changes === 0) {
      db.close();
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const updatedCommunity = db.prepare('SELECT * FROM communities WHERE id = ?').get(id);
    db.close();

    return NextResponse.json(updatedCommunity);
  } catch (error) {
    console.error('Error updating community:', error);
    return NextResponse.json(
      { error: 'Failed to update community' },
      { status: 500 }
    );
  }
}

// DELETE - 删除社区（单个或批量）
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
        `DELETE FROM communities WHERE id IN (${placeholders})`
      ).run(...idArray);

      db.close();

      return NextResponse.json({
        message: `Successfully deleted ${result.changes} communities`,
        count: result.changes
      });
    }

    // 单个删除
    if (id) {
      const result = db.prepare('DELETE FROM communities WHERE id = ?').run(id);
      db.close();

      if (result.changes === 0) {
        return NextResponse.json({ error: 'Community not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Community deleted successfully' });
    }

    db.close();
    return NextResponse.json({ error: 'ID or IDs required' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting community:', error);
    return NextResponse.json(
      { error: 'Failed to delete community' },
      { status: 500 }
    );
  }
}
