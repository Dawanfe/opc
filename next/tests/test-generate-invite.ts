#!/usr/bin/env tsx

/**
 * 测试生成邀请码API
 */

const API_BASE_TEST_INVITE = 'http://localhost:3000';

async function testGenerateInviteCode() {
  console.log('🧪 测试生成邀请码功能\n');

  // 1. 先登录获取token
  console.log('1️⃣ 登录获取token...');
  const loginResponse = await fetch(`${API_BASE_TEST_INVITE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '19988888888',
      password: 'test123456'
    })
  });

  if (!loginResponse.ok) {
    console.error('❌ 登录失败');
    const data = await loginResponse.json();
    console.error('错误:', data.error);
    return;
  }

  const loginData = await loginResponse.json();
  const token = loginData.token;
  console.log('✅ 登录成功\n');

  // 2. 调用生成邀请码API
  console.log('2️⃣ 生成邀请码...');
  const generateResponse = await fetch(`${API_BASE_TEST_INVITE}/api/user/generate-invite-code`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const generateData = await generateResponse.json();

  if (!generateResponse.ok) {
    console.error('❌ 生成失败');
    console.error('状态码:', generateResponse.status);
    console.error('错误:', generateData.error);
    if (generateData.details) {
      console.error('详情:', generateData.details);
    }
    return;
  }

  console.log('✅ 生成成功!');
  console.log('邀请码:', generateData.inviteCode);
  console.log('消息:', generateData.message);
  console.log('\n');

  // 3. 验证邀请码
  console.log('3️⃣ 验证邀请码...');
  const inviteInfoResponse = await fetch(`${API_BASE_TEST_INVITE}/api/user/invite-info`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!inviteInfoResponse.ok) {
    console.error('❌ 查询邀请信息失败');
    return;
  }

  const inviteInfo = await inviteInfoResponse.json();
  console.log('✅ 查询成功');
  console.log('用户邀请码:', inviteInfo.user.inviteCode);

  if (inviteInfo.user.inviteCode === generateData.inviteCode) {
    console.log('✅ 邀请码匹配成功!\n');
  } else {
    console.error('❌ 邀请码不匹配\n');
  }

  // 4. 尝试再次生成（应该失败）
  console.log('4️⃣ 测试重复生成（应该失败）...');
  const generateResponse2 = await fetch(`${API_BASE_TEST_INVITE}/api/user/generate-invite-code`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const generateData2 = await generateResponse2.json();

  if (generateResponse2.status === 400) {
    console.log('✅ 正确拒绝重复生成');
    console.log('错误消息:', generateData2.error);
    console.log('现有邀请码:', generateData2.inviteCode);
  } else {
    console.error('❌ 应该拒绝重复生成');
  }

  console.log('\n🎉 测试完成!');
}

testGenerateInviteCode().catch(err => {
  console.error('测试失败:', err);
  process.exit(1);
});
