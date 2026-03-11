/**
 * 邀请码功能性能测试和压力测试
 */

import { generateInviteCode, generateUniqueInviteCode } from '@/lib/utils/invite';
import { getDb } from '@/lib/db';

// 性能计时器
class PerformanceTimer {
  private startTime: number = 0;

  start() {
    this.startTime = Date.now();
  }

  stop(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * 测试1: 邀请码生成性能
 */
async function testInviteCodeGenerationPerformance() {
  console.log('\n📊 测试1: 邀请码生成性能');

  const timer = new PerformanceTimer();
  const iterations = 10000;

  // 测试简单邀请码生成
  timer.start();
  for (let i = 0; i < iterations; i++) {
    generateInviteCode();
  }
  const simpleTime = timer.stop();

  console.log(`   生成 ${iterations} 个邀请码耗时: ${simpleTime}ms`);
  console.log(`   平均每个: ${(simpleTime / iterations).toFixed(3)}ms`);
  console.log(`   预计吞吐量: ${Math.floor(iterations / (simpleTime / 1000))} 个/秒`);

  // 基准检查
  if (simpleTime > 1000) {
    console.log('   ⚠️  性能警告: 生成速度较慢');
  } else {
    console.log('   ✅ 性能良好');
  }
}

/**
 * 测试2: 唯一邀请码生成性能（数据库查询）
 */
async function testUniqueInviteCodePerformance() {
  console.log('\n📊 测试2: 唯一邀请码生成性能');

  const timer = new PerformanceTimer();
  const iterations = 100;

  timer.start();
  for (let i = 0; i < iterations; i++) {
    generateUniqueInviteCode();
  }
  const uniqueTime = timer.stop();

  console.log(`   生成 ${iterations} 个唯一邀请码耗时: ${uniqueTime}ms`);
  console.log(`   平均每个: ${(uniqueTime / iterations).toFixed(3)}ms`);
  console.log(`   预计吞吐量: ${Math.floor(iterations / (uniqueTime / 1000))} 个/秒`);

  // 基准检查
  if (uniqueTime / iterations > 100) {
    console.log('   ⚠️  性能警告: 生成速度较慢（可能数据库较大）');
  } else {
    console.log('   ✅ 性能良好');
  }
}

/**
 * 测试3: 数据库查询性能
 */
async function testDatabaseQueryPerformance() {
  console.log('\n📊 测试3: 数据库查询性能');

  const db = getDb();
  const timer = new PerformanceTimer();

  try {
    // 获取用户总数
    const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
    console.log(`   数据库中用户数: ${userCount}`);

    // 测试邀请码查询
    const iterations = 1000;
    timer.start();
    for (let i = 0; i < iterations; i++) {
      db.prepare('SELECT id FROM users WHERE inviteCode = ?').get('TEST1234');
    }
    const queryTime = timer.stop();

    console.log(`   执行 ${iterations} 次邀请码查询耗时: ${queryTime}ms`);
    console.log(`   平均每次: ${(queryTime / iterations).toFixed(3)}ms`);
    console.log(`   预计吞吐量: ${Math.floor(iterations / (queryTime / 1000))} 次/秒`);

    // 测试邀请记录查询
    timer.start();
    for (let i = 0; i < 100; i++) {
      db.prepare(`
        SELECT COUNT(*) as count
        FROM invite_records
        WHERE inviterId = ?
      `).get(1);
    }
    const inviteQueryTime = timer.stop();

    console.log(`   执行 100 次邀请记录查询耗时: ${inviteQueryTime}ms`);
    console.log(`   平均每次: ${(inviteQueryTime / 100).toFixed(3)}ms`);

    // 基准检查
    if (queryTime / iterations > 5) {
      console.log('   ⚠️  性能警告: 查询速度较慢，建议检查索引');
    } else {
      console.log('   ✅ 查询性能良好');
    }
  } finally {
    db.close();
  }
}

/**
 * 测试4: 并发注册压力测试
 */
async function testConcurrentRegistration() {
  console.log('\n📊 测试4: 并发注册压力测试');

  const concurrentCount = 50;
  const basePhone = '19900';

  console.log(`   模拟 ${concurrentCount} 个并发注册请求...`);

  const timer = new PerformanceTimer();
  timer.start();

  const promises = [];
  for (let i = 0; i < concurrentCount; i++) {
    const phone = `${basePhone}${String(i + 10000).slice(-5)}`;
    const promise = fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        password: 'test123456',
        nickname: `压测用户${i}`,
      }),
    }).then(res => ({
      status: res.status,
      ok: res.ok,
    })).catch(error => ({
      status: 0,
      ok: false,
      error: error.message,
    }));

    promises.push(promise);
  }

  const results = await Promise.all(promises);
  const totalTime = timer.stop();

  const successCount = results.filter(r => r.ok || r.status === 409).length; // 409 表示已存在
  const failCount = results.filter(r => !r.ok && r.status !== 409).length;

  console.log(`   总耗时: ${totalTime}ms`);
  console.log(`   平均响应时间: ${(totalTime / concurrentCount).toFixed(2)}ms`);
  console.log(`   成功/已存在: ${successCount} 个`);
  console.log(`   失败: ${failCount} 个`);

  if (failCount > concurrentCount * 0.1) {
    console.log('   ⚠️  警告: 失败率超过 10%');
  } else {
    console.log('   ✅ 并发处理良好');
  }
}

