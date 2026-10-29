import { Facebook, Instagram, Send, Music2 } from "lucide-react";
import { site } from "@/data/site";

const items = [
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "tiktok", label: "TikTok", Icon: Music2 },
  { key: "telegram", label: "Telegram", Icon: Send },
] as const;

export function SocialLinks() {
  return (
    <ul className="flex gap-3">
      {items.map(({ key, label, Icon }) => {
        const url = site.socials[key];
        const cls = "flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream transition-all";
        return (
          <li key={key}>
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className={`${cls} hover:border-primary hover:bg-primary`}><Icon className="h-4 w-4" /></a>
            ) : (
              <span title={`${label} account to be confirmed`} aria-label={`${label} — account to be confirmed`} className={`${cls} cursor-not-allowed opacity-40`}><Icon className="h-4 w-4" /></span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
