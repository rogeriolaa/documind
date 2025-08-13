"use client";
import React from "react";

export type DocType = "pdf" | "docx" | "md" | "txt" | "unknown";

const colors: Record<DocType, string> = {
  pdf: "fill-red-500",
  docx: "fill-blue-500",
  md: "fill-emerald-500",
  txt: "fill-slate-500",
  unknown: "fill-gray-400",
};

export default function FileIcon({ type }: { type: DocType }) {
  const color = colors[type] || colors.unknown;
  return (
    <svg className={`w-6 h-6 ${color}`} viewBox="0 0 24 24" aria-hidden>
      <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2z" />
      <path className="fill-white/80" d="M13 2v5h5" />
    </svg>
  );
}
