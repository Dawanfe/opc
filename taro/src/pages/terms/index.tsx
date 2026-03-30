import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'

export default function TermsPage() {
  return (
    <ScrollView scrollY className="h-full bg-gray-50">
      <View className="p-4">
        <Text className="block text-2xl font-bold text-gray-900 mb-6">用户服务协议</Text>

        <View className="bg-white rounded-xl p-5 space-y-6 text-gray-700 leading-relaxed">
          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">1. 服务条款的接受</Text>
            <Text className="text-sm leading-relaxed">
              欢迎使用WeOPC平台服务！本用户服务协议（以下简称"本协议"）是您与WeOPC平台运营方之间就使用WeOPC平台服务所订立的协议。
              当您注册、登录或使用WeOPC平台服务时，即表示您已充分阅读、理解并接受本协议的全部内容。
            </Text>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">2. 服务内容</Text>
            <Text className="text-sm leading-relaxed">WeOPC平台为用户提供以下服务：</Text>
            <View className="mt-2 pl-4 space-y-1">
              <Text className="block text-sm">• OPC政策查询与解读</Text>
              <Text className="block text-sm">• 工位申请与匹配服务</Text>
              <Text className="block text-sm">• 社区联系方式查询</Text>
              <Text className="block text-sm">• 活动报名与优先通道</Text>
              <Text className="block text-sm">• 需求发布与任务接单</Text>
              <Text className="block text-sm">• 邀请好友与积分奖励</Text>
            </View>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">3. 用户注册</Text>
            <Text className="text-sm leading-relaxed">
              用户在注册时必须提供真实、准确、完整的个人信息。用户应对其提供的个人信息承担全部责任。
              WeOPC平台有权对用户提交的信息进行审核，对于信息不真实或不完整的用户，WeOPC平台有权拒绝提供服务。
            </Text>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">4. 用户行为规范</Text>
            <Text className="text-sm leading-relaxed">用户在使用WeOPC平台服务时，必须遵守以下规范：</Text>
            <View className="mt-2 pl-4 space-y-1">
              <Text className="block text-sm">• 不得发布虚假信息、违法信息或不良信息</Text>
              <Text className="block text-sm">• 不得侵犯他人知识产权、肖像权、隐私权等合法权益</Text>
              <Text className="block text-sm">• 不得利用平台进行欺诈、诈骗等违法活动</Text>
              <Text className="block text-sm">• 不得恶意攻击、诽谤他人或平台</Text>
              <Text className="block text-sm">• 不得恶意刷单、刷分等行为</Text>
            </View>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">5. 用户隐私保护</Text>
            <Text className="text-sm leading-relaxed">
              WeOPC平台重视用户隐私保护。我们将严格按照《隐私政策》收集、使用、存储您的个人信息。
              未经您的同意，我们不会向第三方披露您的个人信息，法律法规另有规定的除外。
            </Text>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">6. 知识产权</Text>
            <Text className="text-sm leading-relaxed">
              WeOPC平台上的所有内容，包括但不限于文字、图片、音频、视频、软件、程序、版面设计等，
              均受著作权法、商标法、专利法等法律法规的保护。未经WeOPC平台许可，用户不得复制、传播、使用上述内容。
            </Text>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">7. 免责声明</Text>
            <Text className="text-sm leading-relaxed">WeOPC平台不对以下情况承担责任：</Text>
            <View className="mt-2 pl-4 space-y-1">
              <Text className="block text-sm">• 因不可抗力导致的服务中断或终止</Text>
              <Text className="block text-sm">• 因用户自身操作不当导致的损失</Text>
              <Text className="block text-sm">• 因第三方行为导致的损失</Text>
              <Text className="block text-sm">• 因网络故障、系统维护等原因导致的服务中断</Text>
            </View>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">8. 协议的修改</Text>
            <Text className="text-sm leading-relaxed">
              WeOPC平台有权根据需要修改本协议，修改后的协议将在平台上公布。
              如用户不同意修改后的协议，可以停止使用WeOPC平台服务。如用户继续使用，则视为接受修改后的协议。
            </Text>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">9. 争议解决</Text>
            <Text className="text-sm leading-relaxed">
              因本协议引起的任何争议，双方应友好协商解决。协商不成的，任何一方可向WeOPC平台所在地人民法院提起诉讼。
            </Text>
          </View>

          <View>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">10. 联系我们</Text>
            <Text className="text-sm leading-relaxed">如果您对本协议有任何疑问，请通过以下方式联系我们：</Text>
            <View className="mt-2 pl-4 space-y-1">
              <Text className="block text-sm">• 邮箱：contact@weopc.com.cn</Text>
              <Text className="block text-sm">• 微信公众号：WeOPC</Text>
            </View>
          </View>

          <View className="pt-4 border-t border-gray-200">
            <Text className="text-sm text-gray-500">
              本协议自发布之日起生效。最后更新日期：2024年3月30日
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
