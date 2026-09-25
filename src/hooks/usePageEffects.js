import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import VanillaTilt from "vanilla-tilt";
import { useLocation } from "react-router-dom";

export default function usePageEffects() {
  const location = useLocation();

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      if (location.hash) {
        document.querySelector(location.hash)?.scrollIntoView();
        return;
      }
      window.scrollTo(0, 0);
    });

    return () => cancelAnimationFrame(frameId);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMac = /Macintosh|Mac OS X/.test(navigator.userAgent);
    const isPerformanceMode =
      isMac ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 6) ||
      (navigator.deviceMemory && navigator.deviceMemory <= 4);
    document.documentElement.classList.toggle("performance-mode", Boolean(isPerformanceMode));

    const nodes = Array.from(document.querySelectorAll("[data-tilt]"));
    const magneticNodes = isPerformanceMode
      ? []
      : Array.from(document.querySelectorAll(".magnetic:not(.glow-button):not(.ghost-link)"));
    const magneticCleanups = magneticNodes.map((node) => {
      const move = (event) => {
        const rect = node.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        node.style.transform = `translate3d(${x * 0.18}px, ${y * 0.22}px, 0)`;
      };
      const leave = () => {
        node.style.transform = "translate3d(0, 0, 0)";
      };
      node.addEventListener("mousemove", move);
      node.addEventListener("mouseleave", leave);
      return () => {
        node.removeEventListener("mousemove", move);
        node.removeEventListener("mouseleave", leave);
      };
    });

    if (nodes.length && !isPerformanceMode && !prefersReduced) {
      VanillaTilt.init(nodes, {
        max: 9,
        speed: 650,
        glare: true,
        "max-glare": 0.18,
        perspective: 900,
        gyroscope: false,
      });
    }

    if (!prefersReduced) {
      gsap.registerPlugin(ScrollTrigger);
      /* `.nav-shell` was the old header; the site ships og-header now, which
         animates itself. The tween was targeting nothing. */
      /* These are the old page-hero classes. Most pages no longer have any of
         them, and handing GSAP a selector that matches nothing logs "target
         not found" on every route - so it only runs when something is there. */
      const heroBits = gsap.utils.toArray(
        ".hero-kicker, .hero-title, .hero-copy, .hero-actions, .hero-metrics, .page-hero .eyebrow, .page-hero h1, .page-hero p",
      );
      if (heroBits.length) {
        gsap.timeline({ defaults: { ease: "power3.out" } }).fromTo(
          heroBits,
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, stagger: 0.06 },
        );
      }

      gsap.utils.toArray(".reveal").forEach((el) => {
        const containsHeading = Boolean(el.querySelector("h2"));
        gsap.fromTo(
          el,
          { y: 42, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: isPerformanceMode ? 0.62 : containsHeading ? 1.15 : 0.78,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 86%",
              once: true,
            },
          },
        );
      });

      ScrollTrigger.refresh();
    } else {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    }

    // Click ripple for primary buttons / links
    const rippleSelector = ".glow-button, .nav-cta, .ghost-link, .mini-button, .ripple-btn";
    const handleRipple = (event) => {
      const target = event.target.closest?.(rippleSelector);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.15;
      const ripple = document.createElement("span");
      ripple.className = "btn-ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      target.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    };
    document.addEventListener("pointerdown", handleRipple);

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      nodes.forEach((node) => node.vanillaTilt?.destroy());
      magneticCleanups.forEach((cleanup) => cleanup());
      document.removeEventListener("pointerdown", handleRipple);
    };
  }, [location.pathname]);
}
