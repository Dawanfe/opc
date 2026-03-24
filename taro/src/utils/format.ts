export function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone || ''
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

export function formatMemberId(id: number): string {
  return `WOPC${String(id).padStart(8, '0')}`
}

export function categorizeNews(title: string): string {
  if (!title) return 'news'
  if (title.includes('政策') || title.includes('汇总')) return 'policy'
  if (title.includes('分析') || title.includes('解读')) return 'analysis'
  return 'news'
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** 将 /api/... 相对路径补全为完整 URL（小程序中图片需要完整地址） */
export function fullUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${TARO_APP_BASE_URL}${path}`
}

export function getTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return formatDate(dateString)
}
