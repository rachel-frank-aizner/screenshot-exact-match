import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor } from "@/components/cms/SectionEditor";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "עריכת תחומי פעילות | SKILLZ Admin" },
      { name: "description", content: "עריכת תוכן תחומי פעילות באתר SKILLZ" },
      { property: "og:title", content: "עריכת תחומי פעילות | SKILLZ Admin" },
      { property: "og:description", content: "עריכת תוכן תחומי פעילות באתר SKILLZ" },
    ],
  }),
  component: () => <SectionEditor key="activities" sectionKey="activities" />,
});
