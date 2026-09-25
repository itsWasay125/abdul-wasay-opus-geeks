import { useState, useEffect, useCallback } from "react";
import Icon from "./Icon";

/* Real team. The avatar files are the existing photos from the previous roster
   re-pointed to the current names, so every orbit node shows a face again.
   Replace each path as real headshots arrive; the component still falls back
   to initials on a brand gradient if a file is missing. */
const teamMembers = [
  { id: 1, name: "Mohammad Mohsin Anjum", role: "Project Manager", email: "mohsin@opusgeeks.com", gradient: "linear-gradient(135deg, #7c3aed, #5b21b6)", avatar: "/assets/team/abdul-wasay.jpg" },
  { id: 2, name: "Sami Zafar", role: "Backend Lead", email: "sami@opusgeeks.com", gradient: "linear-gradient(135deg, #2563eb, #4338ca)", avatar: "/assets/team/hassan-khan.jpg" },
  { id: 3, name: "Abdul Qadeer", role: "Mobile Developer Lead", email: "qadeer@opusgeeks.com", gradient: "linear-gradient(135deg, #f59e0b, #d97706)", avatar: "/assets/team/zain-malik.jpg" },
  { id: 4, name: "Haris Asif Siddiqui", role: "Front End & CMS Lead", email: "haris@opusgeeks.com", gradient: "linear-gradient(135deg, #06b6d4, #0891b2)", avatar: "/assets/team/omar-sheikh.jpg" },
    { id: 5, name: "Ehtisham Ahmed", role: "UI/UX Designer", email: "ehtisham@opusgeeks.com", gradient: "linear-gradient(135deg, #0ea5e9, #4f46e5)", avatar: "/assets/team/ehtisham-ahmed.jpg" },
  { id: 6, name: "Abdullah Ahmed", role: "Sales Lead", email: "abdullah@opusgeeks.com", gradient: "linear-gradient(135deg, #10b981, #059669)", avatar: "/assets/team/bilal-qureshi.jpg" },
  { id: 7, name: "Mazaain Hasan", role: "Business Development Lead", email: "mazaain@opusgeeks.com", gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)", avatar: "/assets/team/mazaain-hasan.jpg" },
];

function getInitials(name) {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
}

export default function TeamOrbit() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    const check = () => setWindowWidth(window.innerWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft")
        setActiveIndex((i) => (i - 1 + teamMembers.length) % teamMembers.length);
      else if (e.key === "ArrowRight")
        setActiveIndex((i) => (i + 1) % teamMembers.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isSmallMobile = windowWidth < 400;
  const isMobile = windowWidth < 768;

  const radius = isMobile ? (isSmallMobile ? 148 : 162) : 260;
  const profileSize = isMobile ? (isSmallMobile ? 38 : 44) : 88;
  const baseSize = radius * 2 + profileSize + (isMobile ? 16 : 80);

  // Scaler to guarantee all left/right avatars fit comfortably within viewport without clipping
  const availableWidth = typeof window !== "undefined" ? Math.min(windowWidth - 24, 768) : baseSize;
  const scale = isMobile && availableWidth < baseSize ? Math.max(0.72, availableWidth / baseSize) : 1;
  const stageHeight = isMobile ? Math.round(baseSize * scale) : undefined;

  const getRotation = useCallback(
    (index) => (index - activeIndex) * (360 / teamMembers.length),
    [activeIndex]
  );

  const next = () => setActiveIndex((i) => (i + 1) % teamMembers.length);
  const prev = () => setActiveIndex((i) => (i - 1 + teamMembers.length) % teamMembers.length);

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : null;
    if (touchEndX !== null) {
      const diff = touchStartX - touchEndX;
      if (diff > 35) {
        next();
      } else if (diff < -35) {
        prev();
      }
    }
    setTouchStartX(null);
  };

  const active = teamMembers[activeIndex];

  return (
    <div
      className="orbit-stage"
      style={isMobile ? { width: "100%", height: stageHeight, display: "flex", justifyContent: "center", alignItems: "center" } : undefined}
    >
      <div
        className="orbit-wrap"
        style={{
          width: baseSize,
          height: baseSize,
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: "center center",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-label="Team members"
      >
        <div
          className="orbit-ring"
          style={{ width: radius * 2, height: radius * 2 }}
          aria-hidden="true"
        />
        <div
          className="orbit-ring orbit-ring--inner"
          style={{ width: radius * 1.42, height: radius * 1.42 }}
          aria-hidden="true"
        />

        <div className="orbit-card" key={active.id}>
          <div className="orbit-avatar" style={{ background: active.gradient }}>
            <span className="orbit-avatar-fallback">{getInitials(active.name)}</span>
            {active.avatar ? (
              <img
                src={active.avatar}
                alt={active.name}
                className="orbit-avatar-img"
                loading="eager"
                onError={(event) => { event.currentTarget.style.display = "none"; }}
              />
            ) : null}
          </div>
          <span className="orbit-count">{String(activeIndex + 1).padStart(2, "0")} / {String(teamMembers.length).padStart(2, "0")}</span>
          <h3 className="orbit-name">{active.name}</h3>
          <p className="orbit-meta">
            <Icon name="briefcase" size={13} />
            {active.role}
          </p>
          <p className="orbit-email-row">
            <Icon name="mail" size={12} />
            {active.email}
          </p>
          <div className="orbit-nav">
            <button className="orbit-nav-btn" onClick={prev} aria-label="Previous member">
              <Icon name="chevron-left" size={15} />
            </button>
            <button className="orbit-connect">Connect</button>
            <button className="orbit-nav-btn" onClick={next} aria-label="Next member">
              <Icon name="chevron-right" size={15} />
            </button>
          </div>
        </div>

        {teamMembers.map((member, i) => {
          const rotation = getRotation(i);
          return (
            <div
              key={member.id}
              className={`orbit-item${i === activeIndex ? " is-active" : ""}`}
              style={{
                width: profileSize,
                height: profileSize,
                top: `calc(50% - ${profileSize / 2}px)`,
                left: `calc(50% - ${profileSize / 2}px)`,
                transform: `rotate(${rotation}deg) translateY(-${radius}px)`,
              }}
              onClick={() => i !== activeIndex && setActiveIndex(i)}
              role="button"
              tabIndex={0}
              aria-label={`View ${member.name}, ${member.role}`}
              onKeyDown={(e) => e.key === "Enter" && i !== activeIndex && setActiveIndex(i)}
            >
              <div
                className="orbit-item-face"
                style={{
                  background: member.gradient,
                  transform: `rotate(-${rotation}deg)`,
                }}
              >
                <span className="orbit-face-fallback">{getInitials(member.name)}</span>
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="orbit-face-img"
                    loading="eager"
                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
