import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor } from "@/components/cms/SectionEditor";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "עריכת יצירת קשר | SKILLZ Admin" },
      { name: "description", content: "עריכת תוכן יצירת קשר באתר SKILLZ" },
      { property: "og:title", content: "עריכת יצירת קשר | SKILLZ Admin" },
      { property: "og:description", content: "עריכת תוכן יצירת קשר באתר SKILLZ" },
    ],
  }),
  component: () => <SectionEditor key="contact" sectionKey="contact" />,
});
