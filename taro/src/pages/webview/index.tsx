import { WebView } from '@tarojs/components'
import { useRouter, useReady } from '@tarojs/taro'

export default function WebViewPage() {
  const router = useRouter()

  useReady(() => {
    const pageTitle = router.params.title || ''
    if (pageTitle) {
      Taro.setNavigationBarTitle({ title: pageTitle })
    }
  })

  const url = decodeURIComponent(router.params.url || '')

  return <WebView src={url} />
}
