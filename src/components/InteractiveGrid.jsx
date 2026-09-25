import { useEffect, useRef } from "react";

/* Interactive grid background.
   Cells light up under the cursor and leave a short trail; when the mouse has
   been still for a moment a few cells drift on their own so the page never
   feels dead.

   Ported from the shadcn/Tailwind original to this project's stack, with four
   changes it needed here:
   - the canvas is sized to the device pixel ratio and re-sized on resize
     (the original was fixed at load and blurry on retina screens)
   - it renders as a fixed layer behind the page instead of wrapping children
   - dark-mode class detection dropped: this site is light, colours come in as props
   - prefers-reduced-motion draws a single static frame and never loops */

export default function InteractiveGrid({
  gridSize = 56,
  gridColor = "rgba(14, 30, 72, 0.07)",
  effectColor = "rgba(37, 99, 235, 0.30)",
  trailLength = 4,
  idleSpeed = 0.06,
  idleRandomCount = 4,
  glow = true,
  glowRadius = 26,
  showFade = true,
  fadeIntensity = 28,
  fadeColor = "#f7faff",
  className = "",
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const trailRef = useRef([]);
  const idleTargetsRef = useRef([]);
  const idlePositionsRef = useRef([]);
  const lastMouseTimeRef = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let frameId = 0;
    let visible = true;
    let dirty = true;
    let lastFrame = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      cols = Math.max(1, Math.floor(width / gridSize));
      rows = Math.max(1, Math.floor(height / gridSize));

      idleTargetsRef.current = Array.from({ length: idleRandomCount }, () => ({
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
      }));
      idlePositionsRef.current = idleTargetsRef.current.map((point) => ({ ...point }));
      dirty = true; // the canvas was just cleared by the size change
    };

    /* cells fade out along the trail, so each one needs its own alpha */
    const paint = () => {
      ctx.clearRect(0, 0, width, height);

      trailRef.current.forEach((cell, index) => {
        const alpha = Math.max(0, 1 - index * (1 / (trailLength + 1)));
        const color = effectColor.replace(/[\d.]+\)$/, `${alpha.toFixed(3)})`);
        ctx.fillStyle = color;
        if (glow) {
          ctx.shadowColor = color;
          ctx.shadowBlur = glowRadius;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize, gridSize);
      });

      ctx.shadowBlur = 0;
    };

    const pushCell = (x, y, cap) => {
      const head = trailRef.current[0];
      if (head && head.x === x && head.y === y) return;
      trailRef.current.unshift({ x, y });
      if (trailRef.current.length > cap) trailRef.current.pop();
      dirty = true;
    };

    const draw = (now) => {
      /* the trail holds still between changes, so repainting every frame just
         burns GPU on the glow blur — repaint only when a cell actually moved,
         and cap the idle drift at ~30fps */
      const due = now - lastFrame >= 33;

      /* after a pause, a few cells wander on their own */
      if (due && Date.now() - lastMouseTimeRef.current > 1800) {
        idlePositionsRef.current.forEach((position, index) => {
          const target = idleTargetsRef.current[index];
          if (!target) return;
          const dx = target.x - position.x;
          const dy = target.y - position.y;

          if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
            idleTargetsRef.current[index] = {
              x: Math.floor(Math.random() * cols),
              y: Math.floor(Math.random() * rows),
            };
            return;
          }

          position.x += dx * idleSpeed;
          position.y += dy * idleSpeed;
          pushCell(Math.round(position.x), Math.round(position.y), trailLength * idleRandomCount);
        });
      }

      if (dirty && due) {
        paint();
        dirty = false;
        lastFrame = now;
      }
      /* The loop used to re-arm on every frame while on screen, idle or not.
         After the pointer has been still for 6s the idle wander stops too,
         and the loop parks; the next pointer move wakes it. */
      const quiet = Date.now() - lastMouseTimeRef.current > 6000;
      if (visible && !(quiet && !dirty)) frameId = window.requestAnimationFrame(draw);
      else frameId = 0;
    };

    const onMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

      lastMouseTimeRef.current = Date.now();
      pushCell(Math.floor(x / gridSize), Math.floor(y / gridSize), trailLength);
      // the loop parks when quiet; a pointer move wakes it
      if (!frameId && visible) frameId = window.requestAnimationFrame(draw);
    };

    const onResize = () => {
      resize();
      if (reduced) paint();
    };

    resize();

    if (reduced) {
      /* one static frame: a few lit cells, no loop, no pointer tracking */
      idlePositionsRef.current.forEach((position) => pushCell(Math.round(position.x), Math.round(position.y), 8));
      paint();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", onResize);

    let observer = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          const wasVisible = visible;
          visible = Boolean(entry && entry.isIntersecting);
          if (visible && !wasVisible) {
            window.cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(draw);
          }
        },
        { rootMargin: "150px" }
      );
      observer.observe(container);
    }

    /* no GPU: the canvas is hidden by lite mode, so never start the loop */
    if (document.documentElement.classList.contains("lite")) return () => {};
    frameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
    };
  }, [gridSize, effectColor, trailLength, idleSpeed, idleRandomCount, glow, glowRadius]);

  return (
    <div className={`grid-bg ${className}`.trim()} ref={containerRef} aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="grid-bg__canvas"
        style={{
          backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />
      {showFade ? (
        <span
          className="grid-bg__fade"
          style={{
            background: fadeColor,
            WebkitMaskImage: `radial-gradient(ellipse at center, transparent ${fadeIntensity}%, black)`,
            maskImage: `radial-gradient(ellipse at center, transparent ${fadeIntensity}%, black)`,
          }}
        />
      ) : null}
    </div>
  );
}
