import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Icon from "./Icon";
import "./ServicesConnected.css";

gsap.registerPlugin(ScrollTrigger);

/* ==========================================================================
   SERVICES — FOUR CONNECTED CARDS
   Built to the supplied layout: numbered cards joined by a drawn connector,
   each carrying an illustration, a proof metric and a link through to the
   service page.

   The connector is one SVG path across the whole row rather than a border on
   each card, because it has to pass BETWEEN cards and bow slightly — a border
   cannot leave its own box, and four separate segments would never line up
   once the cards reflow. It redraws itself from the real card positions on
   resize, so it stays attached at every width.
   ========================================================================== */

const SERVICES = [
  {
    num: "01",
    title: "Mobile Applications",
    copy: "Powerful, intuitive mobile apps for iOS and Android that turn ideas into everyday solutions.",
    icon: "smartphone",
    metric: "100+",
    metricLabel: "Apps Launched",
    metricIcon: "smartphone",
    shot: "/assets/herobanner/03_mobile_app.webp",
    to: "/services/mobile-development",
    accent: "#633494",
  },
  {
    num: "02",
    title: "Web Development",
    copy: "High-performance websites and web apps tailored to your goals, built for what's next.",
    icon: "code-2",
    metric: "200+",
    metricLabel: "Projects Delivered",
    metricIcon: "layout-dashboard",
    shot: "/assets/herobanner/02_web.webp",
    to: "/services/web-development",
    accent: "#147bc2",
  },
  {
    num: "03",
    title: "UI/UX Design",
    copy: "Human-centered design experiences that look beautiful, feel effortless and drive results.",
    icon: "pen-tool",
    metric: "95%",
    metricLabel: "Client Satisfaction",
    metricIcon: "users",
    shot: "/assets/herobanner/04_uiux.webp",
    to: "/services/ui-ux-design",
    accent: "#00aeef",
  },
  {
    num: "04",
    title: "AI Automation",
    copy: "Intelligent automation using AI to streamline workflows, reduce manual work and unlock growth.",
    icon: "bot",
    metric: "3x",
    metricLabel: "Average Efficiency",
    metricIcon: "zap",
    shot: "/assets/herobanner/06_ai.webp",
    to: "/services",
    accent: "#8b5cf6",
  },
];

const PROMISES = [
  { icon: "heart", label: "People-Centric" },
  { icon: "git-branch", label: "Long-Term Partnership" },
  { icon: "shield-check", label: "Real-World Impact" },
];

