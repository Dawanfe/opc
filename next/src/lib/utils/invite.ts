import { getDb } from '@/lib/db';

/**
 * 生成8位字母数字混合邀请码（排除易混淆字符）
 * 排除：0, O, o, I, l, 1
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnpqrstuvwxyz';
  let code = '';

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }

  return code;
}

/**
 * 生成唯一邀请码（确保数据库中不重复）
 * @param maxRetries 最大重试次数，默认10次
 */
export function generateUniqueInviteCode(maxRetries: number = 10): string {
  for (let i = 0; i < maxRetries; i++) {
    const code = generateInviteCode();
    const db = getDb();

    try {
      const existing = db.prepare('SELECT id FROM users WHERE inviteCode = ?').get(code);

      if (!existing) {
        return code;
      }
    } finally {
      db.close();
    }
  }

  throw new Error('Failed to generate unique invite code after multiple attempts');
}

/**
 * 校验邀请码格式（8位字母数字混合）
 */
export function validateInviteCodeFormat(code: string): boolean {
  if (!code || code.length !== 8) {
    return false;
  }

  // 只允许字母和数字
  return /^[A-Za-z0-9]{8}$/.test(code);
}

/**
 * 检查邀请码是否存在且有效
 * @returns 邀请人信息或null
 */
export function checkInviteCodeExists(code: string): { id: number; nickname: string; phone: string } | null {
  if (!validateInviteCodeFormat(code)) {
    return null;
  }

  const db = getDb();
  const user = db.prepare(
    'SELECT id, nickname, phone FROM users WHERE inviteCode = ?'
  ).get(code) as { id: number; nickname: string; phone: string } | undefined;

  db.close();
  return user || null;
}

/**
 * 为现有用户生成并更新邀请码（用于数据迁移）
 */
export function generateInviteCodeForExistingUsers(): void {
  const db = getDb();

  // 查找所有没有邀请码的用户
  const usersWithoutCode = db.prepare(
    'SELECT id FROM users WHERE inviteCode IS NULL'
  ).all() as { id: number }[];

  const updateStmt = db.prepare('UPDATE users SET inviteCode = ? WHERE id = ?');

  const transaction = db.transaction(() => {
    for (const user of usersWithoutCode) {
      const code = generateUniqueInviteCode();
      updateStmt.run(code, user.id);
    }
  });

  transaction();
  db.close();

  console.log(`Generated invite codes for ${usersWithoutCode.length} existing users`);
}
