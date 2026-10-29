import { MapPin, Phone, Clock, MessageCircle, Navigation } from "lucide-react";
import { fallbackMapsUrl, site } from "@/data/site";
import { PlaceholderTag } from "./ui";
import { SocialLinks } from "./SocialLinks";

export function ContactBlock() {
  const rows = [
    { Icon: MapPin, label: "Address", value: site.address, fallback: `Exact address in ${site.city}` },
    { Icon: Phone, label: "Phone", value: site.phone, fallback: "Phone number" },
    { Icon: Clock, label: "Opening hours", value: site.hours?.map((h) => `${h.days}: ${h.time}`).join(" · ") ?? null, fallback: "Opening hours" },
  ];
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-3xl bg-charcoal p-8 text-cream md:p-12">
        <ul className="space-y-7">
          {rows.map(({ Icon, label, value, fallback }) => (
            <li key={label} className="flex gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary"><Icon className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">{label}</p>
                {value ? <p className="mt-1 text-lg">{value}</p> : (
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-lg text-cream-muted">{fallback} <PlaceholderTag>To be confirmed</PlaceholderTag></p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          {site.phone && <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"><Phone className="h-4 w-4" /> Call us</a>}
          {site.whatsapp ? (
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold hover:bg-cream hover:text-charcoal"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-dashed border-cream/30 px-6 py-3 text-sm font-semibold opacity-60" title="Activates once the verified WhatsApp number is added"><MessageCircle className="h-4 w-4" /> WhatsApp — number pending</span>
          )}
        </div>
        <div className="mt-8"><SocialLinks /></div>
      </div>
      <div className="relative flex min-h-80 flex-col overflow-hidden rounded-3xl border bg-card shadow-soft">
        <iframe title="Map of Adama, Ethiopia" src="https://www.google.com/maps?q=Adama,Ethiopia&z=13&output=embed" className="h-full min-h-80 w-full flex-1 grayscale-[30%]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-sm text-muted-foreground">{site.mapsUrl ? "Get turn-by-turn directions." : <>Showing Adama city — <strong>exact pin to be confirmed</strong>.</>}</p>
          <a href={site.mapsUrl ?? fallbackMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><Navigation className="h-4 w-4" /> Get directions</a>
        </div>
      </div>
    </div>
  );
}
