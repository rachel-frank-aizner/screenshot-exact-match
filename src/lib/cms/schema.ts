import general from "@/content/general.json";
import about from "@/content/about.json";
import activities from "@/content/activities.json";
import services from "@/content/services.json";
import gallery from "@/content/gallery.json";
import contact from "@/content/contact.json";

export type FieldType = "text" | "textarea" | "image" | "url";
export type FieldDef = { key: string; label: string; type: FieldType };
export type Item = { id: string; title?: string; text?: string; image?: string; value?: string; label?: string; url?: string; [key: string]: string | undefined };
export type SectionData = { items: Item[]; [key: string]: string | Item[] };

export type SectionKey = "general" | "about" | "activities" | "services" | "gallery" | "contact";

export type SectionDef = {
  key: SectionKey;
  file: string;
  title: string;
  path: string;
  fields: FieldDef[];
  itemsLabel: string;
  itemFields: FieldDef[];
  idPrefix: string;
};

export const SECTIONS: SectionDef[] = [
  {
    key: "general", file: "general.json", title: "תוכן ראשי – Hero", path: "/hero", idPrefix: "stat",
    fields: [
      { key: "siteName", label: "שם האתר", type: "text" },
      { key: "title", label: "כותרת ראשית", type: "text" },
      { key: "subtitle", label: "תת-כותרת", type: "textarea" },
      { key: "ctaText", label: "טקסט כפתור", type: "text" },
      { key: "ctaLink", label: "קישור כפתור", type: "url" },
      { key: "image", label: "תמונת רקע", type: "image" },
    ],
    itemsLabel: "נתונים מספריים",
    itemFields: [
      { key: "value", label: "ערך", type: "text" },
      { key: "label", label: "תיאור", type: "text" },
    ],
  },
  {
    key: "about", file: "about.json", title: "אודות", path: "/about", idPrefix: "value",
    fields: [
      { key: "title", label: "כותרת", type: "text" },
      { key: "text", label: "טקסט", type: "textarea" },
      { key: "image", label: "תמונה", type: "image" },
    ],
    itemsLabel: "ערכים",
    itemFields: [
      { key: "title", label: "כותרת", type: "text" },
      { key: "text", label: "טקסט", type: "textarea" },
    ],
  },
  {
    key: "activities", file: "activities.json", title: "תחומי פעילות", path: "/activities", idPrefix: "act",
    fields: [
      { key: "title", label: "כותרת", type: "text" },
      { key: "subtitle", label: "תת-כותרת", type: "text" },
    ],
    itemsLabel: "תחומים",
    itemFields: [
      { key: "title", label: "כותרת", type: "text" },
      { key: "text", label: "תיאור", type: "textarea" },
      { key: "image", label: "תמונה", type: "image" },
    ],
  },
  {
    key: "services", file: "services.json", title: "שירותים", path: "/services", idPrefix: "srv",
    fields: [
      { key: "title", label: "כותרת", type: "text" },
      { key: "subtitle", label: "תת-כותרת", type: "text" },
    ],
    itemsLabel: "שירותים",
    itemFields: [
      { key: "title", label: "כותרת", type: "text" },
      { key: "text", label: "תיאור", type: "textarea" },
      { key: "image", label: "תמונה", type: "image" },
    ],
  },
  {
    key: "gallery", file: "gallery.json", title: "גלריית תמונות", path: "/gallery", idPrefix: "img",
    fields: [{ key: "title", label: "כותרת", type: "text" }],
    itemsLabel: "תמונות",
    itemFields: [
      { key: "title", label: "כיתוב", type: "text" },
      { key: "image", label: "תמונה", type: "image" },
    ],
  },
  {
    key: "contact", file: "contact.json", title: "יצירת קשר", path: "/contact", idPrefix: "soc",
    fields: [
      { key: "title", label: "כותרת", type: "text" },
      { key: "text", label: "טקסט", type: "textarea" },
      { key: "email", label: "אימייל", type: "text" },
      { key: "phone", label: "טלפון", type: "text" },
      { key: "address", label: "כתובת", type: "text" },
    ],
    itemsLabel: "רשתות חברתיות",
    itemFields: [
      { key: "title", label: "שם", type: "text" },
      { key: "url", label: "קישור", type: "url" },
    ],
  },
];

export const getSection = (key: SectionKey) => SECTIONS.find((s) => s.key === key)!;

export const DEFAULT_CONTENT: Record<SectionKey, SectionData> = {
  general, about, activities, services, gallery, contact,
} as unknown as Record<SectionKey, SectionData>;

export function newItem(def: SectionDef): Item {
  const item: Item = { id: `${def.idPrefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}` };
  def.itemFields.forEach((f) => (item[f.key] = ""));
  return item;
}
