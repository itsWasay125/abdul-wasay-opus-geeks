import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Icon from "./Icon";

gsap.registerPlugin(ScrollTrigger);

/* ── the fan ──────────────────────────────────────────────────────────────
   One function decides where a card sits, and it takes a *fractional*
   distance from the centre. That is what makes the drag feel attached to the
   finger: mid-drag every card is asked for its position at, say, 1.4 cards
   out, and it answers with a real transform rather than snapping between
   whole steps. */
/* Two each side of the centre — the five-card arrangement the reference
   shows. It is also what keeps the fan narrower than the viewport, so the
   arrows have somewhere to stand that is not on top of a card. */
const DEPTH = 2;

function place(offset, gap) {
  const d = Math.abs(offset);
  const scale = d <= 1 ? 1.08 - 0.2 * d : Math.max(0.6, 0.88 - 0.07 * (d - 1));
  return {
    x: offset * gap,
    z: -Math.min(d, DEPTH + 1) * 150,
    rotateY: gsap.utils.clamp(-46, 46, -offset * 26),
    scale,
    /* Cards stay solid — depth comes from scale, rotation and a dimming
       overlay, not from making them see-through. Fading them was what let
       the fan read as a stack of ghosts rather than a row of objects. Only
       the last half-card fades, and only so it leaves the stage cleanly. */
    opacity: gsap.utils.clamp(0, 1, (DEPTH + 0.6 - d) / 0.9),
    /* This was `filter: brightness(...)`, and it is an overlay now for two
       reasons. GSAP reads an undeclared filter as zero, so the first tween
       of every card started from brightness(0) and the whole fan flashed
       black. And a brightness filter on five 380x452 cards repaints all of
       them every frame, which is what made the spin stutter on Safari — an
       opacity on a flat overlay composites instead. */
    dim: Number((Math.min(d, DEPTH) * 0.13).toFixed(3)),
    zIndex: 200 - Math.round(d * 10),
  };
}

/* Signed distance round the ring, taking the short way so the deck wraps
   instead of unwinding all the way back. */
function shortestOffset(index, position, length) {
  /* `position` counts up forever — after a few minutes of autoplay it is well
     past `length` — so the difference has to be brought back into one turn of
     the ring with a modulo before the ±half correction. Adjusting by a single
     `length` only works while the deck is on its first lap; past that a card
     would be told to stand eighty places away and would simply vanish. */
  let offset = (index - position) % length;
  const half = length / 2;
  if (offset > half) offset -= length;
  if (offset < -half) offset += length;
  return offset;
}

const AUTOPLAY_MS = 4600;
const DRAG_DISTANCE = 220; // px of travel that equals one card
const CLICK_SLOP = 8; // px of movement still counted as a click

/* The last word of the heading carries the brand ramp, the way every other
   section heading on the site marks its accent — with a <strong>. Splitting
   it here rather than at the three call sites keeps them passing one plain
   string. */
function splitHeading(text) {
  const parts = String(text).trim().split(' ');
  if (parts.length < 2) return { lead: '', accent: text };
  return { lead: parts.slice(0, -1).join(' '), accent: parts[parts.length - 1] };
}

/**
 * The work deck — a cinematic coverflow.
 *
 * Every project has one card, mounted once and never reordered; what changes
 * is where each card is told to stand. That is the whole trick behind the
 * infinite loop: `position` is a float that keeps counting up, each card
 * works out its own shortest distance from it, and the one that falls off the
 * left edge is simply asked to stand on the right. Nothing remounts, no index
 * resets, so there is no jump at the wrap and a project never loses its
 * identity mid-transition.
 *
 * GSAP drives the transforms. During a drag the layout is `set` straight onto
 * the elements — no tween per frame — and on release one tween carries the
 * deck to the nearest whole card.
 *
 * It is CSS perspective, not WebGL: the page already runs a Spline scene and
 * a canvas grid, and this section should not add a third renderer.
 */
