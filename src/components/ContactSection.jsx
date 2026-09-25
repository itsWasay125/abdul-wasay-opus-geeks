import { useState } from "react";
import Icon from "./Icon";

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    service: "Web Development",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [bursts, setBursts] = useState([]);

  const submit = (event) => {
    event.preventDefault();
    const particles = Array.from({ length: 18 }, (_, index) => ({
      id: `${Date.now()}-${index}`,
      angle: index * 20,
      distance: 42 + (index % 5) * 11,
    }));
    setBursts(particles);
    setSubmitted(true);
    setTimeout(() => setBursts([]), 900);
  };

  const updateField = (event) => {
    setSubmitted(false);
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="contact-shell">
        <span className="contact-shell-corner contact-shell-corner--top" aria-hidden="true" />
        <span className="contact-shell-corner contact-shell-corner--bottom" aria-hidden="true" />

        <div className="row g-0 align-items-stretch">
          <div className="col-12 col-lg-6">
            <div className="contact-content">
              <p className="eyebrow">Start A Project</p>
              <h2>Let's Build Something <strong>Extraordinary.</strong></h2>
              <p>Share the challenge. We will respond with a clear product direction and the fastest path to launch.</p>

              <div className="contact-signal" aria-hidden="true">
                <div className="contact-signal-core">
                  <Icon name="send" />
                  <span />
                </div>
                <span className="contact-signal-ring contact-signal-ring--one" />
                <span className="contact-signal-ring contact-signal-ring--two" />
                <span className="contact-signal-node contact-signal-node--one"><Icon name="sparkles" /></span>
                <span className="contact-signal-node contact-signal-node--two"><Icon name="code-2" /></span>
                <span className="contact-signal-node contact-signal-node--three"><Icon name="smartphone" /></span>
              </div>

              <div className="contact-promises">
                <span><Icon name="check" /> Reply within 24 hours</span>
                <span><Icon name="check" /> Clear scope and next steps</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <form className="contact-form" onSubmit={submit}>
              <div className="contact-form-topline">
                <span><i /> Secure project channel</span>
                <small>01 / 04</small>
              </div>

              <div className="contact-field-grid">
                <label className="contact-field">
                  <span>Your Name</span>
                  <input
                    name="name"
                    type="text"
                    placeholder="Alex Morgan"
                    value={form.name}
                    required
                    onChange={updateField}
                  />
                </label>
                <label className="contact-field">
                  <span>Work Email</span>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    required
                    onChange={updateField}
                  />
                </label>
              </div>

              <label className="contact-field">
                <span>What Do You Need?</span>
                <select name="service" value={form.service} onChange={updateField}>
                  <option>Web Development</option>
                  <option>Mobile Application</option>
                  <option>UI/UX Design</option>
                  <option>Game Development</option>
                  <option>AI Automation</option>
                  <option>Branding</option>
                </select>
              </label>

              <label className="contact-field">
                <span>Project Details</span>
                <textarea
                  name="message"
                  rows="5"
                  placeholder="Tell us about your product, goals, and ideal launch date..."
                  value={form.message}
                  required
                  onChange={updateField}
                />
              </label>

              <div className="contact-form-action">
                <div>
                  <strong>Ready when you are.</strong>
                  <span>No spam. Just a useful conversation.</span>
                </div>
                <button className="glow-button" type="submit">
                  Send Signal
                  <Icon name="send" />
                  {bursts.map((burst) => (
                    <span
                      className="burst-particle"
                      key={burst.id}
                      style={{
                        "--angle": `${burst.angle}deg`,
                        "--distance": `${burst.distance}px`,
                      }}
                    ></span>
                  ))}
                </button>
              </div>
              {submitted && <span className="form-note">Signal received. We will reply within 24 hours.</span>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
