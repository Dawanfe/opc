import { View, Image } from '@tarojs/components'
import { useMemo } from 'react'
import icons from './icons'

interface IconProps {
  name: string
  size?: number
  color?: string
  className?: string
}

function buildSvg(paths: string, color: string, size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
}

function toBase64(str: string): string {
  // Works in both H5 (browser btoa) and mini-program (Buffer polyfill or manual)
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(str)))
  }
  // Fallback for mini-program environment
  const utf8Bytes: number[] = []
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i)
    if (charCode < 0x80) {
      utf8Bytes.push(charCode)
    } else if (charCode < 0x800) {
      utf8Bytes.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f))
    } else {
      utf8Bytes.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f))
    }
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let result = ''
  for (let i = 0; i < utf8Bytes.length; i += 3) {
    const b1 = utf8Bytes[i]
    const b2 = utf8Bytes[i + 1]
    const b3 = utf8Bytes[i + 2]
    result += chars[b1 >> 2]
    result += chars[((b1 & 3) << 4) | (b2 >> 4 || 0)]
    result += b2 !== undefined ? chars[((b2 & 15) << 2) | (b3 >> 6 || 0)] : '='
    result += b3 !== undefined ? chars[b3 & 63] : '='
  }
  return result
}

export default function Icon({ name, size = 24, color = '#6B7280', className }: IconProps) {
  const src = useMemo(() => {
    const paths = icons[name]
    if (!paths) return ''
    const svg = buildSvg(paths, color, size)
    return `data:image/svg+xml;base64,${toBase64(svg)}`
  }, [name, size, color])

  if (!src) return null

  return (
    <View
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      <Image
        src={src}
        style={{ width: `${size}px`, height: `${size}px` }}
        mode='scaleToFill'
      />
    </View>
  )
}
