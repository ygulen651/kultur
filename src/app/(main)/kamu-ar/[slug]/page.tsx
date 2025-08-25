"use client"

import { Section } from '@/components/Section'
import { Container } from '@/components/Container'

export default function KamuArSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Section padding="xl">
      <Container>
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Kamu-AR</h1>
          <p className="text-gray-600">Kamu-AR detay sayfası yakında eklenecek.</p>
        </div>
      </Container>
    </Section>
  )
}


