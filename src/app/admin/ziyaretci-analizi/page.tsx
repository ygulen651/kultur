'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ZiyaretciAnaliziPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/admin/analitik')
  }, [router])

  return null
}
