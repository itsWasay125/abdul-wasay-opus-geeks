import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Plus, Minus, ArrowUpRight, Cpu, Sparkles, Smartphone, Layers, Gem } from "lucide-react";
import { Link } from "react-router-dom";

const FEATURES_DATA = [
  {
    id: "product-eng",
    num: "01",
    title: "Digital Product Engineering",
    icon: Cpu,
    desc: "We engineer resilient digital products from architectural blueprint to high-throughput cloud scale. Combining micro-frontends, typed APIs, and real-time data pipelines to turn complex logic into ultra-performant interfaces.",
    tags: ["React & Next.js", "Node.js", "TypeScript", "Microservices", "GraphQL & REST"],
    link: "/services/web-development",
    image: "/assets/disciplines/01_product_engineering.webp",
    visualLabel: "Product surface",
    visualCaption: "Typed APIs and real-time data behind an interface that stays fast under load.",
    color: "#00ADEE",
  },
  {
    id: "creative-3d",
    num: "02",
    title: "Creative Development & 3D WebGL",
    icon: Sparkles,
    desc: "We push beyond standard browser constraints using custom GLSL shaders, Three.js spatial environments, and GSAP micro-animations. Every interaction is tuned to 60fps with tactile haptic fluidity.",
    tags: ["Three.js & WebGL", "Custom Shaders", "GSAP & Motion", "3D Artifacts", "Spatial Audio"],
    link: "/portfolio",
    image: "/assets/disciplines/02_creative_3d.webp",
    visualLabel: "Spatial canvas",
    visualCaption: "Shaders, spatial scenes and motion tuned to hold 60fps on real hardware.",
    color: "#5B8BFF",
  },
  {
    id: "mobile-apps",
    num: "03",
    title: "Cross-Platform & Native Mobile",
    icon: Smartphone,
    desc: "High-framerate iOS and Android apps engineered with shared core architecture. From offline-first synchronizations to native device integrations, we ensure seamless touch responsiveness across all viewports.",
    tags: ["React Native", "Flutter", "iOS & Android", "Offline Sync", "Native Bridges"],
    link: "/services/mobile-development",
    image: "/assets/disciplines/03_mobile_apps.webp",
    visualLabel: "Device layer",
    visualCaption: "One shared core, two stores, and offline sync that survives a dead signal.",
    color: "#8B5CF6",
  },
  {
    id: "headless-commerce",
    num: "04",
    title: "Headless CMS & Digital Commerce",
    icon: Layers,
    desc: "Modern decoupled content architecture and high-conversion e-commerce engines. We integrate headless CMS platforms and custom cart checkout pipelines delivering instant page loads and zero vendor lock-in.",
    tags: ["Headless Shopify", "Sanity / Medusa", "Stripe Connect", "Omnichannel", "Global Edge CDN"],
    link: "/services/web-development",
    image: "/assets/disciplines/04_headless_commerce.webp",
    visualLabel: "Commerce stack",
    visualCaption: "Decoupled content and checkout wired to the edge, with no vendor lock-in.",
    color: "#00E5FF",
  },
  {
    id: "ux-systems",
    num: "05",
    title: "Brand Systems & Strategic UX",
    icon: Gem,
    desc: "User research, cognitive wireframes, and design token libraries built for compounding momentum. We craft systemic visual languages that scale effortlessly across global marketing and enterprise portals.",
    tags: ["Design Systems", "Figma Tokens", "UX Flow Mapping", "Interaction Prototyping", "Design Ops"],
    link: "/services/ui-ux-design",
    image: "/assets/disciplines/05_brand_ux.webp",
    visualLabel: "Design system",
    visualCaption: "Research, tokens and flows that keep every surface speaking one language.",
    color: "#A855F7",
  },
];

/**
 * The discipline visual.
 *
 * This used to be a WebGL viewport building five primitives — a torus knot, an
 * icosphere, a gimbal, a cube array and an octahedron — and cross-fading them
 * by scale. They were procedural shapes, and they read as procedural shapes:
 * flat-shaded toys next to copy about production engineering.
 *
 * They are pre-rendered CGI plates now. Every image is stacked in the same
 * cell and only the active one is at full opacity, so a swap is two opacity
 * and scale tweens rather than a mount, and nothing reflows. The whole
 * three.js dependency goes with it — one fewer WebGL context on the page.
 */
