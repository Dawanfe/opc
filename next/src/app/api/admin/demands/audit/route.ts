import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// PUT - 审核需求（通过/拒绝）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, auditStatus, rejectReason } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (!auditStatus || !['approved', 'rejected'].includes(auditStatus)) {
      return NextResponse.json(
        { error: 'auditStatus must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    if (auditStatus === 'rejected' && !rejectReason) {
      return NextResponse.json(
        { error: 'rejectReason is required when rejecting' },
        { status: 400 }
      );
    }

    const db = getDb();

    const result = db.prepare(`
      UPDATE demands
      SET auditStatus = ?, rejectReason = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      auditStatus,
      auditStatus === 'rejected' ? rejectReason : null,
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
    console.error('Error auditing demand:', error);
    return NextResponse.json(
      { error: 'Failed to audit demand' },
      { status: 500 }
    );
  }
}
