import { useEffect } from "react";

/* ==========================================================================
   ANIMATION BUDGET — infinite CSS animations only run where they can be seen

   The site keeps about thirty `animation: ... infinite` declarations alive at
   once: the shimmer on every ShinyButton, the heading shine, two marquees, the
   team orbit ring, the stats ring and sweep, the globe orbit, the gradient
   flow on the CTA title. Most of them are several screens away at any moment,
   and a few of them animate properties that cannot be composited — so the
   browser was repainting off-screen work on every frame. Measured on a 4x
   throttled CPU that was the difference between 6.7fps and a usable scroll.

   Rather than delete any of them, each section is watched and its subtree is
   paused while it is off screen. `animation-play-state` resumes exactly where
   it left off, 200px before the section arrives, so nothing is ever seen
   frozen or seen starting late.

   Deliberately not `content-visibility: auto`, which would do this and more:
   it changes an off-screen section's measured height, and every GSAP
   ScrollTrigger on this site derives its start and end from exactly that.
   ========================================================================== */

const SELECTOR = [
  "main > section",
  "main > div > section",
  ".homepage-flow > *",
  "footer",
].join(", ");

/* far enough out that a section is already running before its first pixel */
const MARGIN = "200px 0px 200px 0px";

export default function useAnimationBudget() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    let observer = null;
    let raf = 0;

    const attach = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            /* the attribute, not a class: nothing else writes to it, so this
               can never collide with a component managing its own classList */
            if (entry.isIntersecting) entry.target.removeAttribute("data-anim-idle");
            else entry.target.setAttribute("data-anim-idle", "");
          }
        },
        { rootMargin: MARGIN, threshold: 0 }
      );

      document.querySelectorAll(SELECTOR).forEach((el) => observer.observe(el));
    };

    /* routes swap their sections out from under us, so re-read the document
       after paint whenever the tree changes, coalesced to one pass a frame */
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        attach();
      });
    };

    attach();

    const mutation = new MutationObserver(schedule);
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      mutation.disconnect();
      observer?.disconnect();
      document.querySelectorAll("[data-anim-idle]").forEach((el) => el.removeAttribute("data-anim-idle"));
    };
  }, []);
}
