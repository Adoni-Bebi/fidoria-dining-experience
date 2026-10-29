import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { gallery, highlights, images, menu, site } from "@/data/site";
import { ButtonLink, Eyebrow, MenuCard, PlaceholderTag, SectionHeading } from "@/components/site/ui";
import { ContactBlock } from "@/components/site/ContactBlock";
import { DemoBanner } from "@/components/site/DemoBanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fidoria Noodles & Chicken — Adama, Ethiopia" },
      { name: "description", content: "Fidoria Noodles & Chicken in Adama, Oromia. Explore our noodles, chicken dishes, sides and drinks." },
      { property: "og:title", content: "Fidoria Noodles & Chicken — Adama" },
      { property: "og:description", content: "Noodles and chicken in Adama, Oromia, Ethiopia." },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = menu.map((c) => ({ category: c.title, item: c.items[0] }));
  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-charcoal">
        <img src={images.hero} alt="Stir-fried noodles topped with crispy chicken, chili and spring onions" width={1920} height={1280} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pt-28 pb-20">
          <div className="max-w-2xl fade-up">
            <Eyebrow light>Adama · Oromia · Ethiopia</Eyebrow>
            <h1 className="text-6xl font-medium leading-[0.95] text-cream sm:text-7xl lg:text-8xl">
              Good Food.<br /><em className="text-gold">Great Moments.</em>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-cream-muted">
              Welcome to {site.fullName} — a home for noodles and chicken in the heart of Adama.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink to="/menu">Explore Our Menu <ArrowRight className="h-4 w-4" /></ButtonLink>
              <ButtonLink to="/contact" variant="outlineLight">Find Us</ButtonLink>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.4em] text-cream/50 md:block">Scroll</div>
      </section>

      <DemoBanner />

      {/* FEATURED MENU */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading eyebrow="Featured menu" title={<>A taste of <em className="text-primary">Fidoria</em></>} intro="A preview across our four categories. Dishes and prices shown are samples until confirmed by the restaurant." />
          <ButtonLink to="/menu" variant="outline" className="self-start md:self-auto">View Full Menu <ArrowRight className="h-4 w-4" /></ButtonLink>
        </div>
        <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map(({ category, item }) => (
            <div key={category}>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">{category}</p>
              <MenuCard item={item} />
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-secondary/60">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 md:py-32 lg:grid-cols-2">
          <div className="relative">
            <img src={images.wok} alt="Noodles being tossed in a flaming wok" loading="lazy" width={1024} height={1280} className="aspect-[4/5] w-full rounded-3xl object-cover shadow-soft" />
            <img src={images.chicken} alt="Crispy fried chicken" loading="lazy" width={1024} height={1024} className="absolute -bottom-10 -right-4 hidden w-48 rounded-3xl border-8 border-background object-cover shadow-soft sm:block md:w-60" />
          </div>
          <div>
            <SectionHeading eyebrow="About us" title={<>Noodles &amp; chicken, <em className="text-primary">made for sharing</em></>} />
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>{site.fullName} serves noodles and chicken in {site.city}.</p>
              <p className="flex flex-wrap items-center gap-2">Our story, kitchen and what makes us special will appear here. <PlaceholderTag>Owner to write</PlaceholderTag></p>
            </div>
            <div className="mt-9"><ButtonLink to="/about" variant="outline">More about us</ButtonLink></div>
          </div>
        </div>
      </section>

      {/* WHY VISIT */}
      <section className="relative overflow-hidden bg-charcoal py-24 md:py-32">
        <img src={images.interior} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionHeading light center eyebrow="Why visit Fidoria" title={<>Reasons to <em className="text-gold">pull up a chair</em></>} intro="Editable highlights — the owner can confirm or rewrite each one." />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((h, i) => (
              <div key={h.title} className="rounded-3xl border border-cream/10 bg-charcoal-soft/70 p-8 backdrop-blur transition-colors hover:border-primary/50">
                <span className="font-display text-4xl italic text-primary">0{i + 1}</span>
                <h3 className="mt-5 text-2xl text-cream">{h.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream-muted">{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading eyebrow="Gallery" title="From our kitchen" intro="Sample photography — to be replaced with restaurant-approved photos." />
          <ButtonLink to="/gallery" variant="outline" className="self-start md:self-auto">See gallery</ButtonLink>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          {gallery.slice(0, 4).map((g, i) => (
            <div key={g.alt} className={`group overflow-hidden rounded-3xl ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
              <img src={g.src} alt={g.alt} loading="lazy" className="aspect-square h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="bg-secondary/60 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow="Location & contact" title={<>Find us in <em className="text-primary">Adama</em></>} intro="Details marked “to be confirmed” will be added once verified by the owner." />
          <div className="mt-14"><ContactBlock /></div>
        </div>
      </section>
    </>
  );
}
