import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

/* One client per slide: portrait on the left, the quote beside it, and the
   five thumbnails double as the picker. The deck-of-cards version this
   replaced put six quotes on screen at once and scrubbed them apart on
   scroll, which meant no single quote was ever readable. */
const CLIENTS = [
  {
    id: "zelt",
    name: "Adrian Cole",
    from: "From Toronto, Canada",
    role: "Founder & CEO, Zelt Cloud",
    photo: "/assets/clients/client-01.jpg",
    quote:
      "Opus Geeks rebranded and rebuilt our company website end to end. The quality of the work exceeded what we had scoped, and the site has since picked up a number of international awards.",
  },
  {
    id: "loanpro",
    name: "Vanessa Soto",
    from: "From Austin, United States",
    role: "VP Technology, Potion Studio",
    photo: "/assets/clients/client-02.jpg",
    quote:
      "They were engaged to build our flagship interactive marketing portal and custom 3D web applications. Their team brought an extraordinary mix of WebGL motion and technical execution.",
  },
  {
    id: "livespot",
    name: "Marcus Vance",
    from: "From London, United Kingdom",
    role: "Head of Product, LoanPro Systems",
    photo: "/assets/clients/client-03.jpg",
    quote:
      "We worked with the team over a multi-quarter platform rehaul that included new copy, design, and code. Clear scope, weekly demos, and not one surprise in the invoice.",
  },
  {
    id: "sca",
    name: "Christine Hughes",
    from: "From Dubai, United Arab Emirates",
    role: "Operations Lead, SCA Digital",
    photo: "/assets/clients/client-04.jpg",
    quote:
      "Our enterprise platform overhaul landed on time and under budget. Their engineers brought a formidable blend of architecture, design tokens, and strategic velocity.",
  },
  {
    id: "flipaclip",
    name: "Eric Henderson",
    from: "From Sydney, Australia",
    role: "Managing Partner, LiveSpot Global",
    photo: "/assets/clients/client-05.jpg",
    quote:
      "Heartfelt gratitude to the Opus Geeks team for their support through our launch. Their speed, responsiveness, and interface polish made our platform stand apart globally.",
  },
];

const AUTOPLAY_MS = 7000;

export default function AboutTopClients() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = CLIENTS.length;
  const timerRef = useRef(null);

  const go = useCallback(
    (next) => setIndex(((next % total) + total) % total),
    [total],
  );

  useEffect(() => {
    if (paused) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    timerRef.current = window.setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(timerRef.current);
  }, [index, paused, go]);

  const active = CLIENTS[index];

  return (
    <section
      className="og-clients"
      id="clients"
      aria-labelledby="og-clients-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="og-shell">
        <header className="og-clients__head">
          <p className="og-clients__eyebrow">
            <span className="og-clients__eyebrow-dot" aria-hidden="true" />
            <span>In their own words</span>
          </p>
          <h2 id="og-clients-title" className="og-clients__title">
            Our Top <span className="og-clients__title-grad">Clients</span>
          </h2>
          <p className="og-clients__sub">
            See what the teams we have shipped for say about working with us.
          </p>
        </header>

        <div className="og-clients__stage">
          <div className="og-clients__viewport" aria-live="polite">
            <article className="og-clients__slide" key={active.id}>
              <div className="og-clients__portrait">
                <span className="og-clients__portrait-plate" aria-hidden="true" />
                <img
                  src={active.photo}
                  alt={active.name}
                  width="740"
                  height="740"
                  loading="lazy"
                  decoding="async"
                />
                <span className="og-clients__portrait-quote" aria-hidden="true">
                  <Quote />
                </span>
              </div>

              <div className="og-clients__copy">
                <div className="og-clients__stars" aria-label="Rated 5 out of 5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" stroke="none" />
                  ))}
                </div>

                <blockquote className="og-clients__quote">&ldquo;{active.quote}&rdquo;</blockquote>

                <div className="og-clients__author">
                  <span className="og-clients__author-name">{active.name}</span>
                  <span className="og-clients__author-from">{active.from}</span>
                  <span className="og-clients__author-role">{active.role}</span>
                </div>
              </div>
            </article>
          </div>

          <div className="og-clients__controls">
            <div className="og-clients__thumbs" role="tablist" aria-label="Choose a client">
              {CLIENTS.map((client, i) => (
                <button
                  type="button"
                  role="tab"
                  key={client.id}
                  className={`og-clients__thumb${i === index ? " is-active" : ""}`}
                  aria-selected={i === index}
                  aria-label={client.name}
                  onClick={() => go(i)}
                >
                  <img src={client.photo} alt="" width="104" height="104" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>

            <div className="og-clients__arrows">
              <button
                type="button"
                className="og-clients__arrow"
                onClick={() => go(index - 1)}
                aria-label="Previous client"
              >
                <ChevronLeft />
              </button>
              <span className="og-clients__count">
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
              <button
                type="button"
                className="og-clients__arrow"
                onClick={() => go(index + 1)}
                aria-label="Next client"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
