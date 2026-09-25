/* ==========================================================================
   THE ENGAGEMENT — what the five stages of an Opus Geeks build actually are

   This section used to carry five client screenshots. The industries section
   directly above it already shows client work, so the homepage was showing the
   same kind of thing twice in a row. This answers the question the work does
   not: what is it like to hire these people.

   The stages carried a week range each. They are gone: a range on a homepage
   is read as a commitment, and the one number that matters is agreed in
   discovery anyway.

   `image` is the stage's illustration. These replaced the studio photographs:
   each one carries its own number and title, so the panel shows it whole on a
   light plate rather than using it as a backdrop with a list over it.
   Supplied as ~500KB PNGs, served as ~120KB WebP; originals in
   assets-src/work-deck.
   ========================================================================== */

export const workDeck = [
  {
    id: "discovery",
    image: "/assets/work-deck/image1.webp",
    imageAlt: "Discovery and strategy illustration: research, strategy and roadmap",
    stage: "Discovery",
    color: "#a855f7",
    lead: "We work out what you are actually building.",
    line:
      "Most briefs describe a solution someone already picked. We go back a step and pin down who this is for, what they are trying to get done, and which parts of it are worth building first — so the scope you sign off is one you would still choose three months in.",
    deliverables: [
      "A written scope with what is in and what is explicitly out",
      "User journeys for the three flows that matter most",
      "A fixed price and a delivery date, not a range",
    ],
    people: "Product lead · Tech lead",
  },
  {
    id: "design",
    image: "/assets/work-deck/image2.webp",
    imageAlt: "UI and UX design illustration: screens, components and design tokens",
    stage: "Design",
    color: "#6366f1",
    lead: "You see the real thing before a line of code is written.",
    line:
      "Not a mood board and not a wireframe — the actual screens, at real sizes, with your real content in them. You click through a working prototype and change your mind there, where changing your mind is free.",
    deliverables: [
      "Clickable prototype of every screen in scope",
      "A design system your future developers can build on",
      "Two rounds of revisions built into the timeline",
    ],
    people: "Product designer · UI engineer",
  },
  {
    id: "build",
    image: "/assets/work-deck/image3.webp",
    imageAlt: "Development and integration illustration: code, services and APIs",
    stage: "Build",
    color: "#2563eb",
    lead: "A working link, every Friday, from the first week.",
    line:
      "You are never waiting on a milestone to find out how it is going. The staging environment goes up before the first feature does, and every Friday it has more in it than it did the week before. No demo day, no reveal — just the thing, getting closer.",
    deliverables: [
      "A live staging link updated weekly",
      "The senior people you met in the pitch, writing the code",
      "Your repository, your cloud account, your keys",
    ],
    people: "Tech lead · 2–4 engineers · QA",
  },
  {
    id: "launch",
    image: "/assets/work-deck/image4.webp",
    imageAlt: "Testing and optimisation illustration: performance, security and cross-browser checks",
    stage: "Launch",
    color: "#06b6d4",
    lead: "Shipping is a checklist, not an event.",
    line:
      "Performance budgets, accessibility, SEO, analytics, error tracking and a rollback plan are all done before launch week, not after it. The day you go live should be the least interesting day of the project.",
    deliverables: [
      "Lighthouse, accessibility and load testing signed off",
      "Analytics and error tracking wired to your dashboards",
      "A handover session and written runbook for your team",
    ],
    people: "Tech lead · QA · DevOps",
  },
  {
    id: "support",
    image: "/assets/work-deck/image5.webp",
    imageAlt: "Launch and growth illustration: release, monitoring and growth metrics",
    stage: "After launch",
    color: "#10b981",
    lead: "We are still here in month six.",
    line:
      "The agency disappearing after handover is the single most common thing clients tell us about their last one. Support is a standing arrangement with a named engineer and an agreed response time — and if you would rather take it in house, the handover is built for that too.",
    deliverables: [
      "A named engineer who already knows the codebase",
      "Agreed response times, in writing",
      "Monthly health report — uptime, speed, errors",
    ],
    people: "Named engineer · Product lead",
  },
];

export default workDeck;
