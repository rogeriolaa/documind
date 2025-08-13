// src/app/components/QAPanel.tsx
"use client";
import React, { useEffect, useState } from "react";
import type { UDoc } from "./UploadZone";
export type QAResult = {
  question: string;
  answer: string;
  score: number;
  contextSnippet?: string;
};
export default function QAPanel({
  doc,
  initial = [],
  onAsk,
}: {
  doc?: UDoc | null;
  initial?: QAResult[];
  onAsk: (question: string) => Promise<QAResult>;
}) {
  const thresholdStoredValue =
    typeof window == "undefined"
      ? 60
      : Number(localStorage.getItem("dm-threshold") ?? 60);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<QAResult[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(thresholdStoredValue);
  useEffect(() => {
    setHistory(initial);
    setQ("");
    setError(null);
  }, [doc?.id, initial]);
  useEffect(() => {
    localStorage.setItem("dm-threshold", String(threshold));
  }, [threshold]);
  async function submit() {
    if (!q.trim() || !doc) return;
    setLoading(true);
    setError(null);
    try {
      const result = await onAsk(q.trim());
      setHistory((prev) => [result, ...prev]);
      setQ("");
    } catch (e: any) {
      setError(e?.message || "Failed to get answer.");
    } finally {
      setLoading(false);
    }
  }
  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  }
  if (!doc)
    return (
      <div className="text-sm text-slate-500">
        Select a document to ask questions.
      </div>
    );
  return (
    <div className="flex flex-col h-full">
      <div className="mb-3">
        <label className="block text-sm font-medium text-slate-700">
          Confidence threshold:{" "}
          <span className="font-semibold">{threshold}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700">
          Ask about: <span className="font-semibold">{doc.name}</span>
        </label>
        <div className="mt-2 flex gap-2">
          <textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Type your question… (Ctrl/Cmd + Enter to send)"
            className="flex-1 min-h-[70px] rounded-lg border border-slate-300 p-3 focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={submit}
            disabled={loading || !q.trim()}
            className={`self-start rounded-lg px-4 py-2 text-white transition ${
              loading || !q.trim()
                ? "bg-slate-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
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
                Asking…
              </div>
            ) : (
              "Ask"
            )}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      <div className="flex-1 overflow-auto space-y-4">
        {history.length === 0 ? (
          <div className="text-sm text-slate-500">
            No questions yet. Try asking about key facts, dates, or definitions.
          </div>
        ) : (
          history.map((h, i) => {
            const conf = h.score * 100;
            const isAbove = conf >= threshold;
            return (
              <div
                key={i}
                className={`rounded-lg border p-3 ${
                  isAbove ? "border-slate-200" : "border-amber-300 bg-amber-50"
                }`}
              >
                <div className="text-sm text-slate-600">
                  <span className="font-semibold">Q:</span> {h.question}
                </div>
                <div className="mt-2">
                  {isAbove ? (
                    <>
                      <div className="font-medium text-slate-800">
                        A: {h.answer}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Confidence: {conf.toFixed(1)}%
                      </div>
                      {h.contextSnippet && (
                        <div className="mt-2 text-xs text-slate-500 border-l-2 pl-2">
                          <span className="font-semibold">Context:</span> "…
                          {h.contextSnippet}…"
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-amber-800 flex items-start gap-2">
                      <svg
                        className="w-4 h-4 mt-[2px] shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          className="stroke-amber-500"
                        />
                        <path
                          d="M12 16v-4M12 8h.01"
                          className="stroke-amber-500"
                        />
                      </svg>
                      <span>
                        Discarded answer (confidence {conf.toFixed(1)}%):
                        <br />
                        <strong>{h.answer}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
