// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  extractTextFromBuffer,
  detectType,
  normalizeWhitespace,
} from "@/lib/extract";
import { putDoc } from "@/lib/store";

export const runtime = "nodejs";
const MAX_MB = 10;
const MAX_SIZE = MAX_MB * 1024 * 1024;
const ALLOWED = new Set(["pdf", "docx", "md", "txt", "html"]);
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json(
        { error: `File too large. Max ${MAX_MB}MB.` },
        { status: 400 }
      );
    const name = file.name || "upload";
    const type = detectType(name, file.type);
    if (!ALLOWED.has(type))
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    const buf = Buffer.from(await file.arrayBuffer());
    const textRaw = await extractTextFromBuffer(buf, name, file.type);
    const text = normalizeWhitespace(textRaw);
    const id = crypto.randomUUID();
    putDoc({
      id,
      name,
      type: type as any,
      size: file.size,
      text,
      length: text.length,
      createdAt: Date.now(),
    });
    return NextResponse.json({ id, filename: name, length: text.length });
  } catch (e: any) {
    console.error("Upload error", e);
    return NextResponse.json(
      { error: e?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
