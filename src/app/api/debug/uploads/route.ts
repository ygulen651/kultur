import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function GET() {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    return NextResponse.json({ ok: true, files });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'List failed' }, { status: 500 });
  }
}
