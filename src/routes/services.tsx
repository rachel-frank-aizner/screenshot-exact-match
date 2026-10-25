import { createFileRoute } from "@tanstack/react-router";
import { SectionEditor } from "@/components/cms/SectionEditor";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "עריכת שירותים | SKILLZ Admin" },
      { name: "description", content: "עריכת תוכן שירותים באתר SKILLZ" },
      { property: "og:title", content: "עריכת שירותים | SKILLZ Admin" },
      { property: "og:description", content: "עריכת תוכן שירותים באתר SKILLZ" },
    ],
  }),
  component: () => <SectionEditor key="services" sectionKey="services" />,
});
