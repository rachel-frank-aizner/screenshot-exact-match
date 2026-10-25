import { useRef } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { SectionData, SectionDef } from "@/lib/cms/schema";
import { validateSectionJson } from "@/lib/cms/validate";

export function ImportButton({ def, onLoad, size = "default" }: { def: SectionDef; onLoad: (d: SectionData) => void; size?: "default" | "sm" }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="application/json,.json"
        className="hidden"
        data-testid={`import-${def.key}`}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          const res = validateSectionJson(await file.text(), def);
          if (!res.ok) return toast.error(`ייבוא נכשל: ${res.error}`);
          onLoad(res.data);
          toast.success(`${file.name} נטען בהצלחה`);
        }}
      />
      <Button variant="outline" size={size} onClick={() => ref.current?.click()}>
        <Upload /> Import
      </Button>
    </>
  );
}
