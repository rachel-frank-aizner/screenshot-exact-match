import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_CONTENT, SECTIONS, type SectionData, type SectionKey } from "./schema";
import { toJson } from "./export";

type Snapshots = Record<SectionKey, string>;
type CmsState = {
  data: Record<SectionKey, SectionData>;
  lastSaved: string | null;
  save: (key: SectionKey, value: SectionData) => void;
  markExported: (keys: SectionKey[]) => void;
  isDirty: (key: SectionKey) => boolean;
  dirtyKeys: SectionKey[];
};

const Ctx = createContext<CmsState | null>(null);
const STORAGE = "skillz-cms-v1";
const snap = (d: Record<SectionKey, SectionData>) =>
  Object.fromEntries(SECTIONS.map((s) => [s.key, toJson(d[s.key])])) as Snapshots;

export function CmsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(DEFAULT_CONTENT);
  const [exported, setExported] = useState<Snapshots>(() => snap(DEFAULT_CONTENT));
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Browser-only working copy so a refresh doesn't lose edits. Nothing is sent anywhere.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.data) setData({ ...DEFAULT_CONTENT, ...p.data });
        if (p.exported) setExported((e) => ({ ...e, ...p.exported }));
        if (p.lastSaved) setLastSaved(p.lastSaved);
      }
    } catch { /* ignore corrupt cache */ }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE, JSON.stringify({ data, exported, lastSaved }));
  }, [data, exported, lastSaved, loaded]);

  const save = useCallback((key: SectionKey, value: SectionData) => {
    setData((d) => ({ ...d, [key]: structuredClone(value) }));
    setLastSaved(new Date().toISOString());
  }, []);

  const markExported = useCallback((keys: SectionKey[]) => {
    setExported((e) => {
      const n = { ...e };
      keys.forEach((k) => (n[k] = toJson(data[k])));
      return n;
    });
  }, [data]);

  const value = useMemo<CmsState>(() => {
    const isDirty = (k: SectionKey) => toJson(data[k]) !== exported[k];
    return { data, lastSaved, save, markExported, isDirty, dirtyKeys: SECTIONS.map((s) => s.key).filter(isDirty) };
  }, [data, exported, lastSaved, save, markExported]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCms() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCms must be used inside CmsProvider");
  return c;
}
