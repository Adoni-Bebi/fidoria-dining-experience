import { Link } from "@tanstack/react-router";
import { navLinks, site } from "@/data/site";
import { Logo } from "./ui";
import { SocialLinks } from "./SocialLinks";

export function SiteFooter() {
  return (
    <footer className="bg-charcoal text-cream-muted">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed">Noodles and chicken in {site.city}.</p>
          <div className="mt-6"><SocialLinks /></div>
        </div>
        <nav aria-label="Footer">
          <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.3em] text-gold">Explore</h2>
          <ul className="space-y-2.5 text-sm">
            {navLinks.map((l) => <li key={l.to}><Link to={l.to} className="transition-colors hover:text-cream">{l.label}</Link></li>)}
          </ul>
        </nav>
        <div>
          <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.3em] text-gold">Visit</h2>
          <ul className="space-y-2.5 text-sm">
            <li>{site.address ?? "Exact address — to be confirmed"}</li>
            <li>{site.city}</li>
            <li>{site.phone ?? "Phone — to be confirmed"}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {site.fullName}. All rights reserved.</p>
          <p className="text-cream-muted/70">Demonstration website — content pending owner approval.</p>
        </div>
      </div>
    </footer>
  );
}
