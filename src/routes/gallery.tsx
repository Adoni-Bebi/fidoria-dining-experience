import { createFileRoute } from "@tanstack/react-router";
import { gallery, images } from "@/data/site";
import { PageHero } from "@/components/site/ui";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Fidoria Noodles & Chicken" },
      { name: "description", content: "Photos of noodles, chicken, sides and drinks from Fidoria in Adama." },
      { property: "og:title", content: "Gallery — Fidoria Noodles & Chicken" },
      { property: "og:description", content: "Noodles, chicken, sides and drinks — in pictures." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <>
      <PageHero eyebrow="Gallery" title="From our kitchen" image={images.wings} intro="Sample photography — to be replaced with restaurant-approved photos." />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {gallery.map((g) => (
            <li key={g.alt} className="group relative overflow-hidden rounded-3xl">
              <img src={g.src} alt={g.alt} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-end bg-fade-overlay p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <p className="text-sm text-cream">{g.alt}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
