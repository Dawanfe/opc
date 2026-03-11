/**
 * 邀请码功能自动化测试套件
 * 测试范围：邀请码生成、注册流程、邀请关系、统计查询
 */

import { generateInviteCode, generateUniqueInviteCode, validateInviteCodeFormat, checkInviteCodeExists } from '@/lib/utils/invite';
import { getDb } from '@/lib/db';

// 测试工具函数
function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`❌ ${message}\n   Expected: ${expected}\n   Got: ${actual}`);
  }
  console.log(`✅ ${message}`);
}

function assertNotNull(value: any, message: string) {
  if (value === null || value === undefined) {
    throw new Error(`❌ ${message}\n   Value is null or undefined`);
  }
  console.log(`✅ ${message}`);
}

function assertTrue(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ ${message}`);
  }
  console.log(`✅ ${message}`);
}

// 清理测试数据
function cleanupTestData() {
  const db = getDb();
  try {
    db.prepare("DELETE FROM invite_records WHERE inviteCode LIKE 'TEST%'").run();
    db.prepare("DELETE FROM users WHERE phone LIKE '199%'").run();
    console.log('🧹 测试数据已清理');
  } finally {
    db.close();
  }
}

// ==================== 测试套件 ====================

/**
 * 测试1: 邀请码生成功能
 */
async function test1_inviteCodeGeneration() {
  console.log('\n📋 测试1: 邀请码生成功能');

  // 1.1 生成邀请码
  const code = generateInviteCode();
  assertEqual(code.length, 8, '邀请码长度应为8位');
  assertTrue(/^[A-Za-z0-9]{8}$/.test(code), '邀请码应只包含字母和数字');

  // 1.2 验证不包含易混淆字符
  const confusingChars = ['0', 'O', 'o', 'I', 'l', '1'];
  const hasConfusing = confusingChars.some(char => code.includes(char));
  assertTrue(!hasConfusing, '邀请码不应包含易混淆字符 (0,O,o,I,l,1)');

  // 1.3 生成唯一邀请码
  const uniqueCode = generateUniqueInviteCode();
  assertNotNull(uniqueCode, '应成功生成唯一邀请码');
  assertEqual(uniqueCode.length, 8, '唯一邀请码长度应为8位');

  console.log(`   生成的邀请码: ${code}`);
  console.log(`   唯一邀请码: ${uniqueCode}`);
}

/**
 * 测试2: 邀请码格式验证
 */
async function test2_inviteCodeValidation() {
  console.log('\n📋 测试2: 邀请码格式验证');

  // 2.1 有效邀请码
  assertTrue(validateInviteCodeFormat('ABC12345'), '有效的8位字母数字组合应通过验证');
  assertTrue(validateInviteCodeFormat('XyZ98765'), '大小写混合应通过验证');

  // 2.2 无效邀请码
  assertTrue(!validateInviteCodeFormat('ABC123'), '少于8位应验证失败');
  assertTrue(!validateInviteCodeFormat('ABC123456'), '多于8位应验证失败');
  assertTrue(!validateInviteCodeFormat('ABC@1234'), '包含特殊字符应验证失败');
  assertTrue(!validateInviteCodeFormat(''), '空字符串应验证失败');
  assertTrue(!validateInviteCodeFormat('ABC 1234'), '包含空格应验证失败');
}

/**
 * 测试3: 用户注册流程（不带邀请码）
 */
async function test3_registerWithoutInviteCode() {
  console.log('\n📋 测试3: 用户注册流程（不带邀请码）');

  const testPhone = '19900000001';
  const testPassword = 'test123456';

  // 调用注册 API
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      password: testPassword,
      nickname: '测试用户1',
    }),
  });

  const data = await response.json();

  if (response.ok) {
    assertNotNull(data.user, '应返回用户信息');
    assertNotNull(data.user.inviteCode, '新用户应自动生成邀请码');
    assertEqual(data.user.phone, testPhone, '手机号应匹配');
    console.log(`   注册成功，邀请码: ${data.user.inviteCode}`);
  } else {
    // 如果是"已注册"错误，这是正常的（重复测试）
    if (data.error === '该手机号已注册') {
      console.log('   ⚠️  用户已存在（跳过注册测试）');
    } else {
      throw new Error(`注册失败: ${data.error}`);
    }
  }
}

/**
 * 测试4: 用户注册流程（带邀请码）
 */
async function test4_registerWithInviteCode() {
  console.log('\n📋 测试4: 用户注册流程（带邀请码）');

  // 先创建邀请人
  const inviterPhone = '19900000002';
  const inviterPassword = 'test123456';

  let inviteCode: string;

  // 注册邀请人
  const inviterResponse = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: inviterPhone,
      password: inviterPassword,
      nickname: '邀请人',
    }),
  });

  const inviterData = await inviterResponse.json();

  if (inviterResponse.ok) {
    inviteCode = inviterData.user.inviteCode;
    console.log(`   邀请人注册成功，邀请码: ${inviteCode}`);
  } else if (inviterData.error === '该手机号已注册') {
    // 已存在，查询邀请码
    const db = getDb();
    try {
      const user = db.prepare('SELECT inviteCode FROM users WHERE phone = ?').get(inviterPhone) as any;
      inviteCode = user.inviteCode;
      console.log(`   使用已存在邀请人的邀请码: ${inviteCode}`);
    } finally {
      db.close();
    }
  } else {
    throw new Error(`邀请人注册失败: ${inviterData.error}`);
  }

  // 注册被邀请人
  const inviteePhone = '19900000003';
  const inviteeResponse = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: inviteePhone,
      password: 'test123456',
      nickname: '被邀请人',
      inviteCode: inviteCode,
    }),
  });

  const inviteeData = await inviteeResponse.json();

  if (inviteeResponse.ok) {
    assertNotNull(inviteeData.user, '被邀请人应注册成功');
    console.log(`   被邀请人注册成功: ${inviteeData.user.nickname}`);

    // 验证邀请关系
    const db = getDb();
    try {
      const record = db.prepare(
        'SELECT * FROM invite_records WHERE inviteCode = ? AND inviteeId = ?'
      ).get(inviteCode, inviteeData.user.id) as any;

      assertNotNull(record, '应创建邀请记录');
      assertEqual(record.status, 'activated', '邀请状态应为已激活');
      console.log(`   邀请关系已建立 ✓`);
    } finally {
      db.close();
    }
  } else if (inviteeData.error === '该手机号已注册') {
    console.log('   ⚠️  被邀请人已存在（跳过测试）');
  } else {
    throw new Error(`被邀请人注册失败: ${inviteeData.error}`);
  }
}

/**
 * 测试5: 无效邀请码处理
 */
async function test5_invalidInviteCode() {
  console.log('\n📋 测试5: 无效邀请码处理');

  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '19900000099',
      password: 'test123456',
      inviteCode: 'INVALID1',
    }),
  });

  const data = await response.json();

  assertTrue(!response.ok, '使用无效邀请码应注册失败');
  assertTrue(
    data.error.includes('邀请码') || data.error.includes('无效'),
    '应返回邀请码相关错误信息'
  );
  console.log(`   正确拒绝无效邀请码: ${data.error}`);
}

/**
 * 测试6: 用户邀请信息查询
 */
async function test6_userInviteInfo() {
  console.log('\n📋 测试6: 用户邀请信息查询');

  // 先登录获取 token
  const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '19900000002', // 邀请人
      password: 'test123456',
    }),
  });

  if (!loginResponse.ok) {
    console.log('   ⚠️  登录失败，跳过测试');
    return;
  }

  const loginData = await loginResponse.json();
  const token = loginData.token;

  // 查询邀请信息
  const response = await fetch('http://localhost:3000/api/user/invite-info', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (response.ok) {
    assertNotNull(data.user, '应返回用户信息');
    assertNotNull(data.user.inviteCode, '应包含邀请码');
    assertNotNull(data.stats, '应返回统计数据');

    console.log(`   邀请码: ${data.user.inviteCode}`);
    console.log(`   总邀请数: ${data.stats.totalInvites}`);
    console.log(`   已激活: ${data.stats.activatedInvites}`);
  } else {
    throw new Error(`查询失败: ${data.error}`);
  }
}

/**
 * 测试7: 管理后台邀请统计
 */
async function test7_adminInviteStats() {
  console.log('\n📋 测试7: 管理后台邀请统计');

  const response = await fetch('http://localhost:3000/api/admin/invite-stats');
  const data = await response.json();

  if (response.ok) {
    assertNotNull(data.overallStats, '应返回全站统计');
    assertNotNull(data.topInviters, '应返回排行榜');
    assertNotNull(data.inviterList, '应返回邀请人列表');

    console.log(`   总邀请人数: ${data.overallStats.totalInviters}`);
    console.log(`   总被邀请人数: ${data.overallStats.totalInvitees}`);
    console.log(`   激活率: ${data.overallStats.conversionRate}%`);
    console.log(`   TOP1 邀请人: ${data.topInviters[0]?.nickname || '无'} (${data.topInviters[0]?.inviteCount || 0}人)`);
  } else {
    throw new Error(`查询失败: ${data.error}`);
  }
}

/**
 * 测试8: 数据库完整性检查
 */
async function test8_databaseIntegrity() {
  console.log('\n📋 测试8: 数据库完整性检查');

  const db = getDb();
  try {
    // 8.1 检查 users 表结构
    const userColumns = db.prepare("PRAGMA table_info(users)").all() as any[];
    const hasInviteCode = userColumns.some((col: any) => col.name === 'inviteCode');
    const hasInvitedBy = userColumns.some((col: any) => col.name === 'invitedBy');

    assertTrue(hasInviteCode, 'users 表应有 inviteCode 列');
    assertTrue(hasInvitedBy, 'users 表应有 invitedBy 列');

    // 8.2 检查 invite_records 表存在
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='invite_records'").all();
    assertEqual(tables.length, 1, 'invite_records 表应存在');

    // 8.3 检查索引
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='invite_records'").all() as any[];
    const indexNames = indexes.map((idx: any) => idx.name);

    assertTrue(
      indexNames.some((name: string) => name.includes('inviterId')),
      '应有 inviterId 索引'
    );

    // 8.4 检查邀请码唯一性
    const duplicates = db.prepare(`
      SELECT inviteCode, COUNT(*) as count
      FROM users
      WHERE inviteCode IS NOT NULL
      GROUP BY inviteCode
      HAVING count > 1
    `).all();

    assertEqual(duplicates.length, 0, '邀请码应保持唯一性（无重复）');

    // 8.5 检查孤立记录
    const orphanRecords = db.prepare(`
      SELECT COUNT(*) as count
      FROM invite_records ir
      WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = ir.inviterId)
         OR NOT EXISTS (SELECT 1 FROM users u WHERE u.id = ir.inviteeId)
    `).get() as any;

    assertEqual(orphanRecords.count, 0, '不应有孤立的邀请记录');

    console.log('   数据库结构完整性验证通过 ✓');
  } finally {
    db.close();
  }
}

// ==================== 主测试执行器 ====================

async function runAllTests() {
  console.log('🚀 开始执行邀请码功能自动化测试\n');
  console.log('=' .repeat(60));

  const tests = [
    { name: '邀请码生成功能', fn: test1_inviteCodeGeneration },
    { name: '邀请码格式验证', fn: test2_inviteCodeValidation },
    { name: '用户注册（不带邀请码）', fn: test3_registerWithoutInviteCode },
    { name: '用户注册（带邀请码）', fn: test4_registerWithInviteCode },
    { name: '无效邀请码处理', fn: test5_invalidInviteCode },
    { name: '用户邀请信息查询', fn: test6_userInviteInfo },
    { name: '管理后台邀请统计', fn: test7_adminInviteStats },
    { name: '数据库完整性检查', fn: test8_databaseIntegrity },
  ];

  let passed = 0;
  let failed = 0;
  const failedTests: string[] = [];

  for (const test of tests) {
    try {
      await test.fn();
      passed++;
    } catch (error) {
      failed++;
      failedTests.push(test.name);
      console.error(`\n❌ 测试失败: ${test.name}`);
      console.error(`   错误: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 输出测试结果
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(60));
  console.log(`总测试数: ${tests.length}`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);

  if (failed > 0) {
    console.log('\n失败的测试:');
    failedTests.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });
  }

  console.log('\n' + '='.repeat(60));

  // 清理测试数据
  // cleanupTestData();

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
