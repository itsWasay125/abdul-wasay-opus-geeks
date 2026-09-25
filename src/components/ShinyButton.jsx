import { forwardRef } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";

/* Primary action button: ink pill with a brand-gradient arc sweeping the border.
   Ported from the shadcn/Tailwind original to this project's stack - the CSS
   lives once in App.css (.btn-shiny) instead of a <style> tag per instance,
   because these render dozens of times across the site. */

const ShinyButton = forwardRef(function ShinyButton(
  { label, children, to, href, type = "button", icon = "arrow-up-right", className = "", ...rest },
  ref
) {
  const content = (
    <span className="btn-shiny__label">
      {children ?? label}
      {icon ? <Icon name={icon} /> : null}
    </span>
  );

  const classes = `btn-shiny ${className}`.trim();

  if (to) {
    return (
      <Link className={classes} to={to} ref={ref} aria-label={label} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a className={classes} href={href} ref={ref} aria-label={label} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} type={type} ref={ref} aria-label={label} {...rest}>
      {content}
    </button>
  );
});

export default ShinyButton;
