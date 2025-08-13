// src/app/components/UploadZone.tsx
"use client";
import React, { useRef, useState } from "react";
const MAX_FILES = 5;
const MAX_MB = 10;
const ACCEPT = [".pdf", ".docx", ".md", ".txt", ".html", ".htm"];
export type UDoc = {
  id: string;
  name: string;
  type: "pdf" | "docx" | "md" | "txt" | "unknown" | "html";
  size: number;
  length?: number;
};
export default function UploadZone({
  disabled,
  onUploaded,
}: {
  disabled?: boolean;
  onUploaded: (docs: UDoc[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const detect = (name: string): UDoc["type"] => {
    const ext = name.toLowerCase().split(".").pop() || "";
    return (
      ["pdf", "docx", "md", "txt", "html"].includes(ext) ? ext : "unknown"
    ) as any;
  };
  async function handleFiles(list: FileList | null) {
    if (!list) return;
    const files = Array.from(list)
      .filter(
        (f) =>
          ACCEPT.some((a) => f.name.toLowerCase().endsWith(a)) &&
          f.size <= MAX_MB * 1024 * 1024
      )
      .slice(0, MAX_FILES);
    if (!files.length) {
      setError(`Only ${ACCEPT.join(", ")} up to ${MAX_MB}MB each are allowed.`);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const uploaded: UDoc[] = [];
      for (const f of files) {
        const form = new FormData();
        form.append("file", f);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Upload failed");
        uploaded.push({
          id: data.id,
          name: f.name,
          size: f.size,
          type: detect(f.name),
          length: data.length,
        });
      }
      onUploaded(uploaded);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }
  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed p-6 transition
          ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-white"
          }
          ${
            disabled
              ? "opacity-60 pointer-events-none"
              : "cursor-pointer hover:border-slate-400"
          }`}
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-slate-700 font-medium">Upload documents</p>
        <p className="text-sm text-slate-500">
          PDF, DOCX, MD, TXT, HTML. Up to 5 files, 10MB each.
        </p>
        <button
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700 disabled:opacity-60"
          type="button"
          disabled={uploading}
        >
          {uploading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                />
              </svg>
              Uploading…
            </>
          ) : (
            "Choose files"
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
