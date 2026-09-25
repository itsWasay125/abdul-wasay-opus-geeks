/**
 * Single source of truth for Opus Geeks business facts.
 * Everything here is taken verbatim from opusgeeks.com — do not invent values.
 */

export const BRAND = {
  name: "Opus Geeks",
  legalName: "Opus Geeks",
  tagline:
    "We design exceptional brands, products, web apps, mobile apps and websites for startups and enterprises.",
  shortTagline: "Ideas into impact",
  url: "https://opusgeeks.com/",
  logo: "/logo.png",
  founded: 2018,
};

export const CONTACT = {
  email: "contact@opusgeeks.com",
  phone: "+1 (346) 690-4693",
  phoneHref: "tel:+13466904693",
};

/**
 * Offices. `tz` is an IANA zone used for the live clocks;
 * `coords` is [lon, lat] (GeoJSON order) for the globe.
 */
export const OFFICES = [
  {
    id: "fl",
    kind: "Headquarters",
    city: "Pembroke Pines",
    region: "Florida, USA",
    lines: ["8903 Pines Blvd 217 153", "Pembroke Pines, FL 33024", "United States"],
    tz: "America/New_York",
    coords: [-80.2237, 26.0128],
    label: "PEMBROKE PINES, FL",
    readout: "26.01°N 80.22°W",
    hours: [9, 18],
  },
  {
    id: "khi",
    kind: "Engineering Studio",
    city: "Karachi",
    region: "Sindh, Pakistan",
    lines: ["Block 22, Street Gulshan", "Karachi, Sindh", "Pakistan"],
    tz: "Asia/Karachi",
    coords: [67.0099, 24.8607],
    label: "KARACHI, PK",
    readout: "24.86°N 67.01°E",
    hours: [10, 19],
  },
];

export const SOCIALS = [
  { label: "LinkedIn", short: "LI", href: "https://www.linkedin.com/company/opusgeeks" },
  { label: "Facebook", short: "FB", href: "https://www.facebook.com/profile.php?id=100083553187361" },
  { label: "X", short: "X", href: "https://x.com/opusgeeks?s=21" },
];

/** Primary navigation — mirrors the live site's IA. */
/* Order as asked: Home, About, Services (whose own pages hang off it),
   Portfolio, Blogs, Contact. FAQs was not in that list but was not asked to be
   removed either, so it keeps its place before Contact. */
export const NAV = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services", mega: true },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Blogs", path: "/blogs" },
  { label: "FAQs", path: "/faqs" },
  { label: "Contact Us", path: "/contact-us" },
];

/**
 * The three flagship services, app work first - it is what most of the
 * inbound asks for, so it is what every list of them opens on.
 * `shot` is a real piece of client work from the portfolio — the menu shows
 * the thing itself rather than a stock icon.
 */
export const SERVICE_MENU = [
  {
    index: "01",
    label: "App Development",
    path: "/services/mobile-development",
    blurb: "iOS, Android and cross-platform releases with clean flows and stable ships.",
    stack: ["React Native", "Swift", "Kotlin"],
    shot: "/assets/portfolio/Group-1000008331.webp",
    shotAlt: "Restaurant Techs mobile application designed and built by Opus Geeks",
  },
  {
    index: "02",
    label: "Web Development",
    path: "/services/web-development",
    blurb: "Platforms, SaaS dashboards and commerce builds engineered for real traffic.",
    stack: ["Next.js", "React", "Node"],
    shot: "/assets/portfolio/Group-1000008350.png",
    shotAlt: "Healthcare platform built by Opus Geeks, shown on a laptop",
  },
  {
    index: "03",
    label: "UX / UI Design",
    path: "/services/ui-ux-design",
    blurb: "Research-led interfaces, design systems and prototypes that hold up in build.",
    stack: ["Figma", "Design systems", "Motion"],
    shot: "/assets/portfolio/Group-1000008327.webp",
    shotAlt: "V-Stream Aviation brand and interface design by Opus Geeks",
  },
];

export const FOOTER_SERVICES = [
  { label: "App Development", path: "/services/mobile-development" },
  { label: "Web Development", path: "/services/web-development" },
  { label: "UX / UI Design", path: "/services/ui-ux-design" },
  { label: "Game Development", path: "/services" },
  { label: "All capabilities", path: "/services" },
];

export const FOOTER_STUDIO = [
  { label: "Portfolio", path: "/portfolio" },
  { label: "About", path: "/about" },
  { label: "Blogs", path: "/blogs" },
  { label: "FAQs", path: "/faqs" },
  { label: "Contact", path: "/contact-us" },
];
