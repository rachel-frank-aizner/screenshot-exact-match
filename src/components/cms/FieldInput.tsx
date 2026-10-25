import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FieldDef } from "@/lib/cms/schema";

export function FieldInput({ def, value, onChange, id }: { def: FieldDef; value: string; onChange: (v: string) => void; id: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{def.label}</Label>
      {def.type === "textarea" ? (
        <Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : (
        <Input
          id={id}
          dir={def.type === "text" ? "rtl" : "ltr"}
          value={value}
          placeholder={def.type === "image" ? "https://...jpg" : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {def.type === "image" && (
        <div className="mt-2 aspect-video w-full max-w-xs overflow-hidden rounded-lg border bg-muted">
          {value ? (
            <img src={value} alt={def.label} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">אין תמונה</div>
          )}
        </div>
      )}
    </div>
  );
}
