import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Icon from "../components/Icon";
import { BLOGS_PER_PAGE, blogCategories, blogPosts } from "../data/blogs";

function normalize(value) {
  return value.toLowerCase().trim();
}

export default function Blogs() {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(urlQuery);
  const categoryParam = searchParams.get("category");
  const activeCategory = blogCategories.includes(categoryParam) ? categoryParam : "All";

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const buildSearchString = ({ category = activeCategory, search = query } = {}) => {
    const params = new URLSearchParams();
    const cleanSearch = search.trim();

    if (category && category !== "All") {
      params.set("category", category);
    }

    if (cleanSearch) {
      params.set("q", cleanSearch);
    }

    const serializedParams = params.toString();
    return serializedParams ? `?${serializedParams}` : "";
  };

  const filteredArticles = useMemo(() => {
    const searchTerm = normalize(query);

    return blogPosts.filter((post) => {
      const matchesCategory = activeCategory === "All" || post.category === activeCategory;
      const matchesSearch =
        !searchTerm ||
        normalize(`${post.title} ${post.category} ${post.excerpt}`).includes(searchTerm);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, query]);

  const requestedPage = Number.parseInt(pageNumber || "1", 10);
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / BLOGS_PER_PAGE));
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const startIndex = (currentPage - 1) * BLOGS_PER_PAGE;
  const visibleArticles = filteredArticles.slice(startIndex, startIndex + BLOGS_PER_PAGE);

  /* The newest post leads the page; the rest fall into the grid below. */
  const featured = blogPosts[0];

  const clearFilters = () => {
    setQuery("");
    setSearchParams({});
    navigate("/blogs", { replace: true });
  };

  const getPageLink = (paginationPage) =>
    `${paginationPage === 1 ? "/blogs" : `/blogs/page/${paginationPage}`}${buildSearchString()}`;

  const getCategoryLink = (category) =>
    `/blogs${buildSearchString({ category, search: query })}`;

  const handleSearchChange = (event) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    navigate(`/blogs${buildSearchString({ search: nextQuery })}`, { replace: true });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(`/blogs${buildSearchString({ search: query })}`);
  };

  return (
    <main className="blogs-page">
      <section className="blogs-page__hero">
        <div className="blogs-page__hero-copy">
          <p className="blogs-page__eyebrow">
            <span />
            Opus Geeks Journal
          </p>
          <h1>
            Insights <strong>&amp; Inspiration</strong>
          </h1>
          <p>
            Welcome to the heart of our blog. Here, we explore into the depths of
            thought-provoking ideas, share valuable wisdom, and ignite the flames of creativity.
            Our mission is to empower and uplift through the power of words, offering a reserve
            for those seeking enlightenment and motivation.
          </p>
          <a className="glow-button" href="#featured-articles">
            Explore Articles
            <Icon name="move-right" />
          </a>
        </div>

        <div className="blogs-page__hero-visual" aria-hidden="true">
          <span className="blogs-page__orbit blogs-page__orbit--one" />
          <span className="blogs-page__orbit blogs-page__orbit--two" />
          <div className="blogs-page__person-card">
            <img src="/assets/blogs/blog-banner-image.webp" alt="" />
          </div>
          <span className="blogs-page__floating-tag blogs-page__floating-tag--one">Ideas</span>
          <span className="blogs-page__floating-tag blogs-page__floating-tag--two">Research</span>
          <span className="blogs-page__floating-tag blogs-page__floating-tag--three">Clarity</span>
        </div>
      </section>

      <section className="blogs-page__intro">
        <div className="blogs-page__intro-inner">
          <p className="blogs-page__eyebrow">
            <span />
            Unveiling Perspectives
          </p>
          <h2>
            Diving Into The Depths Of <strong>Insight And Inspiration</strong>
          </h2>
          <p>
            It is where we explore the details of human experience, offering profound insights and
            igniting creative sparks. Join us as we peel back the layers of conventional wisdom,
            inviting you to discover new horizons and uncover hidden truths.
          </p>
          <div className="blogs-page__intro-chips" aria-label="Journal themes">
            <span>Strategy Notes</span>
            <span>Product Thinking</span>
            <span>Digital Growth</span>
          </div>
        </div>
      </section>

      {featured && (
        <section className="blogs-page__spotlight" aria-label="Featured article">
          <Link className="blog-featured" to={`/blogs/${featured.slug}`}>
            <span className="blog-featured__media">
              <img src={featured.image} alt="" loading="lazy" decoding="async" />
            </span>
            <span className="blog-featured__copy">
              <span className="blog-featured__tags">
                <span className="blog-featured__badge">Featured</span>
                <span className="blog-featured__cat">{featured.category}</span>
              </span>
              <strong className="blog-featured__title">{featured.title}</strong>
              <span className="blog-featured__excerpt">{featured.excerpt}</span>
              <span className="blog-featured__meta">
                {featured.date}
                <i aria-hidden="true" />
                {featured.readTime}
              </span>
              <span className="blog-featured__cta">
                Read the article
                <Icon name="arrow-up-right" />
              </span>
            </span>
          </Link>

          <div className="blog-filters">
            <form className="blog-filters__search" onSubmit={handleSearchSubmit} role="search">
              <Icon name="search" />
              <input
                id="blog-search"
                type="search"
                value={query}
                onChange={handleSearchChange}
                placeholder="Search articles, topics, or keywords..."
                aria-label="Search articles"
              />
              <button type="submit">Search</button>
            </form>

            <div className="blog-filters__cats" aria-label="Blog categories">
              <Link
                className={activeCategory === "All" ? "is-active" : undefined}
                to={getCategoryLink("All")}
              >
                All
              </Link>
              {blogCategories.map((category) => (
                <Link
                  className={activeCategory === category ? "is-active" : undefined}
                  key={category}
                  to={getCategoryLink(category)}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="featured-articles" className="blogs-page__articles">
        <div className="blogs-page__articles-heading">
          <p className="blogs-page__eyebrow">
            <span />
            Featured Articles
          </p>
          <h2>
            Ideas built for teams that <strong>move ahead.</strong>
          </h2>
          <p>
            Opus Geeks empowers you to embrace the future with our cutting-edge user experience
            and development solutions. Stay ahead of the curve and delight your audience with
            experiences that are ahead of their time.
          </p>
        </div>

        <div className="blogs-page__results-bar">
          <span>
            Showing {visibleArticles.length} of {filteredArticles.length} articles
          </span>
          {(query || activeCategory !== "All") && (
            <button type="button" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>

        {visibleArticles.length > 0 ? (
          <div className="blogs-page__article-grid">
            {visibleArticles.map((article, index) => (
              <article
                className="blogs-page__article-card"
                key={article.slug}
                style={{ "--article-delay": `${index * 70}ms` }}
              >
                <Link className="blogs-page__article-image" to={`/blogs/${article.slug}`}>
                  <img src={article.image} alt={`${article.title} cover`} />
                </Link>
                <div className="blogs-page__article-copy">
                  <div className="blogs-page__article-topline">
                    <span>{String(startIndex + index + 1).padStart(2, "0")}</span>
                    <em>{article.category}</em>
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <Link className="blogs-page__article-link" to={`/blogs/${article.slug}`}>
                    Read More
                    <Icon name="arrow-up-right" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="blogs-page__empty">
            <h3>No articles found</h3>
            <p>Try a different keyword or choose another category.</p>
            <button type="button" onClick={clearFilters}>
              Reset Search
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="blogs-page__pagination" aria-label="Blog pagination">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((paginationPage) => (
              <Link
                className={paginationPage === currentPage ? "is-active" : undefined}
                to={getPageLink(paginationPage)}
                key={paginationPage}
              >
                {paginationPage}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="blogs-page__cta">
        <div>
          <p className="blogs-page__eyebrow">
            <span />
            Streamline Your Tech Efforts
          </p>
          <h2>
            More About <strong>Streamlining</strong> Your Tech Efforts?
          </h2>
          <p>
            Discover how Opus Geeks can simplify your tech processes and amplify your productivity.
            Streamline your efforts and achieve greater success with our cutting-edge solutions.
          </p>
        </div>
        <Link className="glow-button" to="/contact-us">
          Explore Now
          <Icon name="arrow-up-right" />
        </Link>
      </section>
    </main>
  );
}
