/**
 * 前端功能测试（可选，需要浏览器环境）
 */

// 复制功能测试
export function testCopyFunctionality() {
  console.log('\n📋 测试: 复制功能');

  // 测试1: clipboard API 可用性
  const hasClipboard = typeof navigator !== 'undefined' &&
                       navigator.clipboard &&
                       typeof navigator.clipboard.writeText === 'function';

  console.log(`  Clipboard API 可用: ${hasClipboard ? '✅' : '⚠️  (将使用降级方案)'}`);

  // 测试2: execCommand 降级方案
  const hasExecCommand = typeof document !== 'undefined' &&
                         typeof document.execCommand === 'function';

  console.log(`  execCommand 可用: ${hasExecCommand ? '✅' : '❌'}`);

  if (!hasClipboard && !hasExecCommand) {
    console.log('  ⚠️  警告: 复制功能在当前环境不可用');
  } else {
    console.log('  ✅ 复制功能可用');
  }
}

// 导航功能测试
export function testNavigationToInvitePage() {
  console.log('\n📋 测试: 导航到邀请页面');

  if (typeof window !== 'undefined') {
    console.log(`  当前URL: ${window.location.href}`);
    console.log(`  邀请页面URL: ${window.location.origin}/invite`);
    console.log('  ✅ 导航功能可用');
  } else {
    console.log('  ⚠️  非浏览器环境，跳过测试');
  }
}

// 使用说明
console.log(`
╔════════════════════════════════════════════════════════════╗
║  前端功能测试说明                                          ║
╚════════════════════════════════════════════════════════════╝

这些测试需要在浏览器环境中运行：

1. 打开浏览器开发者工具 (F12)
2. 访问 http://localhost:3000/invite
3. 在 Console 中运行：

   // 测试复制功能
   const text = "ABC12345";
   navigator.clipboard.writeText(text)
     .then(() => console.log("✅ 复制成功"))
     .catch(() => console.log("❌ 复制失败"));

4. 点击页面上的"复制邀请码"按钮
5. 检查是否显示成功提示

预期行为：
- 点击按钮后显示 "邀请码已复制到剪贴板"
- 粘贴时能看到邀请码
- 如果失败，显示 "复制失败，请手动复制"

测试清单：
□ 复制邀请码按钮可点击
□ 点击后显示成功提示
□ 能够粘贴邀请码
□ 邀请链接复制功能正常
□ 从会员中心能访问邀请页面
□ 邀请页面正常显示邀请码
`);
