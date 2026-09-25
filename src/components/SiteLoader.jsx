import { useEffect, useState } from "react";
import "./SiteLoader.css";

/* ==========================================================================
   SITE LOADER — the brand, then the page

   No counter and no "loading": the mark grows in, the wordmark types itself
   out a letter at a time, and then the mark expands through the screen and
   the page is behind it.

   It is timed, not tied to the network, and short - about two seconds - so
   it never holds a fast connection hostage. It mounts above the router, so
   it plays on a real page load and never on an in-app navigation, and under
   prefers-reduced-motion it does not appear at all.

   Everything that moves is a transform, an opacity or a clip-path, so the
   whole sequence runs on the compositor while the page renders underneath.
   ========================================================================== */

const EXIT_AT = 1500; // ms: the mark starts to expand
const DONE_AT = 2150; // ms: unmounted

export default function SiteLoader() {
  const [enabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [phase, setPhase] = useState("in"); // in -> out -> gone

  useEffect(() => {
    if (!enabled) return undefined;
    const exit = window.setTimeout(() => setPhase("out"), EXIT_AT);
    const done = window.setTimeout(() => setPhase("gone"), DONE_AT);
    return () => {
      window.clearTimeout(exit);
      window.clearTimeout(done);
    };
  }, [enabled]);

  if (!enabled || phase === "gone") return null;

  return (
    <div className={`og-loader og-loader--${phase}`} aria-hidden="true">
      <div className="og-loader__lockup">
        <img className="og-loader__mark" src="/assets/logo/mark.webp" alt="" width="320" height="394" />
        <span className="og-loader__type">
          <img className="og-loader__word" src="/assets/logo/wordmark-dark.webp" alt="" width="900" height="98" />
          <span className="og-loader__caret" />
        </span>
      </div>
    </div>
  );
}
