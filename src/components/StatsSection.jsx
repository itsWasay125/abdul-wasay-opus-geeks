import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

const stats = [
  { value: 500, suffix: "+", label: "Projects Delivered", icon: "package" },
  { value: 50, suffix: "+", label: "Happy Clients", icon: "users" },
  { value: 5, suffix: "+", label: "Years In Market", icon: "award" },
  { value: 98, suffix: "%", label: "Client Satisfaction", icon: "heart" },
];

function AnimatedNumber({ value, suffix }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [hasStarted, setHasStarted] = useState(false);
  const numberRef = useRef(null);

  useEffect(() => {
    const currentElement = numberRef.current;

    if (!currentElement) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDisplayValue(0);
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45 }
    );

    observer.observe(currentElement);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) {
      return undefined;
    }

    let frameId = 0;
    const duration = 1450;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [hasStarted, value]);

  return (
    <span className="stat-number" ref={numberRef}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsSection({ className = "" }) {
  return (
    <section className={`section stats-section ${className}`.trim()} aria-label="Opus Geeks results">
      <div className="stats-section__shell">
        <div className="stats-section__heading">
          <p className="eyebrow">Numbers That Move</p>
          <h2>
            Built to count real <strong>outcomes.</strong>
          </h2>
        </div>
        <div className="stats-section__grid">
          {stats.map((stat, index) => (
            <article
              className="stat-card"
              key={stat.label}
              style={{ "--stat-delay": `${index * 90}ms` }}
            >
              <span className="stat-card__ring" aria-hidden="true" />
              <div className="stat-icon">
                <Icon name={stat.icon} />
              </div>
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              <span className="stat-label">{stat.label}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
