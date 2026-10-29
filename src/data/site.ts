// ============================================================
// EDIT ME — all restaurant content lives here.
// Replace placeholder values (marked `null` or "To be confirmed")
// with verified details from the owner. Buttons for phone,
// WhatsApp, maps and socials activate automatically once filled.
// ============================================================
import noodles from "@/assets/noodles.jpg";
import chicken from "@/assets/chicken.jpg";
import rice from "@/assets/rice.jpg";
import drinks from "@/assets/drinks.jpg";
import wings from "@/assets/wings.jpg";
import hero from "@/assets/hero.jpg";
import wok from "@/assets/wok.jpg";
import interior from "@/assets/interior.jpg";

export const images = { noodles, chicken, rice, drinks, wings, hero, wok, interior };

export const site = {
  name: "Fidoria",
  fullName: "Fidoria Noodles & Chicken",
  city: "Adama, Oromia, Ethiopia",
  address: null as string | null, // e.g. "Street name, Kebele, Adama"
  phone: null as string | null, // e.g. "+251 9XX XXX XXX"
  whatsapp: null as string | null, // digits only, e.g. "2519XXXXXXXX"
  hours: null as { days: string; time: string }[] | null,
  // Verified Google Maps link to the restaurant pin. Until set, a general Adama search is used.
  mapsUrl: null as string | null,
  socials: {
    facebook: null as string | null,
    instagram: null as string | null,
    tiktok: null as string | null,
    telegram: null as string | null,
  },
};

export const fallbackMapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Fidoria+Noodles+%26+Chicken+Adama+Ethiopia";

export type MenuItem = { name: string; description: string; price: string | null; image: string };
export type MenuCategory = { id: string; title: string; items: MenuItem[] };

// SAMPLE MENU — placeholders only, not the restaurant's real dishes or prices.
export const menu: MenuCategory[] = [
  {
    id: "noodles",
    title: "Signature Noodles",
    items: [
      { name: "Sample: Spicy Stir-Fried Noodles", description: "Placeholder description — replace with the real dish details.", price: null, image: noodles },
      { name: "Sample: Chicken Noodle Bowl", description: "Placeholder description — replace with the real dish details.", price: null, image: hero },
    ],
  },
  {
    id: "chicken",
    title: "Chicken Dishes",
    items: [
      { name: "Sample: Crispy Fried Chicken", description: "Placeholder description — replace with the real dish details.", price: null, image: chicken },
      { name: "Sample: Glazed Chicken Wings", description: "Placeholder description — replace with the real dish details.", price: null, image: wings },
    ],
  },
  {
    id: "sides",
    title: "Rice & Sides",
    items: [
      { name: "Sample: Fried Rice with Chicken", description: "Placeholder description — replace with the real dish details.", price: null, image: rice },
    ],
  },
  {
    id: "drinks",
    title: "Drinks",
    items: [
      { name: "Sample: Fresh Juices", description: "Placeholder description — replace with the real drink details.", price: null, image: drinks },
    ],
  },
];

export const gallery = [
  { src: hero, alt: "Bowl of stir-fried noodles topped with crispy chicken and chili" },
  { src: noodles, alt: "Spicy noodles with greens, mushrooms and a soft egg" },
  { src: chicken, alt: "Golden fried chicken pieces with dipping sauce" },
  { src: wok, alt: "Chef tossing noodles in a flaming wok" },
  { src: wings, alt: "Glazed chicken wings sprinkled with sesame" },
  { src: rice, alt: "Fried rice with sliced grilled chicken and fries" },
  { src: drinks, alt: "Fresh orange juice and iced drinks with mint" },
  { src: interior, alt: "Warmly lit restaurant dining room" },
];

// "Why visit" — editable qualities for the owner to confirm.
export const highlights = [
  { title: "Noodles at the heart", text: "Placeholder — describe what makes Fidoria's noodles special (owner to confirm)." },
  { title: "Chicken, done right", text: "Placeholder — describe the chicken dishes and style (owner to confirm)." },
  { title: "A place to gather", text: "Placeholder — describe the dining atmosphere (owner to confirm)." },
  { title: "In the heart of Adama", text: "Placeholder — describe the location and how to find it (owner to confirm)." },
];

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About Us" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;
