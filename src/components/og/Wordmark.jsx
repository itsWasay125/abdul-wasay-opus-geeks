import { Link } from "react-router-dom";

/**
 * The Opus Geeks lockup.
 *
 * The emblem is the real mark, cropped losslessly out of the supplied
 * logo.png (public/logo-mark.png) — not a redraw. The word "OPUS GEEKS" is
 * set in type rather than baked into the bitmap, because the original PNG
 * has white lettering that would vanish on a light background.
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
          src="/logo-mark.png"
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
