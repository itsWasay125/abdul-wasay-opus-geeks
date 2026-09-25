import React, { useState, useId } from "react";
import { motion } from "framer-motion";

/* ==========================================================================
   OFFICIAL BRAND SVG LOGOS & GENERIC CAPABILITY ICONS
   ========================================================================== */

// 1. React — Official Cyan #61DAFB Atom
export const ReactIcon = () => (
  <div className="og-convergence-node__icon-badge og-convergence-node__icon-badge--react" title="React">
    <svg viewBox="-11.5 -10.23174 23 20.46348" aria-label="React" role="img">
      <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  </div>
);

// 2. Next.js — Official Black & White Mark
export const NextjsIcon = () => (
  <div className="og-convergence-node__icon-badge og-convergence-node__icon-badge--nextjs" title="Next.js">
    <svg viewBox="0 0 24 24" aria-label="Next.js" role="img">
      <path fill="#FFFFFF" d="M18.665 21.978C16.744 23.255 14.453 24 12 24 5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12c0 3.193-1.245 6.096-3.284 8.243l-9.431-12.227H9.17v9.968h1.86v-7.39l8.035 10.384h-.4zm-4.707-13.962v6.621h1.86V8.016h-1.86z" />
    </svg>
  </div>
);

// 3. Node.js — Official Authentic Simple Icons Hexagon Emblem
export const NodejsIcon = () => (
  <div className="og-convergence-node__icon-badge og-convergence-node__icon-badge--nodejs" title="Node.js">
    <svg viewBox="0 0 24 24" aria-label="Node.js" role="img">
      <path
        fill="#5FA04E"
        d="M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.604.065-.037.151-.023.218.017l2.256 1.339c.082.045.197.045.272 0l8.795-5.076c.082-.047.134-.141.134-.238V6.921c0-.099-.053-.192-.137-.242l-8.791-5.072c-.081-.047-.189-.047-.271 0L3.075 6.68c-.085.049-.139.145-.139.241v10.15c0 .097.054.189.139.235l2.409 1.392c1.307.654 2.108-.116 2.108-.89V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.112.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L2.28 18.675c-.57-.329-.922-.945-.922-1.604V6.921c0-.659.353-1.275.922-1.603l8.795-5.082c.557-.315 1.296-.315 1.848 0l8.794 5.082c.57.329.924.944.924 1.603v10.15c0 .659-.354 1.273-.924 1.604l-8.794 5.078c-.279.16-.598.244-.924.244zm7.101-10.007c0-1.9-1.284-2.406-3.987-2.763-2.731-.361-3.009-.548-3.009-1.187 0-.528.235-1.233 2.258-1.233 1.807 0 2.473.389 2.747 1.607.024.115.129.199.247.199h1.141c.071 0 .138-.031.186-.081.048-.054.074-.123.067-.196-.177-2.098-1.571-3.076-4.388-3.076-2.508 0-4.004 1.058-4.004 2.833 0 1.925 1.488 2.457 3.895 2.695 2.88.282 3.103.703 3.103 1.269 0 .983-.789 1.402-2.642 1.402-2.327 0-2.839-.584-3.011-1.742-.02-.124-.126-.215-.253-.215h-1.137c-.141 0-.254.112-.254.253 0 1.482.806 3.248 4.655 3.248 3.017.001 4.615-1.096 4.615-3.013z"
      />
    </svg>
  </div>
);

// 4. React Native — Official Cyan #61DAFB Cross-Platform Atom
export const ReactNativeIcon = () => (
  <div className="og-convergence-node__icon-badge og-convergence-node__icon-badge--reactnative" title="React Native">
    <svg viewBox="-11.5 -10.23174 23 20.46348" aria-label="React Native" role="img">
      <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  </div>
);

// 5. .NET - the official roundel, drawn as a mark rather than wordmark
export const DotnetIcon = () => (
  <div className="og-convergence-node__icon-badge og-convergence-node__icon-badge--dotnet" title=".NET" aria-label=".NET">
    <svg viewBox="0 0 24 24" fill="none" aria-label=".NET" role="img">
      <circle cx="12" cy="12" r="9.2" fill="#512BD4" />
      {/* the N, in the negative space the roundel leaves */}
      <path d="M8.1 16V8.6h1.5l3.1 4.7V8.6h1.4V16h-1.5l-3.1-4.7V16z" fill="#FFFFFF" />
      <circle cx="5.6" cy="15.6" r="0.95" fill="#FFFFFF" />
    </svg>
  </div>
);

