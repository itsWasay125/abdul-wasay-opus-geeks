"use client";

/**
 * OfficeGlobe — orthographic globe on a 2D canvas, drawn from real Natural
 * Earth geometry (world-atlas 110m via topojson).
 *
 * Why canvas 2D and not WebGL: the whole thing is ~30kb of deps, costs nothing
 * at first paint, and never blocks hydration. The geometry is genuine — no
 * hand-drawn coastlines.
 *
 * Performance contract:
 *  - Nothing is imported until the canvas is within 400px of the viewport, so
 *    the footer globe costs a visitor who never scrolls down exactly nothing.
 *  - The RAF loop parks itself when scrolled out of view or when the tab is
 *    hidden, and never starts at all under prefers-reduced-motion (a static
 *    globe is still painted).
 *  - Drag to rotate; auto-spin resumes 2.5s after release.
 *
 * Cost control on the draw itself — this mattered enormously. A naive version
 * of this component re-projected the full Natural Earth geometry every frame
 * and measured 416ms per frame (2.5fps) on a 4x-throttled CPU, spending 99% of
 * wall time in script. Four changes fixed it:
 *   1. The land rings are decimated once at boot instead of every frame.
 *   2. d3's adaptive resampling is relaxed (precision 0.4 -> 1.6).
 *   3. Canvas shadowBlur is gone — it is the single most expensive 2D op and
 *      was being set on every marker, every frame.
 *   4. The loop is capped to 30fps; the globe turns slowly, so nobody can see
 *      the difference and it halves the work.
 */

import { useEffect, useRef } from "react";
import { OFFICES } from "../../data/site";

const SITES = OFFICES.map((office) => ({
  name: office.label,
  sub: office.readout,
  coords: office.coords,
}));

const LABEL_FONT = "500 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const PALETTE = {
  oceanLit: "rgba(23,134,207,0.20)",
  oceanDim: "rgba(4,10,20,0.60)",
  land: "rgba(150,200,238,0.38)",
  landFill: "rgba(23,134,207,0.12)",
  graticule: "rgba(130,175,220,0.07)",
  rim: "rgba(120,180,225,0.38)",
  halo: "rgba(23,134,207,0.34)",
  marker: "#4FB2F0",
  arc: "#4FB2F0",
  label: "rgba(238,243,248,0.88)",
  labelDim: "rgba(163,177,194,0.64)",
};

const TOPO_CDN = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";
const ARC_STEPS = 96;

