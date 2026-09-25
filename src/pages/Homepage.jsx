import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroRobotic from "../components/HeroRobotic";
import ServicesConnected from "../components/ServicesConnected";
import Testimonials from "../components/Testimonials";
import TeamOrbit from "../components/TeamOrbit";
import IndustriesSection from "../components/IndustriesSection";
import WorkDeck from "../components/WorkDeck";
import StoryShowcase from "../components/StoryShowcase";
import Icon from "../components/Icon";

/* The stack, grouped the way a build is actually put together, so the
   section reads as an architecture rather than a logo wall. */
const stackLayers = [
  {
    id: 'interface',
    label: 'Interface',
    blurb: 'The layer people touch — typed, componentised, and fast on the first paint.',
    tools: [
      { name: 'React', role: 'Interfaces', logo: '/assets/tech/react.svg' },
      { name: 'Next.js', role: 'Web apps', logo: '/assets/tech/nextjs.svg' },
      { name: 'TypeScript', role: 'Engineering', logo: '/assets/tech/typescript.svg' },
    ],
  },
  {
    id: 'mobile',
    label: 'Mobile & design',
    blurb: 'One design language and one shared core across iOS, Android, and the web.',
    tools: [
      { name: 'Flutter', role: 'Mobile', logo: '/assets/tech/flutter.svg' },
      { name: 'Figma', role: 'Product design', logo: '/assets/tech/figma.svg' },
    ],
  },
  {
    id: 'engine',
    label: 'Engine & data',
    blurb: 'Typed APIs, real-time sync, and a data model that survives the second year.',
    tools: [
      { name: 'Node.js', role: 'Back end', logo: '/assets/tech/nodejs.svg' },
      { name: 'MongoDB', role: 'Data', logo: '/assets/tech/mongodb.svg' },
      { name: 'Firebase', role: 'Infrastructure', logo: '/assets/tech/firebase.svg' },
    ],
  },
  {
    id: 'cloud',
    label: 'Cloud & delivery',
    blurb: 'Edge delivery and infrastructure sized to the traffic, not to the invoice.',
    tools: [
      { name: 'AWS', role: 'Cloud', logo: '/assets/tech/aws.svg' },
      { name: 'Vercel', role: 'Deployment', logo: '/assets/tech/vercel.svg' },
    ],
  },
  {
    id: 'commerce',
    label: 'Commerce',
    blurb: 'Storefronts and checkout flows tuned for discovery, speed, and conversion.',
    tools: [
      { name: 'Shopify', role: 'Commerce', logo: '/assets/tech/shopify.svg' },
      { name: 'Stripe', role: 'Payments', logo: '/assets/tech/stripe.svg' },
    ],
  },
];
function SectionAtmosphere({ variant }) {
  return (
    <div className={`home-atmosphere home-atmosphere--${variant}`} aria-hidden="true">
      <span className="home-atmosphere__orb home-atmosphere__orb--one" />
      <span className="home-atmosphere__orb home-atmosphere__orb--two" />
      <span className="home-atmosphere__beam home-atmosphere__beam--one" />
      <span className="home-atmosphere__beam home-atmosphere__beam--two" />
      <span className="home-atmosphere__signal home-atmosphere__signal--one" />
      <span className="home-atmosphere__signal home-atmosphere__signal--two" />
    </div>
  );
}

/**
 * Product technology ecosystem.
 *
 * A continuous marquee of the stack. The loop is a CSS animation over a
 * track holding two identical runs of the list, so translating by exactly
 * half the track puts run two where run one started and the seam is never
 * visible. It runs on the compositor, which is why it holds its speed while
 * the page is being scrolled.
 */
