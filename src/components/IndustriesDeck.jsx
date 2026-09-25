import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Icon from "./Icon";
import { adjacentSectors, industries } from "../data/industries";

gsap.registerPlugin(ScrollTrigger);

const COUNT = industries.length;
/* How far the captured site scrolls inside its frame as a card passes the centre. */
const SHOT_TRAVEL = -68;

export default function IndustriesDeck() {
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const shotRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const isNarrow = window.matchMedia("(max-width: 900px)").matches;
    const spread = isNarrow ? 88 : 68;
    const depth = isNarrow ? 180 : 300;

    const render = (progress) => {
      /* Cards rest at the centre for most of each step, then swap quickly -
         without this the deck spends half the scroll in a muddled in-between. */
      const raw = progress * (COUNT - 1);
      const step = Math.min(COUNT - 2, Math.floor(raw));
      const within = gsap.utils.clamp(0, 1, (raw - step - 0.26) / 0.46);
      const position = step + within * within * (3 - 2 * within);

      for (let i = 0; i < COUNT; i += 1) {
        const card = cardRefs.current[i];
        if (!card) continue;

        const offset = i - position;
        const distance = Math.abs(offset);
        const rotation = gsap.utils.clamp(-38, 38, -offset * 26);
        const scale = Math.max(0.64, 1 - distance * 0.16);
        const shift = Math.sign(offset) * Math.pow(distance, 0.78) * spread;

        card.style.transform = `translate(-50%, -50%) translateX(${shift}%) translateZ(${
          -distance * depth
        }px) rotateY(${rotation}deg) scale(${scale})`;
        card.style.opacity = distance > 2.1 ? "0" : String(Math.max(0, 1 - distance * 0.52));
        card.style.filter = distance > 0.3 ? `blur(${Math.min(7, (distance - 0.3) * 8)}px)` : "none";
        card.style.zIndex = String(120 - Math.round(distance * 10));
        card.style.pointerEvents = distance < 0.5 ? "auto" : "none";
        card.classList.toggle("is-active", distance < 0.5);

        const shot = shotRefs.current[i];
        if (shot) {
          const travel = gsap.utils.clamp(-1, 1, offset);
          shot.style.transform = `translateY(${((1 - travel) / 2) * SHOT_TRAVEL}%)`;
        }
      }

      const next = gsap.utils.clamp(0, COUNT - 1, Math.round(position));
      setActiveIndex((current) => (current === next ? current : next));
    };

    const proxy = { value: 0 };
    const tween = gsap.to(proxy, {
      value: 1,
      ease: "none",
      onUpdate: () => render(proxy.value),
      scrollTrigger: {
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.7,
        invalidateOnRefresh: true,
      },
    });

    render(0);
    ScrollTrigger.refresh();

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const goTo = (index) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const scrollable = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (index / (COUNT - 1)) * scrollable, behavior: "smooth" });
  };

  const active = industries[activeIndex];

  return (
    <section
      id="industries"
      className="industry-deck"
      style={{ "--industry-color": active.color, "--deck-count": COUNT }}
    >
      <div className="industry-deck__intro">
        <div>
          <p className="eyebrow">Sector expertise</p>
          <h2>
            Industry fluency, <strong>engineered into every build.</strong>
          </h2>
        </div>
        <p>
          Scroll through the sectors we build in. Every panel is a real product surface, shaped around the
          workflows, risks, and customers of that market.
        </p>
      </div>

      <div className="industry-deck__track" ref={trackRef}>
        <div className="industry-deck__viewport">
          <div className="industry-deck__scene">
            {industries.map((industry, index) => (
              <article
                key={industry.name}
                className="deck-card"
                style={{ "--industry-color": industry.color }}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
              >
                <div className="deck-card__frame">
                  <span className="deck-card__bar" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <em>{industry.work ? industry.work.client : industry.name}</em>
                  </span>
                  <div className="deck-card__shot">
                    <img
                      src={industry.work ? industry.work.image : industry.image}
                      alt={
                        industry.work
                          ? `${industry.work.client} website built by Opus Geeks`
                          : industry.imageAlt
                      }
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                      ref={(node) => {
                        shotRefs.current[index] = node;
                      }}
                    />
                  </div>
                  <span className="deck-card__tag">
                    <Icon name={industry.work ? "app-window" : "layers"} />
                    {industry.work ? industry.work.type : industry.insetCaption}
                  </span>
                </div>

                <div className="deck-card__copy">
                  <span className="deck-card__badge">
                    <Icon name={industry.icon} />
                    {String(index + 1).padStart(2, "0")} / {String(COUNT).padStart(2, "0")}
                  </span>
                  <h3>{industry.name}</h3>
                  <p className="deck-card__focus">{industry.focus}</p>
                  <p className="deck-card__desc">{industry.description}</p>

                  <ul className="deck-card__chips">
                    {industry.signals.map((signal) => (
                      <li key={signal.title}>
                        <Icon name={signal.icon} />
                        {signal.title}
                      </li>
                    ))}
                  </ul>

                  <div className="deck-card__stats">
                    {industry.stats.map((stat) => (
                      <div key={stat.label}>
                        <strong>{stat.value}</strong>
                        <small>{stat.label}</small>
                      </div>
                    ))}
                  </div>

                  <div className="deck-card__proof">
                    <span>
                      <Icon name={industry.work ? "award" : "layers"} />
                      {industry.work ? "Recent build" : "Sector capability"}
                    </span>
                    <strong>{industry.work ? industry.work.client : industry.insetCaption}</strong>
                    <small>{industry.work ? industry.work.type : industry.focus}</small>
                  </div>

                  <div className="deck-card__foot">
                    <div className="deck-card__logos">
                      {industry.stack.map((tool) => (
                        <span key={tool.name} title={tool.name}>
                          <img src={tool.logo} alt={tool.name} loading="lazy" decoding="async" />
                        </span>
                      ))}
                    </div>
                    <Link to="/contact-us">
                      Start a {industry.name} build
                      <Icon name="arrow-up-right" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="industry-deck__hud">
            <div className="industry-deck__hud-label">
              <strong>{active.name}</strong>
              <small>{active.focus}</small>
            </div>
            <div className="industry-deck__hud-rail" role="tablist" aria-label="Industries">
              {industries.map((industry, index) => (
                <button
                  key={industry.name}
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === index}
                  aria-label={industry.name}
                  className={activeIndex === index ? "is-active" : ""}
                  style={{ "--industry-color": industry.color }}
                  onClick={() => goTo(index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </button>
              ))}
            </div>
            <p className="industry-deck__hud-hint">
              <Icon name="move-right" />
              Keep scrolling
            </p>
          </div>
        </div>
      </div>

      <div className="industry-deck__adjacent">
        <p>
          <Icon name="sparkles" />
          Also shipping in
        </p>
        <div>
          {adjacentSectors.map((sector) => (
            <span key={sector}>{sector}</span>
          ))}
        </div>
        <Link to="/contact-us">
          Your sector not listed?
          <Icon name="arrow-up-right" />
        </Link>
      </div>
    </section>
  );
}
