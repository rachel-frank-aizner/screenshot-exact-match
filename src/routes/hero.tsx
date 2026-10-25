import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor } from "@/components/cms/SectionEditor";

export const Route = createFileRoute("/hero")({
  head: () => ({
    meta: [
      { title: "עריכת Hero | SKILLZ Admin" },
      { name: "description", content: "עריכת תוכן Hero באתר SKILLZ" },
      { property: "og:title", content: "עריכת Hero | SKILLZ Admin" },
      { property: "og:description", content: "עריכת תוכן Hero באתר SKILLZ" },
    ],
  }),
  component: () => <SectionEditor key="general" sectionKey="general" />,
});
