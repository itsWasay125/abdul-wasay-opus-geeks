import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, Minus, Plus, Phone, Clock, ShieldCheck, Users } from "lucide-react";
import GlowButton from "../GlowButton";
import { CONTACT, NAV, OFFICES, SERVICE_MENU } from "../../data/site";
import { useOfficeClock } from "../../hooks/useOfficeClock";
import Wordmark from "./Wordmark";
import ProjectModal from "./ProjectModal";

const KARACHI = OFFICES.find((office) => office.id === "khi");
const HOVER_INTENT = 90;

export default function SiteHeader({ darkHero = false }) {
  const { pathname } = useLocation();
  const [pinned] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const intentRef = useRef(0);
  const headerRef = useRef(null);

  // Close everything when the route changes.
  useEffect(() => {
    setMegaOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  // Escape closes; the drawer also locks the page behind it.
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      setMegaOpen(false);
      setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!drawerOpen) {
      document.body.removeAttribute("data-drawer-open");
      return undefined;
    }
    const { body } = document;
    body.setAttribute("data-drawer-open", "true");
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.removeAttribute("data-drawer-open");
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
    };
  }, [drawerOpen]);

  const openMega = useCallback(() => {
    window.clearTimeout(intentRef.current);
    intentRef.current = window.setTimeout(() => setMegaOpen(true), HOVER_INTENT);
  }, []);

  const closeMega = useCallback(() => {
    window.clearTimeout(intentRef.current);
    intentRef.current = window.setTimeout(() => setMegaOpen(false), HOVER_INTENT);
  }, []);

  useEffect(() => () => window.clearTimeout(intentRef.current), []);

  return (
    <>
      <a className="og-skip" href="#main-content">
        Skip to content
      </a>

      <header
        ref={headerRef}
        className="og-header"
        data-hero={darkHero ? "dark" : "light"}
        data-pinned={pinned ? "true" : "false"}
        data-mega={megaOpen ? "true" : "false"}
        data-drawer={drawerOpen ? "open" : "closed"}
      >
        <div className="og-header__bar">
          <div className="og-header__lead">
            <Wordmark size={34} />
          </div>

          <nav className="og-header__nav" aria-label="Primary">
            {NAV.map((item) =>
              item.mega ? (
                <div
                  key={item.path}
                  className="og-header__megawrap"
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                  onFocus={openMega}
                  onBlur={closeMega}
                >
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `og-link${isActive ? " is-active" : ""}`
                    }
                    aria-expanded={megaOpen}
                    aria-haspopup="true"
                    onClick={() => setMegaOpen(false)}
                  >
                    <span className="og-link__slide" data-text={item.label}>
                      {item.label}
                    </span>
                    <span className="og-link__caret" aria-hidden="true" />
                  </NavLink>
                </div>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) => `og-link${isActive ? " is-active" : ""}`}
                  onMouseEnter={closeMega}
                >
                  <span className="og-link__slide" data-text={item.label}>
                    {item.label}
                  </span>
                </NavLink>
              ),
            )}
          </nav>

          <div className="og-header__aside">
            <OfficePulse />
            <GlowButton
              label="Start a project"
              icon="arrow-up-right"
              className="og-header__cta"
              onClick={() => setProjectOpen(true)}
            />
            <button
              type="button"
              className="og-burger"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((v) => !v)}
              data-open={drawerOpen ? "true" : "false"}
            >
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* Scroll progress. Driven by the browser's own scroll timeline where
            it exists — no listener, no jank; simply absent elsewhere. */}
        <span className="og-header__progress" aria-hidden="true" />

        <MegaPanel
          open={megaOpen}
          onEnter={openMega}
          onLeave={closeMega}
          onNavigate={() => setMegaOpen(false)}
        />
      </header>

      <ProjectModal open={projectOpen} onClose={() => setProjectOpen(false)} />

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

/* ── call readout ────────────────────────────────────────────────────────
   This was a live Karachi clock. A clock is a nice detail and nobody has
   ever acted on one; the number is the same slot doing work. The studio
   hours still drive the dot, so the number reads as staffed or out of hours
   rather than as a bare string. */
function OfficePulse() {
  const { isOpen } = useOfficeClock(KARACHI.tz, KARACHI.hours);

  return (
    <a
      className="og-pulse og-pulse--call"
      href={CONTACT.phoneHref}
      title={isOpen ? `Call the studio — open now` : `Call the studio — currently outside studio hours`}
    >
      <span className="og-pulse__dot" data-live={isOpen ? "true" : "false"} aria-hidden="true" />
      <span className="og-pulse__time">{CONTACT.phone}</span>
    </a>
  );
}

