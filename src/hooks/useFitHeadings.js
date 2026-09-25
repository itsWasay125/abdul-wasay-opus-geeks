import { useEffect } from "react";

/* Keeps every page banner on exactly three lines.
   ===================================================================
   The banner headings are authored as three block-level lines. What
   broke that was never the markup - it was font size. Each banner sets
   its own, and measured at 390px they came out at 47-59px, where a line
   such as "Answers to questions" needs 439px of a 354px column and wraps
   into a fourth. At 1900px the services banner sits in a 310px column
   and "Digital services" needs 364px.

   One CSS value cannot fit eight headings with eight different longest
   lines in eight different columns. So this measures instead: every
   authored line is held on one line, and if the widest of them is wider
   than the heading, the heading's font steps down a pixel at a time
   until it fits. It never steps *up* past the size the stylesheet set.

   Runs on route change and on resize (debounced); it touches only the
   one h1 per page, so it costs nothing. */

const LINE = ".hero-line, .rh-hero__line, .hero-banner__title-lead, .hero-banner__title-row, .hero-banner__title-tail";

function fit() {
  document.querySelectorAll("h1").forEach((h) => {
    const lines = [...h.querySelectorAll(LINE)].filter((l) => l.parentElement === h);
    if (lines.length < 2) return;

    h.style.removeProperty("font-size");
    lines.forEach((l) => { l.style.whiteSpace = "nowrap"; });

    /* The room a line actually has is the narrowest of three things: the
       heading itself, its parent's content box, and the distance to the right
       edge of the viewport. The heading alone is not enough - on the FAQ
       banner at 390px the h1 was wider than the column it sat in, so every
       line "fit" the h1 while the column clipped the last few letters off. */
    const parent = h.parentElement;
    const pcs = parent ? getComputedStyle(parent) : null;
    const parentRoom = parent
      ? parent.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight)
      : Infinity;
    const viewportRoom = document.documentElement.clientWidth - h.getBoundingClientRect().left - 16;
    const avail = Math.min(h.clientWidth, parentRoom, viewportRoom);
    if (!avail || avail < 60) return;

    let size = parseFloat(getComputedStyle(h).fontSize);

    /* Measure the *text*, not the line. Each line is a block, and a block's
       scrollWidth is never less than its own width - so measuring that
       returned the heading's width whatever the font size was, and the loop
       below never had anything to converge on. A Range over the line's
       contents gives the extent of the glyphs themselves. */
    const range = document.createRange();
    const textWidth = (l) => {
      /* A line carrying a rotating word holds every word in a hidden sizer so
         the line never shifts. A Range over it would measure all of them laid
         side by side; the sizer's own box is the width the line really needs. */
      const sizer = l.querySelector(".rh-hero__rotator");
      if (sizer) {
        let w = 0;
        for (const node of l.childNodes) {
          if (node.nodeType === 3) {
            range.selectNodeContents(node);
            w += range.getBoundingClientRect().width;
          } else if (node === sizer || node.contains?.(sizer)) {
            w += sizer.getBoundingClientRect().width;
          }
        }
        return w;
      }
      range.selectNodeContents(l);
      return range.getBoundingClientRect().width;
    };
    const widest = () => Math.max(...lines.map(textWidth));

    let guard = 0;
    while (widest() > avail + 1 && size > 18 && guard < 60) {
      size -= 1;
      /* with priority: several banners set their size with !important in
         the stylesheet, which beats a plain inline style. Without this the
         font never changed, the widest line never shrank, and the loop ran
         straight to its floor. */
      h.style.setProperty("font-size", size + "px", "important");
      guard += 1;
    }
  });
}

export function useFitHeadings(key) {
  useEffect(() => {
    let frame = 0;
    let timer = 0;

    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };

    // after the route's fonts and layout have settled
    run();
    const late = window.setTimeout(run, 400);
    if (document.fonts?.ready) document.fonts.ready.then(run).catch(() => {});

    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(run, 120);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(late);
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [key]);
}
