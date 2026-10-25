// Pure logic for the original SKILLZ content files. Structures are preserved exactly:
// values are edited in place, key order is kept, and untouched files export byte-for-byte.

export const FILES = [
  "he.json", "activities.json", "services.json", "projects.json", "videos.json",
  "stats.json", "footerSocial.json", "nav.json", "sites-help-info.json",
] as const;
export type FileName = (typeof FILES)[number];
export type Loaded = { value: unknown; raw: string };
export type Files = Partial<Record<FileName, Loaded>>;
export type He = Record<string, string>;
export type Row = Record<string, unknown>;

const ARRAY_FILES: FileName[] = ["activities.json", "services.json", "projects.json", "videos.json", "stats.json", "footerSocial.json"];

/** Linked arrays keep media in the array file and texts in he.json under `${prefix}.${id}.*`. */
export const LINKED: Partial<Record<FileName, { prefix: string; fallback: string[] }>> = {
  "activities.json": { prefix: "activities", fallback: ["title", "description"] },
  "services.json": { prefix: "services", fallback: ["title", "description"] },
  "projects.json": { prefix: "projects", fallback: [] },
};

export const isFileName = (n: string): n is FileName => (FILES as readonly string[]).includes(n);
export const baseName = (p: string) => p.split(/[\\/]/).pop() ?? p;

export type Validation = { ok: true; value: unknown } | { ok: false; error: string };

export function validateFile(name: FileName, text: string): Validation {
  let v: unknown;
  try { v = JSON.parse(text); } catch { return { ok: false, error: `${name}: הקובץ אינו JSON תקין` }; }
  if (name === "he.json") {
    if (!v || typeof v !== "object" || Array.isArray(v)) return { ok: false, error: "he.json חייב להיות אובייקט שטוח" };
    for (const [k, val] of Object.entries(v)) if (typeof val !== "string") return { ok: false, error: `he.json: הערך של "${k}" אינו טקסט` };
  }
  if (ARRAY_FILES.includes(name)) {
    if (!Array.isArray(v)) return { ok: false, error: `${name} חייב להיות מערך` };
    const ids = new Set<unknown>();
    for (const [i, it] of v.entries()) {
      if (!it || typeof it !== "object" || Array.isArray(it)) return { ok: false, error: `${name}: פריט ${i + 1} אינו אובייקט` };
      const id = (it as Row)["id"];
      if (id !== undefined) {
        if (ids.has(id)) return { ok: false, error: `${name}: id כפול "${String(id)}"` };
        ids.add(id);
      }
    }
  }
  return { ok: true, value: v };
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Unchanged → original text verbatim; changed → same indentation and trailing newline as the source. */
export function serialize(f: Loaded): string {
  let orig: unknown;
  try { orig = JSON.parse(f.raw); } catch { orig = undefined; }
  if (same(orig, f.value)) return f.raw;
  const m = f.raw.match(/\n([ \t]+)\S/);
  const indent = m ? m[1]! : f.raw.includes("\n") ? 2 : 0;
  return JSON.stringify(f.value, null, indent) + (f.raw.endsWith("\n") ? "\n" : "");
}

/** Rebuild an object inserting entries right after `after` (or at the end), keeping key order. */
function insertAfter(obj: He, after: string | undefined, entries: [string, string][]): He {
  const out: He = {};
  let done = false;
  for (const [k, v] of Object.entries(obj)) {
    out[k] = v;
    if (k === after) { entries.forEach(([a, b]) => (out[a] = b)); done = true; }
  }
  if (!done) entries.forEach(([a, b]) => (out[a] = b));
  return out;
}

export const linkedKeys = (he: He, prefix: string, id: string) =>
  Object.keys(he).filter((k) => k.startsWith(`${prefix}.${id}.`));

/** Adds an item to a linked/plain array; new item copies the existing key set with empty values. */
export function addItem(arr: Row[], id: string | null, he?: He, prefix?: string, fallback: string[] = []) {
  const template = arr[0] ? Object.keys(arr[0]) : id !== null ? ["id"] : [];
  const item: Row = {};
  template.forEach((k) => (item[k] = k === "id" ? id : ""));
  if (id !== null) item["id"] = id;
  const nextArr = [...arr, item];
  if (!he || !prefix || id === null) return { arr: nextArr, he };
  let suffixes: string[] = [];
  for (const it of arr) {
    const ks = linkedKeys(he, prefix, String(it["id"]));
    if (ks.length) { suffixes = ks.map((k) => k.slice(`${prefix}.${String(it["id"])}.`.length)); break; }
  }
  if (!suffixes.length) suffixes = fallback;
  const last = Object.keys(he).filter((k) => k.startsWith(`${prefix}.`)).pop();
  return { arr: nextArr, he: insertAfter(he, last, suffixes.map((s) => [`${prefix}.${id}.${s}`, ""])) };
}

export function removeItem(arr: Row[], index: number, he?: He, prefix?: string) {
  const id = arr[index]?.["id"];
  const nextArr = arr.filter((_, i) => i !== index);
  if (!he || !prefix || id === undefined) return { arr: nextArr, he };
  const drop = new Set(linkedKeys(he, prefix, String(id)));
  return { arr: nextArr, he: Object.fromEntries(Object.entries(he).filter(([k]) => !drop.has(k))) };
}