/* ── services mega panel ─────────────────────────────────────────────── */
function MegaPanel({ open, onEnter, onLeave, onNavigate }) {
  return (
    <div
      className="og-mega"
      data-open={open ? "true" : "false"}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-hidden={!open}
      inert={open ? undefined : ""}
    >
      <div className="og-mega__inner">
        <div className="og-mega__list">
          {SERVICE_MENU.map((service, i) => (
            <Link
              key={service.path}
              to={service.path}
              className="og-mega__item"
              style={{ "--i": i }}
              onClick={onNavigate}
            >
              {/* Real client work, not an icon. Lazy + async so an unopened
                  menu never costs a byte on first load. */}
              <span className="og-mega__shot">
                <img
                  src={service.shot}
                  alt={service.shotAlt}
                  loading="lazy"
                  decoding="async"
                  width="368"
                  height="384"
                />
              </span>
              <span className="og-mega__index">{service.index}</span>
              <span className="og-mega__body">
                <span className="og-mega__title">
                  {service.label}
                  <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="og-mega__blurb">{service.blurb}</span>
                <span className="og-mega__stack">
                  {service.stack.map((tech) => (
                    <em key={tech}>{tech}</em>
                  ))}
                </span>
              </span>
            </Link>
          ))}
        </div>

        <aside className="og-mega__aside" style={{ "--i": 3 }}>
          <p className="og-eyebrow">Start here</p>
          <p className="og-mega__pitch">
            Tell us what you are building. You get a senior team, a fixed scope
            and a first call within one working day.
          </p>
          <Link to="/contact-us" className="og-btn og-btn--solid og-btn--block og-mega__cta" onClick={onNavigate}>
            <span>Book a call</span>
            <ArrowUpRight size={16} strokeWidth={2.1} aria-hidden="true" />
          </Link>
          <a className="og-mega__mail" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>

          {/* The panel ran out of content here and left a white gap under the
              address. These are the two things someone reads next after
              deciding to get in touch: how to call, and what happens when
              they do. */}
          <a className="og-mega__phone" href={CONTACT.phoneHref}>
            <Phone size={14} strokeWidth={2.2} aria-hidden="true" />
            {CONTACT.phone}
          </a>

          <ul className="og-mega__promise">
            <li>
              <Clock size={13} strokeWidth={2.2} aria-hidden="true" />
              Reply within one working day
            </li>
            <li>
              <ShieldCheck size={13} strokeWidth={2.2} aria-hidden="true" />
              NDA on request, before anything is shared
            </li>
            <li>
              <Users size={13} strokeWidth={2.2} aria-hidden="true" />
              You speak to the team that builds it
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

/* ── mobile drawer ───────────────────────────────────────────────────── */
function MobileDrawer({ open, onClose }) {
  const [openGroup, setOpenGroup] = useState(false);

  useEffect(() => {
    if (!open) setOpenGroup(false);
  }, [open]);

  return (
    <div className="og-drawer" data-open={open ? "true" : "false"} aria-hidden={!open}>
      <nav className="og-drawer__nav" aria-label="Mobile">
        {NAV.map((item, i) =>
          item.mega ? (
            <div key={item.path} className="og-drawer__group" style={{ "--i": i }}>
              <div className="og-drawer__row">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `og-drawer__link${isActive ? " is-active" : ""}`}
                  onClick={onClose}
                >
                  <span className="og-drawer__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="og-drawer__label">{item.label}</span>
                </NavLink>
                <button
                  type="button"
                  className="og-drawer__expand"
                  onClick={() => setOpenGroup((v) => !v)}
                  aria-label={openGroup ? "Collapse services" : "Expand services"}
                  aria-expanded={openGroup}
                >
                  {openGroup ? <Minus size={18} /> : <Plus size={18} />}
                </button>
              </div>
              <div className="og-drawer__sub" data-open={openGroup ? "true" : "false"}>
                <div>
                  {SERVICE_MENU.map((service) => (
                    <NavLink
                      key={service.path}
                      to={service.path}
                      className={({ isActive }) => (isActive ? "is-active" : "")}
                      onClick={onClose}
                    >
                      {service.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) => `og-drawer__link${isActive ? " is-active" : ""}`}
              style={{ "--i": i }}
              onClick={onClose}
            >
              <span className="og-drawer__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="og-drawer__label">{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>

      <div className="og-drawer__foot" style={{ "--i": NAV.length }}>
        <Link to="/contact-us" className="og-btn og-btn--solid og-btn--block og-drawer__cta" onClick={onClose}>
          <span>Start a project</span>
          <ArrowUpRight size={16} strokeWidth={2.1} aria-hidden="true" />
        </Link>
        <div className="og-drawer__meta">
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
        </div>
      </div>
    </div>
  );
}
