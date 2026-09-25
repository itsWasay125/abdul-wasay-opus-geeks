import { Link } from "react-router-dom";
import { Phone, Sparkles, MessageSquare } from "lucide-react";
import Spotlight from "./Spotlight";
import SplineScene from "./SplineScene";
import ShinyButton from "../ShinyButton";
import GlowButton from "../GlowButton";
import { CONTACT } from "../../data/site";

const SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

/**
 * Site-wide closing 3D CTA with Interactive Cyber Droid.
 * Fully adapted for the white theme with high-converting callouts,
 * glowing actions, and interactive 3D scene.
 */
export default function CtaBanner3D({ onContactPage = false }) {
  return (
    <section className="og-spline-banner-section" aria-labelledby="og-spline-banner-title">
      <span className="og-ring og-ring--tl" aria-hidden="true" />
      <span className="og-ring og-ring--br" aria-hidden="true" />

      <div className="og-spline-banner-container">
        <div className="og-3d-card og-spline-card">
          <Spotlight className="og-spline-card__spotlight" fill="#38bdf8" id="og-cta-cyan" />
          <Spotlight className="og-spline-card__spotlight-colored" fill="#818cf8" id="og-cta-violet" />

          <div className="og-spline-card__grid">
            <div className="og-spline-card__viewport">
              <div className="og-spline-card__mask" aria-hidden="true" />
              <div className="og-spline-card__canvas-wrap">
                <SplineScene scene={SCENE} className="og-spline-render" />
              </div>
            </div>

            <div className="og-spline-card__content">
              <div className="og-spline-card__badge">
                <span className="og-spline-card__badge-dot" aria-hidden="true" />
                <Sparkles size={14} className="og-spline-card__badge-icon" aria-hidden="true" />
                <span>Let&apos;s Build Together</span>
              </div>

              <h2 id="og-spline-banner-title" className="og-spline-card__title">
                Ready to take your project{" "}
                <span className="og-spline-card__title-accent">to the next level?</span>
              </h2>

              <p className="og-spline-card__desc">
                Whether you have questions, want to discuss a new product idea, or need senior engineers
                to ship your roadmap, our studio is ready. From strategy to production — we deliver.
              </p>

              <div className="og-spline-card__actions">
                <ShinyButton
                  to={onContactPage ? undefined : "/contact-us"}
                  href={onContactPage ? "#contact" : undefined}
                  label="Start Your Project"
                  icon="arrow-up-right"
                  className="og-spline-card__cta"
                />

                <GlowButton
                  href={CONTACT.phoneHref}
                  label={CONTACT.phone}
                  icon="phone"
                  className="og-spline-card__cta"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
