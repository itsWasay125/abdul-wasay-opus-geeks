/* Sector expertise shown on the homepage industries console.
   Metrics are positioning claims - swap them for verified client numbers. */
const U = "https://images.unsplash.com/";
const img = (id, w) => `${U}${id}?auto=format&fit=crop&w=${w}&q=72`;

export const industries = [
  {
    name: "Real Estate",
    icon: "building-2",
    color: "#a78bfa",
    focus: "Connected property journeys",
    description:
      "Search, viewings, offers, and portfolio operations joined into one journey - so buyers move faster and agents stop stitching five tools together.",
    signals: [
      { icon: "layout-dashboard", title: "Property portals", text: "MLS and feed-synced listings with map, filter, and saved-search behaviour." },
      { icon: "users", title: "Agent CRM & lead routing", text: "Every enquiry scored, assigned, and followed up before it goes cold." },
      { icon: "app-window", title: "Owner & tenant portals", text: "Documents, payments, and maintenance requests behind one login." },
    ],
    stats: [
      { value: "3x", label: "faster property discovery" },
      { value: "-46%", label: "manual admin per deal" },
    ],
    stack: [
      { name: "Next.js", logo: "/assets/tech/nextjs.svg" },
      { name: "React", logo: "/assets/tech/react.svg" },
      { name: "MongoDB", logo: "/assets/tech/mongodb.svg" },
      { name: "AWS", logo: "/assets/tech/aws.svg" },
    ],
    image: img("photo-1486406146926-c627a92ad1ab", 1280),
    imageAlt: "Glass office towers viewed from the ground",
    inset: img("photo-1512917774080-9991f1c4c750", 640),
    insetAlt: "Modern luxury home with a pool",
    insetCaption: "Listing detail experience",
    work: { client: "PSBC Steel Buildings", type: "Property build & construction", image: "/assets/work/psbc-steel.webp" },
  },
  {
    name: "Fintech",
    icon: "landmark",
    color: "#38bdf8",
    focus: "Trusted financial experiences",
    description:
      "Onboarding, payments, and reporting engineered around the parts users never see: uptime, audit trails, and controls that survive review.",
    signals: [
      { icon: "credit-card", title: "Payments & wallets", text: "Card, bank, and payout flows with retries, reconciliation, and clear receipts." },
      { icon: "fingerprint", title: "KYC & fraud controls", text: "Identity, limits, and risk rules built in from the first release." },
      { icon: "gauge", title: "Live reporting", text: "Balances, ledgers, and exports a finance team can actually trust." },
    ],
    stats: [
      { value: "99.99%", label: "transaction uptime target" },
      { value: "SOC 2", label: "aligned delivery process" },
    ],
    stack: [
      { name: "React", logo: "/assets/tech/react.svg" },
      { name: "Node.js", logo: "/assets/tech/nodejs.svg" },
      { name: "Stripe", logo: "/assets/tech/stripe.svg" },
      { name: "AWS", logo: "/assets/tech/aws.svg" },
    ],
    image: img("photo-1563013544-824ae1b704d3", 1280),
    imageAlt: "Person paying online with a card and laptop",
    inset: img("photo-1611974789855-9c2a0a7236a3", 640),
    insetAlt: "Financial market chart on a dark screen",
    insetCaption: "Realtime ledger dashboards",
    work: { client: "Receipt Rewards", type: "Scan & earn rewards app", image: "/assets/work/receipt-app.webp" },
  },
  {
    name: "Healthcare",
    icon: "heart-pulse",
    color: "#22d3ee",
    focus: "Human-centered care systems",
    description:
      "Clinical workflows, patient portals, and connected records that stay accessible under pressure and auditable after the fact.",
    signals: [
      { icon: "calendar-days", title: "Patient portals & scheduling", text: "Booking, reminders, intake forms, and results without the phone tag." },
      { icon: "message-circle", title: "Telehealth & care journeys", text: "Consults, follow-ups, and care plans that keep their context intact." },
      { icon: "shield-check", title: "HIPAA-aware engineering", text: "Access control, encryption, and audit logging designed in, not bolted on." },
    ],
    stats: [
      { value: "40%", label: "faster care workflows" },
      { value: "24/7", label: "patient access built in" },
    ],
    stack: [
      { name: "React", logo: "/assets/tech/react.svg" },
      { name: "TypeScript", logo: "/assets/tech/typescript.svg" },
      { name: "Node.js", logo: "/assets/tech/nodejs.svg" },
      { name: "AWS", logo: "/assets/tech/aws.svg" },
    ],
    image: img("photo-1576091160399-112ba8d25d1d", 1280),
    imageAlt: "Clinician using a phone in a medical setting",
    inset: img("photo-1631217868264-e5b90bb7e133", 640),
    insetAlt: "Doctor talking with a patient",
    insetCaption: "Care team workspace",
    work: { client: "InTouch Medical Consult", type: "Care consultation platform", image: "/assets/work/intouch-medical.webp" },
  },
  {
    name: "eCommerce",
    icon: "shopping-bag",
    color: "#818cf8",
    focus: "Commerce built to convert",
    description:
      "Storefront, checkout, and back office tuned together, so discovery turns into orders and orders turn into repeat customers.",
    signals: [
      { icon: "package", title: "Headless storefronts", text: "Fast catalogue, search, and merchandising that survives a traffic spike." },
      { icon: "credit-card", title: "Checkout optimisation", text: "Fewer steps, more payment methods, measurably less drop-off." },
      { icon: "truck", title: "Inventory & fulfilment", text: "Stock, orders, and shipping synced across every channel you sell on." },
    ],
    stats: [
      { value: "2.4x", label: "higher conversion potential" },
      { value: "<1.5s", label: "storefront load budget" },
    ],
    stack: [
      { name: "Shopify", logo: "/assets/tech/shopify.svg" },
      { name: "Next.js", logo: "/assets/tech/nextjs.svg" },
      { name: "Stripe", logo: "/assets/tech/stripe.svg" },
      { name: "Vercel", logo: "/assets/tech/vercel.svg" },
    ],
    image: img("photo-1441986300917-64674bd600d8", 1280),
    imageAlt: "Interior of a modern retail boutique",
    inset: img("photo-1556742049-0cfed4f6a45d", 640),
    insetAlt: "Customer paying at a store counter",
    insetCaption: "Checkout and POS flows",
    work: { client: "Talouwa", type: "Beauty & hair commerce", image: "/assets/work/talouwa.webp" },
  },
  {
    name: "Food & Restaurant",
    icon: "utensils-crossed",
    color: "#fbbf24",
    focus: "Ordering that never drops",
    description:
      "Menus, ordering, delivery, and loyalty connected end to end - from a single kitchen to a multi-location group on one dashboard.",
    signals: [
      { icon: "app-window", title: "Online ordering & menus", text: "Live menus, modifiers, and pickup or delivery in a few taps." },
      { icon: "map-pin", title: "Delivery & driver tracking", text: "Dispatch, live ETAs, and proof of delivery customers can watch." },
      { icon: "star", title: "Loyalty & repeat orders", text: "Offers, reorder flows, and reviews that bring guests back." },
    ],
    stats: [
      { value: "+30%", label: "average order value lift" },
      { value: "2x", label: "repeat order rate" },
    ],
    stack: [
      { name: "Flutter", logo: "/assets/tech/flutter.svg" },
      { name: "Firebase", logo: "/assets/tech/firebase.svg" },
      { name: "Node.js", logo: "/assets/tech/nodejs.svg" },
      { name: "Stripe", logo: "/assets/tech/stripe.svg" },
    ],
    image: img("photo-1517248135467-4c7edcad34c4", 1280),
    imageAlt: "Warmly lit restaurant dining room",
    inset: img("photo-1504674900247-0877df9cc836", 640),
    insetAlt: "Plated dishes shot from above",
    insetCaption: "Menu and ordering app",
    work: { client: "Raw Omakase DC", type: "Restaurant & reservations", image: "/assets/work/raw-omakase.webp" },
  },
  {
    name: "Travel & Hospitality",
    icon: "plane",
    color: "#2dd4bf",
    focus: "Booking journeys that flow",
    description:
      "Search, availability, and booking engines that stay fast under demand and stay calm when plans change mid-trip.",
    signals: [
      { icon: "calendar-days", title: "Booking engines", text: "Availability, pricing, and reservations that never double-book." },
      { icon: "git-branch", title: "Supplier integrations", text: "Channel managers, GDS, and payment partners wired into one flow." },
      { icon: "smartphone", title: "Guest & trip apps", text: "Itineraries, check-in, and upsells in the traveller's pocket." },
    ],
    stats: [
      { value: "-60%", label: "booking drop-off" },
      { value: "24/7", label: "availability under load" },
    ],
    stack: [
      { name: "Next.js", logo: "/assets/tech/nextjs.svg" },
      { name: "Node.js", logo: "/assets/tech/nodejs.svg" },
      { name: "MongoDB", logo: "/assets/tech/mongodb.svg" },
      { name: "Vercel", logo: "/assets/tech/vercel.svg" },
    ],
    image: img("photo-1506929562872-bb421503ef21", 1280),
    imageAlt: "Aerial view of a turquoise coastline with boats",
    inset: img("photo-1488646953014-85cb44e25828", 640),
    insetAlt: "Travel planning flat lay with a map and camera",
    insetCaption: "Trip planning experience",
    work: { client: "Destinations To Explore", type: "Travel booking experience", image: "/assets/work/destinations-to-explore.webp" },
  },
  {
    name: "Education",
    icon: "graduation-cap",
    color: "#60a5fa",
    focus: "Learning that keeps attention",
    description:
      "Courses, cohorts, and assessments built to hold attention and give teams real visibility on who is actually progressing.",
    signals: [
      { icon: "layout-dashboard", title: "LMS & course platforms", text: "Curriculum, cohorts, and certificates in one structured system." },
      { icon: "users", title: "Live classes & assessment", text: "Sessions, submissions, and grading that scale past the pilot." },
      { icon: "gauge", title: "Progress analytics", text: "Completion, drop-off, and outcome reporting leaders can act on." },
    ],
    stats: [
      { value: "3x", label: "course completion lift" },
      { value: "10k+", label: "concurrent learners" },
    ],
    stack: [
      { name: "React", logo: "/assets/tech/react.svg" },
      { name: "Node.js", logo: "/assets/tech/nodejs.svg" },
      { name: "Firebase", logo: "/assets/tech/firebase.svg" },
      { name: "AWS", logo: "/assets/tech/aws.svg" },
    ],
    image: img("photo-1522202176988-66273c2fd55f", 1280),
    imageAlt: "Students collaborating around laptops",
    inset: img("photo-1523240795612-9a054b0db644", 640),
    insetAlt: "People studying together in a library",
    insetCaption: "Cohort learning dashboard",
    work: null,
  },
  {
    name: "Logistics",
    icon: "truck",
    color: "#34d399",
    focus: "Fleets that run on data",
    description:
      "Dispatch, tracking, and proof of delivery in one operational picture that drivers, dispatchers, and customers all trust.",
    signals: [
      { icon: "map-pin", title: "Live tracking & dispatch", text: "Jobs, routes, and driver status on one real-time board." },
      { icon: "compass", title: "Route optimisation", text: "Smarter sequencing that cuts fuel, idle time, and missed windows." },
      { icon: "package", title: "Warehouse & inventory sync", text: "Stock, scans, and proof of delivery flowing straight into your ERP." },
    ],
    stats: [
      { value: "-28%", label: "cost per delivery" },
      { value: "Live", label: "GPS visibility end to end" },
    ],
    stack: [
      { name: "Flutter", logo: "/assets/tech/flutter.svg" },
      { name: "Node.js", logo: "/assets/tech/nodejs.svg" },
      { name: "MongoDB", logo: "/assets/tech/mongodb.svg" },
      { name: "AWS", logo: "/assets/tech/aws.svg" },
    ],
    image: img("photo-1601584115197-04ecc0da31d7", 1280),
    imageAlt: "Freight truck on an open highway",
    inset: img("photo-1553413077-190dd305871c", 640),
    insetAlt: "Warehouse aisle stacked with pallets",
    insetCaption: "Dispatch control room",
    work: { client: "DosLogistics", type: "Warehousing & supply chain", image: "/assets/work/doslogistics.webp" },
  },
];

export const adjacentSectors = [
  "Sports & Fitness",
  "Grocery & On-demand",
  "Taxi & Mobility",
  "Dating & Social",
  "Events & Weddings",
  "Media & Streaming",
];

export default industries;
