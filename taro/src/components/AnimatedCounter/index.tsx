import { useState, useEffect } from 'react'
import { Text } from '@tarojs/components'

interface AnimatedCounterProps {
  target: number
  suffix?: string
  duration?: number
}

export default function AnimatedCounter({ target, suffix = '', duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target <= 0) return
    const steps = 60
    const increment = target / steps
    const stepTime = duration / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepTime)
    return () => clearInterval(timer)
  }, [target, duration])

  return <Text>{count.toLocaleString()}{suffix}</Text>
}
