import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyRequestSignature, getSyncSecret } from '@/lib/crypto';

/**
 * OPC社区数据同步接口
 *
 * 请求头要求：
 * - X-Signature: HMAC-SHA256签名
 * - X-Timestamp: Unix时间戳（秒）
 * - Content-Type: application/json
 *
 * 签名算法：SHA256(body:timestamp:secret)
 * 有效期：5分钟
 *
 * 请求体格式：
 * {
 *   "communities": [
 *     {
 *       "syncId": "唯一ID（可选，用于去重）",
 *       "province": "省",
 *       "city": "市",
 *       "district": "区",
 *       "name": "社区名称",
 *       "address": "地址",
 *       "policySummary": "政策摘要",
 *       "freeWorkspace": "免费工位信息",
 *       "freeAccommodation": "免费住宿信息",
 *       "computingSupport": "算力支持",
 *       "investmentSupport": "投资支持",
 *       "registrationSupport": "注册支持",
 *       "otherServices": "其他服务",
 *       "benefitCount": 0,
 *       "contact": "联系方式",
 *       "verificationStatus": "已认证",
 *       "confidence": "高"
 *     }
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 获取请求头
    const signature = request.headers.get('X-Signature');
    const timestamp = request.headers.get('X-Timestamp');
    const apiKey = request.headers.get('X-API-Key');

    // 2. 基础验证
    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required headers: X-Signature, X-Timestamp' },
        { status: 400 }
      );
    }

    // 3. API Key 验证（可选，双重保险）
    const expectedApiKey = process.env.COMMUNITY_SYNC_API_KEY;
    if (expectedApiKey && apiKey !== expectedApiKey) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      console.warn(`Invalid API Key from IP: ${ip}`);
      return NextResponse.json(
        { error: 'Invalid API Key' },
        { status: 401 }
      );
    }

    // 4. IP 白名单验证（可选）
    const allowedIpsStr = process.env.ALLOWED_SYNC_IPS || '';
    const allowedIps = allowedIpsStr ? allowedIpsStr.split(',').map(s => s.trim()).filter(s => s) : [];
    if (allowedIps.length > 0) {
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                       request.headers.get('x-real-ip');
      if (!clientIp || !allowedIps.includes(clientIp)) {
        console.warn(`Unauthorized IP access: ${clientIp || 'unknown'}`);
        return NextResponse.json(
          { error: 'IP not allowed' },
          { status: 403 }
        );
      }
    }

    // 5. 获取请求体
    const body = await request.text();
    let data: { communities?: any[] };

    try {
      data = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // 6. 验证数据格式
    if (!Array.isArray(data?.communities)) {
      return NextResponse.json(
        { error: 'Invalid data format: communities must be an array' },
        { status: 400 }
      );
    }

    // 7. 验证签名
    const secret = getSyncSecret();
    const isValid = verifyRequestSignature(body, timestamp, signature, secret, 300);

    if (!isValid) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      console.warn(`Invalid signature from IP: ${ip}`);
      return NextResponse.json(
        { error: 'Invalid signature or expired timestamp' },
        { status: 401 }
      );
    }

    // 8. 限制批量数量
    const MAX_BATCH_SIZE = parseInt(process.env.MAX_SYNC_BATCH_SIZE || '100', 10);
    if (data.communities.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Batch size exceeds limit of ${MAX_BATCH_SIZE}` },
        { status: 400 }
      );
    }

    // 9. 数据库操作
    const db = getDb();

    // 准备插入语句
    const insertCommunity = db.prepare(`
      INSERT INTO communities (
        syncId, province, city, district, name, address, policySummary,
        freeWorkspace, freeAccommodation, computingSupport, investmentSupport,
        registrationSupport, otherServices, benefitCount, contact,
        verificationStatus, confidence, source, auditStatus,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cron', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    // 准备更新语句
    const updateCommunity = db.prepare(`
      UPDATE communities SET
        province = ?,
        city = ?,
        district = ?,
        name = ?,
        address = ?,
        policySummary = ?,
        freeWorkspace = ?,
        freeAccommodation = ?,
        computingSupport = ?,
        investmentSupport = ?,
        registrationSupport = ?,
        otherServices = ?,
        benefitCount = ?,
        contact = ?,
        verificationStatus = ?,
        confidence = ?,
        source = 'cron',
        updatedAt = CURRENT_TIMESTAMP
      WHERE syncId = ?
    `);

    // 批量插入（事务）
    const insertMany = db.transaction((items: any[]) => {
      let inserted = 0;
      let updated = 0;

      for (const item of items) {
        // 检查是否已存在
        if (item.syncId) {
          const existing = db.prepare(
            'SELECT id FROM communities WHERE syncId = ?'
          ).get(item.syncId);
          if (existing) {
            // 更新
            updateCommunity.run(
              sanitizeInput(item.province),
              sanitizeInput(item.city),
              sanitizeInput(item.district),
              sanitizeInput(item.name),
              sanitizeInput(item.address),
              sanitizeInput(item.policySummary),
              sanitizeInput(item.freeWorkspace),
              sanitizeInput(item.freeAccommodation),
              sanitizeInput(item.computingSupport),
              sanitizeInput(item.investmentSupport),
              sanitizeInput(item.registrationSupport),
              sanitizeInput(item.otherServices),
              item.benefitCount || 0,
              sanitizeInput(item.contact),
              sanitizeInput(item.verificationStatus),
              sanitizeInput(item.confidence),
              item.syncId
            );
            updated++;
          } else {
            // 插入
            insertCommunity.run(
              item.syncId || null,
              sanitizeInput(item.province),
              sanitizeInput(item.city),
              sanitizeInput(item.district),
              sanitizeInput(item.name),
              sanitizeInput(item.address),
              sanitizeInput(item.policySummary),
              sanitizeInput(item.freeWorkspace),
              sanitizeInput(item.freeAccommodation),
              sanitizeInput(item.computingSupport),
              sanitizeInput(item.investmentSupport),
              sanitizeInput(item.registrationSupport),
              sanitizeInput(item.otherServices),
              item.benefitCount || 0,
              sanitizeInput(item.contact),
              sanitizeInput(item.verificationStatus),
              sanitizeInput(item.confidence)
            );
            inserted++;
          }
        } else {
          // 没有 syncId，直接插入
          insertCommunity.run(
            null,
            sanitizeInput(item.province),
            sanitizeInput(item.city),
            sanitizeInput(item.district),
            sanitizeInput(item.name),
            sanitizeInput(item.address),
            sanitizeInput(item.policySummary),
            sanitizeInput(item.freeWorkspace),
            sanitizeInput(item.freeAccommodation),
            sanitizeInput(item.computingSupport),
            sanitizeInput(item.investmentSupport),
            sanitizeInput(item.registrationSupport),
            sanitizeInput(item.otherServices),
            item.benefitCount || 0,
            sanitizeInput(item.contact),
            sanitizeInput(item.verificationStatus),
            sanitizeInput(item.confidence)
            );
          inserted++;
        }
      }

      return { inserted, updated };
    });

    // 执行批量操作
    const result = insertMany(data.communities);

    // 10. 记录日志
    console.log(`[CommunitySync] ${new Date().toISOString()} - ` +
      `Inserted: ${result.inserted}, Updated: ${result.updated}, ` +
      `Total: ${data.communities.length}`);

    // 11. 返回结果
    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      inserted: result.inserted,
      updated: result.updated,
      total: data.communities.length
    });

  } catch (error) {
    console.error('[CommunitySync] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 输入清理 - 防XSS
 */
function sanitizeInput(input: any): string {
  if (input === null || input === undefined) {
    return '';
  }
  const str = String(input);
  // 移除HTML标签
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * GET 接口 - 获取待审核列表（管理员）
 */
export async function GET(request: NextRequest) {
  try {
    // 简单鉴权（生产环境应使用JWT）
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== process.env.COMMUNITY_SYNC_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // 获取待审核和已审核的列表
    const pending = db.prepare(`
      SELECT id, syncId, province, city, district, name, address,
             auditStatus, createdAt
      FROM communities
      WHERE auditStatus = 'pending'
      ORDER BY createdAt DESC
      LIMIT 50
    `).all();

    const stats = db.prepare(`
      SELECT
        COUNT(*) FILTER (WHERE auditStatus = 'pending') as pending,
        COUNT(*) FILTER (WHERE auditStatus = 'approved') as approved,
        COUNT(*) FILTER (WHERE auditStatus = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE auditStatus = 'published') as published
      FROM communities
    `).get() as any;

    return NextResponse.json({
      success: true,
      pending,
      stats
    });

  } catch (error) {
    console.error('[CommunitySync] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
