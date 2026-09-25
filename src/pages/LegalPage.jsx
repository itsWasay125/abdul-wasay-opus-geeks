import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Icon from "../components/Icon";
import { legalPages } from "../data/legal";

/**
 * Terms and Privacy share one layout: a light banner, a sticky contents rail,
 * and the sections themselves. Both are long documents nobody reads top to
 * bottom, so the rail tracks which section is on screen and lets you jump.
 */
export default function LegalPage({ slug }) {
  const page = legalPages[slug];
  const [activeId, setActiveId] = useState(page?.sections?.[0]?.id ?? "");

  useEffect(() => {
    if (!page) return undefined;

    const onScroll = () => {
      const focal = window.innerHeight * 0.32;
      let best = page.sections[0].id;
      let bestDiff = Infinity;
      for (const section of page.sections) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        const diff = Math.abs(el.getBoundingClientRect().top - focal);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = section.id;
        }
      }
      setActiveId(best);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [page]);

  if (!page) return <Navigate to="/" replace />;

  return (
    <main className="legal-page">
      <section className="legal-page__hero">
        <h1>{page.title}</h1>
        <p className="legal-page__lead">{page.lead}</p>
        <p className="legal-page__updated">
          <Icon name="check" />
          {page.updated}
        </p>
      </section>

      <div className="legal-page__body">
        <aside className="legal-page__rail" aria-label="On this page">
          <span className="legal-page__rail-title">On this page</span>
          <ol>
            {page.sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={activeId === section.id ? "is-active" : ""}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <div className="legal-page__content">
          {page.sections.map((section, index) => (
            <section className="legal-page__section" id={section.id} key={section.id}>
              <h2>
                <span className="legal-page__section-num">{String(index + 1).padStart(2, "0")}</span>
                {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </section>
          ))}

          <div className="legal-page__foot">
            <div>
              <strong>Still not sure?</strong>
              <span>Ask us anything about how we handle your work or your data.</span>
            </div>
            <Link className="btn-shiny legal-page__foot-cta" to="/contact-us">
              Talk to the team
              <Icon name="arrow-up-right" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
