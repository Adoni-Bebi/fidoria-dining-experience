import { createFileRoute } from "@tanstack/react-router";
import { images } from "@/data/site";
import { useSuspenseQuery } from '@tanstack/react-query';
import { groupMeals, publicMenuOptions } from '@/lib/menu-query';
import { MenuCard, PageHero } from "@/components/site/ui";
import { DemoBanner } from "@/components/site/DemoBanner";

export const Route = createFileRoute("/menu")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publicMenuOptions),
  head: () => ({
    meta: [
      { title: "Menu — Fidoria Noodles & Chicken, Adama" },
      { name: "description", content: "Browse noodles, chicken dishes, rice and sides, and drinks at Fidoria in Adama." },
      { property: "og:title", content: "Menu — Fidoria Noodles & Chicken" },
      { property: "og:description", content: "Noodles, chicken, rice, sides and drinks in Adama." },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { data } = useSuspenseQuery(publicMenuOptions);
  const menu = groupMeals(data);
  return (
    <>
      <PageHero eyebrow="Our menu" title="Noodles, chicken & more" image={images.noodles} intro="Explore the menu. Items marked as samples are awaiting restaurant confirmation." />
      <DemoBanner />
      <nav aria-label="Menu categories" className="sticky top-[68px] z-30 border-b bg-background/95 backdrop-blur">
        <ul className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-4">
          {menu.map((c) => (
            <li key={c.id}><a href={`#${c.id}`} className="block whitespace-nowrap rounded-full border px-5 py-2 text-sm font-semibold transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground">{c.title}</a></li>
          ))}
        </ul>
      </nav>
      <div className="mx-auto max-w-7xl space-y-20 px-6 py-20">
        {!menu.length && <p className="text-muted-foreground">The menu is being updated. Please check back soon.</p>}
        {menu.map((c) => (
          <section key={c.id} id={c.id} className="scroll-mt-40">
            <h2 className="text-4xl font-medium md:text-5xl">{c.title}</h2>
            <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {c.items.map((item) => <MenuCard key={item.name} item={item} />)}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
