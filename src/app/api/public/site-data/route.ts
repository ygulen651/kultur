import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Her zaman 200 OK + boş JSON döndür
    return NextResponse.json({
      ok: true,
      data: {
        mission: {
          mission: null,
          vision: null,
          values: null
        },
        settings: null,
        theme: null,
        menu: null,
        socials: null,
        highlights: [],
        hero: null,
        footer: null
      }
    }, { status: 200 });
  } catch (error) {
    // Hata durumunda bile 200 OK + boş JSON döndür
    return NextResponse.json({
      ok: true,
      data: {
        mission: {
          mission: null,
          vision: null,
          values: null
        },
        settings: null,
        theme: null,
        menu: null,
        socials: null,
        highlights: [],
        hero: null,
        footer: null
      }
    }, { status: 200 });
  }
}
