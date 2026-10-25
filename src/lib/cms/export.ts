import JSZip from "jszip";
import { SECTIONS, type SectionData, type SectionKey } from "./schema";

export const toJson = (data: SectionData) => JSON.stringify(data, null, 2);

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function downloadJson(data: SectionData, filename: string) {
  downloadBlob(new Blob([toJson(data)], { type: "application/json;charset=utf-8" }), filename);
}

export function buildZipArchive(all: Record<SectionKey, SectionData>) {
  const zip = new JSZip();
  const folder = zip.folder("content")!;
  SECTIONS.forEach((s) => folder.file(s.file, toJson(all[s.key])));
  return zip;
}

export const buildZip = (all: Record<SectionKey, SectionData>) =>
  buildZipArchive(all).generateAsync({ type: "blob" });

export const readFileText = (file: File) => file.text();
