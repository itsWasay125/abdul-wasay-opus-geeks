import { useEffect } from "react";

/* ==========================================================================
   HEADING SHINE — ONLY WHILE IT CAN BE SEEN
   The gradient sweep across heading accents (headingTextShine, og-shine,
   gradientFlow) animates background-position on text clipped to its
   background. That cannot be composited: every frame repaints the glyphs.
   Measured with the testimonials on screen, twelve of these were running
   and ten of them were off screen; pausing them took the frame rate from
   ~31 to ~37fps and the worst frames from 50ms to 33ms on an Intel UHD 620.

   The section-level animation budget misses them because their sections are
   tall - the section is on screen while its heading is far above - so each
   shining element is watched on its own and played only while visible.
   (Once a CSS animation is paused through the API, later changes to
   animation-play-state no longer resume it, so this and the budget do not
   fight.)
   ========================================================================== */

const SHINE = /shine|gradientflow/i;

export default function useShineBudget(key) {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !document.getAnimations) return undefined;

    let observer = null;
    const byTarget = new Map();

    const start = window.setTimeout(() => {
      for (const anim of document.getAnimations()) {
        const target = anim.effect?.target;
        if (!target || !SHINE.test(anim.animationName || "")) continue;
        if (!byTarget.has(target)) byTarget.set(target, []);
        byTarget.get(target).push(anim);
        anim.pause();
      }
      if (!byTarget.size) return;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            for (const anim of byTarget.get(entry.target) || []) {
              if (entry.isIntersecting) anim.play();
              else anim.pause();
            }
          }
        },
        { rootMargin: "80px 0px" },
      );
      byTarget.forEach((_, el) => observer.observe(el));
    }, 1200);

    return () => {
      window.clearTimeout(start);
      observer?.disconnect();
    };
  }, [key]);
}
