import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Icon from "./Icon";
import ShinyButton from "./ShinyButton";
import GlowButton from "./GlowButton";
import { showcaseWork } from "../data/showcase";

gsap.registerPlugin(ScrollTrigger);

/* Scroll-driven 3D coverflow rail.
   Vertical page scroll scrubs the rail sideways; every card's rotation, depth
   and scale come from its distance to the lane centre, so the row reads as a
   curved wall of screens.

   Safari note: the sticky left panel must never be a descendant of a
   transformed / preserve-3d element. That is why the perspective lives in each
   card's own transform (the perspective() function) instead of a `perspective`
   + `transform-style: preserve-3d` parent - the sticky viewport stays a plain
   block and WebKit keeps it pinned. */

const CTA_SLIDE = {
  id: "cta",
  isCta: true,
  client: "Your build next?",
  sector: "Start a project",
  type: "Free scoping call",
  color: "#6d28d9",
  note: "Tell us what you are launching and we will map the fastest credible route to shipping it.",
};

/* 3D shaping - tuned so side cards clearly recede without smearing the centre */
const PERSPECTIVE = 1150;
const MAX_ROTATE = 34;
const ROTATE_PER_UNIT = 46;
const MAX_DEPTH = 520;
const DEPTH_PER_UNIT = 540;
const LIFT_PER_UNIT = 16;
const SHOT_BASE = -34;
const SHOT_PER_UNIT = 74;
/* beyond this distance (in lane widths) a card is parked and left alone */
const CULL = 1.5;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduced;
}

