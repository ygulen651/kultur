import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return NextResponse.json({})
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return NextResponse.json({})
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return NextResponse.json({})
}


