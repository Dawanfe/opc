import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * OPC社区查询接口（用户侧）
 *
 * GET /api/communities
 *
 * 查询参数：
 * - city: 按城市过滤
 * - province: 按省份过滤
 * - id: 获取单个社区详情
 * - search: 关键词搜索
 *
 * 注意：此接口只返回已审核通过并发布的社区数据
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const city = searchParams.get('city');
  const province = searchParams.get('province');
  const search = searchParams.get('search');

  try {
    const db = getDb();

    // 获取单个社区详情
    if (id) {
      const community = db.prepare(`
        SELECT * FROM communities
        WHERE id = ? AND auditStatus = 'published'
      `).get(id);
      db.close();

      if (!community) {
        return NextResponse.json({ error: 'Community not found' }, { status: 404 });
      }

      return NextResponse.json(community);
    }

    // 构建查询条件
    let whereClause = "WHERE auditStatus = 'published'";
    const params: any[] = [];

    if (city) {
      whereClause += ' AND city = ?';
      params.push(city);
    }

    if (province) {
      whereClause += ' AND province = ?';
      params.push(province);
    }

    if (search) {
      whereClause += ' AND (name LIKE ? OR address LIKE ? OR policySummary LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const query = `
      SELECT * FROM communities
      ${whereClause}
      ORDER BY publishedAt DESC
    `;

    const communities = db.prepare(query).all(...params);
    db.close();

    return NextResponse.json({
      success: true,
      count: communities.length,
      data: communities
    });

  } catch (error) {
    console.error('[Communities API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}
