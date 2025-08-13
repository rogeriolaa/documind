"use client";
import React from "react";
import UploadZone, { type UDoc } from "./components/UploadZone";
import DocumentList from "./components/DocumentList";
import QAPanel, { type QAResult } from "./components/QAPanel";
import DocuMindIcon from "./components/DocumindIcon";

export default function HomePage() {
  const [docs, setDocs] = React.useState<UDoc[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [qaCache, setQaCache] = React.useState<Record<string, QAResult[]>>({});

  const addDocs = (newDocs: UDoc[]) => {
    setDocs((prev) => {
      const combined = [...newDocs, ...prev].slice(0, 5);
      // Preserve selection; if none selected yet, select the first document.
      if (!selectedId && combined.length) setSelectedId(combined[0].id);
      return combined;
    });
    // Note: we do NOT clear qaCache here — preserves history across uploads.
  };

  const selected = docs.find((d) => d.id === selectedId) || null;

  async function onAsk(question: string): Promise<QAResult> {
    if (!selected) throw new Error("No document selected");
    const res = await fetch(`/api/ask/${selected.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to get answer");
    const result: QAResult = { question, ...data };

    setQaCache((prev) => ({
      ...prev,
      [selected.id!]: [result, ...(prev[selected.id!] || [])],
    }));

    return result;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DocuMindIcon />
            <h1 className="text-lg font-semibold text-slate-900">DocuMind</h1>
          </div>
          <div className="text-xs text-slate-500">
            Ask anything in your documents
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-4 space-y-4">
            <UploadZone disabled={docs.length >= 5} onUploaded={addDocs} />
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">
                  Documents
                </h2>
                <span className="text-xs text-slate-500">{docs.length}/5</span>
              </div>
              <div className="max-h-[50vh] overflow-auto">
                <DocumentList
                  docs={docs}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>
            </div>
          </section>

          <section className="lg:col-span-8">
            <div className="rounded-xl border border-slate-200 bg-white p-4 h-[70vh] flex flex-col">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Q&A</h2>
              <QAPanel
                doc={selected}
                initial={selected ? qaCache[selected.id] || [] : []}
                onAsk={onAsk}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
