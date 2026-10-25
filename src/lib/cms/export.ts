import JSZip from "jszip";
import { FILES, serialize, type Files, type Loaded } from "./files";

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

export function downloadFile(f: Loaded, filename: string) {
  downloadBlob(new Blob([serialize(f)], { type: "application/json;charset=utf-8" }), filename);
}

export function buildZipArchive(files: Files) {
  const zip = new JSZip();
  FILES.forEach((n) => { const f = files[n]; if (f) zip.file(n, serialize(f)); });
  return zip;
}

export const buildZip = (files: Files) => buildZipArchive(files).generateAsync({ type: "blob" });
