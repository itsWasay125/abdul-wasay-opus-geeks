"use client";
// Opus Geeks — Glowing Line + Soft Particles cursor (ek hi file, koi extra package nahi)
// Next.js: app/layout.tsx mein <LineTrail /> ek dafa laga dein.
import { useEffect } from "react";

function createLineTrail(opts = {}) {
  if (typeof window === "undefined") return () => {};
  if (window.matchMedia("(pointer: coarse)").matches) return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const stops = opts.colors || ["#65348F", "#3963B2", "#0085CA", "#00B1F3"];
  const LEN = opts.length || 28;          // line kitni lambi (points)
  const WIDTH = opts.width || 3.2;        // head par line ki motai
  const MAXP = opts.maxParticles || 90;
  const spacing = opts.spacing || 16;     // kitne px par ek particle

  // gradient ramp
  const rgb = stops.map(h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; });
  const ramp = [];
  for (let i = 0; i < 48; i++) {
    const t = (i / 47) * (rgb.length - 1), k = Math.min(Math.floor(t), rgb.length - 2), f = t - k;
    ramp.push(rgb[k].map((v, j) => Math.round(v + (rgb[k + 1][j] - v) * f)).join(","));
  }
  const col = (t, a) => `rgba(${ramp[Math.round(Math.max(0, Math.min(1, t)) * 47)]},${a})`;

  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  // zIndex 1150: above the header (1000), below every overlay - the chat
  // button (1199), the chat panel (1200-1202), the "Start a project" dialog
  // (3000) and the loader (9999). At 9999 the trail drew over all of them.
  Object.assign(cv.style, { position: "fixed", inset: "0", width: "100vw", height: "100vh", pointerEvents: "none", zIndex: "1150" });
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");

  let W = 0, H = 0, raf = 0, mx = null, my = null, hx = 0, hy = 0, travel = 0, lastWheel = 0, idle = 0;
  const pts = [], ps = [];
  const rand = (a, b) => a + Math.random() * (b - a);

  const resize = () => {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };

  const add = (x, y, vx, vy, big) => {
    if (ps.length >= MAXP) ps.shift();
    const life = big ? rand(70, 110) : rand(40, 75);
    ps.push({ x, y, vx, vy, life, max: life, t: Math.random(), s: big ? rand(3, 4.5) : rand(0.8, 2), a: big ? 0.3 : rand(0.6, 0.95), w: rand(0, 6.28) });
    wake();
  };

  const drawLine = () => {
    const n = pts.length;
    if (n < 3) return;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    // do pass: pehle chaudi halki glow, phir patli core line
    for (const pass of [0, 1]) {
      for (let i = 1; i < n - 1; i++) {
        const t = i / (n - 1);                 // 0 = tail, 1 = head
        const e = t * t * (3 - 2 * t);         // smooth taper
        const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
        ctx.beginPath();
        ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
        ctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
        if (pass === 0) { ctx.lineWidth = WIDTH * 4.5 * e + 1; ctx.strokeStyle = col(t, 0.10 * e); }
        else { ctx.lineWidth = WIDTH * e + 0.3; ctx.strokeStyle = col(t, 0.9 * e); }
        ctx.stroke();
      }
    }
    // head par chhota sa chamakta point
    const h = pts[n - 1];
    ctx.fillStyle = col(1, 0.9); ctx.shadowColor = col(1, 1); ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(h.x, h.y, WIDTH * 0.75, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  };

  const tick = () => {
    ctx.clearRect(0, 0, W, H);
    if (mx !== null) {
      const px = hx, py = hy;
      hx += (mx - hx) * 0.38; hy += (my - hy) * 0.38;
      const moved = Math.hypot(hx - px, hy - py) > 0.3;
      if (moved) { pts.push({ x: hx, y: hy }); idle = 0; } else idle++;
    } else idle++;
    // line ka tail sikurta rehta hai
    const drop = idle > 0 ? 2 : 0;
    while (pts.length > LEN) pts.shift();
    for (let k = 0; k < drop && pts.length; k++) pts.shift();

    drawLine();

    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      if (--p.life <= 0) { ps.splice(i, 1); continue; }
      p.w += 0.06;
      p.vx = p.vx * 0.965 + Math.sin(p.w) * 0.015;
      p.vy = p.vy * 0.965 - 0.008;
      p.x += p.vx; p.y += p.vy;
      const t = p.life / p.max, fade = t > 0.85 ? (1 - t) / 0.15 : t;
      ctx.fillStyle = col(p.t, fade * p.a);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (0.5 + 0.5 * t), 0, Math.PI * 2); ctx.fill();
    }
    raf = pts.length || ps.length || mx !== null && idle < 2 ? requestAnimationFrame(tick) : 0;
  };

  const onMove = (e) => {
    // sections with their own pointer effect (the reactive grids) opt out
    if (e.target && e.target.closest && e.target.closest("[data-no-trail]")) { mx = my = null; return; }
    const x = e.clientX, y = e.clientY;
    if (mx === null) { hx = x; hy = y; pts.length = 0; }
    else {
      const dx = x - mx, dy = y - my;
      travel += Math.hypot(dx, dy);
      if (travel > spacing) {
        travel = 0;
        add(x + rand(-6, 6), y + rand(-6, 6), -dx * 0.04 + rand(-0.4, 0.4), -dy * 0.04 + rand(-0.4, 0.4), Math.random() < 0.08);
      }
    }
    mx = x; my = y; wake();
  };
  const onWheel = (e) => {
    const now = performance.now();
    if (mx === null || now - lastWheel < 70) return;
    lastWheel = now;
    const dir = Math.sign(e.deltaY);
    for (let i = 0; i < 3; i++) add(mx + rand(-16, 16), my + rand(-16, 16), rand(-0.4, 0.4), -dir * rand(0.6, 1.6), false);
  };
  const onDown = (e) => {
    if (e.target && e.target.closest && e.target.closest("[data-no-trail]")) return;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + rand(-0.2, 0.2), sp = rand(0.8, 2.6);
      add(e.clientX, e.clientY, Math.cos(a) * sp, Math.sin(a) * sp, i % 5 === 0);
    }
  };
  const onLeave = () => { mx = my = null; };

  resize();
  addEventListener("resize", resize);
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("wheel", onWheel, { passive: true });
  addEventListener("pointerdown", onDown, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);

  return () => {
    cancelAnimationFrame(raf);
    removeEventListener("resize", resize);
    removeEventListener("pointermove", onMove);
    removeEventListener("wheel", onWheel);
    removeEventListener("pointerdown", onDown);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    cv.remove();
  };
}


export default function LineTrail({ colors, length = 28, width = 3.2, maxParticles = 90, spacing = 16 }) {
  useEffect(() => createLineTrail({ colors, length, width, maxParticles, spacing }), [length, width, maxParticles, spacing]);
  return null;
}
