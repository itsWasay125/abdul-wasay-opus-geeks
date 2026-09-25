import { Link } from "react-router-dom";

/**
 * The Opus Geeks lockup, from the supplied brand file (public/assets/logo).
 *
 * The original is a vertical lockup - the G mark over the OPUSGEEKS type -
 * which at header height would render the type a few pixels tall, so it is
 * cropped into its two halves and set side by side here.
 *
 * The mark keeps its gradient on any background. The type comes in two
 * versions, black and white, and both are in the markup: which one shows is
 * decided in CSS by the surface the logo sits on (the header is light, the
 * footer and the open mobile menu are dark). That keeps the choice next to
 * the backgrounds that cause it rather than in a prop every caller has to
 * remember to pass.
 */
export default function Wordmark({ size = 30, showText = true, to = "/", className = "" }) {
  const content = (
    <>
      <span className="og-mark" style={{ "--mark-size": `${size}px` }}>
        <img
          src="/assets/logo/mark.webp"
          alt=""
          width={size}
          height={Math.round((size * 394) / 320)}
          decoding="async"
        />
      </span>
      {showText && (
        <span className="og-wordmark__type" style={{ "--type-h": `${Math.round(size * 0.56)}px` }}>
          <img
            className="og-wordmark__img og-wordmark__img--dark"
            src="/assets/logo/wordmark-dark.webp"
            alt="Opus Geeks"
            width="900"
            height="98"
            decoding="async"
          />
          <img
            className="og-wordmark__img og-wordmark__img--light"
            src="/assets/logo/wordmark-light.webp"
            alt=""
            aria-hidden="true"
            width="900"
            height="98"
            decoding="async"
          />
        </span>
      )}
    </>
  );

  if (!to) {
    return <span className={`og-wordmark ${className}`.trim()}>{content}</span>;
  }

  return (
    <Link to={to} className={`og-wordmark ${className}`.trim()} aria-label="Opus Geeks — home">
      {content}
    </Link>
  );
}
