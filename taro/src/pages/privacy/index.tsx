import { View, Text, ScrollView } from '@tarojs/components'

export default function PrivacyPage() {
  return (
    <ScrollView scrollY className="h-full bg-gray-50">
      <View className="p-4">
        <Text className="block text-2xl font-bold text-gray-900 mb-4">隐私政策</Text>
        <Text className="block text-xs text-gray-500 mb-6">
          生效日期：2024年1月1日 | 最后更新：2024年1月1日
        </Text>

        <View className="bg-white rounded-xl p-5 space-y-6 text-gray-700 leading-relaxed">
          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">引言</Text>
            <Text className="text-sm leading-relaxed">
              WeOPC平台（以下简称"我们"）非常重视用户的隐私和个人信息保护。
              本隐私政策旨在向您说明我们如何收集、使用、存储、共享和保护您的个人信息。
              请您仔细阅读并理解本政策，如果您不同意本政策的任何内容，您应立即停止使用我们的服务。
            </Text>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">1. 我们收集的信息</Text>
            <Text className="text-sm leading-relaxed">我们收集的信息包括：</Text>
            <View className="mt-2 pl-4 space-y-1">
              <Text className="block text-sm">• 账户信息：手机号码、昵称、密码、头像</Text>
              <Text className="block text-sm">• 身份信息：微信OpenID、UnionID</Text>
              <Text className="block text-sm">• 邀请信息：邀请码、被邀请记录</Text>
              <Text className="block text-sm">• 设备信息：设备型号、操作系统、唯一设备标识符</Text>
              <Text className="block text-sm">• 日志信息：IP地址、访问时间、浏览记录</Text>
              <Text className="block text-sm">• 位置信息：经您授权后的地理位置信息</Text>
              <Text className="block text-sm">• 发布内容：您发布的任务、需求、评论等内容</Text>
            </View>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">2. 我们如何使用您的信息</Text>
            <Text className="text-sm leading-relaxed">我们使用您的信息用于以下目的：</Text>
            <View className="mt-2 pl-4 space-y-1">
              <Text className="block text-sm">• 提供、维护和改进我们的服务</Text>
              <Text className="block text-sm">• 验证您的身份并确保账户安全</Text>
              <Text className="block text-sm">• 处理您的工位申请、任务发布等请求</Text>
              <Text className="block text-sm">• 向您发送服务通知和营销信息（经您同意）</Text>
              <Text className="block text-sm">• 进行数据分析以改善用户体验</Text>
              <Text className="block text-sm">• 遵守法律法规的要求</Text>
            </View>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">3. 信息存储</Text>
            <Text className="text-sm leading-relaxed">
              我们将在中华人民共和国境内收集和产生的个人信息存储在境内。
              如需跨境传输，我们将遵守相关法律法规，并确保您的个人信息得到充分保护。
              我们会采取合理的安全措施来保护您的个人信息，防止其被未经授权的访问、使用、修改、损坏或丢失。
            </Text>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">4. 信息共享</Text>
            <Text className="text-sm leading-relaxed">我们不会向第三方出售您的个人信息。但我们可能在以下情况下共享您的信息：</Text>
            <View className="mt-2 pl-4 space-y-1">
              <Text className="block text-sm">• 经您同意：获得您的明确同意后</Text>
              <Text className="block text-sm">• 服务提供方：与帮助我们运营服务的合作伙伴共享</Text>
              <Text className="block text-sm">• 法律要求：根据法律法规、政府要求、法院命令或法律程序</Text>
              <Text className="block text-sm">• 权利保护：为保护我们、用户或公众的权利、财产或安全</Text>
            </View>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">5. 您的权利</Text>
            <Text className="text-sm leading-relaxed">您对您的个人信息享有以下权利：</Text>
            <View className="mt-2 pl-4 space-y-1">
              <Text className="block text-sm">• 访问权：您有权访问您的个人信息</Text>
              <Text className="block text-sm">• 更正权：您有权更正不准确或不完整的个人信息</Text>
              <Text className="block text-sm">• 删除权：您有权要求删除您的个人信息</Text>
              <Text className="block text-sm">• 撤回同意权：您有权撤回之前给予的同意</Text>
              <Text className="block text-sm">• 注销账户：您有权注销您的账户</Text>
            </View>
            <Text className="block text-sm mt-2">
              如需行使上述权利，请通过本政策"联系我们"部分提供的方式与我们联系。
            </Text>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">6. 未成年人保护</Text>
            <Text className="text-sm leading-relaxed">
              我们的服务不面向14周岁以下的未成年人。如果您是未成年人的父母或监护人，
              请监督未成年人使用我们的服务。如果我们发现在未经父母或监护人同意的情况下
              收集了未成年人的个人信息，我们将尽快删除相关信息。
            </Text>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">7. Cookie和类似技术</Text>
            <Text className="text-sm leading-relaxed">
              我们使用Cookie、本地存储和类似技术来提供、保护和改进我们的服务。
              您可以设置浏览器或设备以拒绝Cookie，但这可能导致某些功能无法正常使用。
            </Text>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">8. 第三方链接</Text>
            <Text className="text-sm leading-relaxed">
              我们的服务可能包含指向第三方网站或服务的链接。我们不对这些第三方网站或服务的
              隐私做法负责。建议您仔细阅读第三方的隐私政策。
            </Text>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">9. 隐私政策的更新</Text>
            <Text className="text-sm leading-relaxed">
              我们可能会不时更新本隐私政策。更新后的政策将在我们的平台上公布。
              如果我们做出重大变更，我们将通过您提供的联系方式或在我们的服务中发布公告通知您。
            </Text>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">10. 联系我们</Text>
            <Text className="text-sm leading-relaxed">如果您对本隐私政策有任何疑问、意见或请求，请通过以下方式联系我们：</Text>
            <View className="mt-2 pl-4 space-y-1">
              <Text className="block text-sm">• 邮箱：contact@weopc.com.cn</Text>
              <Text className="block text-sm">• 微信公众号：WeOPC</Text>
            </View>
            <Text className="block text-sm mt-2">
              我们将在15个工作日内回复您的请求。
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
