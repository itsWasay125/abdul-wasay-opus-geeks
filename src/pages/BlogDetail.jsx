import { Link, Navigate, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import { getBlogBySlug, getRelatedBlogs } from "../data/blogs";

function AccentHeading({ children }) {
  const words = children.split(" ");
  const accent = words.pop();

  return (
    <>
      {words.join(" ")} <strong>{accent}</strong>
    </>
  );
}

export default function BlogDetail() {
  const { slug } = useParams();
  const post = getBlogBySlug(slug);

  if (!post) {
    return <Navigate to="/blogs" replace />;
  }

  const relatedPosts = getRelatedBlogs(post);

  return (
    <main className="blog-detail-page">
      <section className="blog-detail-page__hero">
        <div className="blog-detail-page__hero-copy">
          <Link className="blog-detail-page__back-link" to="/blogs">
            <Icon name="chevron-left" />
            Back To Blogs
          </Link>
          <p className="blogs-page__eyebrow">
            <span />
            {post.category}
          </p>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="blog-detail-page__meta">
            <span>{post.author}</span>
            <span>{post.date}</span>
            <span>{post.readTime}</span>
          </div>
        </div>
        <div className="blog-detail-page__hero-image">
          <img src={post.image} alt={`${post.title} cover`} />
          <span />
          <div className="blog-detail-page__image-label">
            <small>Opus journal / {post.category}</small>
            <strong>Ideas for building better digital products.</strong>
          </div>
        </div>
      </section>

      <section className="blog-detail-page__content">
        <aside className="blog-detail-page__toc">
          <div className="blog-detail-page__toc-head">
            <span>Article Guide</span>
            <small>{post.readTime}</small>
          </div>
          <nav>
            {post.sections.map((section, index) => (
              <a href={`#${section.heading.toLowerCase().replaceAll(" ", "-")}`} key={section.heading}>
                <span>0{index + 1}</span>
                {section.heading}
              </a>
            ))}
            <a href="#key-takeaways">
              <span>0{post.sections.length + 1}</span>
              Key Takeaways
            </a>
          </nav>
          <Link className="blog-detail-page__toc-cta" to="/contact-us">
            Discuss your product
            <Icon name="arrow-up-right" />
          </Link>
        </aside>

        <article className="blog-detail-page__article">
          <div className="blog-detail-page__article-intro">
            <span>In this article</span>
            <p>{post.excerpt}</p>
          </div>

          {post.sections.map((section, index) => (
            <section
              id={section.heading.toLowerCase().replaceAll(" ", "-")}
              key={section.heading}
              data-section={`0${index + 1}`}
            >
              <h2><AccentHeading>{section.heading}</AccentHeading></h2>
              <p>{section.body}</p>
            </section>
          ))}

          <div className="blog-detail-page__takeaways" id="key-takeaways">
            <span>Quick recap</span>
            <h2>Key <strong>Takeaways</strong></h2>
            <ul>
              {post.takeaways.map((takeaway) => (
                <li key={takeaway}>
                  <Icon name="check" />
                  {takeaway}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section className="blog-detail-page__related">
        <p className="blogs-page__eyebrow">
          <span />
          Related Articles
        </p>
        <h2>Keep exploring <strong>the journal.</strong></h2>
        <div className="blog-detail-page__related-grid">
          {relatedPosts.map((relatedPost) => (
            <Link className="blog-detail-page__related-card" to={`/blogs/${relatedPost.slug}`} key={relatedPost.slug}>
              <img src={relatedPost.image} alt="" />
              <span>{relatedPost.category}</span>
              <strong>{relatedPost.title}</strong>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
