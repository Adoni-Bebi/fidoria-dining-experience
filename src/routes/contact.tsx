import { createFileRoute } from "@tanstack/react-router";
import { images } from "@/data/site";
import { PageHero } from "@/components/site/ui";
import { ContactBlock } from "@/components/site/ContactBlock";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Location — Fidoria Noodles & Chicken, Adama" },
      { name: "description", content: "Find Fidoria Noodles & Chicken in Adama, Oromia, Ethiopia — directions, phone and opening hours." },
      { property: "og:title", content: "Visit Fidoria in Adama" },
      { property: "og:description", content: "Directions and contact details for Fidoria Noodles & Chicken." },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Come hungry. Find us in Adama." image={images.rice} />
      <section className="mx-auto max-w-7xl px-6 py-20"><ContactBlock /></section>
    </>
  );
}
