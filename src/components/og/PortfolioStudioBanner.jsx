import { Layers, ShieldCheck, Rocket, Sparkles } from "lucide-react";
import ShinyButton from "../ShinyButton";
import GlowButton from "../GlowButton";

/**
 * Portfolio page hero banner — fully styled for the white theme.
 * High-contrast, crystal-clear typography, vibrant brand accents,
 * and live capability telemetry.
 */
export default function PortfolioStudioBanner() {
  return (
    <section className="portfolio-hero-white" aria-label="Portfolio overview">
      {/* Overhead Soundstage Studio Rig with 3 Lamps */}
      <div className="studio-rig" aria-hidden="true">
        <span className="studio-rig__truss">
          <i /><i /><i /><i /><i /><i /><i /><i />
        </span>
        {[0, 1, 2].map((lamp) => (
          <span className={`studio-rig__lamp studio-rig__lamp--${lamp + 1}`} key={lamp}>
            <span className="studio-rig__hanger" />
            <span className="studio-rig__body">
              <span className="studio-rig__lens" />
            </span>
            <span className="studio-rig__cone" />
          </span>
        ))}
        <span className="studio-rig__floor" />
      </div>

      <div className="portfolio-hero-white__shell">
        <div className="portfolio-hero-white__badge">
          <span className="portfolio-hero-white__badge-pip" aria-hidden="true" />
          <Sparkles size={14} className="portfolio-hero-white__badge-icon" aria-hidden="true" />
          <span>Selected Work & Systems</span>
        </div>

        <h1 className="portfolio-hero-white__title">
          <span className="hero-line">Real products.</span>
          <strong className="hero-line">Immersive</strong>
          <strong className="hero-line">stories.</strong>
        </h1>

        <p className="portfolio-hero-white__lead">
          Websites, mobile apps, and interface systems designed and engineered end to end — each
          one built to turn attention into measurable momentum for the business behind it.
        </p>

        <div className="portfolio-hero-white__actions">
          <ShinyButton to="/contact-us" label="Start a project" icon="arrow-up-right" />
          <GlowButton href="#websites" label="Explore the work" icon="sparkles" />
        </div>

        <div className="portfolio-hero-white__stats" aria-label="Portfolio metrics">
          <div className="portfolio-hero-white__stat">
            <Layers size={18} className="portfolio-hero-white__stat-icon" />
            <div>
              <strong>15+</strong>
              <small>Shipped Builds</small>
            </div>
          </div>
          <div className="portfolio-hero-white__stat">
            <Rocket size={18} className="portfolio-hero-white__stat-icon" />
            <div>
              <strong>03</strong>
              <small>Core Disciplines</small>
            </div>
          </div>
          <div className="portfolio-hero-white__stat">
            <ShieldCheck size={18} className="portfolio-hero-white__stat-icon" />
            <div>
              <strong>100%</strong>
              <small>Production Ready</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