/**
 * 测试5: 邀请码唯一性压力测试
 */
async function testInviteCodeUniqueness() {
  console.log('\n📊 测试5: 邀请码唯一性压力测试');

  const iterations = 10000;
  const codes = new Set<string>();

  console.log(`   生成 ${iterations} 个邀请码检查唯一性...`);

  const timer = new PerformanceTimer();
  timer.start();

  for (let i = 0; i < iterations; i++) {
    const code = generateInviteCode();
    codes.add(code);
  }

  const totalTime = timer.stop();
  const uniqueCount = codes.size;
  const duplicateRate = ((1 - uniqueCount / iterations) * 100).toFixed(4);

  console.log(`   总耗时: ${totalTime}ms`);
  console.log(`   生成数量: ${iterations}`);
  console.log(`   唯一数量: ${uniqueCount}`);
  console.log(`   重复率: ${duplicateRate}%`);

  if (parseFloat(duplicateRate) > 0.1) {
    console.log('   ⚠️  警告: 重复率较高');
  } else {
    console.log('   ✅ 唯一性良好');
  }
}

/**
 * 测试6: 统计查询性能
 */
async function testStatsQueryPerformance() {
  console.log('\n📊 测试6: 统计查询性能');

  const timer = new PerformanceTimer();

  // 测试管理后台统计查询
  timer.start();
  const response = await fetch('http://localhost:3000/api/admin/invite-stats');
  const statsTime = timer.stop();

  if (response.ok) {
    const data = await response.json();
    console.log(`   统计查询耗时: ${statsTime}ms`);
    console.log(`   返回数据量: ${JSON.stringify(data).length} 字节`);

    if (statsTime > 1000) {
      console.log('   ⚠️  性能警告: 查询较慢，考虑添加缓存');
    } else {
      console.log('   ✅ 查询性能良好');
    }
  } else {
    console.log('   ❌ 统计查询失败');
  }
}

/**
 * 主测试执行器
 */
async function runPerformanceTests() {
  console.log('🚀 开始执行性能测试\n');
  console.log('=' .repeat(60));

  try {
    await testInviteCodeGenerationPerformance();
    await testUniqueInviteCodePerformance();
    await testDatabaseQueryPerformance();
    await testInviteCodeUniqueness();

    // 需要服务器运行的测试
    if (await checkServerRunning()) {
      await testConcurrentRegistration();
      await testStatsQueryPerformance();
    } else {
      console.log('\n⚠️  跳过需要服务器的测试（服务器未运行）');
    }

  } catch (error) {
    console.error('\n❌ 测试执行出错:', error);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ 性能测试完成');
  console.log('=' .repeat(60));
}

// 检查服务器是否运行
async function checkServerRunning(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok || response.status === 404; // 404 也算服务器在运行
  } catch {
    return false;
  }
}

// 执行测试
if (require.main === module) {
  runPerformanceTests().catch((error) => {
    console.error('测试执行出错:', error);
    process.exit(1);
  });
}

export { runPerformanceTests };
