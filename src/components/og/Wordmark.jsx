import { Link } from "react-router-dom";

/**
 * The Opus Geeks lockup.
 *
 * The emblem is the supplied brand file, cropped out of oglogo.png. That
 * original is a 12289x6829 vertical lockup - the mark over the wordmark -
 * which at a 40px header height would render the type about four pixels
 * tall, so the two halves are cropped apart. This is the mark; the word is
 * still set in type beside it, which keeps it crisp at any size and lets it
 * take the surrounding colour.
 */
export default function Wordmark({
  size = 30,
  showText = true,
  to = "/",
  className = "",
}) {
  const content = (
    <>
      <span className="og-mark" style={{ "--mark-size": `${size}px` }}>
        <img
          src="/assets/oglogo-mark.webp"
          alt=""
          width={size}
          height={Math.round((size * 72) / 80)}
          decoding="async"
        />
      </span>
      {showText && (
        <span className="og-wordmark__type">
          <span className="og-wordmark__name">Opus Geeks</span>
        </span>
      )}
    </>
  );

  if (!to) {
    return <span className={`og-wordmark ${className}`.trim()}>{content}</span>;
  }

  return (
    <Link
      to={to}
      className={`og-wordmark ${className}`.trim()}
      aria-label="Opus Geeks — home"
    >
      {content}
    </Link>
  );
}
