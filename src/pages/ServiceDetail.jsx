import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import Icon from "../components/Icon";
import { servicePages } from "../data/servicePages";
import InteractiveGrid from "../components/InteractiveGrid";

/* The grid colour per service, from the brand ramp: web takes the blue,
   mobile the violet, design the cyan. */
const GRID_TINT = {
  web: { line: "rgba(20, 123, 194, 0.10)", glow: "rgba(20, 123, 194, 0.42)" },
  mobile: { line: "rgba(99, 52, 148, 0.10)", glow: "rgba(99, 52, 148, 0.40)" },
  design: { line: "rgba(0, 174, 239, 0.11)", glow: "rgba(0, 174, 239, 0.42)" },
};

export default function ServiceDetail({ service }) {
  const slug = service.path.split("/").pop();
  const page = servicePages[slug];
  const bannerRef = useRef(null);

  /* The still tilts a few degrees toward the pointer. It is written on
     pointermove rather than animated, and only while the pointer is over
     the hero, so it costs nothing the rest of the time. */
  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if (!window.matchMedia("(hover: hover)").matches) return undefined;

    const host = el.parentElement;
    let frame = 0;

    const onMove = (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const box = host.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        el.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 7}deg)`;
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      el.style.transform = "";
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [slug]);
  if (!page) {
    return (
      <>
        <PageHero eyebrow="Service" title={service.label} copy={service.intro} />
        <section className="section page-section service-detail-layout">
          <article className="detail-panel reveal">
            <p className="eyebrow">What We Build</p>
            <h2>{service.label} that feels premium from first click.</h2>
            <ul className="feature-list">
              {service.bullets.map((item) => (
                <li key={item}>
                  <Icon name="check" />
                  {item}
                </li>
              ))}
            </ul>
            <Link className="glow-button magnetic" to="/contact-us">
              Start This Service
              <Icon name="send" />
            </Link>
          </article>
        </section>
      </>
    );
  }

  return (
    <main className={`svc-page svc-page--${page.theme}`}>
      <section className="svc-hero">
        {/* Same grid as the services index, so a service page and the page
            that lists them share a background. */}
        {/* Tinted by the service: the pointer lights cells in that page’s own
            colour. The cells are 44px - at 76px each lit square read as a
            large block rather than as a trail. */}
        <InteractiveGrid
          className="svc-grid"
          gridSize={44}
          gridColor={(GRID_TINT[page.theme] || GRID_TINT.web).line}
          effectColor={(GRID_TINT[page.theme] || GRID_TINT.web).glow}
          glowRadius={18}
          fadeIntensity={36}
          fadeColor="#ffffff"
        />
        <div className="svc-hero__inner">
          <div className="svc-hero__copy">
            <p className="svc-kicker">
              <Link to="/services">Services</Link>
              <i aria-hidden="true" />
              <span>{page.kicker}</span>
            </p>
            <h1>
              <span className="hero-line">{page.titleTop}</span>
              {String(page.titleAccent).split(" ").length > 2 ? (
                (() => {
                  const words = String(page.titleAccent).split(" ");
                  const half = Math.ceil(words.length / 2);
                  return (
                    <>
                      <strong className="hero-line">{words.slice(0, half).join(" ")}</strong>
                      <strong className="hero-line">{words.slice(half).join(" ")}</strong>
                    </>
                  );
                })()
              ) : (
                <strong className="hero-line">{page.titleAccent}</strong>
              )}
            </h1>
            <p className="svc-hero__intro">{page.intro}</p>
            <div className="svc-hero__actions">
              <Link className="glow-button" to="/contact-us">
                Start This Project
                <Icon name="arrow-up-right" />
              </Link>
              <Link className="ghost-link" to="/portfolio">
                <Icon name="explore" />
                See Related Work
              </Link>
            </div>
          </div>

          {/* One still, not the rotating deck that used to live here. The deck
              ran a 3s interval and mounted every project card on a page where
              the work already has its own section further down. */}
          <div className="svc-hero__visual">
            <span className="svc-hero__aura" />
            <figure className="svc-hero__banner" ref={bannerRef}>
              <span className="svc-hero__banner-float">
                <img
                  src={page.banner}
                  alt={page.bannerAlt}
                  width="1200"
                  height="1000"
                  loading="eager"
                  decoding="async"
                  draggable="false"
                />
              </span>
            </figure>
            <span className="svc-hero__chip svc-hero__chip--one">
              <Icon name={page.icon} />
              {page.kicker}
            </span>
            <span className="svc-hero__chip svc-hero__chip--two">
              <Icon name="zap" />
              Launch ready
            </span>
          </div>
        </div>
      </section>

      <div className="svc-marquee" aria-hidden="true">
        <div className="svc-marquee__track">
          {[...page.marquee, ...page.marquee].map((word, index) => (
            <span key={`${word}-${index}`}>
              {word}
              <i aria-hidden="true">+</i>
            </span>
          ))}
        </div>
      </div>


      <section className="svc-capabilities">
        <div className="svc-section-head reveal">
          <p className="svc-eyebrow"><span /> What we build</p>
          <h2>
            {page.capabilitiesTitle[0]} <strong>{page.capabilitiesTitle[1]}</strong>
          </h2>
        </div>
        <div className="svc-capability-grid">
          {page.capabilities.map((capability, index) => (
            <article className="svc-capability reveal" data-tilt key={capability.title}>
              <span className="svc-card-orbit" aria-hidden="true" />
              <span className="svc-capability__num">0{index + 1}</span>
              <span className="svc-capability__icon"><Icon name={capability.icon} /></span>
              <h3>{capability.title}</h3>
              <p>{capability.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="svc-process">
        <div className="svc-section-head reveal">
          <p className="svc-eyebrow"><span /> How we work</p>
          <h2>
            {page.processTitle[0]} <strong>{page.processTitle[1]}</strong>
          </h2>
        </div>
        <ol className="svc-process__list">
          {page.process.map((step, index) => (
            <li className="reveal" data-tilt key={step.title}>
              <span className="svc-process__num">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="svc-stack">
        <div className="svc-section-head reveal">
          <p className="svc-eyebrow"><span /> Tools of the trade</p>
          <h2>
            A stack chosen for <strong>your product, not ours.</strong>
          </h2>
        </div>
        <div className="svc-stack__marquee-box">
          <div className="svc-stack__grid">
            {[...page.stack, ...page.stack, ...page.stack].map((tool, idx) => (
              <span
                className={`svc-stack__chip ${idx >= page.stack.length ? 'svc-stack__chip--clone' : ''}`}
                data-tilt={idx < page.stack.length ? '' : undefined}
                key={`${tool.name}-${idx}`}
              >
                <span className="svc-stack__logo"><img src={tool.logo} alt="" loading="lazy" /></span>
                <span>
                  <strong>{tool.name}</strong>
                  <small>{tool.role}</small>
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="svc-showcase">
        <div className="svc-section-head reveal">
          <p className="svc-eyebrow"><span /> Proof in production</p>
          <h2>
            Work that shows <strong>how we think.</strong>
          </h2>
        </div>
        <div className="svc-showcase__grid">
          {page.showcase.map((project, index) => (
            <Link
              className="svc-showcase__card reveal"
              data-tilt
              style={{ "--project-accent": project.accent }}
              to="/portfolio"
              key={project.title}
            >
              <div className="svc-showcase__media">
                <div className="svc-showcase__browser" aria-hidden="true">
                  <span><i /><i /><i /></span>
                  <small>opusgeeks.com / selected-work</small>
                </div>
                <img src={project.image} alt={project.title} loading="lazy" />
                <span className="svc-showcase__glare" aria-hidden="true" />
                <strong className="svc-showcase__number">0{index + 1}</strong>
              </div>
              <div className="svc-showcase__meta">
                <span>{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.copy}</p>
                <em>
                  View portfolio <Icon name="arrow-up-right" />
                </em>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="svc-cta">
        <div className="svc-cta__panel reveal">
          <div className="svc-cta__copy">
            <p className="svc-eyebrow"><span /> Deliverables included</p>
            <h2>{page.ctaTitle}</h2>
            <div className="svc-cta__chips">
              {service.deliverables.map((item) => (
                <span key={item}>
                  <Icon name="check" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <Link className="glow-button" to="/contact-us">
            Start This Service
            <Icon name="send" />
          </Link>
        </div>
      </section>
    </main>
  );
}
