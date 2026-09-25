import { useEffect, useState } from "react";

/* Types a word, holds it, backspaces it, types the next.
   ===================================================================
   Used for the rotating word at the end of a banner heading. It is always
   the last thing on its line, so the text changing length never pushes
   anything - the caller wraps it in a sizer as wide as the longest word.

   One setTimeout chain drives it; nothing runs per frame. Under
   prefers-reduced-motion the words simply swap, with no typing, so the
   meaning still changes without the motion. */

const TYPE_MS = 85;
const ERASE_MS = 45;
const HOLD_MS = 1800;
const GAP_MS = 320;

export default function Typewriter({ words, className = "" }) {
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(words[0]?.length ?? 0);
  const [phase, setPhase] = useState("hold"); // typing | hold | erasing | gap

  useEffect(() => {
    if (!words.length) return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const word = words[index];
    let timer;

    if (reduced) {
      timer = window.setTimeout(() => {
        const next = (index + 1) % words.length;
        setIndex(next);
        setLength(words[next].length);
      }, HOLD_MS + 800);
      return () => window.clearTimeout(timer);
    }

    if (phase === "typing") {
      timer = length < word.length
        ? window.setTimeout(() => setLength((n) => n + 1), TYPE_MS)
        : window.setTimeout(() => setPhase("hold"), 0);
    } else if (phase === "hold") {
      timer = window.setTimeout(() => setPhase("erasing"), HOLD_MS);
    } else if (phase === "erasing") {
      timer = length > 0
        ? window.setTimeout(() => setLength((n) => n - 1), ERASE_MS)
        : window.setTimeout(() => setPhase("gap"), 0);
    } else {
      timer = window.setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setPhase("typing");
      }, GAP_MS);
    }
    return () => window.clearTimeout(timer);
  }, [index, length, phase, words]);

  return (
    <span className={`typewriter ${className}`.trim()}>
      {words[index].slice(0, length)}
      <span className="typewriter__caret" aria-hidden="true" />
    </span>
  );
}
