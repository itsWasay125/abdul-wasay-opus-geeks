import { useState } from "react";
import Icon from "./Icon";

const contactOptions = [
  {
    title: "Project Brief",
    description: "Tell us what you want to build",
    detail: "Start with your idea, challenge, or product roadmap.",
    icon: "message-circle",
    color: "#38bdf8",
    href: "#contact",
    action: "Open Project Form",
  },
  {
    title: "Email Us",
    description: "hello@opusgeeks.com",
    detail: "Best for documents, proposals, and detailed questions.",
    icon: "mail",
    color: "#818cf8",
    href: "mailto:hello@opusgeeks.com",
    action: "Send An Email",
  },
  {
    title: "Book A Call",
    description: "Pick a time that works",
    detail: "A focused discovery call with our product team.",
    icon: "calendar-days",
    color: "#a78bfa",
    href: "#contact",
    action: "Schedule A Call",
  },
  {
    title: "Our Locations",
    description: "Karachi · Florida",
    detail: "Building globally across time zones and industries.",
    icon: "map-pin",
    color: "#22d3ee",
    href: "#contact",
    action: "View Availability",
  },
];

export default function ContactOptions() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="section contact-options-section" aria-labelledby="contact-options-title">
      <div className="contact-options-heading">
        <div>
          <p className="eyebrow">Choose A Channel</p>
          <h2 id="contact-options-title">
            How would you like to <strong>connect?</strong>
          </h2>
        </div>
      </div>

      <div className="contact-options-panel">
        <div className="row g-3">
          {contactOptions.map((option, index) => (
            <div className="col-12 col-sm-6 col-xl-3" key={option.title}>
              <a
                className={`contact-option-card${activeIndex === index ? " is-active" : ""}`}
                href={option.href}
                style={{ "--option-color": option.color }}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
              >
                <span className="contact-option-watermark" aria-hidden="true">
                  <Icon name={option.icon} />
                </span>
                <span className="contact-option-icon">
                  <Icon name={option.icon} />
                </span>
                <span className="contact-option-copy">
                  <strong>{option.title}</strong>
                  <span>{option.description}</span>
                  <small>{option.detail}</small>
                </span>
                <span className="contact-option-action">
                  {option.action}
                  <Icon name="arrow-up-right" />
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
