import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor } from "@/components/cms/SectionEditor";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "עריכת גלריה | SKILLZ Admin" },
      { name: "description", content: "עריכת תוכן גלריה באתר SKILLZ" },
      { property: "og:title", content: "עריכת גלריה | SKILLZ Admin" },
      { property: "og:description", content: "עריכת תוכן גלריה באתר SKILLZ" },
    ],
  }),
  component: () => <SectionEditor key="gallery" sectionKey="gallery" />,
});
