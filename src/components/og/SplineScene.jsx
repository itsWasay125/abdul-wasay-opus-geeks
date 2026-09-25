import { useEffect, useRef, useState } from "react";

/**
 * A Spline scene, loaded only once it is worth loading — and drawn with the
 * classic WebGL pipeline, never the newer three.js r185 WebGPU one.
 *
 * Two lazy gates, same as before:
 *  · The scene is not fetched until the container comes within roughly two
 *    screens of the viewport — @splinetool/runtime plus the remote
 *    .splinecode file are a few megabytes, not worth paying for above the
 *    fold on every route this banner appears on.
 *  · Under prefers-reduced-motion the live scene never loads at all; the
 *    static fallback renders instead.
 *
 * The one structural change: this talks to @splinetool/runtime's
 * `Application` class directly instead of going through the `<Spline>`
 * wrapper component. The wrapper only forwards `renderOnDemand` and
 * `wasmPath` to Application's constructor — it never exposes `renderer`,
 * so left to its own default the runtime probes WebGPU first (loading a
 * *second*, separate pipeline chunk to do it) and only falls back to WebGL
 * once that construction throws. Every visitor paid for that probe and its
 * extra chunk regardless of whether WebGPU ever had a chance — this was
 * exactly the sequence a GPU-disabled browser's console showed: "Failed to
 * load the WebGPU material backend, using WebGL", then the WebGL attempt
 * after it. `renderer: "webgl"` is a documented Application constructor
 * option that skips the probe and the extra chunk outright, so the scene
 * reaches its first frame sooner for every visitor, not only the ones
 * where WebGPU was always going to fail.
 */

let webglAnswer;
function canUseWebGL() {
  if (webglAnswer !== undefined) return webglAnswer;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    webglAnswer = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglAnswer = false;
  }
  return webglAnswer;
}

export function SplineScene({ scene, className = "", onLoaded }) {
  const holderRef = useRef(null);
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [armed, setArmed] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (!canUseWebGL()) setHasError(true);
  }, []);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder || armed || reduced || hasError) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setArmed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setArmed(true);
          observer.disconnect();
        }
      },
      { rootMargin: "2200px" },
    );
    observer.observe(holder);
    return () => observer.disconnect();
  }, [armed, reduced, hasError]);

  /* @splinetool/runtime is still a *dynamic* import — kept deliberately, so
     Vite still code-splits it into its own chunk, only fetched once armed,
     exactly as the old React.lazy(() => import("@splinetool/react-spline"))
     did. The only change is which package that import names, and passing
     the renderer option its constructor never got before. */
  useEffect(() => {
    if (!armed || reduced || hasError) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let cancelled = false;
    let app = null;

    import("@splinetool/runtime")
      .then(({ Application }) => {
        if (cancelled) return undefined;
        app = new Application(canvas, { renderer: "webgl" });
        appRef.current = app;
        return app.load(scene);
      })
      .then(() => {
        if (cancelled) return;
        setLoaded(true);
        onLoaded?.(app);
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      });

    return () => {
      cancelled = true;
      app?.dispose();
      appRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, reduced, hasError, scene]);

  /* Loaded doesn't mean visible — the banner lives on every route, so this
     keeps the scene stopped whenever it scrolls off screen. */
  useEffect(() => {
    const holder = holderRef.current;
    if (!holder || !armed || reduced) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const app = appRef.current;
        if (!app) return;
        if (entry.isIntersecting) app.play();
        else app.stop();
      },
      { threshold: 0 },
    );
    observer.observe(holder);
    return () => observer.disconnect();
  }, [armed, reduced]);

  const fallback = (
    <div className="og-spline-fallback">
      <div className="og-spline-fallback__content">
        <div className="og-spline-fallback__core" />
        <span className="og-spline-fallback__text">Spatial 3D canvas</span>
      </div>
    </div>
  );

  return (
    <div className={`og-spline-holder ${className}`.trim()} ref={holderRef}>
      {hasError || reduced ? (
        fallback
      ) : armed ? (
        <>
          <canvas
            ref={canvasRef}
            className="og-spline-canvas"
            style={{ display: loaded ? "block" : "none" }}
          />
          {loaded ? null : (
            <div className="og-spline-loader-wrap og-spline-loader-wrap--over" aria-hidden="true">
              <div className="og-spline-loader">
                <div className="og-spline-loader__spinner" />
                <span className="og-spline-loader__text">Loading 3D engine…</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="og-spline-loader-wrap" aria-hidden="true" />
      )}
    </div>
  );
}

export default SplineScene;
