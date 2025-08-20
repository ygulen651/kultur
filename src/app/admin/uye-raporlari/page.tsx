'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function UyeRaporlariPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/admin/analitik')
  }, [router])

  return null
}
