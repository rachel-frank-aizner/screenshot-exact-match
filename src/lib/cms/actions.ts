import { toast } from "sonner";
import JSZip from "jszip";
import { FILES, baseName, isFileName, validateFile, type FileName } from "./files";
import { buildZip, downloadBlob } from "./export";
import type { useCms } from "./store";

type Cms = ReturnType<typeof useCms>;

export async function exportAll(cms: Cms) {
  const names = FILES.filter((n) => cms.files[n]);
  if (!names.length) { toast.error("אין קבצים לייצוא. יש לייבא קודם את קובצי המקור"); return; }
  downloadBlob(await buildZip(cms.files), "skillz-content.zip");
  cms.markExported(names);
  toast.success("ZIP עם כל קובצי ה-JSON יוצא בהצלחה");
}

/** Imports .json files (or a .zip of them), matched to known files by name. */
export async function importFiles(cms: Cms, list: File[], only?: FileName) {
  const entries: [string, string][] = [];
  for (const file of list) {
    if (file.name.toLowerCase().endsWith(".zip")) {
      const zip = await JSZip.loadAsync(file);
      for (const z of Object.values(zip.files)) if (!z.dir && z.name.endsWith(".json")) entries.push([baseName(z.name), await z.async("string")]);
    } else entries.push([file.name, await file.text()]);
  }
  const ok: string[] = [];
  for (const [rawName, text] of entries) {
    const name = only ?? rawName;
    if (!isFileName(name)) { toast.error(`קובץ לא מוכר: ${rawName}`); continue; }
    const r = validateFile(name, text);
    if (!r.ok) { toast.error(`ייבוא נכשל: ${r.error}`); continue; }
    cms.importFile(name, r.value, text);
    ok.push(name);
  }
  if (ok.length) toast.success(`נטענו: ${ok.join(", ")}`);
}
