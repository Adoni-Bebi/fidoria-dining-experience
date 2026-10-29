import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/data/site";
import { ButtonLink, Logo } from "./ui";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled || open ? "bg-charcoal/95 py-3 shadow-soft backdrop-blur" : "py-6")}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6" aria-label="Main">
        <Logo light />
        <ul className="hidden items-center gap-9 lg:flex">
          {navLinks.map((l) => (
            <li key={l.to}>
              <Link to={l.to} activeOptions={{ exact: true }} className="relative text-sm font-medium text-cream/80 transition-colors hover:text-cream data-[status=active]:text-gold">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden lg:block"><ButtonLink to="/menu" className="px-6 py-3">Explore Our Menu</ButtonLink></div>
        <button type="button" className="rounded-full p-2 text-cream lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((o) => !o)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      <div id="mobile-nav" className={cn("overflow-hidden transition-[max-height] duration-500 lg:hidden", open ? "max-h-[28rem]" : "max-h-0")}>
        <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-6 pb-6 pt-4">
          {navLinks.map((l) => (
            <li key={l.to}>
              <Link to={l.to} activeOptions={{ exact: true }} className="block border-b border-cream/10 py-3 font-display text-2xl text-cream data-[status=active]:text-gold">{l.label}</Link>
            </li>
          ))}
          <li className="pt-4"><ButtonLink to="/menu" className="w-full">Explore Our Menu</ButtonLink></li>
        </ul>
      </div>
    </header>
  );
}
