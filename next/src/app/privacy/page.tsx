export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">隐私政策</h1>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p className="text-gray-500 text-sm">
            生效日期：2024年3月30日 | 最后更新：{new Date().toLocaleDateString('zh-CN')}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">引言</h2>
            <p>
              WeOPC平台（以下简称"我们"）非常重视用户的隐私和个人信息保护。
              本隐私政策旨在向您说明我们如何收集、使用、存储、共享和保护您的个人信息。
              请您仔细阅读并理解本政策，如果您不同意本政策的任何内容，您应立即停止使用我们的服务。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. 我们收集的信息</h2>
            <p>我们收集的信息包括：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>账户信息</strong>：手机号码、昵称、密码、头像</li>
              <li><strong>身份信息</strong>：微信OpenID、UnionID</li>
              <li><strong>邀请信息</strong>：邀请码、被邀请记录</li>
              <li><strong>设备信息</strong>：设备型号、操作系统、唯一设备标识符</li>
              <li><strong>日志信息</strong>：IP地址、访问时间、浏览记录</li>
              <li><strong>位置信息</strong>：经您授权后的地理位置信息</li>
              <li><strong>发布内容</strong>：您发布的任务、需求、评论等内容</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. 我们如何使用您的信息</h2>
            <p>我们使用您的信息用于以下目的：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>提供、维护和改进我们的服务</li>
              <li>验证您的身份并确保账户安全</li>
              <li>处理您的工位申请、任务发布等请求</li>
              <li>向您发送服务通知和营销信息（经您同意）</li>
              <li>进行数据分析以改善用户体验</li>
              <li>遵守法律法规的要求</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. 信息存储</h2>
            <p>
              我们将在中华人民共和国境内收集和产生的个人信息存储在境内。
              如需跨境传输，我们将遵守相关法律法规，并确保您的个人信息得到充分保护。
              我们会采取合理的安全措施来保护您的个人信息，防止其被未经授权的访问、使用、修改、损坏或丢失。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. 信息共享</h2>
            <p>我们不会向第三方出售您的个人信息。但我们可能在以下情况下共享您的信息：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>经您同意</strong>：获得您的明确同意后</li>
              <li><strong>服务提供方</strong>：与帮助我们运营服务的合作伙伴共享</li>
              <li><strong>法律要求</strong>：根据法律法规、政府要求、法院命令或法律程序</li>
              <li><strong>权利保护</strong>：为保护我们、用户或公众的权利、财产或安全</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. 您的权利</h2>
            <p>您对您的个人信息享有以下权利：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>访问权</strong>：您有权访问您的个人信息</li>
              <li><strong>更正权</strong>：您有权更正不准确或不完整的个人信息</li>
              <li><strong>删除权</strong>：您有权要求删除您的个人信息</li>
              <li><strong>撤回同意权</strong>：您有权撤回之前给予的同意</li>
              <li><strong>注销账户</strong>：您有权注销您的账户</li>
            </ul>
            <p className="mt-2">
              如需行使上述权利，请通过本政策"联系我们"部分提供的方式与我们联系。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. 未成年人保护</h2>
            <p>
              我们的服务不面向14周岁以下的未成年人。如果您是未成年人的父母或监护人，
              请监督未成年人使用我们的服务。如果我们发现在未经父母或监护人同意的情况下
              收集了未成年人的个人信息，我们将尽快删除相关信息。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cookie和类似技术</h2>
            <p>
              我们使用Cookie、本地存储和类似技术来提供、保护和改进我们的服务。
              您可以设置浏览器或设备以拒绝Cookie，但这可能导致某些功能无法正常使用。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. 第三方链接</h2>
            <p>
              我们的服务可能包含指向第三方网站或服务的链接。我们不对这些第三方网站或服务的
              隐私做法负责。建议您仔细阅读第三方的隐私政策。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. 隐私政策的更新</h2>
            <p>
              我们可能会不时更新本隐私政策。更新后的政策将在我们的平台上公布。
              如果我们做出重大变更，我们将通过您提供的联系方式或在我们的服务中发布公告通知您。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. 联系我们</h2>
            <p>如果您对本隐私政策有任何疑问、意见或请求，请通过以下方式联系我们：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>邮箱：contact@weopc.com.cn</li>
              <li>微信公众号：WeOPC</li>
            </ul>
            <p className="mt-2">
              我们将在15个工作日内回复您的请求。
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
