'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function IcerikPerformansiPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/admin/analitik')
  }, [router])

  return null
}