// 6. PHP - the elephant is a trademark, so this is the language mark
export const PhpIcon = () => (
  <div className="og-convergence-node__icon-badge og-convergence-node__icon-badge--php" title="PHP" aria-label="PHP">
    <svg viewBox="0 0 24 24" fill="none" aria-label="PHP" role="img">
      <ellipse cx="12" cy="12" rx="10.4" ry="6.1" fill="#777BB4" />
      <g fill="#FFFFFF">
        {/* p h p, set as the language sets it */}
        <path d="M4.9 9.1h2.6c1.3 0 2 .6 1.8 1.7-.2 1.2-1 1.8-2.3 1.8h-1l-.3 1.6H4.2zm1.2 1.1-.3 1.6h.8c.7 0 1.1-.3 1.2-.9.1-.5-.2-.7-.8-.7z" />
        <path d="M10.1 7.5h1.4l-.3 1.6h1.3c1.2 0 1.7.6 1.5 1.6l-.6 3h-1.5l.5-2.7c.1-.5 0-.7-.5-.7h-1.1l-.7 3.4H8.6z" />
        <path d="M15.2 9.1h2.6c1.3 0 2 .6 1.8 1.7-.2 1.2-1 1.8-2.3 1.8h-1l-.3 1.6h-1.5zm1.2 1.1-.3 1.6h.8c.7 0 1.1-.3 1.2-.9.1-.5-.2-.7-.8-.7z" />
      </g>
    </svg>
  </div>
);
// 7. Flutter — Official Cyan/Blue Dual-Tone Wings
export const FlutterIcon = () => (
  <div className="og-convergence-node__icon-badge og-convergence-node__icon-badge--flutter" title="Flutter">
    <svg viewBox="0 0 24 24" aria-label="Flutter" role="img">
      <path fill="#02569B" d="M14.314 0L2.3 12 6 15.7 21.684.013h-7.37z" />
      <path fill="#02569B" d="M14.286 9.686L8.4 15.572l3.7 3.7 9.585-9.586h-7.4z" />
      <path fill="#54C5F8" d="M14.286 24h7.4L14.7 17.014l-3.7 3.7z" />
      <path fill="#29B6F6" d="M11 20.714l3.7-3.7 3.7 3.7-3.7 3.7z" />
    </svg>
  </div>
);

/* ── Opus Geeks Hub Emblem (Uses authentic logo-mark.png mark) ── */
const OpusGeeksHubLogo = () => (
  <div className="og-convergence-hub__logo-wrap">
    <img
      src="/assets/oglogo-mark.webp"
      alt="Opus Geeks"
      className="og-convergence-hub__logo"
      width={38}
      height={34}
      decoding="async"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  </div>
);

export const DEFAULT_TOOLKIT_SOURCES = [
  { id: "react", label: "React", icon: <ReactIcon />, altText: "React" },
  { id: "nextjs", label: "Next.js", icon: <NextjsIcon />, altText: "Next.js" },
  { id: "nodejs", label: "Node.js", icon: <NodejsIcon />, altText: "Node.js" },
  { id: "reactnative", label: "React Native", icon: <ReactNativeIcon />, altText: "React Native" },
  { id: "php", label: "PHP", icon: <PhpIcon />, altText: "PHP" },
  { id: "flutter", label: "Flutter", icon: <FlutterIcon />, altText: "Flutter" },
];

