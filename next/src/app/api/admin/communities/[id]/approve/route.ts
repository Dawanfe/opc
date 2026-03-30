import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * 审核通过接口
 *
 * POST /api/admin/communities/:id/approve
 *
 * 请求头：
 * - X-API-Key: 管理员API密钥
 *
 * 请求体（可选）：
 * {
 *   "notes": "审核备注"
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // API Key 鉴权
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== process.env.COMMUNITY_SYNC_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // 获取当前状态
    const current = db.prepare('SELECT auditStatus FROM communities WHERE id = ?').get(id) as any;
    if (!current) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    if (current.auditStatus === 'published') {
      return NextResponse.json({ error: 'Already published' }, { status: 400 });
    }

    // 获取审核备注
    let notes = '';
    try {
      const body = await request.json();
      notes = body.notes || '';
    } catch {
      // 忽略解析错误
    }

    // 更新状态为已发布
    db.prepare(`
      UPDATE communities
      SET auditStatus = 'published',
          auditNotes = ?,
          auditedAt = CURRENT_TIMESTAMP,
          publishedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(notes, id);

    console.log(`[CommunityAudit] Approved community ${id} by admin`);

    return NextResponse.json({
      success: true,
      message: 'Community approved and published'
    });

  } catch (error) {
    console.error('[CommunityApprove] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
