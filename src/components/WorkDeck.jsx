import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Icon from "./Icon";
import GlowButton from "./GlowButton";
import { workDeck } from "../data/workDeck";
import "./WorkDeck.css";

gsap.registerPlugin(ScrollTrigger);

/* ==========================================================================
   THE ENGAGEMENT — the five stages stack up as you scroll

   This section showed five client screenshots until the industries section
   above it started showing client work too, at which point the homepage was
   saying the same thing twice in a row. It now answers what the work cannot:
   what hiring this studio is actually like, one stage at a time.

   The stacking is `position: sticky` with a per-card top offset, which is pure
   CSS and costs nothing: card two parks 18px lower than card one, so the pile
   keeps a visible edge for every stage underneath it — and the edges double as
   a progress indicator, since you can see how many are left.

   GSAP only does the settle: the card underneath eases down in scale and dims
   as the next one covers it. Sticky itself is never touched, and the transform
   is on the sticky element rather than an ancestor, which is the arrangement
   WebKit keeps pinned.
   ========================================================================== */

export default function WorkDeck() {
  const stackRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    /* below the breakpoint the cards stop stacking and become a plain column,
       so there is nothing to settle */
    const wide = window.matchMedia("(min-width: 901px)");
    if (!wide.matches) return undefined;

    const context = gsap.context(() => {
      cardRefs.current.forEach((card, index) => {
        if (!card || index === workDeck.length - 1) return;

        /* The dim is an overlay's opacity, not a filter on the card.
           `filter: brightness()` has to re-render the whole card subtree
           through the filter every frame it changes, and once each card
           carried a full-bleed photograph that meant re-rastering a large
           bitmap on every scroll frame - it took this section to 2.7fps.
           Opacity on a plain dark overlay reads the same and composites. */
        /* One timeline, one ScrollTrigger. Two scrubbed triggers per card
           meant twice the main-thread work on every scroll frame, and this
           section already has four of them stacked. */
        gsap
          .timeline({
            scrollTrigger: {
              trigger: card,
              start: "top 120px",
              end: () => `+=${card.offsetHeight}`,
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          })
          .to(card, { scale: 0.93, ease: "none" }, 0)
          /* 0.18 of near-black reads as the old brightness(0.82) did */
          .to(card.querySelector(".wd__dim"), { opacity: 0.18, ease: "none" }, 0);
      });
    }, stackRef);

    return () => context.revert();
  }, []);

  return (
    <section id="work-deck" className="wd theme-light" aria-labelledby="wd-title">
      <span className="wd__aura wd__aura--one" aria-hidden="true" />
      <span className="wd__aura wd__aura--two" aria-hidden="true" />

      <div className="wd__head">
        <div>
          <h2 id="wd-title">
            What working with us <strong>actually looks like.</strong>
          </h2>
        </div>
        <p>
          Five stages, and what you get out of each one. Keep scrolling — each stage takes the
          screen, then hands it to the next.
        </p>
      </div>

      <div className="wd__stack" ref={stackRef}>
        {workDeck.map((stage, index) => (
          <article
            key={stage.id}
            className="wd__card"
            style={{ "--wd-color": stage.color, "--i": index }}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
          >
            <span className="wd__dim" aria-hidden="true" />

            <div className="wd__body">

              {/* the stage number reads as part of the heading rather than as a
                  watermark floating in the corner away from it */}
              <h3>
                <span className="wd__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {stage.stage}
              </h3>
              <p className="wd__lead">{stage.lead}</p>
              <p className="wd__line">{stage.line}</p>

              <p className="wd__people">
                <Icon name="users" />
                {stage.people}
              </p>
            </div>

            {/* The deliverables panel — the plain answer to "and what do I get".
                The studio shot sits behind it under a scrim: it gives the stage a
                face without the list ever having to compete with it. */}
            <div className="wd__panel">
              <img
                className="wd__panel-img"
                src={stage.image}
                alt={stage.imageAlt}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                draggable="false"
              />
              <span className="wd__panel-veil" aria-hidden="true" />

              <span className="wd__panel-head">What you get</span>
              <ul className="wd__list">
                {stage.deliverables.map((item) => (
                  <li key={item}>
                    <Icon name="check" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <span className="wd__panel-mark" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="wd__foot">
        <p>
          <Icon name="layers" />
          Every stage is fixed price, and you can stop after any one of them.
        </p>
        <GlowButton to="/contact-us" label="Start with discovery" icon="arrow-up-right" />
      </div>
    </section>
  );
}
