// src/lib/qa.ts
import path from "node:path";
import { env, pipeline, QuestionAnsweringPipeline } from "@xenova/transformers";
env.cacheDir = path.join(process.cwd(), ".models"); // first-call downloads cache here
let qaPipelinePromise: ReturnType<typeof pipeline> | null = null;
async function getQAPipeline() {
  if (!qaPipelinePromise) {
    qaPipelinePromise = pipeline(
      "question-answering",
      "Xenova/distilbert-base-cased-distilled-squad"
    );
  }
  return qaPipelinePromise;
}
function chunkText(text: string, maxWords = 350, overlap = 50): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < words.length; i += maxWords - overlap) {
    const slice = words.slice(i, i + maxWords);
    if (!slice.length) break;
    out.push(slice.join(" "));
  }
  return out;
}
export async function askBestSpan(question: string, text: string) {
  const qa = (await getQAPipeline()) as QuestionAnsweringPipeline;
  const chunks = chunkText(text, 350, 50).slice(0, 100);
  let best: any = null;
  for (const context of chunks) {
    const out: any = await qa(question, context);
    if (!best || out.score > best.score) best = { ...out, context };
  }
  let contextSnippet: string | undefined;
  if (best?.start != null && best?.end != null) {
    const s = Math.max(0, best.start - 120);
    const e = Math.min(best.context.length, best.end + 120);
    contextSnippet = best.context.slice(s, e);
  }
  return {
    answer: best?.answer ?? "",
    score: best?.score ?? 0,
    contextSnippet,
  };
}
