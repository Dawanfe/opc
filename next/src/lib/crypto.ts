import crypto from 'crypto';

/**
 * 生成 HMAC-SHA256 签名
 * @param data - 要签名的数据
 * @param secret - 密钥
 * @returns 签名字符串（hex格式）
 */
export function generateSignature(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * 验证签名
 * @param data - 原始数据
 * @param signature - 待验证的签名
 * @param secret - 密钥
 * @returns 签名是否有效
 */
export function verifySignature(data: string, signature: string, secret: string): boolean {
  const expected = generateSignature(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}

/**
 * 生成请求签名（用于同步接口）
 * @param body - 请求体JSON字符串
 * @param timestamp - 时间戳
 * @param secret - 密钥
 * @returns 签名字符串
 */
export function generateRequestSignature(body: string, timestamp: string, secret: string): string {
  const data = `${body}:${timestamp}:${secret}`;
  return generateSignature(data, secret);
}

/**
 * 验证请求签名
 * @param body - 请求体JSON字符串
 * @param timestamp - 时间戳
 * @param signature - 签名
 * @param secret - 密钥
 * @param maxAge - 最大有效期（秒），默认300秒
 * @returns 签名是否有效
 */
export function verifyRequestSignature(
  body: string,
  timestamp: string,
  signature: string,
  secret: string,
  maxAge: number = 300
): boolean {
  // 验证时间戳是否过期
  const now = Math.floor(Date.now() / 1000);
  const requestTime = parseInt(timestamp, 10);

  if (isNaN(requestTime)) {
    return false;
  }

  if (Math.abs(now - requestTime) > maxAge) {
    console.log(`Timestamp expired: ${requestTime}, now: ${now}`);
    return false;
  }

  // 验证签名
  const data = `${body}:${timestamp}:${secret}`;
  return verifySignature(data, signature, secret);
}

/**
 * 生成随机密钥
 * @param length - 密钥长度，默认32
 * @returns 随机密钥字符串
 */
export function generateSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * 从环境变量获取同步密钥，如果不存在则生成并提示
 */
export function getSyncSecret(): string {
  const secret = process.env.COMMUNITY_SYNC_SECRET;
  if (!secret) {
    throw new Error('COMMUNITY_SYNC_SECRET environment variable is not set');
  }
  return secret;
}

/**
 * API Key 验证
 */
export function verifyApiKey(apiKey: string, expectedKey: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(apiKey),
    Buffer.from(expectedKey)
  );
}
