import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { addItem, linkedKeys, removeItem, type He, type Row } from "@/lib/cms/files";

function TextField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  const isMedia = /src$/i.test(label) || /(^|\.)(url|href)$/i.test(label);
  const long = value.length > 80 || value.includes("\n");
  return (
    <div className={`space-y-1.5 ${long ? "md:col-span-2" : ""}`}>
      <Label htmlFor={id} className="font-mono text-xs" dir="ltr">{label}</Label>
      {long ? (
        <Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={4} />
      ) : (
        <Input id={id} dir={isMedia ? "ltr" : "rtl"} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {/src$/i.test(label) && value && (
        <div className="mt-2 h-24 w-full max-w-xs overflow-hidden rounded-lg border bg-muted">
          <img src={value} alt={label} className="size-full object-contain" />
        </div>
      )}
    </div>
  );
}

/** Edits a subset of he.json keys in place; keys and order are never changed. */
export function HeFields({ he, match, onChange, title = "טקסטים" }: { he?: He; match: (k: string) => boolean; onChange: (he: He) => void; title?: string }) {
  if (!he) return null;
  const keys = Object.keys(he).filter(match);
  return (
    <section className="space-y-4 rounded-xl border bg-card p-5 shadow-card">
      <h2 className="font-display text-lg font-bold">{title} <span className="font-mono text-xs text-muted-foreground" dir="ltr">he.json</span></h2>
      {keys.length === 0 && <p className="text-sm text-muted-foreground">לא נמצאו מפתחות מתאימים בקובץ</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {keys.map((k) => <TextField key={k} id={`he-${k}`} label={k} value={he[k] ?? ""} onChange={(v) => onChange({ ...he, [k]: v })} />)}
      </div>
    </section>
  );
}

/** Edits an array file using only the keys already present on each item. Linked texts live in he.json. */
export function ArrayEditor({
  title, file, items, onChange, he, onHe, prefix, fallback,
}: {
  title: string; file: string; items?: Row[]; onChange: (a: Row[]) => void;
  he?: He; onHe?: (he: He) => void; prefix?: string; fallback?: string[];
}) {
  const [newId, setNewId] = useState("");
  const [toDelete, setToDelete] = useState<number | null>(null);
  if (!items) return null;
  const hasIds = items.length ? items.every((it) => "id" in it) : true;
  const linked = !!(prefix && he && onHe);

  const add = () => {
    let id: string | null = null;
    if (hasIds) {
      id = newId.trim();
      if (!id) { toast.error("יש להזין id לפריט החדש"); return; }
      if (items.some((it) => it["id"] === id)) { toast.error(`id "${id}" כבר קיים`); return; }
    }
    const r = addItem(items, id, linked ? he : undefined, prefix, fallback);
    onChange(r.arr);
    if (linked && r.he) onHe!(r.he);
    setNewId("");
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const a = [...items]; const t = a[i]!; a[i] = a[j]!; a[j] = t;
    onChange(a);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold">{title} <span className="text-muted-foreground">({items.length})</span> <span className="font-mono text-xs text-muted-foreground" dir="ltr">{file}</span></h2>
        <div className="flex gap-2">
          {hasIds && <Input dir="ltr" className="w-44" placeholder="id חדש" value={newId} onChange={(e) => setNewId(e.target.value)} aria-label="id לפריט חדש" />}
          <Button onClick={add}><Plus /> הוספת פריט</Button>
        </div>
      </div>
      {items.length === 0 && <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">אין פריטים</p>}
      {items.map((it, i) => {
        const id = it["id"] !== undefined ? String(it["id"]) : null;
        const heKeys = linked && id !== null ? linkedKeys(he!, prefix!, id) : [];
        return (
          <article key={id ?? i} className="rounded-xl border bg-card p-5 shadow-card" data-testid="item-card">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground" dir="ltr">#{i + 1}{id !== null && ` · ${id}`}</span>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label="הזז למעלה"><ArrowUp /></Button>
                <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="הזז למטה"><ArrowDown /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setToDelete(i)} aria-label="מחיקת פריט"><Trash2 /></Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {heKeys.map((k) => <TextField key={k} id={`he-${k}`} label={k} value={he![k] ?? ""} onChange={(v) => onHe!({ ...he!, [k]: v })} />)}
              {Object.entries(it).filter(([k, v]) => k !== "id" && (typeof v === "string" || typeof v === "number")).map(([k, v]) => (
                <TextField key={k} id={`${file}-${i}-${k}`} label={k} value={String(v)}
                  onChange={(nv) => onChange(items.map((x, j) => (j === i ? { ...x, [k]: typeof v === "number" && nv.trim() !== "" && !isNaN(+nv) ? +nv : nv } : x)))} />
              ))}
            </div>
          </article>
        );
      })}
      <AlertDialog open={toDelete !== null} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>למחוק את הפריט?</AlertDialogTitle>
            <AlertDialogDescription>הפריט יוסר{linked ? " יחד עם הטקסטים שלו ב-he.json" : ""}. השינוי ייכנס לתוקף לאחר שמירה.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                const r = removeItem(items, toDelete!, linked ? he : undefined, prefix);
                onChange(r.arr);
                if (linked && r.he) onHe!(r.he);
                setToDelete(null);
                toast.success("הפריט נמחק");
              }}
            >מחיקה</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
