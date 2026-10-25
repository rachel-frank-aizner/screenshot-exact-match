import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Code, Download, PackageOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImportButton } from "@/components/cms/ImportButton";
import { SECTIONS, type SectionDef } from "@/lib/cms/schema";
import { useCms } from "@/lib/cms/store";
import { downloadJson, toJson } from "@/lib/cms/export";
import { validateSectionJson } from "@/lib/cms/validate";
import { exportAll } from "./index";

export const Route = createFileRoute("/json")({
  head: () => ({
    meta: [
      { title: "ניהול קובצי JSON | SKILLZ Admin" },
      { name: "description", content: "ייבוא, ייצוא וצפייה בקובצי ה-JSON של אתר SKILLZ" },
      { property: "og:title", content: "ניהול קובצי JSON | SKILLZ Admin" },
      { property: "og:description", content: "ייבוא, ייצוא וצפייה בקובצי ה-JSON של אתר SKILLZ" },
    ],
  }),
  component: JsonManager,
});

function JsonManager() {
  const cms = useCms();
  const [editing, setEditing] = useState<SectionDef | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const open = (s: SectionDef) => { setEditing(s); setCode(toJson(cms.data[s.key])); setError(null); };
  const apply = () => {
    if (!editing) return;
    const r = validateSectionJson(code, editing);
    if (!r.ok) return setError(r.error);
    cms.save(editing.key, r.data);
    toast.success(`${editing.file} עודכן ונשמר`);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black">ניהול קובצי JSON</h1>
          <p className="text-muted-foreground" dir="rtl">כל הקבצים בתיקיית <span className="font-mono" dir="ltr">content/</span></p>
        </div>
        <Button variant="accent" onClick={() => exportAll(cms)}><PackageOpen /> Export All (ZIP)</Button>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שם הקובץ</TableHead>
              <TableHead className="text-right">כמות פריטים</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SECTIONS.map((s) => (
              <TableRow key={s.key}>
                <TableCell className="font-mono" dir="ltr">{s.file}</TableCell>
                <TableCell>{cms.data[s.key].items.length}</TableCell>
                <TableCell>{cms.isDirty(s.key) ? <Badge variant="destructive">שינויים שלא יוצאו</Badge> : <Badge variant="secondary">מעודכן</Badge>}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <ImportButton size="sm" def={s} onLoad={(d) => cms.save(s.key, d)} />
                    <Button size="sm" variant="outline" onClick={() => { downloadJson(cms.data[s.key], s.file); cms.markExported([s.key]); toast.success(`${s.file} יוצא בהצלחה`); }}><Download /> Export</Button>
                    <Button size="sm" variant="ghost" onClick={() => open(s)}><Code /> קוד</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent dir="rtl" className="max-w-3xl">
          <DialogHeader><DialogTitle className="font-mono" dir="ltr">{editing?.file}</DialogTitle></DialogHeader>
          <textarea
            dir="ltr"
            spellCheck={false}
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(null); }}
            className="h-[60vh] w-full resize-none rounded-lg border bg-sidebar p-4 font-mono text-xs leading-relaxed text-sidebar-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>סגירה</Button>
            <Button variant="accent" onClick={apply}>החלה ושמירה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
