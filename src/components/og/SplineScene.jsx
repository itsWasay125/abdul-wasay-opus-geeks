import { Component, Suspense, lazy, useEffect, useRef, useState } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

/**
 * A Spline scene, loaded only once it is worth loading.
 *
 * Ported from the other project's ui/SplineScene.jsx with two additions that
 * this build needs, because the banner it sits in now renders on **every**
 * page rather than only the homepage:
 *
 *  · The scene is not mounted until the container comes within a screen of
 *    the viewport. @splinetool/runtime plus the remote .splinecode is a few
 *    megabytes; paying that on every route, above the fold, for a section
 *    that lives near the bottom of the page would be indefensible. The
 *    chunk is only requested when someone actually scrolls to it.
 *  · Under prefers-reduced-motion the live scene never loads at all and the
 *    static fallback is shown instead — the scene is continuous motion that
 *    cannot be paused from outside it.
 */
/* Can this browser draw WebGL at all? With hardware acceleration off, or
   the GPU blocklisted, Chrome reports GL_VENDOR = Disabled and Spline's
   renderer throws while constructing - an uncaught error, and four
   megabytes of runtime downloaded and parsed for nothing. Asking first
   means those browsers get the fallback and never fetch the runtime. */
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

/* Anything Spline throws while rendering lands here instead of taking the
   CTA banner - and the console - down with it. */
class SplineBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail?.();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function SplineScene({ scene, className = "", onLoaded }) {
  const holderRef = useRef(null);
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
      /* four megabytes of runtime and a remote scene file: 800px of warning
         was not enough lead time, so the observer fires two screens out */
      { rootMargin: "2200px" },
    );
    observer.observe(holder);
    return () => observer.disconnect();
  }, [armed, reduced, hasError]);

  /* The CTA banner is part of the site layout, so this scene exists on every
     route. Loading it lazily was only half the job: once loaded it kept
     drawing WebGL frames forever, including while the visitor was ten screens
     away reading something else. It now renders only while it is on screen.

     Guarded by typeof checks because play/stop are runtime methods on the
     Spline Application, and a version that does not expose them should cost
     nothing rather than throw. */
  useEffect(() => {
    const holder = holderRef.current;
    if (!holder || !armed || reduced) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const app = appRef.current;
        if (!app) return;
        if (entry.isIntersecting) {
          if (typeof app.play === "function") app.play();
        } else if (typeof app.stop === "function") {
          app.stop();
        }
      },
      { threshold: 0 }
    );

    observer.observe(holder);
    return () => observer.disconnect();
  }, [armed, reduced]);

  const handleLoad = (app) => {
    appRef.current = app;
    setLoaded(true);
    onLoaded?.(app);
  };

  /* There was an idle prefetch here that pulled the Spline chunk during
     requestIdleCallback. It made the scene appear sooner and cost more than
     it was worth: four megabytes of JavaScript still has to be parsed on the
     main thread, and doing that early dragged first paint from 5.7s to 12s
     on a 4x throttled CPU and took a third off the scroll rate.

     The lead time now comes from the observer's 2200px margin alone, which
     costs nothing until someone is actually heading this way. */
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
        <Suspense
          fallback={
            <div className="og-spline-loader-wrap">
              <div className="og-spline-loader">
                <div className="og-spline-loader__spinner" />
                <span className="og-spline-loader__text">Loading 3D engine…</span>
              </div>
            </div>
          }
        >
          <SplineBoundary fallback={fallback} onFail={() => setHasError(true)}>
            <Spline
              scene={scene}
              className="og-spline-canvas"
              onError={() => setHasError(true)}
              onLoad={handleLoad}
            />
            {/* Suspense lifts the moment the chunk arrives, but the scene
                file itself is still coming - without this the section shows
                an empty box for the gap between the two. */}
            {loaded ? null : (
              <div className="og-spline-loader-wrap og-spline-loader-wrap--over" aria-hidden="true">
                <div className="og-spline-loader">
                  <div className="og-spline-loader__spinner" />
                  <span className="og-spline-loader__text">Loading 3D engine…</span>
                </div>
              </div>
            )}
          </SplineBoundary>
        </Suspense>
      ) : (
        <div className="og-spline-loader-wrap" aria-hidden="true" />
      )}
    </div>
  );
}

export default SplineScene;
