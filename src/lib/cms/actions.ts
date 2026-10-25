import { toast } from "sonner";
import { SECTIONS } from "./schema";
import { buildZip, downloadBlob } from "./export";
import type { useCms } from "./store";

export async function exportAll(cms: ReturnType<typeof useCms>) {
  const blob = await buildZip(cms.data);
  downloadBlob(blob, "skillz-content.zip");
  cms.markExported(SECTIONS.map((s) => s.key));
  toast.success("ZIP עם כל קובצי ה-JSON יוצא בהצלחה");
}