export default function ServicesConnected() {
  const rootRef = useRef(null);
  const rowRef = useRef(null);
  const cardRefs = useRef([]);
  const pathRef = useRef(null);
  const svgRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const row = rowRef.current;
    if (!root || !row) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Measure the cards and lay the connector through the gaps between them.
       Anchors sit on the illustration's vertical centre so the line reads as
       threading the artwork, not the card. */
    const drawConnector = () => {
      const svg = svgRef.current;
      const path = pathRef.current;
      const cards = cardRefs.current.filter(Boolean);
      if (!svg || !path || cards.length < 2) return;

      const rowBox = row.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${rowBox.width} ${rowBox.height}`);

      const anchors = cards.map((card) => {
        const box = card.getBoundingClientRect();
        const art = card.querySelector(".sc-card__art");
        const artBox = art ? art.getBoundingClientRect() : box;
        return {
          left: box.left - rowBox.left,
          right: box.right - rowBox.left,
          y: artBox.top + artBox.height * 0.62 - rowBox.top,
        };
      });

      /* one path, hopping each gap with a shallow arc. The arc reaches INTO
         each card by a few px so the line looks threaded through the artwork
         rather than stopping politely at the card edge. */
      let d = "";
      const joints = [];
      for (let i = 0; i < anchors.length - 1; i += 1) {
        const from = anchors[i];
        const to = anchors[i + 1];
        const x1 = from.right - 26;
        const x2 = to.left + 26;
        const mid = (x1 + x2) / 2;
        const lift = Math.min(30, Math.abs(x2 - x1) * 0.55 + 14);
        d += `M ${x1} ${from.y} C ${mid} ${from.y - lift}, ${mid} ${to.y - lift}, ${x2} ${to.y} `;
        joints.push({ x: x1, y: from.y }, { x: x2, y: to.y });
      }
      path.setAttribute("d", d.trim());

      /* a dot at every junction, as in the layout */
      const dotLayer = svg.querySelector(".sc__connector-dots");
      if (dotLayer) {
        dotLayer.replaceChildren();
        joints.forEach((joint) => {
          const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          dot.setAttribute("cx", String(joint.x));
          dot.setAttribute("cy", String(joint.y));
          dot.setAttribute("r", "4.5");
          dot.setAttribute("class", "sc__connector-dot");
          dotLayer.appendChild(dot);
        });
      }

      const len = path.getTotalLength?.() || 0;
      path.style.setProperty("--dash", String(len));
      return len;
    };

    drawConnector();

    const ctx = gsap.context(() => {
      const cards = cardRefs.current.filter(Boolean);

      if (reduced) {
        gsap.set([root.querySelectorAll("[data-sc-reveal]"), cards], { opacity: 1, y: 0 });
        pathRef.current?.classList.add("is-drawn");
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: root, start: "top 74%", once: true },
      });

      tl.fromTo(
        root.querySelectorAll("[data-sc-reveal]"),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 },
      )
        .fromTo(
          cards,
          { opacity: 0, y: 40, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12 },
          "-=0.35",
        )
        /* the connector draws itself only after the cards it joins exist */
        .fromTo(
          pathRef.current,
          { strokeDashoffset: (i, el) => el.style.getPropertyValue("--dash") || 1200 },
          {
            strokeDashoffset: 0,
            duration: 1.1,
            ease: "power2.inOut",
            /* hand the line over to the dotted pattern once it has arrived */
            onComplete: () => pathRef.current?.classList.add("is-drawn"),
          },
          "-=0.5",
        );

      /* Each illustration drifts on its own clock - done in CSS now
         (sc-card__art-img, --drift-*). As a GSAP repeat:-1 per card it wrote
         an inline transform on the main thread every frame, forever, on or
         off screen: 679 style writes in three idle seconds, measured. A CSS
         transform animation runs on the compositor and is paused by the
         animation budget when the section is out of view. */
    }, root);

    const onResize = () => {
      const len = drawConnector();
      /* after the intro has run the line is fully drawn — keep it that way */
      if (pathRef.current && len) pathRef.current.classList.add("is-drawn");
    };
    window.addEventListener("resize", onResize);

    return () => {
      ctx.revert();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="sc" id="services" ref={rootRef}>
      {/* two hollow rings, top-left and bottom-right, cut from the brand ramp.
          They sit on this section rather than the About one because the copy
          here is centred - the corners are empty, so a mark in them reads as
          framing rather than as something crowding the text. */}
      <span className="sc__ring sc__ring--tl" aria-hidden="true" />
      <span className="sc__ring sc__ring--br" aria-hidden="true" />

      <div className="sc__inner">
        {/* corner annotations, as in the layout */}
        <span className="sc__corner sc__corner--tl" aria-hidden="true" hidden>
          Technology
          <br />
          for a brighter
          <br />
          tomorrow
        </span>
        <span className="sc__corner sc__corner--br" aria-hidden="true" hidden>
          OpusGeeks
          <br />
          <em>a brighter digital tomorrow</em>
        </span>

        <header className="sc__head">
          <p className="sc__eyebrow" data-sc-reveal>
            OpusGeeks
          </p>
          <h2 className="sc__title" data-sc-reveal>
            From Ideas to <strong>Impact.</strong>
          </h2>
          <p className="sc__sub" data-sc-reveal>
            We design, build and automate digital solutions that help businesses grow faster, work
            smarter and make a real difference.
          </p>
        </header>

        <div className="sc__row" ref={rowRef}>
          <svg className="sc__connector" ref={svgRef} preserveAspectRatio="none" aria-hidden="true">
            <path ref={pathRef} className="sc__connector-path" d="" />
            <g className="sc__connector-dots" />
          </svg>

          {SERVICES.map((service, i) => (
            <article
              className="sc-card"
              key={service.num}
              style={{ "--accent": service.accent }}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
            >
              <span className="sc-card__num">{service.num}</span>

              <div className="sc-card__art">
                <span className="sc-card__art-glow" aria-hidden="true" />
                <img
                  className="sc-card__art-img"
                  style={{ "--drift-dur": `${3.4 + i * 0.45}s`, "--drift-delay": `${0.6 + i * 0.2}s` }}
                  src={service.shot}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <span className="sc-card__art-chip" aria-hidden="true">
                  <Icon name={service.icon} />
                </span>
              </div>

              <h3 className="sc-card__title">{service.title}</h3>
              <p className="sc-card__copy">{service.copy}</p>

              <div className="sc-card__foot">
                <span className="sc-card__metric">
                  <span className="sc-card__metric-icon">
                    <Icon name={service.metricIcon} />
                  </span>
                  <span className="sc-card__metric-text">
                    <strong>{service.metric}</strong>
                    <small>{service.metricLabel}</small>
                  </span>
                </span>

                <Link
                  className="sc-card__go"
                  to={service.to}
                  aria-label={`Explore ${service.title}`}
                >
                  <Icon name="move-right" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="sc__action" data-sc-reveal>
          <Link className="sc__cta" to="/services">
            Explore All Services
            <Icon name="move-right" />
          </Link>
          <span className="sc__note" aria-hidden="true">
            Let&rsquo;s build what&rsquo;s next.
          </span>
        </div>

        <ul className="sc__promises" data-sc-reveal>
          {PROMISES.map((promise) => (
            <li key={promise.label}>
              <Icon name={promise.icon} />
              {promise.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
