export type DocRecord = {
  id: string;
  name: string;
  type: "pdf" | "docx" | "md" | "txt" | "unknown" | "html";
  size: number;
  text: string;
  length: number;
  createdAt: number;
};
const docs = new Map<string, DocRecord>();
export function putDoc(doc: DocRecord) {
  docs.set(doc.id, doc);
}
export function getDoc(id: string) {
  return docs.get(id) || null;
}