export default function Project3DSlider({
  projects,
  eyebrow = "Featured work",
  title = "Every discipline. One moving portfolio.",
  copy = "Explore digital products, creative experiences and innovative solutions we have brought to life.",
  compact = false,
}) {
  const items = useMemo(() => projects?.filter(Boolean) ?? [], [projects]);
  const count = items.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);

  const sectionRef = useRef(null);
  const headRef = useRef(null);
  const ringRef = useRef(null);
  const cardsRef = useRef([]);

  /* `position` is the deck's continuous coordinate; activeIndex is only ever
     derived from it, for the readout and the active styling. */
  const posRef = useRef(0);
  const gapRef = useRef(210);
  const dragRef = useRef({ active: false, startX: 0, startPos: 0, moved: false });
  const autoplayRef = useRef(null);
  const pausedRef = useRef({ hover: false, offscreen: false, hidden: false, drag: false });
  const reducedRef = useRef(false);

  /* ── layout ─────────────────────────────────────────────────────────── */
  const layout = useCallback(
    (position, { animate = true } = {}) => {
      const gap = gapRef.current;
      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        const offset = shortestOffset(index, position, count);
        const to = place(offset, gap);
        card.style.zIndex = String(to.zIndex);
        const vars = {
          x: to.x,
          z: to.z,
          rotateY: to.rotateY,
          scale: to.scale,
          opacity: to.opacity,
          "--deck-dim": to.dim,
          /* a card the fan has folded away must not eat clicks meant for the
             one in front of it */
          pointerEvents: to.opacity < 0.2 ? "none" : "auto",
        };
        if (animate) {
          gsap.to(card, { ...vars, duration: 0.95, ease: "power3.inOut", overwrite: "auto" });
        } else {
          gsap.set(card, vars);
        }
      });
    },
    [count],
  );

  const goTo = useCallback(
    (position, opts) => {
      posRef.current = position;
      layout(position, opts);
      const next = ((Math.round(position) % count) + count) % count;
      setActiveIndex((current) => (current === next ? current : next));
    },
    [count, layout],
  );

  const step = useCallback(
    (amount) => goTo(Math.round(posRef.current) + amount),
    [goTo],
  );

  /* ── first paint, resize, entrance ──────────────────────────────────── */
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const ring = ringRef.current;
    if (!section || !ring || !count) return undefined;

    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* The gap is what makes the fan fit the viewport. It is read from a
       custom property so the breakpoints stay in the stylesheet rather than
       being duplicated as magic numbers in here. */
    const readGap = () => {
      const raw = getComputedStyle(ring).getPropertyValue("--deck-gap");
      const parsed = Number.parseFloat(raw);
      gapRef.current = Number.isFinite(parsed) && parsed > 0 ? parsed : 210;
    };

    readGap();
    layout(posRef.current, { animate: false });

    const onResize = () => {
      readGap();
      layout(posRef.current, { animate: false });
    };
    window.addEventListener("resize", onResize);

    const ctx = gsap.context(() => {
      if (reducedRef.current) return;
      gsap.from(headRef.current, {
        opacity: 0,
        y: 26,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 78%", once: true },
      });
      gsap.from(ring, {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 70%", once: true },
      });
    }, section);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  /* a new project set is a new deck */
  useEffect(() => {
    posRef.current = 0;
    setActiveIndex(0);
    layout(0, { animate: false });
  }, [items, layout]);

  /* ── autoplay ───────────────────────────────────────────────────────── */
  const syncAutoplay = useCallback(() => {
    const p = pausedRef.current;
    const shouldRun = count > 1 && !reducedRef.current && !p.hover && !p.offscreen && !p.hidden && !p.drag;

    if (!shouldRun) {
      window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
      return;
    }
    if (autoplayRef.current) return;
    autoplayRef.current = window.setInterval(() => step(1), AUTOPLAY_MS);
  }, [count, step]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const onVisibility = () => {
      pausedRef.current.hidden = document.hidden;
      syncAutoplay();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const observer = new IntersectionObserver(
      ([entry]) => {
        pausedRef.current.offscreen = !entry?.isIntersecting;
        syncAutoplay();
      },
      { threshold: 0.15 },
    );
    observer.observe(section);

    syncAutoplay();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    };
  }, [syncAutoplay]);

  const setPaused = (key, value) => {
    pausedRef.current[key] = value;
    syncAutoplay();
  };

  /* ── drag ───────────────────────────────────────────────────────────── */
  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startPos: posRef.current,
      moved: false,
    };
    setDragging(true);
    setPaused("drag", true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > CLICK_SLOP) drag.moved = true;
    /* damped: the deck moves at a fraction of the pointer, so it reads as
       weight rather than the cards being stuck to the cursor */
    posRef.current = drag.startPos - delta / DRAG_DISTANCE;
    layout(posRef.current, { animate: false });
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    goTo(Math.round(posRef.current)); // settle onto the nearest card
    setPaused("drag", false);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
  };

  if (!count) return null;

  const active = items[activeIndex];
  const heading = splitHeading(title);

  return (
    <section
      ref={sectionRef}
      className={`project-3d-slider work-deck${compact ? " project-3d-slider--compact" : ""}`}
      onMouseEnter={() => setPaused("hover", true)}
      onMouseLeave={() => setPaused("hover", false)}
      aria-roledescription="carousel"
      aria-label="Featured projects"
    >
      <header className="work-deck__head" ref={headRef}>
        <p className="work-deck__eyebrow">{eyebrow}</p>
        <h2>
          {heading.lead} <strong>{heading.accent}</strong>
        </h2>
        <p className="work-deck__lead">{copy}</p>
      </header>

      <div className="work-deck__stage">
        <button
          type="button"
          className="work-deck__arrow work-deck__arrow--prev"
          onClick={() => step(-1)}
          aria-label="Previous project"
        >
          <Icon name="chevron-left" />
        </button>

        <div
          className={`work-deck__ring${dragging ? " is-dragging" : ""}`}
          ref={ringRef}
          tabIndex={0}
          role="group"
          aria-label="Project carousel, use the arrow keys to move"
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {items.map((project, index) => {
            const isActive = index === activeIndex;
            return (
              <article
                key={project.title}
                ref={(node) => { cardsRef.current[index] = node; }}
                className={`work-deck__card${isActive ? " is-active" : ""}`}
                style={{ "--project-accent": project.accent }}
                aria-hidden={isActive ? undefined : "true"}
                onClick={() => {
                  if (dragRef.current.moved) return;
                  if (!isActive) {
                    /* step onto this card the short way round, so clicking a
                       neighbour never spins the deck the long way */
                    goTo(posRef.current + shortestOffset(index, posRef.current, count));
                  }
                }}
              >
                <span className="work-deck__index">{String(index + 1).padStart(2, "0")}</span>

                <span className="work-deck__shot">
                  <img
                    src={project.image}
                    alt={isActive ? `${project.title} — ${project.category}` : ""}
                    loading={index < 4 ? "eager" : "lazy"}
                    decoding="async"
                    draggable="false"
                  />
                </span>

                <span className="work-deck__meta">
                  <small>{project.category}</small>
                  <strong>{project.title}</strong>
                </span>

                <Link
                  className="work-deck__go"
                  to="/portfolio"
                  tabIndex={isActive ? 0 : -1}
                  aria-label={`View ${project.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (dragRef.current.moved) event.preventDefault();
                  }}
                >
                  <Icon name="move-right" />
                </Link>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          className="work-deck__arrow work-deck__arrow--next"
          onClick={() => step(1)}
          aria-label="Next project"
        >
          <Icon name="chevron-right" />
        </button>
      </div>

      {/* The foot used to be a counter and a label: it said where you were
          but gave you no way to go anywhere, and the count sat ahead of the
          title it was counting. The ticks are that readout turned into
          controls — one per project, the active one stretched and carrying
          that project's accent, every one of them a jump. */}
      <div className="work-deck__foot">
        <p className="work-deck__now">
          <strong>{active.title}</strong>
          <span>{active.type}</span>
        </p>

        <div className="work-deck__ticks" role="tablist" aria-label="Jump to a project">
          {items.map((project, index) => (
            <button
              key={project.title}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={project.title}
              tabIndex={index === activeIndex ? 0 : -1}
              className={`work-deck__tick${index === activeIndex ? " is-active" : ""}`}
              style={{ "--project-accent": project.accent }}
              onClick={() => goTo(posRef.current + shortestOffset(index, posRef.current, count))}
            />
          ))}
        </div>

        <span className="work-deck__count" aria-live="polite">
          <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
          <i aria-hidden="true" />
          <span>{String(count).padStart(2, "0")}</span>
        </span>
      </div>
    </section>
  );
}
