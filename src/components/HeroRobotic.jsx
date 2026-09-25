import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import ShinyButton from "./ShinyButton";
import GlowButton from "./GlowButton";
import InteractiveGrid from "./InteractiveGrid";
import "./HeroRobotic.css";
import Typewriter from "./Typewriter";

/* Robotic-hand hero: a pre-rendered CGI hand holds a service object that keeps
   transforming into the next discipline.

   Layout note — the scene is a full-bleed overlay pinned to the hero, NOT a
   cell in the text grid. The hand anchors to the hero's right boundary and the
   object is positioned as a percentage of the hand's own box (.rh-stage), so
   the two stay locked together at every viewport width instead of drifting
   apart as a grid column resizes.

   Animation note — everything animated is driven imperatively. The component
   renders its shell once and never re-renders from the loop; the active image,
   its per-slide sizing and the rail highlight are written straight to the DOM
   inside the GSAP callbacks, because a re-render mid-transition would have
   React reconciling the exact nodes GSAP is mid-tween on.

   Transform ownership is split across nested wrappers so no two timelines ever
   write the same property: .rh-stage holds the static position, __parallax the
   pointer offset, __float the idle bob, and __frame the slide transition. */

const ASSETS = "/assets/herobanner";

/* Sequence: the cube opens, then the seven services, then back to the cube.

   `scale` normalises perceived size and `offset` re-centres the subject — both
   derived from each file's measured alpha bounding box rather than guessed,
   since every service PNG is the same 1254² canvas but fills a different
   fraction of it. Offsets are a % of the rendered image.

   Two asset caveats, both visible here rather than hidden:
   - the cube is only 171px of artwork against the services' 1254px, so it is
     held deliberately small to limit the upscale;
   - `more` reuses the UI/UX artwork, which is how the asset pack ships. */
const STATES = [
  /* the cube is held at 0.72 to limit its upscale; because per-slide scaling
     shrinks around the centre, the +12% nudge keeps its underside level with
     the full-size slides instead of floating clear of the palm */
  { id: "cube", label: "Digital Products", rail: null, image: `${ASSETS}/18_core_cube.webp`, scale: 0.72, offsetX: 0.9, offsetY: 12 },
  { id: "app", label: "Mobile Apps", rail: "App", image: `${ASSETS}/03_mobile_app.webp`, scale: 1.03, offsetX: 0.5, offsetY: 1.6 },
  { id: "web", label: "Web Development", rail: "Web", image: `${ASSETS}/02_web.webp`, scale: 0.97, offsetX: -1.3, offsetY: -0.2 },
  { id: "game", label: "Game Development", rail: "Game", image: `${ASSETS}/05_game.webp`, scale: 0.99, offsetX: -0.8, offsetY: 0.3 },
  { id: "uiux", label: "UI / UX Design", rail: "UI/UX", image: `${ASSETS}/04_uiux.webp`, scale: 0.99, offsetX: -1.2, offsetY: -0.1 },
  { id: "ai", label: "AI Solutions", rail: "AI", image: `${ASSETS}/06_ai.webp`, scale: 0.94, offsetX: -0.5, offsetY: -0.1 },
  { id: "cloud", label: "Cloud Solutions", rail: "Cloud", image: `${ASSETS}/07_cloud.webp`, scale: 1.11, offsetX: -0.6, offsetY: -1 },
  { id: "more", label: "And More", rail: "And More", image: `${ASSETS}/08_more_digital_products.webp`, scale: 0.99, offsetX: -1.2, offsetY: -0.1 },
];

const HAND = `${ASSETS}/01_robotic_hand.webp`;

/* The word that cycles in the headline. Each one has to finish
   "Transforming ideas into ___"

   They are also all within one character of each other, and that is the point.
   The stack is a fixed box as wide as the longest word, so a short word leaves
   the rest of the line sitting away from it - "Ideas" against "Visions" was a
   two-character hole opening and closing before "into" on every swap. Six and
   seven characters of Bebas are close enough that the gap reads as even. Keep
   any replacement to 6-7 characters.

   Length no longer has to match. The rotator is the last thing on the line,
   so the sizer's slack falls off the end of the sentence instead of opening
   a hole in the middle of it. */
