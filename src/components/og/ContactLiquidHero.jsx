import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";
import LiquidGlassBackground from "./LiquidGlassBackground";
import { CONTACT } from "../../data/site";
import Typewriter from "../Typewriter";

/* what the contact banner types after "Tell us what you are" */
const CONTACT_WORDS = ["building.", "designing.", "launching.", "scaling."];

/**
 * Contact Us banner — the refractive liquid-glass hero.
 *
 * Ported from the other project's `og-hero og-hero--liquid-glass`, with the
 * three changes that were asked for:
 *
 *  · The accent ramp is the Opus Geeks logo's own ramp (violet → blue → cyan,
 *    sampled from the mark) rather than the generic purple it shipped with.
 *  · Nothing over the copy carries a backdrop-filter any more, and the scrim
 *    is a solid readable plate behind the text block instead of a thin wash —
 *    the headline was sitting straight on the bright beam and going soft.
 *  · Entrance motion is CSS, staggered off `--i`, so there is no animation
 *    library in the path and reduced-motion simply lands it.
 */
export default function ContactLiquidHero() {
  return (
    <section className="og-hero og-hero--liquid-glass" aria-labelledby="og-hero-title">
      <LiquidGlassBackground
        preset="electric-blue"
        speed={1}
        cells={24}
        distortion={250}
        interactive
        interactiveBlur
      />

      <div className="og-hero__scrim" aria-hidden="true" />

      <div className="og-shell og-hero__panel">
        <div className="og-hero__status-bar">

          <div className="og-hero__status-pill">
            <span className="og-hero__status-pulse" aria-hidden="true" />
            <span className="og-hero__status-text">Replies within one working day</span>
          </div>
        </div>

        <h1 id="og-hero-title" className="og-hero__title">
          <span className="hero-line">Tell us what you are</span>
          <span className="hero-line og-hero__title-accent">
            {/* the sizer holds every word invisibly, so the line keeps the width
                of the longest while the typed one grows and shrinks */}
            <span className="type-slot">
              <span className="type-slot__sizer" aria-hidden="true">
                {CONTACT_WORDS.map((w) => <span key={w}>{w}</span>)}
              </span>
              <Typewriter words={CONTACT_WORDS} className="type-slot__live" />
            </span>
            <span className="sr-only">building.</span>
          </span>
        </h1>

        <p className="og-hero__sub">
          Send us the shape of the problem and we will come back with a senior team, a scope you can
          hold us to, and a first call inside one working day. No forms that go nowhere.
        </p>

        <div className="og-hero__actions">
          <a href="#contact" className="og-btn og-btn--solid">
            <span>Start a project</span>
            <ArrowUpRight size={18} strokeWidth={2.2} aria-hidden="true" />
          </a>
          <Link to="/portfolio" className="og-btn og-btn--ghost">
            <span>See selected work</span>
            <Sparkles size={16} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>

        <div className="og-hero__metrics">
          <div className="og-hero__metric">
            <span className="og-hero__metric-num">
              &lt;1<span className="og-hero__metric-sym">day</span>
            </span>
            <span className="og-hero__metric-desc">First response</span>
          </div>
          <div className="og-hero__metric-divider" aria-hidden="true" />
          <div className="og-hero__metric">
            <span className="og-hero__metric-num">
              2<span className="og-hero__metric-sym">hubs</span>
            </span>
            <span className="og-hero__metric-desc">Florida &amp; Karachi</span>
          </div>
          <div className="og-hero__metric-divider" aria-hidden="true" />
          <div className="og-hero__metric">
            <span className="og-hero__metric-num">Senior</span>
            <span className="og-hero__metric-desc">Team on every build</span>
          </div>
          <div className="og-hero__metric-divider" aria-hidden="true" />
          <div className="og-hero__metric">
            <span className="og-hero__metric-num">Fixed</span>
            <span className="og-hero__metric-desc">Scope and timeline</span>
          </div>
        </div>

      </div>
    </section>
  );
}
