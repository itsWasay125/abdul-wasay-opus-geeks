import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { portalState, resetPortalState } from "./portalState";
import AboutPortalVisual from "./AboutPortalVisual";
import "./AboutPortal.css";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { num: "01", lead: "Innovative", tail: "Solutions" },
  { num: "02", lead: "Client", tail: "Focused" },
  { num: "03", lead: "Results", tail: "Driven" },
  { num: "04", lead: "Long-Term", tail: "Partnerships" },
];

export default function AboutPortal() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resetPortalState(reduced);

    if (reduced) {
      /* Everything is already at its final pose — no entrance, no scrub, no
         parallax. The 3D scene still renders, it just holds still. */
      gsap.set(section.querySelectorAll("[data-reveal]"), { opacity: 1, y: 0 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);

      gsap.set(q("[data-reveal]"), { opacity: 0, y: 26 });
      gsap.set(q("[data-reveal='line'] span"), { yPercent: 108 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: section, start: "top 72%", once: true },
      });

      tl.to(q("[data-reveal='eyebrow']"), { opacity: 1, y: 0, duration: 0.55 })
        .to(
          q("[data-reveal='line']"),
          { opacity: 1, y: 0, duration: 0.1 },
          "-=0.25",
        )
        .to(
          q("[data-reveal='line'] span"),
          { yPercent: 0, duration: 0.95, ease: "power4.out", stagger: 0.09 },
          "<",
        )
        .to(q("[data-reveal='body']"), { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
        .to(
          q("[data-reveal='feature']"),
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
          "-=0.4",
        )
        /* The scene is driven through the shared state object, so these tween
           plain numbers rather than React props — no re-render per frame. */
        .to(
          portalState,
          { portalScale: 1, portalSpin: 0, duration: 1.5, ease: "power4.out" },
          0.1,
        )
        .to(portalState, { energy: 1, duration: 1.1, ease: "power2.out" }, 0.75)
        .to(
          portalState,
          { personOpacity: 1, personRise: 0, duration: 1.1, ease: "power3.out" },
          1.0,
        )
        .to(portalState, { particles: 1, duration: 1.2, ease: "power2.out" }, 1.25);

      /* Scroll scrub. Deliberately not pinned — this stays an ordinary
         section that happens to have a scene in it. */
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.8,
        onUpdate: (self) => {
          portalState.scroll = self.progress;
        },
      });

      gsap.to(q("[data-parallax]"), {
        y: -14,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="about-portal" ref={sectionRef} aria-labelledby="about-portal-title">
      <div className="about-portal__inner">
        <div className="about-portal__copy" data-parallax>
          <p className="about-portal__eyebrow" data-reveal="eyebrow">
            <span aria-hidden="true" />
            About Us
          </p>

          <h2 className="about-portal__title" id="about-portal-title">
            <span className="about-portal__line" data-reveal="line">
              <span>More Than A</span>
            </span>
            <span className="about-portal__line" data-reveal="line">
              <span className="about-portal__title-grad">Tech Agency</span>
            </span>
          </h2>

          <p className="about-portal__body" data-reveal="body">
            Opus Geeks is where creativity meets technology. We build digital experiences that
            inspire, engage and deliver real results — custom software, apps and real-time 3D. Our
            focus is simple: understand your vision and turn it into something extraordinary.
          </p>

          <ul className="about-portal__features">
            {FEATURES.map((feature) => (
              <li key={feature.num} data-reveal="feature">
                <span className="about-portal__feature-num">{feature.num}</span>
                <span className="about-portal__feature-label">
                  <strong>{feature.lead}</strong>
                  <em>{feature.tail}</em>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="about-portal__stage">
          <AboutPortalVisual />
        </div>
      </div>
    </section>
  );
}