function ClientsSection() {
  const tools = stackLayers.flatMap((layer) => layer.tools);

  return (
    <section id="trusted-by" className="clients-section theme-light" aria-label="Product technology ecosystem">
      <SectionAtmosphere variant="tools" />

      <div className="clients-heading">
        <div className="clients-heading-copy">
          <h2>
            The tools behind <strong>exceptional digital products.</strong>
          </h2>
        </div>
        <div className="clients-heading-side">
          <p>
            A modern, proven technology stack selected around your product, users, and growth.
          </p>
          <div className="clients-stack-summary" aria-label="Technology approach">
            <span><i /> Strategy-led</span>
            <span><i /> Built to scale</span>
            <span><i /> Launch ready</span>
          </div>
        </div>
      </div>

      <div className="stack-marquee" aria-label="Selected technology stack">
        <div className="stack-marquee__track">
          {[0, 1].map((run) => (
            <div className="stack-marquee__run" key={run} aria-hidden={run === 1 ? "true" : undefined}>
              {tools.map((tool) => (
                <span className="stack-marquee__tool" key={tool.name}>
                  <span className="stack-marquee__mark">
                    <img src={tool.logo} alt="" width="30" height="30" loading="lazy" decoding="async" />
                  </span>
                  <span className="stack-marquee__copy">
                    <strong>{tool.name}</strong>
                    <small>{tool.role}</small>
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* The photographs were hotlinked from images.unsplash.com. Measured on the
   built site they were the four slowest requests on the homepage by a wide
   margin - 9.3s, 8.8s, 6.4s and 6.2s against a 1.4s first paint - so the page
   was not finishing loading until an external CDN felt like answering. They
   are served from here now.

   The four accents are four stops sampled off the brand ramp itself
   (violet #633494 -> blue #147bc2 -> cyan #00aeef), evenly spaced. They used
   to be Tailwind defaults - a bright #8b5cf6 violet sitting next to the brand
   #623595 violet, which read as two purples arguing rather than one family. */
const aboutPoints = [
  {
    number: "01",
    title: "Senior specialists",
    copy: "Hands-on product leads stay close from first brief to launch.",
    color: "#633494",
    tag: "Senior craft",
    caption: "Product leads in the work, not above it",
    image: "/assets/about-pillars/pillar-01.webp",
    alt: "Senior specialists collaborating on product work",
  },
  {
    number: "02",
    title: "One connected team",
    copy: "Strategy, design, and engineering move together without handoff gaps.",
    color: "#2f63b2",
    tag: "No handoffs",
    caption: "Strategy, design & engineering at one table",
    image: "/assets/about-pillars/pillar-02.webp",
    alt: "One connected team working around a table",
  },
  {
    number: "03",
    title: "Built for momentum",
    copy: "Clear decisions, weekly progress, and products designed to keep evolving.",
    color: "#0e8bd0",
    tag: "Always shipping",
    caption: "Weekly progress you can actually see",
    image: "/assets/about-pillars/pillar-03.webp",
    alt: "Team driving a product launch forward",
  },
  {
    number: "04",
    title: "Owned after launch",
    copy: "Monitoring, iteration, and a roadmap that keeps working once the build is live.",
    color: "#00aeef",
    tag: "Still here",
    caption: "The work does not stop at handover",
    image: "/assets/about-pillars/pillar-04.webp",
    alt: "Team reviewing a live product after launch",
  },
];

function HomeAboutSection() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return undefined;
    const timer = setInterval(() => setActive((i) => (i + 1) % aboutPoints.length), 5200);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <section className="home-about theme-light" id="about-opus">
      <StoryShowcase
        className="home-about__showcase reveal"
        eyebrow={<><span /> About Opus Geeks</>}
        heading={<>One senior team <br />  <strong> behind products  that <br /> move.</strong></>}
        description="We combine strategy, product design, and engineering to turn ambitious ideas into useful digital experiences people understand, trust, and remember."
        items={aboutPoints}
        activeIndex={active}
        onSelect={setActive}
        onPauseChange={setIsPaused}
        selectorAriaLabel="How Opus Geeks works"
        linkTo="/about"
        linkLabel="Meet Opus Geeks"
        linkIcon="explore"
      />
    </section>
  );
}

function CtaBanner() {
  return (
    <section id="start-project" className="section section--alt cta-banner">
      <div className="cta-banner-shell">
        <div className="row g-0 align-items-center h-100">
          <div className="col-12 col-lg-6">
            <div className="cta-banner-copy">
              <p className="eyebrow">Start A Conversation</p>
              <h2>Have an idea? Let&apos;s build what comes <strong>next.</strong></h2>
              <p>Share your email and our product team will reach out to explore the opportunity.</p>
              <form className="cta-email-form" action="/contact-us">
                <label className="sr-only" htmlFor="cta-email">Email address</label>
                <Icon name="mail" />
                <input id="cta-email" name="email" type="email" placeholder="Enter your email address" required />
                <button type="submit">
                  Submit
                  <Icon name="arrow-up-right" />
                </button>
              </form>
              <small className="cta-banner-note">No spam. Just a thoughtful first conversation.</small>
            </div>
          </div>
          <div className="col-12 col-lg-6 cta-banner-brand-column" aria-hidden="true">
            <div className="cta-banner-brand-stage">
              <span className="cta-banner-brand-ring cta-banner-brand-ring--outer" />
              <span className="cta-banner-brand-ring cta-banner-brand-ring--inner" />
              <span className="cta-banner-brand-beam cta-banner-brand-beam--one" />
              <span className="cta-banner-brand-beam cta-banner-brand-beam--two" />
              <div className="cta-banner-brand-card">
                <span className="cta-banner-brand-card-edge" />
                <img src="/assets/logo/mark.webp" alt="" />
                <small>Digital products worldwide</small>
              </div>
              <span className="cta-banner-brand-chip cta-banner-brand-chip--one">Strategy</span>
              <span className="cta-banner-brand-chip cta-banner-brand-chip--two">Design</span>
              <span className="cta-banner-brand-chip cta-banner-brand-chip--three">Engineering</span>
              <span className="cta-banner-brand-chip cta-banner-brand-chip--four">Launch</span>
            </div>
            <div className="cta-banner-brand-label">
              <span />
              Opus Geeks in motion
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Homepage() {
  return (
    <div className="homepage-flow">
      <HeroRobotic />
      <HomeAboutSection />
      <ServicesConnected />
      <IndustriesSection />
      <WorkDeck />
      <Testimonials />
      <section className="section section--alt team-section theme-light">
        <span className="og-ring og-ring--tl" aria-hidden="true" />
        <span className="og-ring og-ring--br" aria-hidden="true" />

        <div className="team-section__layout">
          <div className="team-section__copy">
            <div className="section-heading reveal">
              <p className="eyebrow">Our Team</p>
              <h2>The people <strong>behind</strong> the <span className="h-accent">products.</span></h2>
              <p>Designers, engineers, and strategists who ship exceptional work together.</p>
            </div>
            <div className="team-section__signals" aria-label="Team disciplines">
              <span><i /> Product strategy</span>
              <span><i /> Experience design</span>
              <span><i /> Product engineering</span>
              <span><i /> Quality and launch</span>
            </div>
          </div>
          <div className="team-orbit-container">
            <TeamOrbit />
          </div>
        </div>
      </section>
    </div>
  );
}
