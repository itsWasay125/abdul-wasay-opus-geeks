import { useEffect, useRef, useState } from "react";
import "./SiteLoader.css";

/* ==========================================================================
   SITE LOADER — the first two seconds

   Mounted once, above the router, so it runs on a real page load and never on
   an in-app navigation. Three things happen at the same time:

   · the count runs 0 → 100, paced by what the page is actually doing rather
     than by a fixed timer (see `target` below);
   · the brand ramp fills the rule under the mark;
   · when it reaches 100 the whole thing lifts off the top of the screen,
     revealing the page that has been sitting behind it the whole time.

   It is deliberately not a spinner. A spinner says "wait"; a counter says how
   long, and a wordmark says who you are waiting for.

   Two rules it will not break: it never holds the page for more than
   MAX_HOLD, whatever the network is doing, and under prefers-reduced-motion
   it does not appear at all.
   ========================================================================== */

const MAX_HOLD = 2400;  // ms — the hard ceiling, however slow the network is
const MIN_HOLD = 700;   // ms — below this it reads as a flicker, not a loader
const LIFT_MS = 760;    // ms the curtain takes to clear the screen

export default function SiteLoader() {
  /* Mount decided once, synchronously, so the loader never appears for a
     frame and then vanishes for someone who asked for no motion. */
  const [enabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const [count, setCount] = useState(0);
  const [lifting, setLifting] = useState(false);
  const [gone, setGone] = useState(!enabled);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!enabled) return undefined;

    const startedAt = performance.now();
    let pageReady = document.readyState === "complete";
    let value = 0;
    let liftTimer = 0;
    let goneTimer = 0;

    const onLoad = () => { pageReady = true; };
    window.addEventListener("load", onLoad, { once: true });

    const tick = (now) => {
      const elapsed = now - startedAt;

      /* The bar is honest about two things and vague about the rest: it will
         not pass 92 until the page has actually loaded, and it will not sit
         still if loading drags. So it eases toward a ceiling that lifts the
         moment `load` fires, and crawls underneath it in the meantime. */
      const ceiling = pageReady ? 100 : 92;
      const pull = pageReady ? 0.2 : 0.035;
      value += (ceiling - value) * pull;

      const held = elapsed >= MIN_HOLD;
      const done = (pageReady && held && value > 99.3) || elapsed >= MAX_HOLD;

      if (done) {
        setCount(100);
        setLifting(true);
        liftTimer = window.setTimeout(() => setGone(true), LIFT_MS);
        return;
      }

      setCount(Math.min(99, Math.round(value)));
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    /* the page underneath must not scroll while a full-screen panel covers it */
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.clearTimeout(liftTimer);
      window.clearTimeout(goneTimer);
      window.removeEventListener("load", onLoad);
      document.body.style.overflow = previousOverflow;
    };
  }, [enabled]);

  /* restore scrolling as soon as the curtain starts moving, not when it lands,
     so a fast reader is never held by the animation itself */
  useEffect(() => {
    if (lifting) document.body.style.overflow = "";
  }, [lifting]);

  if (gone) return null;

  return (
    <div
      className={`og-loader${lifting ? " is-lifting" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading, ${count} percent`}
    >
      <div className="og-loader__inner">
        <span className="og-loader__mark">
          <img src="/assets/logo/mark.webp" alt="" width="46" height="41" decoding="async" />
        </span>

        <span className="og-loader__name">Opus Geeks</span>

        <span className="og-loader__rule" aria-hidden="true">
          <i style={{ transform: `scaleX(${count / 100})` }} />
        </span>

        <span className="og-loader__count" aria-hidden="true">
          {String(count).padStart(3, "0")}
        </span>
      </div>

      <span className="og-loader__foot" aria-hidden="true">
        Digital products, built properly
      </span>
    </div>
  );
}
