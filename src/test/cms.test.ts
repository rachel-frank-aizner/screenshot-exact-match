import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { DEFAULT_CONTENT, getSection } from "@/lib/cms/schema";
import { validateSectionJson } from "@/lib/cms/validate";
import { buildZipArchive } from "@/lib/cms/export";

describe("CMS JSON", () => {
  it("accepts the bundled sample files", () => {
    for (const k of Object.keys(DEFAULT_CONTENT) as (keyof typeof DEFAULT_CONTENT)[]) {
      expect(validateSectionJson(JSON.stringify(DEFAULT_CONTENT[k]), getSection(k)).ok).toBe(true);
    }
  });
  it("rejects invalid JSON", () => {
    expect(validateSectionJson("{oops", getSection("about")).ok).toBe(false);
  });
  it("rejects items without an id", () => {
    const bad = { ...DEFAULT_CONTENT.about, items: [{ title: "a", text: "b" }] };
    expect(validateSectionJson(JSON.stringify(bad), getSection("about")).ok).toBe(false);
  });
  it("rejects duplicate ids", () => {
    const it0 = DEFAULT_CONTENT.gallery.items[0];
    const bad = { ...DEFAULT_CONTENT.gallery, items: [it0, it0] };
    expect(validateSectionJson(JSON.stringify(bad), getSection("gallery")).ok).toBe(false);
  });
  it("zip contains all six files", async () => {
    const zip = await JSZip.loadAsync(await buildZipArchive(DEFAULT_CONTENT).generateAsync({ type: "uint8array" }));
    const names = Object.keys(zip.files).filter((n) => n.endsWith(".json")).sort();
    expect(names).toEqual(["about", "activities", "contact", "gallery", "general", "services"].map((n) => `content/${n}.json`));
  });
});
