import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { FILES, serialize, type FileName, type Files } from "./files";

type CmsState = {
  files: Files;
  lastSaved: string | null;
  save: (updates: Partial<Record<FileName, unknown>>) => void;
  importFile: (name: FileName, value: unknown, raw: string) => void;
  markExported: (names: FileName[]) => void;
  isDirty: (name: FileName) => boolean;
  dirtyKeys: FileName[];
};

const Ctx = createContext<CmsState | null>(null);
const STORAGE = "skillz-cms-v2";

export function CmsProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<Files>({});
  const [exported, setExported] = useState<Partial<Record<FileName, string>>>({});
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Browser-only working copy so a refresh doesn't lose edits. Nothing is sent anywhere.
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(STORAGE) ?? "null");
      if (p?.files) setFiles(p.files);
      if (p?.exported) setExported(p.exported);
      if (p?.lastSaved) setLastSaved(p.lastSaved);
    } catch { /* ignore corrupt cache */ }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE, JSON.stringify({ files, exported, lastSaved }));
  }, [files, exported, lastSaved, loaded]);

  const save = useCallback((updates: Partial<Record<FileName, unknown>>) => {
    setFiles((f) => {
      const n = { ...f };
      for (const [k, v] of Object.entries(updates) as [FileName, unknown][]) {
        const cur = n[k];
        if (cur) n[k] = { ...cur, value: structuredClone(v) };
      }
      return n;
    });
    setLastSaved(new Date().toISOString());
  }, []);

  const importFile = useCallback((name: FileName, value: unknown, raw: string) => {
    setFiles((f) => ({ ...f, [name]: { value, raw } }));
    setExported((e) => ({ ...e, [name]: raw }));
  }, []);

  const markExported = useCallback((names: FileName[]) => {
    setExported((e) => {
      const n = { ...e };
      names.forEach((k) => { const f = files[k]; if (f) n[k] = serialize(f); });
      return n;
    });
  }, [files]);

  const value = useMemo<CmsState>(() => {
    const isDirty = (k: FileName) => !!files[k] && serialize(files[k]!) !== exported[k];
    return { files, lastSaved, save, importFile, markExported, isDirty, dirtyKeys: FILES.filter(isDirty) };
  }, [files, exported, lastSaved, save, importFile, markExported]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCms() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCms must be used inside CmsProvider");
  return c;
}