export default function OfficeGlobe({
  sites = SITES,
  spinSpeed = 0.055,
  labels = true,
  className,
  style,
}) {
  const canvasRef = useRef(null);
  const sitesRef = useRef(sites);
  const labelsRef = useRef(labels);
  const speedRef = useRef(spinSpeed);

  sitesRef.current = sites;
  labelsRef.current = labels;
  speedRef.current = spinSpeed;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let cancelled = false;
    let raf = 0;
    const teardown = [];

    async function boot() {
      const [d3, topojson, atlas] = await Promise.all([
        import("d3-geo"),
        import("topojson-client"),
        loadTopology(),
      ]);
      if (cancelled) return;

      const { geoOrthographic, geoPath, geoGraticule, geoDistance, geoInterpolate } = d3;
      const ctx = canvas.getContext("2d");
      // 1.5 is indistinguishable here and costs 44% fewer pixels than 2.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const projection = geoOrthographic().clipAngle(90).precision(1.6);
      const path = geoPath(projection, ctx);
      const graticule = geoGraticule().step([20, 20])();
      const land = atlas
        ? simplify(topojson.feature(atlas, atlas.objects.countries), 2, 1.5)
        : null;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let W = 0;
      let H = 0;
      let radius = 0;
      // The atmosphere bloom and the ocean gradient depend only on size, not
      // on rotation — but they were being re-filled across the whole disc on
      // every frame, which is the most expensive thing the globe did. They are
      // now painted once per resize into this offscreen canvas and blitted.
      const backdrop = document.createElement("canvas");
      const bctx = backdrop.getContext("2d");
      const rotation = [-42, -16, 0];
      let dash = 0;
      let clock = 0;
      let dragging = false;
      let last = null;
      let spinAt = 0;
      let visible = true;

      // Great-circle routes between consecutive offices.
      const arcs = [];
      for (let i = 0; i < sitesRef.current.length - 1; i += 1) {
        const interpolate = geoInterpolate(
          sitesRef.current[i + 1].coords,
          sitesRef.current[i].coords,
        );
        const coordinates = [];
        for (let t = 0; t <= ARC_STEPS; t += 1) coordinates.push(interpolate(t / ARC_STEPS));
        arcs.push({ feature: { type: "LineString", coordinates }, coordinates });
      }

      function resize() {
        const rect = canvas.getBoundingClientRect();
        W = Math.max(1, rect.width);
        H = Math.max(1, rect.height);
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        radius = Math.max(1, Math.min(W, H) / 2 - 26);
        projection.scale(radius).translate([W / 2, H / 2]);
        buildBackdrop();
        draw();
      }

      /** Paints the static halo + ocean once, at device resolution. */
      function buildBackdrop() {
        const p = PALETTE;
        backdrop.width = Math.round(W * dpr);
        backdrop.height = Math.round(H * dpr);
        bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        bctx.clearRect(0, 0, W, H);

        const cx = W / 2;
        const cy = H / 2;

        const halo = bctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.22);
        halo.addColorStop(0, p.halo);
        halo.addColorStop(1, "rgba(0,0,0,0)");
        bctx.fillStyle = halo;
        bctx.beginPath();
        bctx.arc(cx, cy, radius * 1.22, 0, Math.PI * 2);
        bctx.fill();

        const ocean = bctx.createRadialGradient(
          cx - radius * 0.34,
          cy - radius * 0.38,
          radius * 0.08,
          cx,
          cy,
          radius,
        );
        ocean.addColorStop(0, p.oceanLit);
        ocean.addColorStop(1, p.oceanDim);
        bctx.fillStyle = ocean;
        bctx.beginPath();
        bctx.arc(cx, cy, radius, 0, Math.PI * 2);
        bctx.fill();

        bctx.lineWidth = 1;
        bctx.strokeStyle = p.rim;
        bctx.beginPath();
        bctx.arc(cx, cy, radius, 0, Math.PI * 2);
        bctx.stroke();
      }

      const onFront = (coords) => {
        const r = projection.rotate();
        return geoDistance(coords, [-r[0], -r[1]]) < Math.PI / 2 - 0.02;
      };

      function draw() {
        const p = PALETTE;
        projection.rotate(rotation);
        ctx.clearRect(0, 0, W, H);

        // Atmosphere, ocean and limb in one blit — all pre-rendered.
        ctx.drawImage(backdrop, 0, 0, W, H);

        ctx.beginPath();
        path(graticule);
        ctx.lineWidth = 0.55;
        ctx.strokeStyle = p.graticule;
        ctx.stroke();

        if (land) {
          ctx.beginPath();
          path(land);
          ctx.lineWidth = 0.9;
          ctx.strokeStyle = p.land;
          ctx.stroke();
        }

        arcs.forEach((arc) => {
          ctx.save();
          ctx.beginPath();
          path(arc.feature);
          ctx.setLineDash([4, 7]);
          ctx.lineDashOffset = -dash;
          ctx.lineWidth = 1.15;
          ctx.strokeStyle = p.arc;
          ctx.globalAlpha = 0.75;
          ctx.stroke();
          ctx.restore();

          // A packet travelling the route — the one thing on the globe that
          // reads as live rather than decorative.
          const head = arc.coordinates[Math.floor((clock % 1) * ARC_STEPS)];
          if (head && onFront(head)) {
            const xy = projection(head);
            if (xy) {
              // A two-ring dot rather than shadowBlur: same read, no blur pass.
              ctx.save();
              ctx.globalAlpha = 0.28;
              ctx.fillStyle = p.arc;
              ctx.beginPath();
              ctx.arc(xy[0], xy[1], 5, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1;
              ctx.beginPath();
              ctx.arc(xy[0], xy[1], 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }
        });

        const pulse = (Math.sin(clock * Math.PI * 2) + 1) / 2;

        ctx.font = LABEL_FONT;
        sitesRef.current.forEach((site) => {
          if (!onFront(site.coords)) return;
          const xy = projection(site.coords);
          if (!xy) return;
          const [x, y] = xy;

          ctx.strokeStyle = p.marker;
          ctx.fillStyle = p.marker;

          // Expanding ping.
          ctx.save();
          ctx.globalAlpha = 0.45 * (1 - pulse);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, 4 + pulse * 13, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // Static ring.
          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, 6.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // Core, with a soft halo drawn as a disc instead of shadowBlur.
          ctx.save();
          ctx.globalAlpha = 0.25;
          ctx.beginPath();
          ctx.arc(x, y, 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.arc(x, y, 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (!labelsRef.current) return;

          const flip = x > W * 0.6;
          ctx.textAlign = flip ? "right" : "left";
          const lx = flip ? x - 13 : x + 13;

          // Leader line from the pin out to the label.
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(flip ? x - 7 : x + 7, y);
          ctx.lineTo(flip ? x - 11 : x + 11, y);
          ctx.stroke();
          ctx.restore();

          if ("letterSpacing" in ctx) ctx.letterSpacing = "0.12em";
          ctx.fillStyle = p.label;
          ctx.fillText(site.name, lx, y - 2);
          ctx.fillStyle = p.labelDim;
          ctx.fillText(site.sub, lx, y + 11);
          if ("letterSpacing" in ctx) ctx.letterSpacing = "0em";
        });
      }

      /* ── ADAPTIVE FRAME BUDGET ──────────────────────────────────────────
         A globe that redraws world geometry costs what the machine costs. On
         a fast desktop a 30fps redraw is free; on a throttled or older
         machine the same redraw eats the whole frame and the entire page
         judders — which is exactly what "it lags near the bottom" was.

         So the interval is not fixed. Each draw is timed, and the cadence is
         chosen so drawing never occupies more than ~1/3 of the interval. It
         settles between 30fps and 8fps, and if even 8fps is too costly the
         globe stops animating and stays as a still image. Nothing about the
         page depends on it moving.                                        */
      const MIN_INTERVAL = 1000 / 30;
      const MAX_INTERVAL = 1000 / 8;
      let interval = MIN_INTERVAL;
      let avgDraw = 0;
      let lastFrame = 0;
      let frozen = false;

      function frame(now) {
        raf = requestAnimationFrame(frame);
        if (!visible || frozen) return;
        if (now - lastFrame < interval) return;
        lastFrame = now - ((now - lastFrame) % interval);

        const step = interval / (1000 / 60); // how many 60fps ticks we skipped
        if (!dragging && now > spinAt) rotation[0] += speedRef.current * step;
        dash = (dash + 0.3 * step) % 11;
        clock = (clock + 0.0045 * step) % 1000;

        const t0 = performance.now();
        draw();
        const cost = performance.now() - t0;

        // Rolling average, then pick an interval that keeps the draw under a
        // third of it.
        avgDraw = avgDraw ? avgDraw * 0.85 + cost * 0.15 : cost;
        const wanted = Math.min(MAX_INTERVAL, Math.max(MIN_INTERVAL, avgDraw * 3));
        interval += (wanted - interval) * 0.2;

        // Past the floor, movement is costing more than it is worth.
        if (avgDraw > MAX_INTERVAL / 2) {
          frozen = true;
          draw();
        }
      }

      // ── interaction ────────────────────────────────────────────────────
      const onDown = (event) => {
        dragging = true;
        last = [event.clientX, event.clientY];
        canvas.setPointerCapture?.(event.pointerId);
        canvas.style.cursor = "grabbing";
      };
      const onMove = (event) => {
        if (!dragging) return;
        rotation[0] += (event.clientX - last[0]) * 0.32;
        rotation[1] = Math.max(-68, Math.min(68, rotation[1] - (event.clientY - last[1]) * 0.26));
        last = [event.clientX, event.clientY];
        if (reduced) draw();
      };
      const onUp = () => {
        if (!dragging) return;
        dragging = false;
        spinAt = performance.now() + 2500;
        canvas.style.cursor = "grab";
      };

      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);
      canvas.addEventListener("og:repaint", draw);
      teardown.push(() => {
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
        canvas.removeEventListener("og:repaint", draw);
      });

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      teardown.push(() => resizeObserver.disconnect());

      const viewObserver = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting && !document.hidden;
        },
        { rootMargin: "120px" },
      );
      viewObserver.observe(canvas);
      teardown.push(() => viewObserver.disconnect());

      const onVisibility = () => {
        if (document.hidden) visible = false;
      };
      document.addEventListener("visibilitychange", onVisibility);
      teardown.push(() => document.removeEventListener("visibilitychange", onVisibility));

      resize();
      if (reduced) draw();
      else raf = requestAnimationFrame(frame);
    }

    // Defer every byte of the globe until it is actually approaching.
    const gate = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        gate.disconnect();
        boot();
      },
      { rootMargin: "400px" },
    );
    gate.observe(canvas);

    return () => {
      cancelled = true;
      gate.disconnect();
      cancelAnimationFrame(raf);
      teardown.forEach((fn) => fn());
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        cursor: "grab",
        touchAction: "none",
        background: "transparent",
        ...style,
      }}
      role="img"
      aria-label="Rotating globe marking the Opus Geeks offices in Pembroke Pines, Florida and Karachi, Pakistan"
    />
  );
}

