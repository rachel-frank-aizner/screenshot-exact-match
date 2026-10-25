import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, FileJson, Layers, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SECTIONS } from "@/lib/cms/schema";
import { useCms } from "@/lib/cms/store";
import { exportAll } from "@/lib/cms/actions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "לוח בקרה | SKILLZ Admin" },
      { name: "description", content: "לוח בקרה לניהול ויצוא תוכן אתר SKILLZ לקובצי JSON" },
      { property: "og:title", content: "לוח בקרה | SKILLZ Admin" },
      { property: "og:description", content: "לוח בקרה לניהול ויצוא תוכן אתר SKILLZ לקובצי JSON" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const cms = useCms();
  const totalItems = SECTIONS.reduce((n, s) => n + cms.data[s.key].items.length, 0);
  const stats = [
    { label: "קובצי JSON", value: SECTIONS.length, icon: FileJson },
    { label: "פריטי תוכן", value: totalItems, icon: Layers },
    { label: "שינויים שטרם יוצאו", value: cms.dirtyKeys.length, icon: PackageOpen },
    { label: "שמירה אחרונה", value: cms.lastSaved ? new Date(cms.lastSaved).toLocaleString("he-IL") : "—", icon: Clock },
  ];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black">שלום 👋</h1>
          <p className="text-muted-foreground">ניהול כל התכנים של אתר SKILLZ במקום אחד.</p>
        </div>
        <Button variant="accent" size="lg" onClick={() => exportAll(cms)}><PackageOpen /> Export All (ZIP)</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5 shadow-card">
            <s.icon className="size-5 text-primary" />
            <div className="mt-3 font-display text-2xl font-black">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
      <div>
        <h2 className="mb-3 font-display text-lg font-bold">קיצורי דרך</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <Link key={s.key} to={s.path} className="group flex items-center justify-between rounded-xl border bg-card p-4 shadow-card transition hover:border-primary">
              <div>
                <div className="font-bold">{s.title}</div>
                <div className="text-xs text-muted-foreground">{cms.data[s.key].items.length} פריטים {cms.isDirty(s.key) && "· שונה"}</div>
              </div>
              <ArrowLeft className="size-4 text-muted-foreground transition group-hover:-translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
