import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, error: "file is required" }, { status: 400 });
    }
    const orig = (file.name || "upload.bin").replace(/^C:\\fakepath\\/, "");
    const ext = path.extname(orig) || "";
    const base = path.basename(orig, ext).replace(/[^a-zA-Z0-9-_]+/g, "_");
    const stamp = Date.now();
    const filename = `${base}_${stamp}${ext.toLowerCase()}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);
    const url = `/uploads/${filename}`;
    return NextResponse.json({ ok: true, filename, url });
  } catch (e: any) {
    console.error("UPLOAD ERR:", e);
    return NextResponse.json({ ok: false, error: e?.message || "upload error" }, { status: 500 });
  }
}
