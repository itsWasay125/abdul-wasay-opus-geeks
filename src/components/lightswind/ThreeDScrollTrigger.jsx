import { Children, useEffect, useMemo, useRef, useState } from "react";

/* Marquee rows that scroll forever, wrap seamlessly, and react to the page
   scroll.
   ===================================================================
   The translation is a CSS animation: the track holds N identical blocks
   and slides by exactly one of them, so the loop is invisible and the
   movement runs on the compositor.

   The scroll reaction is expressed as `playbackRate` - scrolling down
   speeds a row up, scrolling up runs it backwards. Writing that every
   frame is what made this section jank: setting playbackRate on a running
   CSS animation forces a style recalculation, and the homepage was paying
   for it on every scroll frame whether the rows were on screen or not.

   Two things make it cheap now:
     1. A row only subscribes while it is actually in the viewport. Scroll
        past the testimonials and the rows stop costing anything at all.
     2. The rate is quantised to 0.25 steps and only written when the step
        changes, so a fast scroll writes a handful of times rather than
        sixty. The motion is indistinguishable; the recalcs are not.

   Hovering pauses the row. */

/* ── shared scroll velocity ───────────────────────────────
   One listener for the whole page no matter how many rows are mounted, and
   the easing loop parks itself the moment everything is back at rest. */
const subscribers = new Set();
let velocity = 0; // -1 … 1, smoothed
let target = 0;
let lastY = 0;
let lastT = 0;
let loopId = 0;
let listening = false;

/* How much faster a row runs at full scroll velocity. At 1.35 the reaction
   was barely perceptible; 2.6 reads as the rows responding to the scroll
   without ever outrunning the eye. */
const MAX_BOOST = 2.6;

function ease() {
  velocity += (target - velocity) * 0.08;
  target *= 0.88; // a scroll that has stopped decays back to rest

  subscribers.forEach((fn) => fn(velocity));

  if (Math.abs(velocity) > 0.004 || Math.abs(target) > 0.004) {
    loopId = requestAnimationFrame(ease);
  } else {
    velocity = 0;
    target = 0;
    subscribers.forEach((fn) => fn(0));
    loopId = 0;
  }
}

function onScroll() {
  const now = performance.now();
  const y = window.scrollY;
  const dt = Math.max(16, now - lastT);
  const pxPerSecond = ((y - lastY) / dt) * 1000;
  lastY = y;
  lastT = now;

  // 2000px/s of scroll is "as fast as it gets"
  target = Math.max(-1, Math.min(1, pxPerSecond / 2000));
  if (!loopId) loopId = requestAnimationFrame(ease);
}

function subscribe(fn) {
  subscribers.add(fn);
  if (!listening) {
    listening = true;
    lastY = window.scrollY;
    lastT = performance.now();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  return () => {
    subscribers.delete(fn);
    if (!subscribers.size) {
      listening = false;
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(loopId);
      loopId = 0;
      velocity = 0;
      target = 0;
    }
  };
}
export function ThreeDScrollTriggerContainer({ children, className = "" }) {
  return <div className={`three-d-scroll-trigger ${className}`.trim()}>{children}</div>;
}

export function ThreeDScrollTriggerRow({
  children,
  baseVelocity = 5,
  direction = 1,
  className = "",
  pauseOnHover = false,
}) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const hoveredRef = useRef(false);
  const [copies, setCopies] = useState(3);
  const [duration, setDuration] = useState(40);

  const childrenArray = useMemo(() => Children.toArray(children), [children]);

  /* One measurement, and again on resize — enough copies to cover the
     viewport plus one, and a duration that keeps every row at the same
     pixels-per-second no matter how much content it holds. */
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return undefined;

    const measure = () => {
      const block = track.firstElementChild;
      const unit = block ? block.scrollWidth : 0;
      if (unit <= 0) return;
      setCopies(Math.max(2, Math.ceil(container.offsetWidth / unit) + 1));
      /* baseVelocity is "percent of a block per second" in the original, so
         a block takes 100 / baseVelocity seconds to travel its own width. */
      setDuration(Math.max(8, 100 / Math.max(0.5, baseVelocity)));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [baseVelocity, childrenArray]);

  /* Hold the animation so hover can pause it, and drive its rate from the
     shared scroll velocity - but only while this row is on screen, and
     only when the quantised rate actually changes. */
  useEffect(() => {
    const row = containerRef.current;
    const track = trackRef.current;
    if (!row || !track) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const found = track.getAnimations().find((a) => a.animationName === "marqueeSlide");
    animationRef.current = found || null;
    if (!found) return undefined;

    let written = 1;
    let unsubscribe = null;

    const apply = (v) => {
      if (hoveredRef.current) return;
      const boost = 1 + Math.abs(v) * (MAX_BOOST - 1);
      const sign = v < -0.02 ? -1 : 1;
      /* quantised: a rate of 1.37 and one of 1.42 look identical, but each
         write costs a style recalculation */
      const next = sign * Math.round(boost * 4) / 4;
      if (next === written) return;
      written = next;
      found.playbackRate = next;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !unsubscribe) {
          unsubscribe = subscribe(apply);
        } else if (!entry.isIntersecting && unsubscribe) {
          unsubscribe();
          unsubscribe = null;
          if (written !== 1) {
            written = 1;
            found.playbackRate = 1;
          }
        }
      },
      { rootMargin: "120px 0px" }
    );
    observer.observe(row);

    return () => {
      observer.disconnect();
      if (unsubscribe) unsubscribe();
    };
  }, [copies, duration]);
  const onEnter = () => {
    hoveredRef.current = true;
    animationRef.current?.pause();
  };

  const onLeave = () => {
    hoveredRef.current = false;
    animationRef.current?.play();
  };

  return (
    <div
      ref={containerRef}
      className={`three-d-scroll-trigger__row ${className}`.trim()}
      onMouseEnter={pauseOnHover ? onEnter : undefined}
      onMouseLeave={pauseOnHover ? onLeave : undefined}
    >
      <div
        ref={trackRef}
        className="three-d-scroll-trigger__track"
        style={{
          "--marquee-copies": copies,
          "--marquee-duration": `${duration}s`,
          "--marquee-direction": direction >= 0 ? "normal" : "reverse",
        }}
      >
        {Array.from({ length: copies }).map((_, copyIndex) => (
          <div className="three-d-scroll-trigger__block" key={copyIndex}>
            {childrenArray}
          </div>
        ))}
      </div>
    </div>
  );
}
