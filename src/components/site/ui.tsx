import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/data/site";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="group inline-flex flex-col leading-none" aria-label="Fidoria Noodles & Chicken — home">
      <span className={cn("font-display text-2xl font-semibold italic tracking-tight md:text-3xl", light ? "text-cream" : "text-foreground")}>
        Fidoria<span className="text-primary">.</span>
      </span>
      <span className={cn("mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.35em]", light ? "text-gold" : "text-primary")}>
        Noodles &amp; Chicken
      </span>
    </Link>
  );
}

const btn = {
  primary: "bg-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:brightness-110",
  outlineLight: "border border-cream/40 text-cream hover:bg-cream hover:text-charcoal",
  outline: "border border-foreground/20 text-foreground hover:bg-foreground hover:text-background",
  disabled: "border border-dashed border-current/40 opacity-60 cursor-not-allowed",
};

export function ButtonLink({ to, href, variant = "primary", children, className }: { to?: string; href?: string; variant?: keyof typeof btn; children: ReactNode; className?: string }) {
  const cls = cn("inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-all duration-300", btn[variant], className);
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>;
  return <Link to={to ?? "/"} className={cls}>{children}</Link>;
}

export function Eyebrow({ children, light }: { children: ReactNode; light?: boolean | undefined }) {
  return (
    <p className={cn("mb-4 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em]", light ? "text-gold" : "text-primary")}>
      <span className="h-px w-8 bg-current" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeading({ eyebrow, title, intro, light, center }: { eyebrow: string; title: ReactNode; intro?: ReactNode; light?: boolean; center?: boolean }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2 className={cn("text-4xl font-medium leading-[1.05] md:text-5xl", light ? "text-cream" : "text-foreground")}>{title}</h2>
      {intro && <p className={cn("mt-5 text-lg leading-relaxed", light ? "text-cream-muted" : "text-muted-foreground")}>{intro}</p>}
    </div>
  );
}

export function PlaceholderTag({ children = "Placeholder" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary/60 bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-primary">
      {children}
    </span>
  );
}

export function MenuCard({ item }: { item: MenuItem }) {
  return (
    <article className="group overflow-hidden rounded-3xl bg-card shadow-soft transition-all duration-500 hover:-translate-y-1.5">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={item.image} alt={item.name.replace("Sample: ", "")} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute left-4 top-4"><span className="rounded-full bg-charcoal/80 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-gold backdrop-blur">Sample dish</span></div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-medium">{item.name}</h3>
          <span className="shrink-0 font-display text-lg text-primary">{item.price ?? "ETB —"}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      </div>
    </article>
  );
}

export function PageHero({ eyebrow, title, image, intro }: { eyebrow: string; title: string; image: string; intro?: string }) {
  return (
    <section className="relative flex min-h-[55vh] items-end overflow-hidden bg-charcoal pt-32 pb-16">
      <img src={image} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-fade-overlay" />
      <div className="relative mx-auto w-full max-w-7xl px-6 fade-up">
        <Eyebrow light>{eyebrow}</Eyebrow>
        <h1 className="max-w-3xl text-5xl font-medium leading-none text-cream md:text-7xl">{title}</h1>
        {intro && <p className="mt-5 max-w-xl text-lg text-cream-muted">{intro}</p>}
      </div>
    </section>
  );
}
