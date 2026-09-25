import { useEffect } from "react";

/* ==========================================================================
   LITE MODE — for machines that are drawing the site without a GPU
   ==========================================================================
   The console log from the machine that lags reads:

     GL_VENDOR = Disabled, GL_RENDERER = Disabled, Sandboxed = yes

   i.e. hardware acceleration is off (or the GPU is blocklisted). In that
   state every blur, every animated gradient and every canvas frame is drawn
   by the CPU, and the site's always-on decoration - two dozen infinite CSS
   animations, a reactive grid canvas, an animated filter blur - is enough
   to keep the main thread busy while the page is doing nothing at all.
   Measured with the GPU off and a 4x throttled CPU: ~2.5s of long tasks in
   every 3s of *idle*, and a scroll that ran at 8fps.

   Lite mode is switched on only when the browser tells us it is in that
   state (no WebGL at all), or has very little CPU, or the visitor asked for
   less data. It adds `lite` to <html>, and the stylesheet stops the
   decorative motion under it. Nothing is removed and no layout changes;
   machines with a working GPU never see a difference.
   ========================================================================== */

function detect() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "no-webgl";
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    // software rasterisers report themselves by name
    if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return "software-gl";
  } catch {
    return "no-webgl";
  }
  if (navigator.connection?.saveData) return "save-data";
  if ((navigator.hardwareConcurrency || 8) <= 2) return "low-cpu";
  return null;
}

export default function useLiteMode() {
  useEffect(() => {
    const reason = detect();
    if (!reason) return;
    document.documentElement.classList.add("lite");
    document.documentElement.dataset.lite = reason;
  }, []);
}

export const isLite = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("lite");
