import { useEffect, useRef } from "react";
import gsap from "gsap";
import { portalState } from "./portalState";

/* ==========================================================================
   ABOUT PORTAL — VISUAL
   The portal is a supplied pre-rendered cutout (ring + figure + rock shelf)
   rather than a WebGL scene.

   Why: the scene's figure was only ever a GLB that was never delivered, so the
   section shipped an "asset missing" card, and its ground was a flat blurred
   oval. The supplied render already is the requested composition — a realistic
   adult stood on a rocky platform, seen from behind, facing the ring, lit with
   a blue rim — so it replaces the whole canvas. AboutPortalScene.jsx is left on
   disk untouched: swap the import back in if a real GLB ever lands.

   It still moves. Entrance, an idle float and pointer parallax are driven here
   so the section does not read as a flat picture, and the depth layers (glow,
   ring image, foreground haze) shift by different amounts.
   ========================================================================== */

const PERSON_WEBP = "/assets/og-person-image.webp";

export default function AboutPortalVisual() {
  const wrapRef = useRef(null);
  const artRef = useRef(null);
  const floatRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const art = artRef.current;
    const float = floatRef.current;
    const glow = glowRef.current;
    if (!wrap || !art || !float) return undefined;

    if (portalState.reduced) {
      gsap.set([art, float, glow], { clearProps: "all" });
      return undefined;
    }

    const ctx = gsap.context(() => {
      /* entrance — scale up out of the page as the section arrives */
      gsap.fromTo(
        art,
        { opacity: 0, scale: 0.92, y: 34 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: { trigger: wrap, start: "top 82%", once: true },
        },
      );

      /* the ring's own light breathing, independent of the float */
      if (glow) {
        gsap.to(glow, {
          opacity: 0.85,
          scale: 1.06,
          duration: 3.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      /* idle float on its own wrapper so it never fights the entrance */
      gsap.to(float, {
        y: 12,
        duration: 5.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.2,
      });
    }, wrap);

    /* pointer parallax — the art leans, the glow leans less */
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const artX = gsap.quickTo(art, "x", { duration: 0.8, ease: "power3.out" });
    const artRot = gsap.quickTo(art, "rotationY", { duration: 0.9, ease: "power3.out" });
    const glowX = glow ? gsap.quickTo(glow, "x", { duration: 1, ease: "power3.out" }) : null;

    const onMove = (event) => {
      const rect = wrap.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      artX(px * 26);
      artRot(px * 6);
      glowX?.(px * 12);
    };
    const onLeave = () => {
      artX(0);
      artRot(0);
      glowX?.(0);
    };

    if (finePointer) {
      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerleave", onLeave);
    }

    return () => {
      ctx.revert();
      if (finePointer) {
        wrap.removeEventListener("pointermove", onMove);
        wrap.removeEventListener("pointerleave", onLeave);
      }
    };
  }, []);

  return (
    <div className="about-portal__visual" ref={wrapRef}>
      <span className="about-portal__visual-glow" ref={glowRef} aria-hidden="true" />

      <div className="about-portal__visual-float" ref={floatRef}>
        <div className="about-portal__visual-art" ref={artRef}>
          {/* the PNG fallback was 2.3MB shipped for browsers older than
              Safari 14 (2020); the WebP is 580KB and is served directly */}
          <picture>
            <img
              src={PERSON_WEBP}
              alt="A person standing on a rocky ledge, facing an illuminated portal ring"
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          </picture>

          {/* the words that used to live inside the WebGL ring */}
          <p className="about-portal__portal-text" aria-hidden="true">
            <span>Ideas</span>
            <span>Into</span>
            <span>Impact</span>
          </p>
        </div>
      </div>
    </div>
  );
}
