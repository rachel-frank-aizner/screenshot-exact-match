import type { SectionData, SectionDef } from "./schema";

export type ValidationResult = { ok: true; data: SectionData } | { ok: false; error: string };

/** Validates raw JSON text against a section's schema before it is loaded. */
export function validateSectionJson(text: string, def: SectionDef): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "הקובץ אינו JSON תקין" };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "שורש הקובץ חייב להיות אובייקט" };
  }
  const obj = parsed as Record<string, unknown>;
  for (const f of def.fields) {
    if (typeof obj[f.key] !== "string") return { ok: false, error: `השדה "${f.key}" חסר או אינו טקסט` };
  }
  if (!Array.isArray(obj.items)) return { ok: false, error: 'חסר מערך "items"' };
  const ids = new Set<string>();
  for (const [i, it] of obj.items.entries()) {
    if (!it || typeof it !== "object") return { ok: false, error: `פריט ${i + 1} אינו אובייקט` };
    const item = it as Record<string, unknown>;
    if (typeof item.id !== "string" || !item.id) return { ok: false, error: `לפריט ${i + 1} אין id` };
    if (ids.has(item.id)) return { ok: false, error: `id כפול: ${item.id}` };
    ids.add(item.id);
    for (const f of def.itemFields) {
      if (typeof item[f.key] !== "string") return { ok: false, error: `בפריט ${i + 1} השדה "${f.key}" חסר` };
    }
  }
  return { ok: true, data: obj as SectionData };
}
