/**
 * 测试数据生成脚本
 * 用于快速生成邀请关系测试数据
 */

import { getDb } from '../src/lib/db';
import { generateUniqueInviteCode } from '../src/lib/utils/invite';
import bcrypt from 'bcryptjs';

interface GenerateOptions {
  userCount?: number;      // 生成用户数量
  inviteRate?: number;     // 邀请关系比例 (0-1)
  phonePrefix?: string;    // 手机号前缀
}

/**
 * 生成测试用户
 */
async function generateTestUsers(options: GenerateOptions = {}) {
  const {
    userCount = 50,
    inviteRate = 0.7,
    phonePrefix = '199',
  } = options;

  console.log('📦 开始生成测试数据...\n');
  console.log(`配置:`);
  console.log(`  - 用户数量: ${userCount}`);
  console.log(`  - 邀请比例: ${(inviteRate * 100).toFixed(0)}%`);
  console.log(`  - 手机号前缀: ${phonePrefix}`);
  console.log('');

  const db = getDb();
  const hashedPassword = await bcrypt.hash('test123456', 10);

  try {
    const userIds: number[] = [];

    // 第一步：创建用户
    console.log('1️⃣ 创建用户...');
    for (let i = 0; i < userCount; i++) {
      const phone = `${phonePrefix}${String(10000 + i).slice(-5)}`;
      const inviteCode = generateUniqueInviteCode();
      const nickname = `测试用户${i + 1}`;

      // 检查是否已存在
      const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone) as any;

      if (existing) {
        userIds.push(existing.id);
        process.stdout.write(`\r   用户 ${i + 1}/${userCount} (已存在)`);
      } else {
        const result = db.prepare(`
          INSERT INTO users (phone, password, nickname, membershipType, inviteCode)
          VALUES (?, ?, ?, 'free', ?)
        `).run(phone, hashedPassword, nickname, inviteCode);

        userIds.push(result.lastInsertRowid as number);
        process.stdout.write(`\r   用户 ${i + 1}/${userCount} 已创建`);
      }
    }
    console.log('\n   ✅ 用户创建完成\n');

    // 第二步：创建邀请关系
    console.log('2️⃣ 创建邀请关系...');
    let inviteCount = 0;

    for (let i = 1; i < userIds.length; i++) {
      // 根据 inviteRate 决定是否创建邀请关系
      if (Math.random() > inviteRate) continue;

      // 随机选择一个之前的用户作为邀请人
      const inviterIndex = Math.floor(Math.random() * i);
      const inviterId = userIds[inviterIndex];
      const inviteeId = userIds[i];

      // 获取邀请人的邀请码
      const inviter = db.prepare('SELECT inviteCode FROM users WHERE id = ?').get(inviterId) as any;

      if (inviter && inviter.inviteCode) {
        // 更新被邀请人的 invitedBy
        db.prepare('UPDATE users SET invitedBy = ? WHERE id = ?').run(inviterId, inviteeId);

        // 创建邀请记录
        db.prepare(`
          INSERT INTO invite_records (inviterId, inviteeId, inviteCode, status, activatedAt)
          VALUES (?, ?, ?, 'activated', CURRENT_TIMESTAMP)
        `).run(inviterId, inviteeId, inviter.inviteCode);

        inviteCount++;
        process.stdout.write(`\r   邀请关系 ${inviteCount} 已创建`);
      }
    }

    console.log('\n   ✅ 邀请关系创建完成\n');

    // 统计信息
    console.log('📊 生成结果:');
    const stats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE phone LIKE '${phonePrefix}%') as totalUsers,
        (SELECT COUNT(DISTINCT inviterId) FROM invite_records) as totalInviters,
        (SELECT COUNT(DISTINCT inviteeId) FROM invite_records) as totalInvitees,
        (SELECT COUNT(*) FROM invite_records) as totalRecords
    `).get() as any;

    console.log(`  总用户数: ${stats.totalUsers}`);
    console.log(`  邀请人数: ${stats.totalInviters}`);
    console.log(`  被邀请人数: ${stats.totalInvitees}`);
    console.log(`  邀请记录数: ${stats.totalRecords}`);
    console.log('');

    // TOP 邀请人
    const topInviters = db.prepare(`
      SELECT u.nickname, u.inviteCode, COUNT(ir.id) as inviteCount
      FROM users u
      INNER JOIN invite_records ir ON u.id = ir.inviterId
      GROUP BY u.id
      ORDER BY inviteCount DESC
      LIMIT 5
    `).all() as any[];

    if (topInviters.length > 0) {
      console.log('🏆 TOP 5 邀请人:');
      topInviters.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.nickname} (${user.inviteCode}) - ${user.inviteCount}人`);
      });
    }

    console.log('\n✅ 测试数据生成完成！');
    console.log('\n💡 提示:');
    console.log(`  - 登录账号: ${phonePrefix}10000`);
    console.log(`  - 登录密码: test123456`);
    console.log(`  - 查看统计: http://localhost:3000/admin/invite-stats`);

  } catch (error) {
    console.error('\n❌ 生成失败:', error);
    throw error;
  } finally {
    db.close();
  }
}

/**
 * 清理测试数据
 */
function cleanTestData(phonePrefix: string = '199') {
  console.log(`🧹 清理测试数据 (手机号前缀: ${phonePrefix})...`);

  const db = getDb();

  try {
    // 删除邀请记录
    const inviteResult = db.prepare(`
      DELETE FROM invite_records
      WHERE inviterId IN (SELECT id FROM users WHERE phone LIKE '${phonePrefix}%')
         OR inviteeId IN (SELECT id FROM users WHERE phone LIKE '${phonePrefix}%')
    `).run();

    // 删除用户
    const userResult = db.prepare(`
      DELETE FROM users WHERE phone LIKE '${phonePrefix}%'
    `).run();

    // 删除增量日志
    db.prepare(`
      DELETE FROM member_count_log
      WHERE userId NOT IN (SELECT id FROM users)
    `).run();

    console.log(`✅ 清理完成`);
    console.log(`  - 删除邀请记录: ${inviteResult.changes}`);
    console.log(`  - 删除用户: ${userResult.changes}`);
  } finally {
    db.close();
  }
}

// 命令行参数解析
const args = process.argv.slice(2);
const command = args[0];

if (command === 'clean') {
  const phonePrefix = args[1] || '199';
  cleanTestData(phonePrefix);
} else if (command === 'generate' || !command) {
  const userCount = parseInt(args.find(arg => arg.startsWith('--count='))?.split('=')[1] || '50');
  const inviteRate = parseFloat(args.find(arg => arg.startsWith('--rate='))?.split('=')[1] || '0.7');
  const phonePrefix = args.find(arg => arg.startsWith('--prefix='))?.split('=')[1] || '199';

  generateTestUsers({ userCount, inviteRate, phonePrefix }).catch(error => {
    console.error('生成失败:', error);
    process.exit(1);
  });
} else {
  console.log('使用方法:');
  console.log('  生成数据: npm run test:seed [选项]');
  console.log('  清理数据: npm run test:seed clean [前缀]');
  console.log('');
  console.log('选项:');
  console.log('  --count=N    生成用户数量 (默认: 50)');
  console.log('  --rate=N     邀请关系比例 0-1 (默认: 0.7)');
  console.log('  --prefix=XXX 手机号前缀 (默认: 199)');
  console.log('');
  console.log('示例:');
  console.log('  npm run test:seed -- --count=100 --rate=0.8');
  console.log('  npm run test:seed clean 199');
}
