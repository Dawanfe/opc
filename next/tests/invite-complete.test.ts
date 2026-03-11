/**
 * 邀请码功能完整测试套件
 * 覆盖所有功能点，适合每次开发完成后运行
 */

import { generateInviteCode, generateUniqueInviteCode, validateInviteCodeFormat, checkInviteCodeExists } from '@/lib/utils/invite';
import { getDb } from '@/lib/db';

// 测试工具函数
function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`❌ ${message}\n   Expected: ${expected}\n   Got: ${actual}`);
  }
  console.log(`  ✅ ${message}`);
}

function assertNotNull(value: any, message: string) {
  if (value === null || value === undefined) {
    throw new Error(`❌ ${message}\n   Value is null or undefined`);
  }
  console.log(`  ✅ ${message}`);
}

function assertTrue(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ ${message}`);
  }
  console.log(`  ✅ ${message}`);
}

function assertFalse(condition: boolean, message: string) {
  if (condition) {
    throw new Error(`❌ ${message}: 期望为 false，但结果为 true`);
  }
  console.log(`  ✅ ${message}`);
}

// 测试上下文
let testContext: {
  inviterPhone?: string;
  inviterInviteCode?: string;
  inviterToken?: string;
  inviteePhone?: string;
  inviteeToken?: string;
} = {};

// ==================== 模块1: 邀请码生成与验证 ====================

async function module1_inviteCodeGeneration() {
  console.log('\n📦 模块1: 邀请码生成与验证');
  console.log('─'.repeat(60));

  // 1.1 基本生成功能
  console.log('\n[1.1] 基本生成功能');
  const code = generateInviteCode();
  assertEqual(code.length, 8, '邀请码长度为8位');
  assertTrue(/^[A-Za-z0-9]{8}$/.test(code), '邀请码只包含字母和数字');

  // 1.2 排除易混淆字符
  console.log('\n[1.2] 排除易混淆字符');
  const confusingChars = ['0', 'O', 'o', 'I', 'l', '1'];
  let hasConfusing = false;
  for (let i = 0; i < 50; i++) {
    const testCode = generateInviteCode();
    if (confusingChars.some(char => testCode.includes(char))) {
      hasConfusing = true;
      break;
    }
  }
  assertFalse(hasConfusing, '50次生成均不包含易混淆字符');

  // 1.3 唯一性生成
  console.log('\n[1.3] 唯一性生成');
  const uniqueCode = generateUniqueInviteCode();
  assertNotNull(uniqueCode, '成功生成唯一邀请码');
  assertEqual(uniqueCode.length, 8, '唯一邀请码长度为8位');

  // 1.4 格式验证 - 有效格式
  console.log('\n[1.4] 格式验证 - 有效格式');
  assertTrue(validateInviteCodeFormat('ABC12345'), '接受标准8位字母数字');
  assertTrue(validateInviteCodeFormat('XyZ98765'), '接受大小写混合');
  assertTrue(validateInviteCodeFormat('aBcDeF23'), '接受任意大小写组合');

  // 1.5 格式验证 - 无效格式
  console.log('\n[1.5] 格式验证 - 无效格式');
  assertFalse(validateInviteCodeFormat('ABC123'), '拒绝长度不足');
  assertFalse(validateInviteCodeFormat('ABC123456'), '拒绝长度超出');
  assertFalse(validateInviteCodeFormat('ABC@1234'), '拒绝特殊字符');
  assertFalse(validateInviteCodeFormat('ABC 1234'), '拒绝空格');
  assertFalse(validateInviteCodeFormat(''), '拒绝空字符串');

  // 1.6 随机性测试
  console.log('\n[1.6] 随机性测试');
  const codes = new Set();
  for (let i = 0; i < 100; i++) {
    codes.add(generateInviteCode());
  }
  assertTrue(codes.size >= 90, `100次生成至少90个不同 (实际: ${codes.size})`);
}

// ==================== 模块2: 用户注册功能 ====================

async function module2_userRegistration() {
  console.log('\n📦 模块2: 用户注册功能');
  console.log('─'.repeat(60));

  // 2.1 普通注册（不带邀请码）
  console.log('\n[2.1] 普通注册（不带邀请码）');
  const phone1 = `19901${Date.now().toString().slice(-6)}`;
  testContext.inviterPhone = phone1;

  const response1 = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: phone1,
      password: 'test123456',
      nickname: '测试邀请人',
    }),
  });

  const data1 = await response1.json();

  if (response1.ok) {
    assertNotNull(data1.user, '返回用户信息');
    assertNotNull(data1.user.inviteCode, '自动生成邀请码');
    assertEqual(data1.user.phone, phone1, '手机号正确');
    testContext.inviterInviteCode = data1.user.inviteCode;
    console.log(`  📝 邀请人邀请码: ${testContext.inviterInviteCode}`);
  } else if (data1.error === '该手机号已注册') {
    // 查询已存在用户的邀请码
    const db = getDb();
    try {
      const user = db.prepare('SELECT inviteCode FROM users WHERE phone = ?').get(phone1) as any;
      testContext.inviterInviteCode = user.inviteCode;
      console.log(`  ⚠️  用户已存在，使用现有邀请码: ${testContext.inviterInviteCode}`);
    } finally {
      db.close();
    }
  } else {
    throw new Error(`注册失败: ${data1.error}`);
  }

  // 2.2 带邀请码注册
  console.log('\n[2.2] 带邀请码注册');
  const phone2 = `19902${Date.now().toString().slice(-6)}`;
  testContext.inviteePhone = phone2;

  const response2 = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: phone2,
      password: 'test123456',
      nickname: '测试被邀请人',
      inviteCode: testContext.inviterInviteCode,
    }),
  });

  const data2 = await response2.json();

  if (response2.ok) {
    assertNotNull(data2.user, '被邀请人注册成功');
    console.log(`  📝 被邀请人邀请码: ${data2.user.inviteCode}`);

    // 验证邀请关系
    const db = getDb();
    try {
      const record = db.prepare(
        'SELECT * FROM invite_records WHERE inviteCode = ? AND inviteeId = ?'
      ).get(testContext.inviterInviteCode, data2.user.id) as any;
      assertNotNull(record, '创建邀请记录');
      assertEqual(record.status, 'activated', '邀请状态为已激活');
    } finally {
      db.close();
    }
  } else if (data2.error === '该手机号已注册') {
    console.log(`  ⚠️  被邀请人已存在`);
  } else {
    throw new Error(`带邀请码注册失败: ${data2.error}`);
  }

  // 2.3 无效邀请码拒绝
  console.log('\n[2.3] 无效邀请码拒绝');
  const response3 = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: `19903${Date.now().toString().slice(-6)}`,
      password: 'test123456',
      inviteCode: 'INVALID1',
    }),
  });

  assertFalse(response3.ok, '拒绝无效邀请码');
  const data3 = await response3.json();
  assertTrue(data3.error.includes('邀请码'), '返回邀请码错误信息');

  // 2.4 重复手机号拒绝
  console.log('\n[2.4] 重复手机号拒绝');
  const response4 = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: phone1,
      password: 'test123456',
    }),
  });

  assertFalse(response4.ok, '拒绝重复手机号');
  const data4 = await response4.json();
  assertTrue(data4.error.includes('已注册'), '返回已注册错误信息');

  // 2.5 参数验证
  console.log('\n[2.5] 参数验证');

  // 缺少必填参数
  const response5 = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '13800138000' }),
  });
  assertFalse(response5.ok, '拒绝缺少密码');

  // 手机号格式错误
  const response6 = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '123', password: 'test123' }),
  });
  assertFalse(response6.ok, '拒绝错误手机号格式');

  // 密码长度不足
  const response7 = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '13800138001', password: '123' }),
  });
  assertFalse(response7.ok, '拒绝密码过短');
}

// ==================== 模块3: 用户登录功能 ====================

async function module3_userLogin() {
  console.log('\n📦 模块3: 用户登录功能');
  console.log('─'.repeat(60));

  // 3.1 正常登录
  console.log('\n[3.1] 正常登录');
  const response1 = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testContext.inviterPhone,
      password: 'test123456',
    }),
  });

  const data1 = await response1.json();

  if (response1.ok) {
    assertNotNull(data1.token, '返回token');
    assertNotNull(data1.user, '返回用户信息');
    testContext.inviterToken = data1.token;
    console.log(`  📝 获取到token`);
  } else {
    throw new Error(`登录失败: ${data1.error}`);
  }

  // 3.2 错误密码拒绝
  console.log('\n[3.2] 错误密码拒绝');
  const response2 = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testContext.inviterPhone,
      password: 'wrongpassword',
    }),
  });

  assertFalse(response2.ok, '拒绝错误密码');

  // 3.3 不存在的账号
  console.log('\n[3.3] 不存在的账号');
  const response3 = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '19999999999',
      password: 'test123456',
    }),
  });

  assertFalse(response3.ok, '拒绝不存在的账号');
}

// ==================== 模块4: 用户邀请信息查询 ====================

async function module4_userInviteInfo() {
  console.log('\n📦 模块4: 用户邀请信息查询');
  console.log('─'.repeat(60));

  if (!testContext.inviterToken) {
    console.log('  ⚠️  跳过：需要先登录');
    return;
  }

  // 4.1 查询邀请信息
  console.log('\n[4.1] 查询邀请信息');
  const response = await fetch('http://localhost:3000/api/user/invite-info', {
    headers: {
      'Authorization': `Bearer ${testContext.inviterToken}`,
    },
  });

  const data = await response.json();

  if (response.ok) {
    assertNotNull(data.user, '返回用户信息');
    assertNotNull(data.user.inviteCode, '包含邀请码');
    assertNotNull(data.stats, '返回统计数据');
    assertNotNull(data.inviteList, '返回邀请列表');

    console.log(`  📊 总邀请数: ${data.stats.totalInvites}`);
    console.log(`  📊 已激活: ${data.stats.activatedInvites}`);
    console.log(`  📊 邀请记录: ${data.inviteList.length} 条`);

    assertTrue(data.stats.totalInvites >= 0, '邀请数非负');
    assertTrue(data.stats.activatedInvites >= 0, '激活数非负');
    assertTrue(Array.isArray(data.inviteList), '邀请列表是数组');
  } else {
    throw new Error(`查询失败: ${data.error}`);
  }

  // 4.2 未登录拒绝
  console.log('\n[4.2] 未登录拒绝');
  const response2 = await fetch('http://localhost:3000/api/user/invite-info');
  assertFalse(response2.ok, '拒绝未登录请求');
  assertEqual(response2.status, 401, '返回401状态码');
}

// ==================== 模块5: 管理后台统计 ====================

async function module5_adminStats() {
  console.log('\n📦 模块5: 管理后台统计');
  console.log('─'.repeat(60));

  // 5.1 全站统计查询
  console.log('\n[5.1] 全站统计查询');
  const response1 = await fetch('http://localhost:3000/api/admin/invite-stats');
  const data1 = await response1.json();

  if (response1.ok) {
    assertNotNull(data1.overallStats, '返回全站统计');
    assertNotNull(data1.dailyStats, '返回每日统计');
    assertNotNull(data1.topInviters, '返回排行榜');
    assertNotNull(data1.inviterList, '返回邀请人列表');
    assertNotNull(data1.pagination, '返回分页信息');

    console.log(`  📊 总邀请人数: ${data1.overallStats.totalInviters}`);
    console.log(`  📊 总被邀请人数: ${data1.overallStats.totalInvitees}`);
    console.log(`  📊 激活率: ${data1.overallStats.conversionRate}%`);
    console.log(`  📊 TOP榜单: ${data1.topInviters.length} 人`);

    assertTrue(data1.overallStats.totalInviters >= 0, '邀请人数非负');
    assertTrue(data1.overallStats.totalInvitees >= 0, '被邀请人数非负');
    assertTrue(Array.isArray(data1.dailyStats), '每日统计是数组');
    assertTrue(Array.isArray(data1.topInviters), '排行榜是数组');
    assertTrue(Array.isArray(data1.inviterList), '邀请人列表是数组');
  } else {
    throw new Error(`查询失败: ${data1.error}`);
  }

  // 5.2 分页查询
  console.log('\n[5.2] 分页查询');
  const response2 = await fetch('http://localhost:3000/api/admin/invite-stats?page=1&pageSize=10');
  const data2 = await response2.json();

  if (response2.ok) {
    assertEqual(data2.pagination.page, 1, '返回第1页');
    assertEqual(data2.pagination.pageSize, 10, '每页10条');
    assertTrue(data2.pagination.total >= 0, '总数非负');
  }

  // 5.3 排序查询
  console.log('\n[5.3] 排序查询');
  const response3 = await fetch('http://localhost:3000/api/admin/invite-stats?sortBy=createdAt');
  const data3 = await response3.json();
  assertTrue(response3.ok, '按注册时间排序');

  const response4 = await fetch('http://localhost:3000/api/admin/invite-stats?sortBy=inviteCount');
  const data4 = await response4.json();
  assertTrue(response4.ok, '按邀请人数排序');

  // 5.4 日期筛选
  console.log('\n[5.4] 日期筛选');
  const today = new Date().toISOString().split('T')[0];
  const response5 = await fetch(`http://localhost:3000/api/admin/invite-stats?startDate=${today}`);
  const data5 = await response5.json();
  assertTrue(response5.ok, '按开始日期筛选');
}

