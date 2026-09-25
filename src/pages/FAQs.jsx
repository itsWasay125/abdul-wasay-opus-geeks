import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { faqs } from "../data/content";

const categories = [
  { name: "All Questions", icon: "sparkles" },
  { name: "Web Development", icon: "code-2" },
  { name: "App Development", icon: "smartphone" },
  { name: "UI/UX Design", icon: "pen-tool" },
];

/* Eight answers is one comfortable screen of reading; the rest come in on
   demand rather than making the page 27 accordions long. */
const PAGE_SIZE = 8;

export default function FAQs() {
  const [activeCategory, setActiveCategory] = useState("All Questions");
  const [query, setQuery] = useState("");
  const [openQuestion, setOpenQuestion] = useState(faqs[0].question);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const visibleFaqs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return faqs.filter((item) => {
      const matchesCategory = activeCategory === "All Questions" || item.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  /* A new filter is a new list, so the count goes back to the first page —
     otherwise switching category after "load more" showed a short list with
     no way to tell whether anything was hidden. */
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [activeCategory, query]);

  const shown = visibleFaqs.slice(0, visible);
  const remaining = visibleFaqs.length - shown.length;

  return (
    <main className="faqs-page">
      <section className="faqs-page__hero">
        <div className="faqs-page__hero-copy">
          <p className="faqs-page__eyebrow"><span /> Frequently asked</p>
          <h1>
            <span className="hero-line">Answers to questions</span>
            <strong className="hero-line">about builds, rates,</strong>
            <strong className="hero-line">and process.</strong>
          </h1>
          <p>
            Everything you need to know about our capabilities, delivery timelines, working model,
            and how our product team builds with founders and enterprises.
          </p>
        </div>

        <div className="faqs-page__visual" aria-hidden="true">
          <div className="faqs-page__answer-engine">
            <div className="faqs-page__answer-ring faqs-page__answer-ring--one" />
            <div className="faqs-page__answer-ring faqs-page__answer-ring--two" />
            <div className="faqs-page__answer-beam faqs-page__answer-beam--one" />
            <div className="faqs-page__answer-beam faqs-page__answer-beam--two" />
            <div className="faqs-page__answer-core">
              <span>Knowledge Hub</span>
              <strong>FAQ</strong>
              <small>Opus Geeks Engine</small>
            </div>
            <div className="faqs-page__answer-chip faqs-page__answer-chip--web">
              <Icon name="code-2" /> Web Platforms
            </div>
            <div className="faqs-page__answer-chip faqs-page__answer-chip--app">
              <Icon name="smartphone" /> Mobile Apps
            </div>
            <div className="faqs-page__answer-chip faqs-page__answer-chip--ux">
              <Icon name="pen-tool" /> UI/UX Design
            </div>
            <div className="faqs-page__answer-chip faqs-page__answer-chip--game">
              <Icon name="gamepad-2" /> Game Development
            </div>
            <div className="faqs-page__answer-chip faqs-page__answer-chip--data">
              <Icon name="database" /> Databases &amp; APIs
            </div>
            <div className="faqs-page__answer-chip faqs-page__answer-chip--cloud">
              <Icon name="cloud-cog" /> Cloud &amp; DevOps
            </div>
          </div>
        </div>
      </section>

      <section className="faqs-page__explorer">
        {/* The rail holds what you use to narrow the list; the column beside
            it holds the list. Previously every one of these was a full-width
            row stacked on the last, centred in an 880px measure, which is
            why the page read as one centred pile with no structure. */}
        <div className="faqs-page__rail">
          <div>
            <p className="faqs-page__eyebrow"><span /> Search knowledge base</p>
            <h2>Everything you need, <strong>before we build.</strong></h2>
            <p className="faqs-page__rail-lead">
              Search the complete knowledge base or filter by discipline. Every answer
              reflects how our product team operates in real-world production.
            </p>
          </div>

          <div className="faqs-page__categories" role="tablist" aria-label="FAQ categories">
            {categories.map((category) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === category.name}
                className={activeCategory === category.name ? "is-active" : ""}
                onClick={() => {
                  setActiveCategory(category.name);
                  setOpenQuestion("");
                }}
                key={category.name}
              >
                <Icon name={category.icon} />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="faqs-page__main">
          <label className="faqs-page__search">
            <Icon name="search" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search questions or services..."
            />
            <span>{visibleFaqs.length} answers</span>
          </label>

          <div className="faqs-page__workspace">
          <div className="faqs-page__list">
            {shown.map((item, index) => {
              const isOpen = openQuestion === item.question;
              const answerId = `faq-answer-${index}`;
              return (
                <article className={`faqs-page__item${isOpen ? " is-open" : ""}`} key={item.question}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenQuestion(isOpen ? "" : item.question)}
                  >
                    <span className="faqs-page__item-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="faqs-page__item-question">
                      <small>{item.category}</small>
                      <strong>{item.question}</strong>
                    </span>
                    <span className="faqs-page__item-toggle" aria-hidden="true">
                      <Icon name="chevron-down" />
                    </span>
                  </button>
                  <div className="faqs-page__item-answer" id={answerId} role="region">
                    <div>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </article>
              );
            })}

            {remaining > 0 && (
              <div className="faqs-page__more">
                <button
                  type="button"
                  className="faqs-page__more-btn"
                  onClick={() => setVisible((count) => count + PAGE_SIZE)}
                >
                  Load more answers
                  <Icon name="chevron-down" />
                </button>
                <small>
                  Showing {shown.length} of {visibleFaqs.length}
                </small>
              </div>
            )}

            {!visibleFaqs.length && (
              <div className="faqs-page__empty">
                <Icon name="search" />
                <h3>No matching answer yet.</h3>
                <p>Try another keyword or ask our product team directly.</p>
                <Link to="/contact-us">Ask Opus Geeks <Icon name="arrow-up-right" /></Link>
              </div>
            )}
          </div>
          </div>
        </div>

        <div className="faqs-page__ask">
          <div>
            <Icon name="message-circle" />
            <div>
              <strong>Still have a question?</strong>
              <span>Talk it through with the people who would actually build it.</span>
            </div>
          </div>
          <Link className="btn-shiny faqs-page__ask-cta" to="/contact-us">
            Start a conversation
            <Icon name="arrow-up-right" />
          </Link>
        </div>
      </section>
    </main>
  );
}
