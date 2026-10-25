import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FileName } from "@/lib/cms/files";
import { useCms } from "@/lib/cms/store";
import { importFiles } from "@/lib/cms/actions";

/** Without `file`: multi-select of any source files or a ZIP. With `file`: replaces that one file. */
export function ImportButton({ file, size = "default", label = "Import" }: { file?: FileName; size?: "default" | "sm"; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const cms = useCms();
  return (
    <>
      <input
        ref={ref}
        type="file"
        multiple={!file}
        accept={file ? "application/json,.json" : "application/json,.json,.zip"}
        className="hidden"
        data-testid={`import-${file ?? "all"}`}
        onChange={async (e) => {
          const list = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (list.length) await importFiles(cms, list, file);
        }}
      />
      <Button variant="outline" size={size} onClick={() => ref.current?.click()}>
        <Upload /> {label}
      </Button>
    </>
  );
}
