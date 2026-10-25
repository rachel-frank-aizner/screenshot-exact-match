import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Download, Eye, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getSection, newItem, type SectionData, type SectionKey } from "@/lib/cms/schema";
import { useCms } from "@/lib/cms/store";
import { downloadJson, toJson } from "@/lib/cms/export";
import { FieldInput } from "./FieldInput";
import { PreviewDialog } from "./PreviewDialog";
import { ImportButton } from "./ImportButton";

export function SectionEditor({ sectionKey }: { sectionKey: SectionKey }) {
  const def = getSection(sectionKey);
  const { data, save, markExported, isDirty } = useCms();
  const [draft, setDraft] = useState<SectionData>(() => structuredClone(data[sectionKey]));
  const [preview, setPreview] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  useEffect(() => setDraft(structuredClone(data[sectionKey])), [data, sectionKey]);
  const unsaved = toJson(draft) !== toJson(data[sectionKey]);

  const setField = (k: string, v: string) => setDraft((d) => ({ ...d, [k]: v }));
  const setItem = (id: string, k: string, v: string) =>
    setDraft((d) => ({ ...d, items: d.items.map((it) => (it.id === id ? { ...it, [k]: v } : it)) }));
  const move = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      const items = [...d.items];
      const j = i + dir;
      if (j < 0 || j >= items.length) return d;
      [items[i], items[j]] = [items[j], items[i]];
      return { ...d, items };
    });

  const onSave = () => { save(sectionKey, draft); toast.success("השינויים נשמרו בהצלחה"); };
  const onExport = () => {
    if (unsaved) save(sectionKey, draft);
    downloadJson(draft, def.file);
    markExported([sectionKey]);
    toast.success(`${def.file} יוצא בהצלחה`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground" dir="ltr">content/{def.file}</p>
          <h1 className="font-display text-3xl font-black">{def.title}</h1>
          <div className="mt-2 flex gap-2">
            {unsaved && <Badge variant="destructive">יש שינויים שלא נשמרו</Badge>}
            {!unsaved && isDirty(sectionKey) && <Badge variant="secondary">נשמר · טרם יוצא</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPreview(true)}><Eye /> Preview</Button>
          <ImportButton def={def} onLoad={(d) => setDraft(d)} />
          <Button variant="outline" onClick={onExport}><Download /> Export JSON</Button>
          <Button variant="accent" onClick={onSave} disabled={!unsaved}><Save /> שמירה</Button>
        </div>
      </div>

      <section className="space-y-4 rounded-xl border bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-bold">תוכן כללי</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {def.fields.map((f) => (
            <div key={f.key} className={f.type === "textarea" || f.type === "image" ? "md:col-span-2" : ""}>
              <FieldInput id={`f-${f.key}`} def={f} value={(draft[f.key] as string) ?? ""} onChange={(v) => setField(f.key, v)} />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{def.itemsLabel} <span className="text-muted-foreground">({draft.items.length})</span></h2>
          <Button onClick={() => setDraft((d) => ({ ...d, items: [...d.items, newItem(def)] }))}><Plus /> הוספת פריט</Button>
        </div>
        {draft.items.length === 0 && <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">אין פריטים עדיין</p>}
        {draft.items.map((it, i) => (
          <article key={it.id} className="rounded-xl border bg-card p-5 shadow-card" data-testid="item-card">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground" dir="ltr">#{i + 1} · {it.id}</span>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label="הזז למעלה"><ArrowUp /></Button>
                <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === draft.items.length - 1} aria-label="הזז למטה"><ArrowDown /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setToDelete(it.id)} aria-label="מחיקת פריט"><Trash2 /></Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {def.itemFields.map((f) => (
                <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                  <FieldInput id={`${it.id}-${f.key}`} def={f} value={it[f.key] ?? ""} onChange={(v) => setItem(it.id, f.key, v)} />
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <PreviewDialog open={preview} onOpenChange={setPreview} def={def} data={draft} />
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>למחוק את הפריט?</AlertDialogTitle>
            <AlertDialogDescription>הפריט יוסר מהרשימה. השינוי ייכנס לתוקף לאחר שמירה.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { setDraft((d) => ({ ...d, items: d.items.filter((x) => x.id !== toDelete) })); setToDelete(null); toast.success("הפריט נמחק"); }}
            >מחיקה</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
