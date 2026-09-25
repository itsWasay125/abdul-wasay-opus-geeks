import { forwardRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";

/* Secondary action button: light pill that lifts and glows on hover, with the
   sparkle mark from the original. Same porting note as ShinyButton - styling
   lives in App.css under .btn-glow. */

const GlowButton = forwardRef(function GlowButton(
  { label, children, to, href, type = "button", icon = "sparkles", className = "", onClick, ...rest },
  ref
) {
  const [clicked, setClicked] = useState(false);

  const handleClick = (event) => {
    setClicked(true);
    window.setTimeout(() => setClicked(false), 220);
    onClick?.(event);
  };

  const content = (
    <span className="btn-glow__label">
      {children ?? label}
      {icon ? <Icon name={icon} /> : null}
    </span>
  );

  const shared = {
    className: `btn-glow ${className}`.trim(),
    "data-state": clicked ? "clicked" : undefined,
    onClick: handleClick,
    "aria-label": label,
    ref,
    ...rest,
  };

  if (to) {
    return (
      <Link to={to} {...shared}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} {...shared}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} {...shared}>
      {content}
    </button>
  );
});

export default GlowButton;
