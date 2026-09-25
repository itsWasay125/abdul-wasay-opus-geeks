import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import {
  BRAND,
  CONTACT,
  FOOTER_SERVICES,
  FOOTER_STUDIO,
  OFFICES,
  SOCIALS,
} from "../../data/site";
import { useOfficeClock } from "../../hooks/useOfficeClock";
import OfficeGlobe from "./OfficeGlobe";
import Wordmark from "./Wordmark";

/* Brand marks are inline rather than pulled from an icon package: lucide has no
   brand glyphs, and the three we need do not justify a new dependency. */
const SOCIAL_PATHS = {
  LinkedIn:
    "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z",
  Facebook:
    "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z",
  X: "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.48l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41z",
};

function SocialIcon({ label }) {
  const path = SOCIAL_PATHS[label];
  if (!path) return null;
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  );
}

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="og-footer">
      {/* ── CALL TO ACTION ─────────────────────────────────────────────── */}
      <section className="og-footer__top og-shell">
        <div className="og-footer__pitch">
          <p className="og-eyebrow">
            <span className="og-eyebrow__rule" aria-hidden="true" />
            Start a project
          </p>
          <h2 className="og-footer__head">
            Let&rsquo;s build something
            <br />
            people <strong data-text="Remember">Remember</strong>.
          </h2>
          <p className="og-footer__sub">{BRAND.tagline}</p>

          <div className="og-footer__actions">
            <Link to="/contact-us" className="og-btn og-btn--solid">
              <span>Start a project</span>
              <ArrowUpRight size={17} strokeWidth={2.1} aria-hidden="true" />
            </Link>
            <a className="og-btn og-btn--ghost" href={`mailto:${CONTACT.email}`}>
              <span>{CONTACT.email}</span>
            </a>
          </div>
        </div>

        {/* ── GLOBE ──────────────────────────────────────────────────────
            Real Natural Earth geometry, the two real offices, a real great
            circle between them. It only loads as it comes into view. */}
        <div className="og-footer__globe">
          <div className="og-globe">
            <OfficeGlobe />
            <span className="og-globe__ring" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ── OFFICES ────────────────────────────────────────────────────── */}
      <section className="og-footer__offices og-shell">
        {OFFICES.map((office) => (
          <OfficeCard key={office.id} office={office} />
        ))}
      </section>

      {/* ── DIRECTORY ──────────────────────────────────────────────────── */}
      <section className="og-footer__grid og-shell">
        <div className="og-footer__brand">
          <Wordmark size={38} />
          <p className="og-footer__blurb">
            A product engineering studio working across two time zones, so
            something is always moving on your build.
          </p>
          <a className="og-footer__phone" href={CONTACT.phoneHref}>
            {CONTACT.phone}
          </a>
        </div>

        <FooterColumn title="Services" links={FOOTER_SERVICES} />
        <FooterColumn title="Studio" links={FOOTER_STUDIO} />

        <div className="og-footer__col">
          <h3 className="og-footer__coltitle">Follow us</h3>
          <ul className="og-footer__links og-footer__links--social">
            {SOCIALS.map((social) => (
              <li key={social.label}>
                <a href={social.href} target="_blank" rel="noreferrer noopener">
                  <span className="og-footer__sockey">
                    <SocialIcon label={social.label} />
                  </span>
                  {social.label}
                  <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── SIGNATURE ──────────────────────────────────────────────────── */}
      {/* The sign-off is the real wordmark, drawn in the brand ramp. */}
      <div className="og-footer__signature" aria-hidden="true">
        <span className="og-footer__signature-mark" />
      </div>

      <div className="og-footer__legal og-shell">
        <p>
          © {year} <Link to="/">{BRAND.legalName}</Link>. All rights reserved.
        </p>
        <nav className="og-footer__legalnav" aria-label="Legal">
          <Link to="/privacy-policy">Privacy</Link>
          <Link to="/terms-conditions">Terms</Link>
          <Link to="/contact-us">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}

/** One office: postal address, coordinates, and its live local time. */
function OfficeCard({ office }) {
  const { time, isOpen } = useOfficeClock(office.tz, office.hours);

  return (
    <article className="og-office">
      <header className="og-office__head">
        <span className="og-eyebrow">{office.kind}</span>
        <span className="og-office__status" data-live={isOpen ? "true" : "false"}>
          {isOpen ? "Open now" : "Closed"}
        </span>
      </header>

      <h3 className="og-office__city">
        {office.city}
        <span>{office.region}</span>
      </h3>

      <address className="og-office__address">
        {office.lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </address>

      <footer className="og-office__meta">
        <span>{office.readout}</span>
        <span className="og-office__clock">{time}</span>
      </footer>
    </article>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div className="og-footer__col">
      <h3 className="og-footer__coltitle">{title}</h3>
      <ul className="og-footer__links">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            <Link to={link.path}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