// ==================== 模块6: 数据库完整性 ====================

async function module6_databaseIntegrity() {
  console.log('\n📦 模块6: 数据库完整性');
  console.log('─'.repeat(60));

  const db = getDb();
  try {
    // 6.1 表结构检查
    console.log('\n[6.1] 表结构检查');

    // users 表
    const userColumns = db.prepare("PRAGMA table_info(users)").all() as any[];
    const hasInviteCode = userColumns.some((col: any) => col.name === 'inviteCode');
    const hasInvitedBy = userColumns.some((col: any) => col.name === 'invitedBy');
    assertTrue(hasInviteCode, 'users表有inviteCode列');
    assertTrue(hasInvitedBy, 'users表有invitedBy列');

    // invite_records 表
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='invite_records'"
    ).all();
    assertEqual(tables.length, 1, 'invite_records表存在');

    // 6.2 索引检查
    console.log('\n[6.2] 索引检查');
    const indexes = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='invite_records'"
    ).all() as any[];
    assertTrue(indexes.length >= 3, `至少3个索引 (实际: ${indexes.length})`);

    // 6.3 数据完整性
    console.log('\n[6.3] 数据完整性');

    // 邀请码唯一性
    const duplicates = db.prepare(`
      SELECT inviteCode, COUNT(*) as count
      FROM users
      WHERE inviteCode IS NOT NULL
      GROUP BY inviteCode
      HAVING count > 1
    `).all();
    assertEqual(duplicates.length, 0, '邀请码无重复');

    // 孤立记录检查
    const orphanRecords = db.prepare(`
      SELECT COUNT(*) as count
      FROM invite_records ir
      WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = ir.inviterId)
         OR NOT EXISTS (SELECT 1 FROM users u WHERE u.id = ir.inviteeId)
    `).get() as any;
    assertEqual(orphanRecords.count, 0, '无孤立邀请记录');

    // 邀请关系一致性
    const inconsistent = db.prepare(`
      SELECT COUNT(*) as count
      FROM users u
      WHERE u.invitedBy IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM invite_records ir
          WHERE ir.inviteeId = u.id AND ir.inviterId = u.invitedBy
        )
    `).get() as any;
    assertEqual(inconsistent.count, 0, '邀请关系一致');

    // 6.4 数据统计
    console.log('\n[6.4] 数据统计');
    const stats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM users) as totalUsers,
        (SELECT COUNT(*) FROM users WHERE inviteCode IS NOT NULL) as usersWithCode,
        (SELECT COUNT(*) FROM invite_records) as totalRecords,
        (SELECT COUNT(DISTINCT inviterId) FROM invite_records) as totalInviters
    `).get() as any;

    console.log(`  📊 总用户数: ${stats.totalUsers}`);
    console.log(`  📊 有邀请码用户: ${stats.usersWithCode}`);
    console.log(`  📊 邀请记录数: ${stats.totalRecords}`);
    console.log(`  📊 邀请人数: ${stats.totalInviters}`);

    assertTrue(stats.usersWithCode <= stats.totalUsers, '有邀请码用户数不超过总用户数');
    assertTrue(stats.totalInviters <= stats.totalUsers, '邀请人数不超过总用户数');
  } finally {
    db.close();
  }
}

// ==================== 模块7: 边界条件测试 ====================

async function module7_edgeCases() {
  console.log('\n📦 模块7: 边界条件测试');
  console.log('─'.repeat(60));

  // 7.1 邀请码查询
  console.log('\n[7.1] 邀请码查询');

  // 存在的邀请码
  if (testContext.inviterInviteCode) {
    const result1 = checkInviteCodeExists(testContext.inviterInviteCode);
    assertNotNull(result1, '查询到存在的邀请码');
  }

  // 不存在的邀请码
  const result2 = checkInviteCodeExists('NOTEXIST');
  assertEqual(result2, null, '不存在的邀请码返回null');

  // 无效格式
  const result3 = checkInviteCodeExists('ABC');
  assertEqual(result3, null, '无效格式返回null');

  // 7.2 并发唯一性
  console.log('\n[7.2] 并发唯一性测试');
  const codes = await Promise.all(
    Array(10).fill(0).map(() => Promise.resolve(generateUniqueInviteCode()))
  );
  const uniqueCodes = new Set(codes);
  assertEqual(uniqueCodes.size, 10, '并发生成10个不同邀请码');

  // 7.3 大小写处理
  console.log('\n[7.3] 大小写处理');
  assertTrue(validateInviteCodeFormat('ABCDEFGH'), '全大写有效');
  assertTrue(validateInviteCodeFormat('abcdefgh'), '全小写有效');
  assertTrue(validateInviteCodeFormat('AbCdEfGh'), '混合大小写有效');

  // 7.4 特殊字符拒绝
  console.log('\n[7.4] 特殊字符拒绝');
  const specialChars = ['@', '#', '$', '%', '^', '&', '*', '-', '_', '+', '=', '!'];
  specialChars.forEach(char => {
    assertFalse(
      validateInviteCodeFormat(`ABC${char}1234`),
      `拒绝特殊字符 ${char}`
    );
  });
}

// ==================== 模块8: 性能基准测试 ====================

async function module8_performance() {
  console.log('\n📦 模块8: 性能基准测试');
  console.log('─'.repeat(60));

  // 8.1 邀请码生成性能
  console.log('\n[8.1] 邀请码生成性能');
  const start1 = Date.now();
  for (let i = 0; i < 1000; i++) {
    generateInviteCode();
  }
  const time1 = Date.now() - start1;
  console.log(`  ⏱️  生成1000个邀请码: ${time1}ms (${(time1 / 1000).toFixed(2)}ms/个)`);
  assertTrue(time1 < 500, '1000个邀请码生成在500ms内完成');

  // 8.2 数据库查询性能
  console.log('\n[8.2] 数据库查询性能');
  const db = getDb();
  try {
    const start2 = Date.now();
    for (let i = 0; i < 100; i++) {
      db.prepare('SELECT id FROM users WHERE inviteCode = ?').get('TEST1234');
    }
    const time2 = Date.now() - start2;
    console.log(`  ⏱️  100次查询: ${time2}ms (${(time2 / 100).toFixed(2)}ms/次)`);
    assertTrue(time2 < 1000, '100次查询在1秒内完成');
  } finally {
    db.close();
  }

  // 8.3 API 响应时间
  console.log('\n[8.3] API响应时间');
  const start3 = Date.now();
  await fetch('http://localhost:3000/api/admin/invite-stats');
  const time3 = Date.now() - start3;
  console.log(`  ⏱️  统计API响应: ${time3}ms`);
  assertTrue(time3 < 2000, '统计API在2秒内响应');
}

// ==================== 主测试执行器 ====================

async function runAllTests() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║         邀请码功能完整测试套件 v1.0                      ║');
  console.log('║         覆盖所有功能点 - 适合每次开发后运行              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');

  const modules = [
    { name: '邀请码生成与验证', fn: module1_inviteCodeGeneration },
    { name: '用户注册功能', fn: module2_userRegistration },
    { name: '用户登录功能', fn: module3_userLogin },
    { name: '用户邀请信息查询', fn: module4_userInviteInfo },
    { name: '管理后台统计', fn: module5_adminStats },
    { name: '数据库完整性', fn: module6_databaseIntegrity },
    { name: '边界条件测试', fn: module7_edgeCases },
    { name: '性能基准测试', fn: module8_performance },
  ];

  let passed = 0;
  let failed = 0;
  const failedModules: string[] = [];
  const startTime = Date.now();

  for (const module of modules) {
    try {
      await module.fn();
      passed++;
      console.log(`\n✅ ${module.name} - 通过`);
    } catch (error) {
      failed++;
      failedModules.push(module.name);
      console.error(`\n❌ ${module.name} - 失败`);
      console.error(`   错误: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const totalTime = Date.now() - startTime;

  // 输出测试结果
  console.log('\n' + '═'.repeat(60));
  console.log('📊 测试结果汇总');
  console.log('═'.repeat(60));
  console.log(`总模块数: ${modules.length}`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`⏱️  总耗时: ${(totalTime / 1000).toFixed(2)}秒`);
  console.log(`📈 通过率: ${((passed / modules.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n失败的模块:');
    failedModules.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });
  }

  console.log('\n' + '═'.repeat(60));

  if (failed === 0) {
    console.log('🎉 所有测试通过！功能正常！');
  } else {
    console.log('⚠️  部分测试失败，请检查上述错误信息');
  }

  console.log('═'.repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

// 执行测试
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error('测试执行出错:', error);
    process.exit(1);
  });
}

export { runAllTests };
