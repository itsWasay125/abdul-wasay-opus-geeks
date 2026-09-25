import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import ShinyButton from "./ShinyButton";
import GlowButton from "./GlowButton";
import { adjacentSectors, industries } from "../data/industries";

const ROTATION_MS = 7000;

export default function IndustriesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const tabRefs = useRef([]);
  const railRef = useRef(null);
  const active = industries[activeIndex];

  /* Keep the active tab visible when the rail scrolls horizontally on phones. */
  useEffect(() => {
    const rail = railRef.current;
    const tab = tabRefs.current[activeIndex];
    if (!rail || !tab || rail.scrollWidth <= rail.clientWidth + 4) return;

    rail.scrollTo({
      left: tab.offsetLeft - (rail.clientWidth - tab.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [activeIndex]);

  useEffect(() => {
    if (isPaused) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % industries.length);
    }, ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const focusTab = useCallback((index) => {
    const next = (index + industries.length) % industries.length;
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  }, []);

  const handleKeyDown = (event, index) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusTab(index + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusTab(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(industries.length - 1);
    }
  };

  return (
    <section id="industries" className="section industries-section theme-light">
      <span className="industries-ambient industries-ambient--one" aria-hidden="true" />
      <span className="industries-ambient industries-ambient--two" aria-hidden="true" />

      <div className="section-heading">
        <div>
          <p className="eyebrow">Sector expertise</p>
          <h2>
            Industry fluency, <strong>engineered into every build.</strong>
          </h2>
        </div>
        <p>
          Great software is not generic. We learn the workflows, risks, and opportunities that make your
          market different, then turn that knowledge into a sharper product.
        </p>
      </div>

      <div
        className={`industry-console${isPaused ? " is-paused" : ""}`}
        style={{ "--industry-color": active.color }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="industry-console__rail" role="tablist" aria-label="Industries we build for" ref={railRef}>
          {industries.map((industry, index) => (
            <button
              key={industry.name}
              type="button"
              role="tab"
              id={`industry-tab-${index}`}
              aria-selected={activeIndex === index}
              aria-controls="industry-panel"
              tabIndex={activeIndex === index ? 0 : -1}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              className={`industry-tab${activeIndex === index ? " is-active" : ""}`}
              style={{ "--industry-color": industry.color }}
              onClick={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => {
                setActiveIndex(index);
                setIsPaused(true);
              }}
              onBlur={() => setIsPaused(false)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="industry-tab__thumb">
                <img src={industry.inset} alt="" loading="lazy" decoding="async" />
                <Icon name={industry.icon} />
              </span>
              <span className="industry-tab__copy">
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{industry.name}</strong>
              </span>
              {activeIndex === index ? (
                <i className="industry-tab__timer" key={`timer-${activeIndex}`} aria-hidden="true" />
              ) : null}
            </button>
          ))}
        </div>

        <div
          className="industry-console__panel"
          id="industry-panel"
          role="tabpanel"
          aria-labelledby={`industry-tab-${activeIndex}`}
        >
          <div className="industry-stage">
            <div className="industry-stage__media">
              {industries.map((industry, index) => (
                <img
                  key={industry.name}
                  src={industry.image}
                  alt={industry.imageAlt}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className={activeIndex === index ? "is-active" : ""}
                />
              ))}
              <span className="industry-stage__shade" aria-hidden="true" />
              <span className="industry-stage__grid" aria-hidden="true" />
            </div>

            <span className="industry-stage__watermark" aria-hidden="true">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>

            <div className="industry-stage__label" key={`label-${active.name}`}>
              <span className="industry-stage__label-icon">
                <Icon name={active.icon} />
              </span>
              <span>
                <strong>{active.name}</strong>
                <small>{active.focus}</small>
              </span>
            </div>

            <div className="industry-stage__metrics" key={`metrics-${active.name}`}>
              {active.stats.map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <small>{stat.label}</small>
                </div>
              ))}
            </div>

            <figure className="industry-stage__inset">
              {industries.map((industry, index) => (
                <img
                  key={industry.name}
                  src={industry.work ? industry.work.image : industry.inset}
                  alt={industry.work ? `${industry.work.client} website` : industry.insetAlt}
                  loading="lazy"
                  decoding="async"
                  className={`${activeIndex === index ? "is-active" : ""}${industry.work ? " is-site" : ""}`}
                />
              ))}
              <figcaption>
                <Icon name={active.work ? "app-window" : "layers"} />
                {active.work ? active.work.client : active.insetCaption}
              </figcaption>
            </figure>
          </div>

          <div className="industry-brief" key={active.name}>
            <div className="industry-brief__kicker">
              <span>
                <Icon name={active.icon} />
                {active.focus}
              </span>
              <small>
                {String(activeIndex + 1).padStart(2, "0")} / {String(industries.length).padStart(2, "0")}
              </small>
            </div>

            <h3>{active.name}</h3>
            <p className="industry-brief__lead">{active.description}</p>

            <ul className="industry-brief__signals">
              {active.signals.map((signal) => (
                <li key={signal.title}>
                  <span className="industry-brief__signal-icon">
                    <Icon name={signal.icon} />
                  </span>
                  <span>
                    <strong>{signal.title}</strong>
                    <small>{signal.text}</small>
                  </span>
                </li>
              ))}
            </ul>

            <div className="industry-brief__stack">
              <span className="industry-brief__stack-label">Built with</span>
              <div className="industry-brief__logos">
                {active.stack.map((tool) => (
                  <span key={tool.name} title={tool.name}>
                    <img src={tool.logo} alt={tool.name} loading="lazy" decoding="async" />
                  </span>
                ))}
              </div>
            </div>

            <div className="industry-brief__actions">
              <ShinyButton to="/contact-us" label={`Discuss a ${active.name} product`} />
              <GlowButton to="/portfolio" label="See related work" icon="move-right" />
            </div>
          </div>
        </div>

        <div className="industry-console__adjacent">
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
      </div>
    </section>
  );
}
