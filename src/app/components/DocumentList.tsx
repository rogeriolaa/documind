"use client";
import React from "react";
import FileIcon from "./FileIcon";
import type { UDoc } from "./UploadZone";

type Props = {
  docs: UDoc[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
};

export default function DocumentList({ docs, selectedId, onSelect }: Props) {
  if (!docs.length) {
    return (
      <div className="text-sm text-slate-500 p-4">
        No documents yet. Upload to get started.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-slate-200">
      {docs.map((doc) => {
        const selected = doc.id === selectedId;
        return (
          <li key={doc.id}>
            <button
              onClick={() => onSelect(doc.id)}
              className={`w-full flex items-center gap-3 p-3 text-left transition
                ${selected ? "bg-blue-50" : "hover:bg-slate-50"}`}
            >
              <FileIcon type={doc.type} />
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium text-slate-800">
                  {doc.name}
                </div>
                <div className="text-xs text-slate-500">
                  {(doc.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
