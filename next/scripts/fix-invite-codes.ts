#!/usr/bin/env tsx

/**
 * 为所有现有用户生成邀请码
 * 修复邀请码为空的问题
 */

import { getDb } from '../src/lib/db';
import { generateInviteCode } from '../src/lib/utils/invite';

function generateUniqueInviteCodeLocal(): string {
  const db = getDb();
  let attempts = 0;
  const maxAttempts = 20;

  while (attempts < maxAttempts) {
    const code = generateInviteCode();

    try {
      const existing = db.prepare('SELECT id FROM users WHERE inviteCode = ?').get(code);

      if (!existing) {
        return code;
      }
    } catch (err) {
      console.error('Error checking invite code:', err);
    }

    attempts++;
  }

  throw new Error('Failed to generate unique invite code after ' + maxAttempts + ' attempts');
}

async function fixInviteCodes() {
  const db = getDb();

  try {
    console.log('🔍 检查需要修复的用户...');

    // 查找所有没有邀请码的用户
    const usersWithoutCode = db.prepare(
      "SELECT id, phone, nickname FROM users WHERE inviteCode IS NULL OR inviteCode = ''"
    ).all() as { id: number; phone: string; nickname: string }[];

    console.log(`📋 找到 ${usersWithoutCode.length} 个用户需要生成邀请码\n`);

    if (usersWithoutCode.length === 0) {
      console.log('✅ 所有用户都已有邀请码！');
      return;
    }

    const updateStmt = db.prepare('UPDATE users SET inviteCode = ? WHERE id = ?');

    // 使用事务批量更新
    const transaction = db.transaction(() => {
      for (const user of usersWithoutCode) {
        const code = generateUniqueInviteCodeLocal();
        updateStmt.run(code, user.id);
        console.log(`✅ 用户 ${user.id} (${user.nickname || user.phone}): ${code}`);
      }
    });

    transaction();

    console.log(`\n🎉 成功为 ${usersWithoutCode.length} 个用户生成邀请码！`);

    // 验证
    console.log('\n🔍 验证结果...');
    const remaining = db.prepare(
      "SELECT COUNT(*) as count FROM users WHERE inviteCode IS NULL OR inviteCode = ''"
    ).get() as { count: number };

    if (remaining.count === 0) {
      console.log('✅ 验证通过：所有用户都有邀请码了！');
    } else {
      console.log(`⚠️  还有 ${remaining.count} 个用户没有邀请码`);
    }

    // 显示所有用户的邀请码
    console.log('\n📋 当前所有用户邀请码：');
    const allUsers = db.prepare(
      'SELECT id, phone, nickname, inviteCode FROM users ORDER BY id'
    ).all() as { id: number; phone: string; nickname: string; inviteCode: string }[];

    allUsers.forEach(user => {
      console.log(`  ${user.id}. ${user.nickname || user.phone}: ${user.inviteCode || '(无)'}`);
    });

  } catch (error) {
    console.error('❌ 修复失败:', error);
    throw error;
  } finally {
    db.close();
  }
}

// 执行修复
fixInviteCodes().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
