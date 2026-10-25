import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor } from "@/components/cms/SectionEditor";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "עריכת אודות | SKILLZ Admin" },
      { name: "description", content: "עריכת תוכן אודות באתר SKILLZ" },
      { property: "og:title", content: "עריכת אודות | SKILLZ Admin" },
      { property: "og:description", content: "עריכת תוכן אודות באתר SKILLZ" },
    ],
  }),
  component: () => <SectionEditor key="about" sectionKey="about" />,
});