export default function KnowledgeConvergence({
  className = "",
  title = "Opus Geeks",
  badgeText = "Our Toolkit",
  showBadge = true,
  sources = DEFAULT_TOOLKIT_SOURCES,
  dotColor = "#00ADEE", // Opus Geeks Cyan Accent
  onTargetClick,
}) {
  const [hoveredId, setHoveredId] = useState(null);
  const filterId = useId();

  // Normalized 1000 x 520 coordinate space matching .og-convergence-layout
  const viewBoxWidth = 1000;
  const viewBoxHeight = 520;

  // Connection point coordinates aligned with card output dots & hub core
  const leftX = 240;
  const targetX = 665;
  const targetY = 260;

  // Vertical distribution of the 6 nodes centered around 260
  const startY = 62;
  const stepY = 79.2;
  const getSourceY = (index) => startY + index * stepY;

  return (
    <div className={`og-convergence-stage ${className}`.trim()}>
      {/* Centered Embedded Section Header (Inside the Glass Box) */}
      <div className="og-convergence-stage__header">
        <p className="og-convergence-stage__eyebrow">
          <span className="og-convergence-stage__eyebrow-dot" />
          <span>Capabilities & architecture</span>
        </p>
        <h2 id="og-toolkit-title" className="og-convergence-stage__title">
          Our Engineering <span className="og-toolkit-section__title-grad">Toolkit</span>
        </h2>
        <p className="og-convergence-stage__sub">
          Battle-tested frameworks and platforms engineered for blistering performance, enterprise scalability, and spatial elegance.
        </p>
      </div>

      <div className="og-convergence-layout">
        {/* SVG Purple-to-Cyan Bezier Beams */}
        <svg
          className="og-convergence-svg"
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Opus Geeks Signature Purple → Blue → Cyan Beam Gradient */}
            <linearGradient id={`${filterId}-stream-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
              <stop offset="45%" stopColor="#5B8BFF" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#00ADEE" stopOpacity="0.95" />
            </linearGradient>

            {/* Soft Glow Filter for Beams */}
            <filter id={`${filterId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Glowing Particle Filter */}
            <filter id={`${filterId}-dot-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Render Bezier Stream Lines */}
          <g>
            {sources.map((src, i) => {
              const srcY = getSourceY(i);
              const isHovered = hoveredId === src.id;
              const isAnyHovered = hoveredId !== null;

              const pathD = `M ${leftX} ${srcY} C ${leftX + 160} ${srcY}, ${targetX - 160} ${targetY}, ${targetX} ${targetY}`;

              return (
                <g key={src.id}>
                  {/* Base Gradient Vector Stream */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={`url(#${filterId}-stream-grad)`}
                    strokeWidth={isHovered ? 3.8 : 2}
                    strokeOpacity={isHovered ? 1 : isAnyHovered ? 0.25 : 0.6}
                    filter={`url(#${filterId}-glow)`}
                    style={{ transition: "all 300ms ease" }}
                  />

                  {/* Pulsing Light Dotted Stream */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={dotColor}
                    strokeWidth={isHovered ? 2.5 : 1.3}
                    strokeDasharray="8 16"
                    strokeOpacity={isHovered ? 1 : 0.4}
                    style={{ transition: "all 300ms ease" }}
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="48"
                      to="0"
                      dur={isHovered ? "0.9s" : "2.2s"}
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Primary Energy Flow Particle */}
                  <circle r={isHovered ? 4.5 : 3.5} fill="#00ADEE" filter={`url(#${filterId}-dot-glow)`}>
                    <animateMotion
                      path={pathD}
                      dur={isHovered ? "1.3s" : `${2.0 + (i % 3) * 0.4}s`}
                      repeatCount="indefinite"
                      begin={`${(i * 0.3) % 2}s`}
                    />
                  </circle>

                  {/* Secondary Violet Energy Particle */}
                  <circle r="2.2" fill="#8B5CF6" opacity="0.9">
                    <animateMotion
                      path={pathD}
                      dur={isHovered ? "1.3s" : `${2.0 + (i % 3) * 0.4}s`}
                      repeatCount="indefinite"
                      begin={`${((i * 0.3) % 2) + 1.0}s`}
                    />
                  </circle>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Left Side: Exactly 6 Tech Nodes */}
        <div className="og-convergence-stack">
          {sources.map((src) => {
            const isHovered = hoveredId === src.id;

            return (
              <motion.div
                key={src.id}
                onMouseEnter={() => setHoveredId(src.id)}
                onMouseLeave={() => setHoveredId(null)}
                whileHover={{ scale: 1.03, x: 6 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                className={`og-convergence-node ${isHovered ? "is-active" : ""}`}
                title={src.altText || src.label}
              >
                {/* Source Icon & Title */}
                <div className="og-convergence-node__left">
                  {src.icon}
                  <span className="og-convergence-node__label">
                    {src.label}
                  </span>
                </div>

                {/* Glowing Connection Dot */}
                <div className="og-convergence-node__dot-wrap">
                  <div
                    className="og-convergence-node__dot"
                    style={{
                      backgroundColor: dotColor,
                      boxShadow: `0 0 10px ${dotColor}, 0 0 18px ${dotColor}`,
                    }}
                  />
                  <div
                    className="og-convergence-node__dot-pulse"
                    style={{ backgroundColor: dotColor }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Side: Opus Geeks Hub Node */}
        <div className="og-convergence-hub">
          {/* Central Hub Node Pulsing Dot */}
          <div className="og-convergence-hub__portal">
            <div
              className="og-convergence-hub__halo"
              style={{
                background: `radial-gradient(circle, ${dotColor} 0%, transparent 70%)`,
              }}
            />
            <div
              className="og-convergence-hub__core"
              style={{
                backgroundColor: dotColor,
                boxShadow: `0 0 14px ${dotColor}, 0 0 28px ${dotColor}`,
              }}
              onClick={onTargetClick}
            />
            <div className="og-convergence-hub__ping" />
          </div>

          {/* Header Opus Geeks Logo & Title */}
          <div className="og-convergence-hub__content">
            <OpusGeeksHubLogo />

            <h3 className="og-convergence-hub__title">
              {title}
            </h3>

            {showBadge && (
              <span className="og-convergence-hub__badge">
                {badgeText}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
