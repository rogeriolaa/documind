// src/lib/extract.ts
import removeMd from "remove-markdown";
import { htmlToText } from "html-to-text";
import mammoth from "mammoth";
import pdfParse from "pdf-parse/lib/pdf-parse";

export function detectType(filename: string, mime?: string) {
  const ext = filename.toLowerCase().split(".").pop() || "";
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  if (ext === "md" || mime === "text/markdown") return "md";
  if (ext === "txt" || mime === "text/plain") return "txt";
  if (ext === "html" || ext === "htm" || mime === "text/html") return "html";
  return "unknown";
}
export function normalizeWhitespace(s: string) {
  return s
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/ +/g, " ")
    .replace(/\n/g, " ")
    .trim();
}
export async function extractTextFromBuffer(
  buf: Buffer,
  filename: string,
  mime?: string
): Promise<string> {
  const type = detectType(filename, mime);
  const content = buf.toString("utf8");
  if (type === "txt") return content;
  if (type === "html") return htmlToText(content);
  if (type === "md") return removeMd(content);
  if (type === "pdf") return (await pdfParse(buf)).text || "";
  if (type === "docx")
    return (await mammoth.extractRawText({ buffer: buf })).value || "";
  throw new Error("Unsupported file type. Use txt, md, html, pdf, or docx.");
}
