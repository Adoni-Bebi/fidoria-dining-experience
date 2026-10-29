import { createFileRoute } from "@tanstack/react-router";
import { images, site } from "@/data/site";
import { ButtonLink, PageHero, PlaceholderTag, SectionHeading } from "@/components/site/ui";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Fidoria Noodles & Chicken" },
      { name: "description", content: "Get to know Fidoria Noodles & Chicken, a noodle and chicken restaurant in Adama, Oromia." },
      { property: "og:title", content: "About Fidoria Noodles & Chicken" },
      { property: "og:description", content: "A noodle and chicken restaurant in Adama, Ethiopia." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero eyebrow="About us" title="Welcome to Fidoria" image={images.interior} />
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-2">
        <img src={images.wok} alt="Noodles tossed in a flaming wok" loading="lazy" width={1024} height={1280} className="aspect-[4/5] w-full rounded-3xl object-cover shadow-soft" />
        <div>
          <SectionHeading eyebrow="Our story" title={<>Noodles &amp; chicken in <em className="text-primary">Adama</em></>} />
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>{site.fullName} is a restaurant in {site.city}, focused on noodles and chicken.</p>
            <p className="rounded-2xl border border-dashed border-primary/50 bg-primary/5 p-5 text-base">
              <PlaceholderTag>Owner to write</PlaceholderTag><br />
              Share how Fidoria started, the people behind it, and what guests can expect. This text is intentionally left for the restaurant to provide.
            </p>
          </div>
          <div className="mt-9 flex flex-wrap gap-4">
            <ButtonLink to="/menu">Explore Our Menu</ButtonLink>
            <ButtonLink to="/contact" variant="outline">Find Us</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
