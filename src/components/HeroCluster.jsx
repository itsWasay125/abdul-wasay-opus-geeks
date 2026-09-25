import { useLayoutEffect, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Icon from "./Icon";
import ShinyButton from "./ShinyButton";
import GlowButton from "./GlowButton";
import "./HeroCluster.css";

/* "Ideas engineered into digital reality" hero.

   The cube itself is one pre-composed render (01) — the panels, their angles
   and the brand plate are already baked into it, so reassembling them from the
   individual crops only ever produced a flatter, looser version of the same
   picture. Everything else is a thin 2.5D parallax rig around that centrepiece:
   pure DOM + GSAP, no WebGL, with depth expressed as parallax amount rather
   than real translateZ so it stays cheap on integrated GPUs.

   Service tags (10–16) are deliberately not layered on: 01 already carries its
   own Web / Apps / Mobile / AI / Cloud labels, so a second set would double up. */

const ASSET_BASE = "/assets/hero";

const LAYERS = [
  {
    key: "particles",
    src: `${ASSET_BASE}/23_particles.png`,
    depth: 0.12,
    className: "hc-particles",
    float: { y: 9, rotation: 0, duration: 7.4 },
  },
  {
    key: "cube",
    src: `${ASSET_BASE}/01_full_3d_cube_reference.webp`,
    depth: 0.3,
    className: "hc-cube",
    float: { y: 14, rotation: 0.5, duration: 6.2 },
  },
  {
    key: "cubes",
    src: `${ASSET_BASE}/17_small_floating_cubes.png`,
    depth: 0.9,
    className: "hc-cubes",
    float: { y: 18, rotation: 2.4, duration: 4.4 },
  },
  {
    key: "glow-cube",
    src: `${ASSET_BASE}/22_glow_cube.png`,
    depth: 1,
    className: "hc-glow-cube",
    float: { y: 21, rotation: -3, duration: 3.7 },
  },
];

const DEFAULT_STATS = [
  { value: 500, suffix: "+", label: "Projects" },
  { value: 50, suffix: "+", label: "Happy Clients" },
  { value: 98, suffix: "%", label: "Satisfaction" },
];

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

export default function HeroCluster({
  eyebrow = "Ideas  ×  Technology  ×  Real Impact",
  titleLead = "Ideas engineered",
  titleAccent = "into digital reality.",
  lead = "We turn bold ideas into powerful digital products — websites, mobile apps, AI solutions and more.",
  primary = { label: "Start a project", to: "/contact-us" },
  secondary = { label: "See our work", to: "/portfolio" },
  stats = DEFAULT_STATS,
}) {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef(null);
  const clusterRef = useRef(null);
  const copyRefs = useRef([]);
  const anchorRefs = useRef([]);
  const floatRefs = useRef([]);
  const statRefs = useRef([]);

  const setCopyRef = (index) => (el) => {
    copyRefs.current[index] = el;
  };

  useLayoutEffect(() => {
    const cluster = clusterRef.current;
    const copyEls = copyRefs.current.filter(Boolean);
    const anchorEls = anchorRefs.current.filter(Boolean);
    const floatEls = floatRefs.current.filter(Boolean);
    const statEls = statRefs.current.filter(Boolean);

    if (reduced) {
      gsap.set([...copyEls, ...floatEls], { clearProps: "all" });
      gsap.set(anchorEls, { clearProps: "all" });
      statEls.forEach((el, index) => {
        const stat = stats[index];
        if (stat) el.textContent = `${stat.value}${stat.suffix}`;
      });
      return undefined;
    }

    const timers = [];

    const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
    entrance
      .fromTo(copyEls, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 })
      .fromTo(
        floatEls,
        { opacity: 0, scale: 0.86, y: 26 },
        { opacity: 1, scale: 1, y: 0, duration: 0.9, stagger: 0.1 },
        "-=0.45"
      );

    statEls.forEach((el, index) => {
      const stat = stats[index];
      if (!stat) return;
      const proxy = { value: 0 };
      timers.push(
        gsap.to(proxy, {
          value: stat.value,
          duration: 1.5,
          delay: 0.55,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = `${Math.round(proxy.value)}${stat.suffix}`;
          },
        })
      );
    });

    /* continuous idle float, one independent tween per layer so they never sync
       up. The centre cube gets the gentlest bob and barely any rotation — it is
       a large object and reads as wobbling if you spin it. */
    LAYERS.forEach((layer, index) => {
      const el = floatRefs.current[index];
      if (!el) return;
      timers.push(
        gsap.to(el, {
          y: `+=${layer.float.y}`,
          rotation: layer.float.rotation,
          duration: layer.float.duration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1.2 + index * 0.12,
        })
      );
    });

    /* pointer parallax: nearer (higher-depth) layers move further */
    const quickSetters = LAYERS.map((_, index) => {
      const el = anchorRefs.current[index];
      if (!el) return null;
      return {
        x: gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" }),
      };
    });

    const isFinePointer = window.matchMedia("(pointer: fine)").matches;

    const handleMove = (event) => {
      if (!cluster) return;
      const rect = cluster.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      LAYERS.forEach((layer, index) => {
        const setter = quickSetters[index];
        if (!setter) return;
        setter.x(px * layer.depth * 36);
        setter.y(py * layer.depth * 28);
      });
    };

    const handleLeave = () => {
      quickSetters.forEach((setter) => {
        if (!setter) return;
        setter.x(0);
        setter.y(0);
      });
    };

    if (cluster && isFinePointer) {
      cluster.addEventListener("pointermove", handleMove);
      cluster.addEventListener("pointerleave", handleLeave);
    }

    return () => {
      entrance.kill();
      timers.forEach((tween) => tween.kill());
      gsap.killTweensOf([...anchorEls, ...floatEls]);
      if (cluster && isFinePointer) {
        cluster.removeEventListener("pointermove", handleMove);
        cluster.removeEventListener("pointerleave", handleLeave);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const handleImgError = (event) => {
    const wrapper = event.currentTarget.closest(".hc-layer");
    if (wrapper) wrapper.style.display = "none";
  };

  return (
    <section className="hero-cluster" ref={rootRef}>
      <div className="hero-cluster__inner">
        <div className="hero-cluster__copy">
          <p className="hero-cluster__eyebrow" ref={setCopyRef(0)}>
            {eyebrow}
          </p>

          <h1 className="hero-cluster__title" ref={setCopyRef(1)}>
            <span>{titleLead}</span>
            <strong>{titleAccent}</strong>
          </h1>

          <p className="hero-cluster__lead" ref={setCopyRef(2)}>
            {lead}
          </p>

          <div className="hero-cluster__actions" ref={setCopyRef(3)}>
            <ShinyButton to={primary.to} label={primary.label} icon="move-right" />
            <GlowButton to={secondary.to} label={secondary.label} icon="play" />
          </div>

          <div className="hero-cluster__stats" ref={setCopyRef(4)}>
            {stats.map((stat, index) => (
              <span key={stat.label}>
                <strong ref={(el) => { statRefs.current[index] = el; }}>
                  {reduced ? `${stat.value}${stat.suffix}` : "0"}
                </strong>
                <small>{stat.label}</small>
              </span>
            ))}
          </div>
        </div>

        <div className="hero-cluster__visual" aria-hidden="true" ref={clusterRef}>
          {LAYERS.map((layer, index) => (
            <div
              className={`hc-layer ${layer.className}`}
              key={layer.key}
              ref={(el) => {
                anchorRefs.current[index] = el;
              }}
            >
              <div
                className="hc-layer__float"
                ref={(el) => {
                  floatRefs.current[index] = el;
                }}
              >
                <img
                  src={layer.src}
                  alt=""
                  loading="eager"
                  decoding="async"
                  draggable="false"
                  onError={handleImgError}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
