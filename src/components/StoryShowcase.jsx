import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function StoryShowcase({
  className = "",
  eyebrow,
  heading,
  description,
  items,
  activeIndex,
  onSelect,
  onPauseChange,
  selectorAriaLabel,
  linkTo,
  linkLabel,
  linkIcon = "explore",
}) {
  const activeItem = items[activeIndex];

  return (
    <div
      className={`story-showcase ${className}`.trim()}
      style={{ "--story-accent": activeItem.color || "#38bdf8" }}
      onMouseEnter={() => onPauseChange?.(true)}
      onMouseLeave={() => onPauseChange?.(false)}
    >
      <div className="story-showcase__copy">
        <p className="story-showcase__eyebrow">{eyebrow}</p>
        <h2>{heading}</h2>
        <p>{description}</p>

        <div className="story-showcase__signals" role="tablist" aria-label={selectorAriaLabel}>
          {items.map((item, index) => (
            <button
              key={item.number || item.title || item.label}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              className={`story-showcase__signal${index === activeIndex ? " is-active" : ""}`}
              onClick={() => onSelect(index)}
              onFocus={() => onPauseChange?.(true)}
              onBlur={() => onPauseChange?.(false)}
              onMouseEnter={() => onSelect(index)}
            >
              <span className="story-showcase__signal-num">{item.number}</span>
              <span className="story-showcase__signal-body">
                <strong>{item.title}</strong>
                <em>{item.copy}</em>
              </span>
            </button>
          ))}
        </div>

        {linkTo && linkLabel ? (
          <Link className="ghost-link story-showcase__link" to={linkTo}>
            <Icon name={linkIcon} />
            {linkLabel}
          </Link>
        ) : null}
      </div>

      <div className="story-showcase__stage">
        <div className="story-showcase__screen">
          <div className="story-showcase__screen-media">
            {items.map((item, index) => (
              <img
                key={item.number || item.title || item.label}
                src={item.image}
                alt={item.alt}
                loading={index === 0 ? "eager" : "lazy"}
                className={index === activeIndex ? "is-active" : ""}
              />
            ))}
            <span className="story-showcase__screen-shade" aria-hidden="true" />
            <span className="story-showcase__screen-grid" aria-hidden="true" />
          </div>

          <div className="story-showcase__screen-meta">
            <span>
              <i />
              {activeItem.tag}
            </span>
            <strong>
              0{activeIndex + 1} / 0{items.length}
            </strong>
          </div>

          <div className="story-showcase__screen-content" key={activeItem.number || activeItem.title}>
            <h3>{activeItem.title}</h3>
            <p>{activeItem.copy}</p>
            <small>{activeItem.caption}</small>
          </div>
        </div>
      </div>
    </div>
  );
}