function DisciplineVisual({ activeIndex }) {
  /* Which plates have been shown; see the note by the render below. */
  const [seenPlates, setSeenPlates] = useState(() => new Set([0]));
  useEffect(() => {
    setSeenPlates((current) => (current.has(activeIndex) ? current : new Set(current).add(activeIndex)));
  }, [activeIndex]);
  const framesRef = useRef([]);
  const floatRef = useRef(null);
  const previousRef = useRef(activeIndex);

  /* Initial state, and the idle float. Layout effect so the first paint is
     already correct rather than flashing all five plates at once. */
  useLayoutEffect(() => {
    const frames = framesRef.current.filter(Boolean);
    if (!frames.length) return undefined;

    gsap.set(frames, { autoAlpha: 0, scale: 0.96 });
    gsap.set(frames[activeIndex] || frames[0], { autoAlpha: 1, scale: 1 });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    /* A pre-rendered plate cannot be spun — there is no other side to it — so
       the only ambient motion is a slow rise and fall. */
    const float = gsap.to(floatRef.current, {
      y: -5,
      duration: 3.4,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    return () => float.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const frames = framesRef.current.filter(Boolean);
    const from = previousRef.current;
    previousRef.current = activeIndex;
    if (!frames.length || from === activeIndex) return undefined;

    /* Every frame is driven to its target on every change, not just the two
       that happen to be swapping. Scrolling changes the active discipline
       faster than a 0.7s tween finishes, and the old version only ever
       animated `from` → `activeIndex`, so a change that landed mid-tween left
       the frame it had skipped over stranded at partial opacity — which is
       the two-images-at-once. Overwriting by tween target also means the new
       tweens kill the ones still in flight on the same property. */
    const tl = gsap.timeline({ defaults: { ease: "power3.out", overwrite: "auto" } });

    /* The outgoing plate is fully gone before the incoming one starts. These
       are large renders on a transparent background, so any overlap in the
       crossfade shows as two artworks stacked on top of each other rather
       than as a dissolve. */
    frames.forEach((frame, i) => {
      if (i === activeIndex) {
        tl.to(frame, { autoAlpha: 1, scale: 1, duration: 0.5 }, 0.3);
      } else {
        tl.to(frame, { autoAlpha: 0, scale: 0.96, duration: 0.28, ease: "power3.in" }, 0);
      }
    });

    return () => tl.kill();
  }, [activeIndex]);

  const active = FEATURES_DATA[activeIndex] || FEATURES_DATA[0];

  return (
    /* The card is sticky, and a sticky grid item can only travel inside its
       own grid area — which, with the grid set to align-items: start, is the
       height of the card itself. It released a few hundred pixels in, so
       disciplines 04 and 05 changed the picture while the picture was already
       off screen. The wrapper is the grid item now and stretches to the row,
       which gives the card the whole list to travel down. */
    <div className="og-about-features__aside">
    <div className="og-about-features__canvas-card">
      <div className="og-about-features__canvas-wrap">
        <div
          className="og-about-features__canvas-glow"
          style={{ background: `radial-gradient(circle at 50% 45%, ${active.color}26 0%, transparent 68%)` }}
          aria-hidden="true"
        />

        <div className="og-about-features__plates" ref={floatRef}>
          {/* Every plate sits in the same grid cell, so all five are inside the
              viewport and `loading="lazy"` defers none of them - the page pulled
              2.1MB of plates to show one. A plate is mounted the first time its
              discipline is selected and stays mounted, so the swap still
              cross-fades from something. */}
          {FEATURES_DATA.map((feat, i) =>
            seenPlates.has(i) ? (
              <img
                key={feat.id}
                ref={(el) => {
                  framesRef.current[i] = el;
                }}
                className="og-about-features__plate"
                src={feat.image}
                alt={i === activeIndex ? `${feat.title} illustration` : ""}
                width="1254"
                height="1254"
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                draggable="false"
              />
            ) : null,
          )}
        </div>

        <div className="og-about-features__canvas-hud-top">
          <span className="og-about-features__hud-tag">
            <span
              className="og-about-features__hud-dot"
              style={{ background: active.color, boxShadow: `0 0 0 3px ${active.color}26` }}
            />
            <span>{active.visualLabel}</span>
          </span>
          <span className="og-about-features__hud-idx">{active.num} / 05</span>
        </div>
      </div>

      <div className="og-about-features__canvas-info">
        <span className="og-about-features__canvas-label">
          <span
            className="og-about-features__canvas-badge"
            style={{ background: active.color, boxShadow: `0 0 0 3px ${active.color}26` }}
          />
          <span>Discipline {active.num}</span>
        </span>
        <h4 className="og-about-features__canvas-title">{active.title}</h4>
        <p className="og-about-features__canvas-sub">{active.visualCaption}</p>
      </div>
    </div>
    </div>
  );
}

/**
 * FeatureSection — an 8-column accordion beside a sticky 4-column visual.
 * Scrolling through the list changes the active discipline; the visual on the
 * right stays pinned and swaps with it.
 */
export default function AboutFeatureSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const itemsRef = useRef([]);
  const sectionRef = useRef(null);
  const isClickingRef = useRef(false);

  // Scroll listener: activates item smoothly when scrolling through each zone (Desktop only)
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined" && window.innerWidth < 1024) return;
      if (isClickingRef.current) return;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const winHeight = window.innerHeight;

      if (rect.top > winHeight || rect.bottom < 0) return;

      // Focal reading line in viewport (around 45% of viewport height)
      const focalLine = winHeight * 0.45;

      let closestIndex = 0;
      let minDiff = Infinity;

      itemsRef.current.forEach((el, idx) => {
        if (!el) return;
        const itemRect = el.getBoundingClientRect();
        const itemCenter = itemRect.top + itemRect.height * 0.5;
        const diff = Math.abs(itemCenter - focalLine);

        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = idx;
        }
      });

      setActiveIdx(closestIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleItem = (idx) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    if (isMobile) {
      setActiveIdx((prev) => (prev === idx ? -1 : idx));
    } else {
      isClickingRef.current = true;
      setActiveIdx(idx);

      const targetEl = itemsRef.current[idx];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      setTimeout(() => {
        isClickingRef.current = false;
      }, 700);
    }
  };

  return (
    <section className="og-about-features" id="features" ref={sectionRef} aria-labelledby="og-features-title">
      <div className="og-shell">
        {/* Section Header */}
        <div className="og-about-features__header">
          <p className="og-about-features__eyebrow">
            <span className="og-about-features__eyebrow-dot" />
            <span>What we do</span>
          </p>
          <h2 id="og-features-title" className="og-about-features__title">
            Engineering &amp; Design <span className="og-about-features__title-grad">Disciplines</span>
          </h2>
          <p className="og-about-features__sub">
            Five disciplines, and what each one actually means in a build. Pick one to open it.
          </p>
        </div>

        {/* 12-Column Grid Layout: 8 Cols Features + 4 Cols visual */}
        <div className="og-about-features__grid">
          {/* 8 Columns: Feature Accordion Items */}
          <div className="og-about-features__list" role="tablist">
            {FEATURES_DATA.map((feat, idx) => {
              const isActive = activeIdx === idx;
              const IconComp = feat.icon;

              return (
                <div
                  key={feat.id}
                  ref={(el) => (itemsRef.current[idx] = el)}
                  className={`og-about-features__item ${isActive ? "is-active" : ""}`}
                  onClick={() => toggleItem(idx)}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      toggleItem(idx);
                    }
                  }}
                >
                  {/* active indicator fill line */}
                  <div className={`og-about-features__fill-track ${isActive ? "is-active" : ""}`}>
                    <div className="og-about-features__fill-bar" />
                  </div>

                  <div className="og-about-features__item-head">
                    <div className="og-about-features__item-left">
                      <span className="og-about-features__item-num">{feat.num}</span>
                      <div className="og-about-features__item-icon-box">
                        <IconComp size={18} />
                      </div>
                      <h3 className="og-about-features__item-title">{feat.title}</h3>
                    </div>
                    <div className="og-about-features__item-toggle" aria-hidden="true">
                      {isActive ? <Minus size={18} strokeWidth={2.4} /> : <Plus size={18} strokeWidth={2.4} />}
                    </div>
                  </div>

                  {isActive && (
                    <div className="og-about-features__item-body">
                      {/* Mobile Inline Discipline Image */}
                      <div className="og-about-features__mobile-media">
                        <img
                          src={feat.image}
                          alt={`${feat.title} illustration`}
                          className="og-about-features__mobile-img"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>

                      <p className="og-about-features__item-desc">{feat.desc}</p>
                      <div className="og-about-features__item-tags">
                        {feat.tags.map((tag) => (
                          <span key={tag} className="og-about-features__item-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="og-about-features__item-action">
                        <Link to={feat.link} className="og-about-features__item-link">
                          <span>Explore Discipline</span>
                          <ArrowUpRight size={16} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 4 Columns: the discipline visual (sticky on desktop) */}
          <DisciplineVisual activeIndex={activeIdx >= 0 ? activeIdx : 0} />
        </div>
      </div>
    </section>
  );
}
