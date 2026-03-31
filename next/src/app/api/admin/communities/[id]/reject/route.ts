import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * 审核拒绝接口
 *
 * POST /api/admin/communities/:id/reject
 *
 * 请求头：
 * - X-API-Key: 管理员API密钥
 *
 * 请求体：
 * {
 *   "reason": "拒绝原因（必填）"
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // 获取拒绝原因
    let reason = '';
    try {
      const body = await request.json();
      reason = body.reason || '';
    } catch {
      return NextResponse.json(
        { error: 'Request body required with reason' },
        { status: 400 }
      );
    }

    if (!reason.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // 检查是否存在
    const current = db.prepare('SELECT auditStatus FROM communities WHERE id = ?').get(id) as any;
    if (!current) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    if (current.auditStatus === 'rejected') {
      return NextResponse.json({ error: 'Already rejected' }, { status: 400 });
    }

    // 更新状态为已拒绝
    db.prepare(`
      UPDATE communities
      SET auditStatus = 'rejected',
          auditNotes = ?,
          auditedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(reason, id);

    console.log(`[CommunityAudit] Rejected community ${id}, reason: ${reason}`);

    return NextResponse.json({
      success: true,
      message: 'Community rejected'
    });

  } catch (error) {
    console.error('[CommunityReject] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
