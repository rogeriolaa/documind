// src/app/api/ask/[id]/route.ts
import { NextResponse } from "next/server";
import { getDoc } from "@/lib/store";
import { askBestSpan } from "@/lib/qa";
export const runtime = "nodejs";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { question } = await req.json();
    const { id } = await params;
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }
    const doc = getDoc(id);
    if (!doc)
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    const result = await askBestSpan(question, doc.text);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error("Ask error", e);
    return NextResponse.json(
      { error: e?.message || "Failed to answer" },
      { status: 500 }
    );
  }
}