export default function WorkRail() {
  const slides = useMemo(() => [...showcaseWork.slice(0, 5), CTA_SLIDE], []);
  const count = slides.length;

  const trackRef = useRef(null);
  const laneRef = useRef(null);
  const rowRef = useRef(null);
  const cardRefs = useRef([]);
  const shotRefs = useRef([]);
  const culled = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    const lane = laneRef.current;
    const row = rowRef.current;
    if (!track || !lane || !row) return undefined;

    /* reduced motion: no scrub, no 3D - the lane becomes a plain
       horizontally scrollable strip and the section collapses to one screen */
    if (reduced) {
      setActiveIndex(0);
      track.style.height = "auto";
      row.style.transform = "none";
      cardRefs.current.forEach((card) => {
        if (!card) return;
        card.style.transform = "none";
        card.style.opacity = "1";
      });
      shotRefs.current.forEach((shot) => {
        if (shot) shot.style.transform = "none";
      });
      return undefined;
    }

    let distance = 0;

    /* the section is as tall as the rail is wide, so one screen of vertical
       scroll moves the rail by one screen - that is what keeps it natural */
    const measure = () => {
      distance = Math.max(0, row.scrollWidth - lane.clientWidth);
      track.style.height = `${window.innerHeight + distance}px`;
    };

    const render = (progress) => {
      const shift = -progress * distance;
      row.style.transform = `translate3d(${shift}px, 0, 0)`;

      const laneWidth = lane.clientWidth || 1;
      const centre = laneWidth / 2;
      let closest = 0;
      let closestGap = Infinity;

      for (let i = 0; i < count; i += 1) {
        const card = cardRefs.current[i];
        if (!card) continue;

        const cardCentre = card.offsetLeft + card.offsetWidth / 2 + shift;
        const offset = (cardCentre - centre) / laneWidth;
        const gap = Math.abs(offset);

        /* cards well outside the lane are parked once and then skipped,
           so per-frame transform writes stay in single digits */
        if (gap > CULL) {
          if (!culled.current[i]) {
            card.style.opacity = "0";
            card.style.transform = `perspective(${PERSPECTIVE}px) translate3d(0, ${LIFT_PER_UNIT}px, ${-MAX_DEPTH}px) scale(0.78)`;
            culled.current[i] = true;
          }
          continue;
        }
        culled.current[i] = false;

        const rotate = gsap.utils.clamp(-MAX_ROTATE, MAX_ROTATE, -offset * ROTATE_PER_UNIT);
        const depth = -Math.min(MAX_DEPTH, gap * DEPTH_PER_UNIT);
        const lift = gap * LIFT_PER_UNIT;
        const scale = Math.max(0.78, 1 - gap * 0.22);

        card.style.transform = `perspective(${PERSPECTIVE}px) translate3d(0, ${lift}px, ${depth}px) rotateY(${rotate}deg) scale(${scale})`;
        card.style.opacity = String(Math.max(0.26, 1 - gap * 0.88));
        card.classList.toggle("is-active", gap < 0.16);

        /* the capture drifts further than its frame - layered glass feel */
        const shot = shotRefs.current[i];
        if (shot) {
          shot.style.transform = `translateY(${gsap.utils.clamp(-70, 0, SHOT_BASE - offset * SHOT_PER_UNIT)}%)`;
        }

        if (gap < closestGap) {
          closestGap = gap;
          closest = i;
        }
      }

      /* only re-render React when the centred project actually changes */
      setActiveIndex((current) => (current === closest ? current : closest));
    };

    measure();

    const proxy = { value: 0 };
    const tween = gsap.to(proxy, {
      value: 1,
      ease: "none",
      onUpdate: () => render(proxy.value),
      scrollTrigger: {
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefreshInit: measure,
      },
    });

    render(0);
    ScrollTrigger.refresh();

    const onResize = () => {
      measure();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [count, reduced]);

  const goTo = useCallback(
    (index) => {
      const track = trackRef.current;
      const lane = laneRef.current;
      const card = cardRefs.current[index];
      if (!track || !lane) return;

      /* reduced motion: the lane is a real scroller, so scroll it sideways */
      if (reduced) {
        if (card) {
          lane.scrollTo({
            left: card.offsetLeft - (lane.clientWidth - card.offsetWidth) / 2,
            behavior: "smooth",
          });
        }
        setActiveIndex(index);
        return;
      }

      const top = track.getBoundingClientRect().top + window.scrollY;
      const scrollable = track.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + (index / (count - 1)) * scrollable, behavior: "smooth" });
    },
    [count, reduced]
  );

  const active = slides[activeIndex];

  return (
    <section
      className={`work-rail${reduced ? " is-static" : ""}`}
      style={{ "--rail-color": active.color }}
    >
      <div className="work-rail__track" ref={trackRef}>
        <div className="work-rail__viewport">
          <aside className="work-rail__panel">
            <p className="eyebrow">Selected work</p>
            <h2>
              Shipped products, <strong>not concept slides.</strong>
            </h2>

            <div className="work-rail__active" key={active.id || active.client}>
              <span className="work-rail__sector">
                <i />
                {active.sector}
              </span>
              <h3>{active.client}</h3>
              <p className="work-rail__type">{active.type}</p>
              <p className="work-rail__note">{active.note}</p>

              <div className="work-rail__links">
                {active.url ? (
                  <ShinyButton href={active.url} label="Visit live site" target="_blank" rel="noreferrer noopener" />
                ) : (
                  <ShinyButton to="/contact-us" label="Start a project" />
                )}
                <GlowButton to="/portfolio" label="Full portfolio" icon="move-right" />
              </div>
            </div>

            <div className="work-rail__meter">
              <div className="work-rail__meter-head">
                <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
                <span>/ {String(count).padStart(2, "0")} builds</span>
              </div>
              <div className="work-rail__ticks" role="tablist" aria-label="Projects">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id || slide.client}
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    aria-label={slide.client}
                    className={index === activeIndex ? "is-active" : ""}
                    style={{ "--rail-color": slide.color }}
                    onClick={() => goTo(index)}
                  />
                ))}
              </div>
            </div>
          </aside>

          <div className="work-rail__lane" ref={laneRef}>
            <span className="work-rail__glow" aria-hidden="true" />

            <div className="work-rail__row" ref={rowRef}>
              {slides.map((slide, index) => (
                <article
                  key={slide.id || slide.client}
                  className={`rail-card${slide.isCta ? " rail-card--cta" : ""}`}
                  style={{ "--rail-color": slide.color }}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                >
                  {slide.isCta ? (
                    <div className="rail-card__frame rail-card__frame--cta">
                      <Icon name="rocket" />
                      <strong>Your build next?</strong>
                      <span>Design, build, and launch with one senior team.</span>
                      <Link to="/contact-us">
                        Start a project
                        <Icon name="arrow-up-right" />
                      </Link>
                    </div>
                  ) : (
                    <div className="rail-card__frame">
                      <span className="rail-card__bar" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                        <em>
                          {slide.url ? slide.url.replace(/^https?:\/\//, "").replace(/\/$/, "") : slide.client}
                        </em>
                      </span>
                      <div className="rail-card__shot">
                        <img
                          src={slide.image}
                          alt={`${slide.client} - ${slide.type}`}
                          loading={index < 3 ? "eager" : "lazy"}
                          decoding="async"
                          draggable="false"
                          ref={(node) => {
                            shotRefs.current[index] = node;
                          }}
                        />
                      </div>
                      <span className="rail-card__badge">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                  )}

                  <div className="rail-card__meta">
                    <strong>{slide.client}</strong>
                    <small>{slide.sector}</small>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
