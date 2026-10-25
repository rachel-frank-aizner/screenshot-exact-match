import { useEffect, useState, type ReactNode } from "react";
import { Download, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FileName } from "@/lib/cms/files";
import { useCms } from "@/lib/cms/store";
import { downloadFile } from "@/lib/cms/export";
import { ImportButton } from "./ImportButton";

export type Draft = Partial<Record<FileName, unknown>>;
export type SetDraft = (name: FileName, value: unknown) => void;

/** Page shell: holds an unsaved draft of the given files; Save commits, Export downloads in source format. */
export function FilesPage({ title, files, children }: { title: string; files: FileName[]; children: (d: Draft, set: SetDraft) => ReactNode }) {
  const cms = useCms();
  const current = () => Object.fromEntries(files.filter((n) => cms.files[n]).map((n) => [n, structuredClone(cms.files[n]!.value)])) as Draft;
  const [draft, setDraft] = useState<Draft>(current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setDraft(current()), [cms.files]);
  const set: SetDraft = (n, v) => setDraft((d) => ({ ...d, [n]: v }));
  const loaded = files.filter((n) => cms.files[n]);
  const missing = files.filter((n) => !cms.files[n]);
  const unsaved = loaded.some((n) => JSON.stringify(draft[n]) !== JSON.stringify(cms.files[n]!.value));

  const onSave = () => { cms.save(draft); toast.success("השינויים נשמרו בהצלחה"); };
  const onExport = () => {
    if (unsaved) cms.save(draft);
    loaded.forEach((n) => downloadFile({ ...cms.files[n]!, value: draft[n] }, n));
    setTimeout(() => cms.markExported(loaded), 0);
    toast.success(`${loaded.join(", ")} יוצאו בהצלחה`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground" dir="ltr">{files.join(" · ")}</p>
          <h1 className="font-display text-3xl font-black">{title}</h1>
          <div className="mt-2 flex gap-2">
            {unsaved && <Badge variant="destructive">יש שינויים שלא נשמרו</Badge>}
            {!unsaved && loaded.some(cms.isDirty) && <Badge variant="secondary">נשמר · טרם יוצא</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportButton />
          <Button variant="outline" onClick={onExport} disabled={!loaded.length}><Download /> Export JSON</Button>
          <Button variant="accent" onClick={onSave} disabled={!unsaved}><Save /> שמירה</Button>
        </div>
      </div>
      {missing.length > 0 && (
        <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
          חסרים קבצים: <span className="font-mono" dir="ltr">{missing.join(", ")}</span>. יש לייבא את קובצי המקור.
        </p>
      )}
      {children(draft, set)}
    </div>
  );
}
