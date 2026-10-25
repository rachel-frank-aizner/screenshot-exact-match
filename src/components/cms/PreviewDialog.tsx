import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SectionData, SectionDef } from "@/lib/cms/schema";

export function PreviewDialog({ open, onOpenChange, def, data }: { open: boolean; onOpenChange: (o: boolean) => void; def: SectionDef; data: SectionData }) {
  const s = (k: string) => (typeof data[k] === "string" ? (data[k] as string) : "");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader><DialogTitle>תצוגה מקדימה – {def.title}</DialogTitle></DialogHeader>
        <section className="overflow-hidden rounded-xl bg-preview text-preview-foreground">
          {s("image") && <img src={s("image")} alt="" className="h-56 w-full object-cover" />}
          <div className="space-y-3 p-6">
            {s("siteName") && <div className="font-display text-sm font-bold text-primary">{s("siteName")}</div>}
            <h2 className="font-display text-3xl font-black">{s("title")}</h2>
            {(s("subtitle") || s("text")) && <p className="text-muted-foreground">{s("subtitle") || s("text")}</p>}
            {s("ctaText") && <a href={s("ctaLink")} target="_blank" rel="noreferrer" className="inline-block rounded-full bg-brand px-5 py-2 text-sm font-bold text-brand-foreground">{s("ctaText")}</a>}
            {s("email") && <p className="text-sm">{s("email")} · {s("phone")} · {s("address")}</p>}
            <div className="grid gap-4 pt-4 sm:grid-cols-2 md:grid-cols-3">
              {data.items.map((it) => (
                <div key={it.id} className="overflow-hidden rounded-lg border bg-card">
                  {it.image && <img src={it.image} alt="" className="aspect-video w-full object-cover" />}
                  <div className="p-3">
                    {it.value && <div className="font-display text-2xl font-black text-primary">{it.value}</div>}
                    <div className="font-bold">{it.title || it.label}</div>
                    {it.text && <p className="text-sm text-muted-foreground">{it.text}</p>}
                    {it.url && <a href={it.url} className="text-sm text-primary underline" dir="ltr">{it.url}</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
