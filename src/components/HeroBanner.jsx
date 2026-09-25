import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import ShinyButton from "./ShinyButton";
import GlowButton from "./GlowButton";

const PHRASES = [
  "Web Platforms",
  "Mobile Apps",
  "E-Commerce",
  "AI Automation",
  "UI/UX Systems",
  "Cloud Products",
];

const PANES = [
  { image: "/assets/work/talouwa.webp", client: "Talouwa", type: "Beauty commerce" },
  { image: "/assets/work/receipt-app.webp", client: "Receipt Rewards", type: "Scan & earn app" },
  { image: "/assets/work/clearshine-tx.webp", client: "ClearShine TX", type: "AI instant quotes" },
];

const CHIPS = [
  { name: "Next.js", logo: "/assets/tech/nextjs.svg" },
  { name: "Flutter", logo: "/assets/tech/flutter.svg" },
  { name: "Stripe", logo: "/assets/tech/stripe.svg" },
];

const MARQUEE = [
  "Talouwa",
  "True One",
  "Receipt Rewards",
  "PGM LLC",
  "ClearShine TX",
  "Sin City Bengals",
  "Raw Omakase DC",
  "DosLogistics",
  "V-Stream Aviation",
];

const DEFAULT_STATS = [
  { value: "500+", label: "Projects delivered" },
  { value: "50+", label: "Happy clients" },
  { value: "98%", label: "Client satisfaction" },
];

export default function HeroBanner({
  eyebrow = "Premium digital product studio",
  titleLead = "We design and build",
  /* sits on the same line as the rotator, to its left */
  titleInline = null,
  titleTail = "people actually use.",
  phrases = PHRASES,
  lead = "Strategy, product design, and engineering under one senior team - shipping websites, apps, and platforms for founders and operators in a dozen industries.",
  primary = { label: "Start a project", to: "/contact-us" },
  secondary = { label: "See our work", to: "/portfolio", icon: "explore" },
  stats = DEFAULT_STATS,
  /* optional extra layer painted inside the banner, behind the content */
  backdrop = null,
}) {
  const [phrase, setPhrase] = useState(0);
  const stageRef = useRef(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhrase((current) => (current + 1) % phrases.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [phrases.length]);

  /* pointer parallax on the 3D pane stack */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if (window.matchMedia("(max-width: 900px)").matches) return undefined;

    const move = (event) => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      stage.style.setProperty("--tilt-x", `${(-y * 8).toFixed(2)}deg`);
      stage.style.setProperty("--tilt-y", `${(x * 12).toFixed(2)}deg`);
    };
    const reset = () => {
      stage.style.setProperty("--tilt-x", "0deg");
      stage.style.setProperty("--tilt-y", "0deg");
    };

    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerleave", reset);
    return () => {
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerleave", reset);
    };
  }, []);

  return (
    <section id="home" className="hero-banner">
      <div className="hero-banner__mesh" aria-hidden="true">
        <span className="hero-banner__blob hero-banner__blob--one" />
        <span className="hero-banner__blob hero-banner__blob--two" />
        <span className="hero-banner__blob hero-banner__blob--three" />
      </div>

      <span className="hero-banner__grid" aria-hidden="true" />

      {backdrop}

      <div className="hero-banner__inner">
        <div className="hero-banner__copy">
          <p className="hero-banner__eyebrow">
            <span aria-hidden="true" />
            {eyebrow}
          </p>

          <h1 className="hero-banner__title">
            <span className="hero-banner__title-lead">{titleLead}</span>
            <span className="hero-banner__title-row">
              {titleInline ? (
                <span className="hero-banner__title-inline">{titleInline}</span>
              ) : null}
              <span className="hero-banner__rotator">
                {phrases.map((item, index) => (
                  <span key={item} className={index === phrase ? "is-active" : ""} aria-hidden={index !== phrase}>
                    {item}
                  </span>
                ))}
              </span>
            </span>
            <span className="hero-banner__title-tail">{titleTail}</span>
          </h1>

          <p className="hero-banner__lead">{lead}</p>

          <div className="hero-banner__actions">
            <ShinyButton to={primary.to} label={primary.label} />
            <GlowButton to={secondary.to} label={secondary.label} icon={secondary.icon || "explore"} />
          </div>
        </div>

        <div className="hero-banner__visual">
          <div className="hero-banner__stage" ref={stageRef}>
            <span className="hero-banner__halo" aria-hidden="true" />

            {PANES.map((pane, index) => (
              <figure className={`hero-pane hero-pane--${index + 1}`} key={pane.client}>
                <span className="hero-pane__bar" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <em>{pane.client}</em>
                </span>
                <img src={pane.image} alt={`${pane.client} - ${pane.type}`} loading="eager" decoding="async" />
              </figure>
            ))}

            {CHIPS.map((chip, index) => (
              <span className={`hero-banner__chip hero-banner__chip--${index + 1}`} key={chip.name}>
                <img src={chip.logo} alt="" loading="lazy" />
                {chip.name}
              </span>
            ))}

            <span className="hero-banner__badge" aria-hidden="true">
              <Icon name="shield-check" />
              <span>
                <strong>Launch ready</strong>
                <small>Design + build + support</small>
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="hero-banner__marquee" aria-hidden="true" hidden>
        <div className="hero-banner__marquee-track">
          {[...MARQUEE, ...MARQUEE].map((name, index) => (
            <span key={`${name}-${index}`}>
              {name}
              <i />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
