import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { FileJson, Image, Info, LayoutDashboard, Layers, Menu, Phone, Sparkles, Briefcase, X } from "lucide-react";
import { useCms } from "@/lib/cms/store";

const NAV = [
  { to: "/", label: "לוח בקרה", icon: LayoutDashboard },
  { to: "/hero", label: "תוכן ראשי – Hero", icon: Sparkles },
  { to: "/about", label: "אודות", icon: Info },
  { to: "/activities", label: "תחומי פעילות", icon: Layers },
  { to: "/services", label: "שירותים", icon: Briefcase },
  { to: "/gallery", label: "פרויקטים וסרטונים", icon: Image },
  { to: "/contact", label: "יצירת קשר", icon: Phone },
  { to: "/json", label: "ניהול קובצי JSON", icon: FileJson },
] as const;

export function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { dirtyKeys } = useCms();
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-64 bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <div className="font-display text-2xl font-black tracking-tight">
            SKILLZ<span className="text-sidebar-primary">.</span>
            <span className="mr-2 align-middle text-xs font-medium opacity-60">Admin</span>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="סגור תפריט"><X className="size-5" /></button>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: true }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium opacity-80 transition hover:bg-sidebar-accent hover:opacity-100"
              activeProps={{ className: "!bg-sidebar-primary !text-sidebar-primary-foreground !opacity-100" }}
            >
              <n.icon className="size-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="absolute inset-x-3 bottom-4 rounded-lg bg-sidebar-accent p-3 text-xs">
          {dirtyKeys.length ? `${dirtyKeys.length} קבצים עם שינויים שלא יוצאו` : "כל השינויים יוצאו ✓"}
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-foreground/40 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="lg:mr-64">
        <header className="sticky top-0 z-20 flex h-14 items-center border-b bg-background/90 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="פתח תפריט"><Menu className="size-5" /></button>
          <span className="mr-3 font-display font-bold">SKILLZ Admin</span>
        </header>
        <main className="mx-auto max-w-5xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