/**
 * Drops points from every ring that sit closer than `tolerance` degrees to the
 * previous kept point. Natural Earth 110m carries far more detail than a
 * 400px globe can show, and every one of those points was being projected on
 * every frame. Run once at boot; rings keep at least 4 points so nothing
 * collapses.
 */
function simplify(geojson, tolerance, minSpan) {
  const t2 = tolerance * tolerance;

  // A ring whose bounding box is under minSpan degrees is smaller than a few
  // pixels on screen; projecting it every frame buys nothing.
  const bigEnough = (ring) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of ring) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    return Math.max(x1 - x0, y1 - y0) >= minSpan;
  };

  const thinRing = (ring) => {
    if (ring.length < 8) return ring;
    const out = [ring[0]];
    let [lx, ly] = ring[0];
    for (let i = 1; i < ring.length - 1; i += 1) {
      const [x, y] = ring[i];
      const dx = x - lx;
      const dy = y - ly;
      if (dx * dx + dy * dy >= t2) {
        out.push(ring[i]);
        lx = x;
        ly = y;
      }
    }
    out.push(ring[ring.length - 1]);
    return out.length >= 4 ? out : ring;
  };

  const thinPoly = (poly) => poly.filter(bigEnough).map(thinRing);

  for (const feature of geojson.features) {
    const g = feature.geometry;
    if (!g) continue;
    if (g.type === "Polygon") {
      g.coordinates = thinPoly(g.coordinates);
    } else if (g.type === "MultiPolygon") {
      g.coordinates = g.coordinates.map(thinPoly).filter((poly) => poly.length);
    }
  }
  geojson.features = geojson.features.filter((feature) => {
    const g = feature.geometry;
    if (!g) return false;
    return g.type === "MultiPolygon" ? g.coordinates.length > 0 : g.coordinates.length > 0;
  });
  return geojson;
}

/** Bundled copy first, pinned CDN as a fallback, graticule-only as a floor. */
async function loadTopology() {
  try {
    const mod = await import("world-atlas/countries-110m.json");
    return mod.default ?? mod;
  } catch {
    try {
      const res = await fetch(TOPO_CDN);
      return await res.json();
    } catch {
      return null;
    }
  }
}