const ROTATING_WORDS = ["Reality.", "Products.", "Platforms.", "Launches."];


const HOLD = 2.8; // seconds a slide stays put
const SWAP = 0.9; // seconds the transformation takes

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

function applySlide(img, state) {
  img.style.setProperty("--slide-scale", state.scale);
  img.style.setProperty("--slide-x", `${state.offsetX}%`);
  img.style.setProperty("--slide-y", `${state.offsetY}%`);
}

export default function HeroRobotic({
  eyebrow = "Technology for a brighter tomorrow",
  primary = { label: "Start Building", to: "/contact-us" },
  secondary = { label: "Play Showreel", to: "/portfolio" },
}) {
  const reduced = usePrefersReducedMotion();

  const rootRef = useRef(null);
  const sceneRef = useRef(null);
  const copyRefs = useRef([]);
  const handParallaxRef = useRef(null);
  const handFloatRef = useRef(null);
  const objParallaxRef = useRef(null);
  const objFloatRef = useRef(null);
  const frameRefs = useRef([]);
  const imgRefs = useRef([]);
  const railRefs = useRef([]);
  const goToRef = useRef(null);

  const setCopyRef = (index) => (el) => {
    copyRefs.current[index] = el;
  };

  useLayoutEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    if (!root || !scene) return undefined;

    const frames = frameRefs.current;
    const images = imgRefs.current;
    if (!frames[0] || !frames[1] || !images[0] || !images[1]) return undefined;

    /* buffer 0 opens on the cube; buffer 1 is the one we load into next */
    let buffer = 0;
    let index = 0;
    images[0].src = STATES[0].image;
    applySlide(images[0], STATES[0]);

    const paintReadouts = (i) => {
      /* rail entry r maps to STATES[r + 1]; the cube (i === 0) lights none */
      railRefs.current.forEach((el, r) => el?.classList.toggle("is-active", i === r + 1));
    };
    paintReadouts(0);

    const ctx = gsap.context(() => {
      const copyEls = copyRefs.current.filter(Boolean);

      if (reduced) {
        gsap.set([...copyEls, handFloatRef.current, frames[0]], { clearProps: "all" });
        gsap.set(frames[0], { opacity: 1 });
        gsap.set(frames[1], { opacity: 0 });
        return;
      }

      gsap.set(frames[1], { opacity: 0 });

      /* ---------- entrance ---------- */
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .fromTo(copyEls, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75, stagger: 0.1 })
        .fromTo(
          handFloatRef.current,
          { opacity: 0, x: 90, y: 26 },
          { opacity: 1, x: 0, y: 0, duration: 1.15 },
          "-=0.75"
        )
        .fromTo(
          frames[0],
          { opacity: 0, scale: 0.78, y: 26 },
          { opacity: 1, scale: 1, y: 0, duration: 1 },
          "-=0.7"
        )
        .fromTo(
          railRefs.current.filter(Boolean),
          { opacity: 0, x: 14 },
          { opacity: 1, x: 0, duration: 0.45, stagger: 0.05 },
          "-=0.6"
        );

      /* ---------- headline word flip ----------
         The outgoing word masks upward out of the box and the incoming one
         rises into the same slot behind it.

         155% rather than 100%: Bebas draws taller than its line box, so a
         word moved by exactly its own height still showed its ascenders under
         the mask. The extra travel clears the glyphs, not just the box.

         The box itself never changes width - a hidden sizer underneath holds
         all four words in one grid cell, so it is simply as wide as the
         widest of them. Nothing is measured in JavaScript, which means
         nothing has to be re-measured when the font lands or the viewport
         changes, and "into" never moves.

         gsap.delayedCall rather than setTimeout so the chain belongs to the
         context; the recursive call is created after the context has finished
         recording, so it is tracked by hand and killed in the cleanup. */
      /* the rotating word is typed by <Typewriter>, not animated here */
      let wordCall = null;

      /* ---------- idle float (own wrappers, so nothing collides) ---------- */
      const idle = [
        gsap.to(handFloatRef.current, {
          y: 6,
          duration: 6.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1.6,
        }),
        gsap.to(objFloatRef.current, {
          y: 13,
          duration: 4.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1.4,
        }),
      ];

      /* ---------- the transformation loop ---------- */
      let queued = null;
      let visible = true;
      let running = false;
      let pending = null; // a rail click that arrived mid-transition

      const preload = (state) => {
        if (!state) return;
        const img = new Image();
        img.src = state.image;
      };

      const schedule = () => {
        queued?.kill();
        queued = visible ? gsap.delayedCall(HOLD, () => goTo((index + 1) % STATES.length)) : null;
      };

      async function goTo(target) {
        /* a click landing mid-swap is held rather than dropped, so the rail
           always responds instead of silently ignoring every other tap */
        if (running) {
          pending = target;
          return;
        }
        if (target === index) return;
        running = true;
        queued?.kill();
        queued = null;

        const state = STATES[target];
        const incomingBuffer = 1 - buffer;
        const incoming = frames[incomingBuffer];
        const outgoing = frames[buffer];
        const incomingImg = images[incomingBuffer];

        /* decode before animating — otherwise the incoming frame can fade up on
           a blank element while the browser is still decoding the PNG */
        try {
          if (incomingImg.getAttribute("src") !== state.image) {
            incomingImg.src = state.image;
            applySlide(incomingImg, state);
          }
          await incomingImg.decode();
        } catch {
          /* decode() rejects on a failed or superseded load — carry on and let
             the tween run rather than stalling the loop for good */
        }

        const swap = gsap.timeline({
          onComplete: () => {
            buffer = incomingBuffer;
            index = target;
            running = false;
            preload(STATES[(target + 1) % STATES.length]);
            if (pending !== null) {
              const next = pending;
              pending = null;
              goTo(next);
            } else {
              schedule();
            }
          },
        });

        swap
          .to(outgoing, {
            opacity: 0,
            scale: 0.82,
            y: -34,
            rotationY: -20,
            transformPerspective: 900,
            duration: SWAP,
            ease: "power3.inOut",
          })
          .fromTo(
            incoming,
            { opacity: 0, scale: 0.82, y: 26, rotationY: 22, transformPerspective: 900 },
            { opacity: 1, scale: 1, y: 0, rotationY: 0, duration: SWAP, ease: "power3.inOut" },
            `-=${SWAP * 0.62}`
          );

        paintReadouts(target);
      }

      goToRef.current = goTo;

      intro.eventCallback("onComplete", () => {
        preload(STATES[1]);
        schedule();
      });

      /* pause the loop while the hero is off screen */
      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (!visible) {
            queued?.kill();
            queued = null;
          } else if (!queued && !running && intro.progress() === 1) {
            schedule();
          }
        },
        { threshold: 0.05 }
      );
      io.observe(scene);

      /* ---------- pointer parallax ---------- */
      const handX = gsap.quickTo(handParallaxRef.current, "x", { duration: 0.8, ease: "power3.out" });
      const handY = gsap.quickTo(handParallaxRef.current, "y", { duration: 0.8, ease: "power3.out" });
      const objX = gsap.quickTo(objParallaxRef.current, "x", { duration: 0.7, ease: "power3.out" });
      const objY = gsap.quickTo(objParallaxRef.current, "y", { duration: 0.7, ease: "power3.out" });

      const finePointer = window.matchMedia("(pointer: fine)").matches;

      const onMove = (event) => {
        const rect = root.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        handX(px * 5);
        handY(py * 4);
        objX(px * 14);
        objY(py * 11);
      };

      const onLeave = () => {
        handX(0);
        handY(0);
        objX(0);
        objY(0);
      };

      if (finePointer) {
        root.addEventListener("pointermove", onMove);
        root.addEventListener("pointerleave", onLeave);
      }

      return () => {
        io.disconnect();
        queued?.kill();
        wordCall?.kill();
        idle.forEach((tween) => tween.kill());
        goToRef.current = null;
        if (finePointer) {
          root.removeEventListener("pointermove", onMove);
          root.removeEventListener("pointerleave", onLeave);
        }
      };
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  /* rail entries map to STATES[1..] — the cube is the intro, not a service */
  const services = STATES.slice(1);

  return (
    <section className="rh-hero" ref={rootRef}>
      <span className="rh-hero__wash" aria-hidden="true" />

      {/* same reactive grid the About hero uses, dialled down so it reads as
          texture behind the hand rather than competing with it */}
      <InteractiveGrid
        className="rh-hero__grid"
        gridSize={58}
        gridColor="rgba(14, 30, 72, 0.055)"
        effectColor="rgba(37, 99, 235, 0.22)"
        glowRadius={22}
        fadeIntensity={40}
        fadeColor="#ffffff"
      />

      {/* full-bleed scene: anchored to the hero's right boundary, never to a
          text-grid column, so the forearm runs off the viewport edge cleanly */}
      <div className="rh-scene" ref={sceneRef} aria-hidden="true">
        <div className="rh-stage">
          <div className="rh-hand" ref={handParallaxRef}>
            <div className="rh-hand__float" ref={handFloatRef}>
              <img src={HAND} alt="" decoding="async" draggable="false" />
            </div>
          </div>

          <div className="rh-object">
            <div className="rh-object__parallax" ref={objParallaxRef}>
              <div className="rh-object__float" ref={objFloatRef}>
                {[0, 1].map((slot) => (
                  <div
                    className="rh-object__frame"
                    key={slot}
                    ref={(el) => {
                      frameRefs.current[slot] = el;
                    }}
                  >
                    <img
                      alt=""
                      decoding="async"
                      draggable="false"
                      ref={(el) => {
                        imgRefs.current[slot] = el;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* service rail: its own overlay layer above the scene */}
      <nav className="rh-rail" aria-label="Services showcased">
        <ul>
          {services.map((state, i) => (
            <li key={state.id}>
              <button
                type="button"
                ref={(el) => {
                  railRefs.current[i] = el;
                }}
                onClick={() => goToRef.current?.(i + 1)}
              >
                {state.rail}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="rh-hero__inner">
        <div className="rh-hero__copy">
          <p className="rh-hero__eyebrow" ref={setCopyRef(0)}>
            {eyebrow}
          </p>

          <h1 className="rh-hero__title">
            <span className="rh-hero__line" ref={setCopyRef(1)}>
              Transforming
            </span>
            <span className="rh-hero__line" ref={setCopyRef(2)}>
              ideas that matter
            </span>
            <span className="rh-hero__line" ref={setCopyRef(3)}>
              into{" "}
              {/* The rotator is the last thing on the last line. It used to sit
                  mid-sentence with "into" after it, so the sizer's box - which is
                  as wide as the longest word and is what stops the line moving -
                  left a visible gap before "into" whenever a shorter word was
                  showing. At the end of the line that same slack falls off the
                  end, where there is nothing to push and nothing to see. */}
              <span className="rh-hero__rotator" aria-hidden="true">
                <span className="rh-hero__rotator-sizer">
                  {ROTATING_WORDS.map((word) => (
                    <em key={word}>{word}</em>
                  ))}
                </span>
                <span className="rh-hero__flip">
                  {/* typed and backspaced; the sizer beside it holds the width */}
                  <em>
                    <Typewriter words={ROTATING_WORDS} />
                  </em>
                </span>
              </span>
              <span className="sr-only">Reality.</span>
            </span>
          </h1>

          <p className="rh-hero__lead" ref={setCopyRef(4)}>
            We build websites, mobile apps, games and digital products that help brands grow,
            engage and lead.
          </p>

          <div className="rh-hero__actions" ref={setCopyRef(5)}>
            <ShinyButton to={primary.to} label={primary.label} icon="move-right" />
            <GlowButton to={secondary.to} label={secondary.label} icon="play" />
          </div>
        </div>
      </div>

    </section>
  );
}
