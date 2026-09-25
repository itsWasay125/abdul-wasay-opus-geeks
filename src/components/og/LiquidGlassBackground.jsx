import { useEffect, useRef, useState } from "react";

/**
 * LiquidGlassBackground
 * =====================
 * WebGL "liquid glass" refractive effect matching Lightswind Pro:
 * - Fine, thin, sharp diagonal refractive rods (~45°, top-left toward bottom-right)
 * - cells default = 18 for clean medium-width balanced glass rods
 * - Tight specular spine (pow(rod, 20.0)) + crisp seam grooves (not blurry/washed out)
 * - Radial 2D cursor lens warp: smoothly deflects all diagonal rods around the pointer
 * - Luminous cursor highlight + multi-sample interactive blur
 * - Overall vertical gradient: dark at top, fading to light/white at bottom
 * - Glowing cyan/blue-green diagonal light beam through the middle
 * - speed prop (default 1): scales ambient speed (0 = frozen, 2 = fast)
 * - StrictMode-safe cleanup (no destructive loseContext())
 *
 * Public API:
 *   <LiquidGlassBackground preset="electric-blue" speed={1} cells={18} distortion={200} interactive interactiveBlur />
 */

const PRESETS = {
  "electric-blue": {
    /* Light-theme ramp. The preset shipped near-black mids and a full-chroma
       cyan core, which is right for a dark page; the site is white, so the
       glass reads as daylight through brand-tinted rods instead. */
    a: [0.58, 0.72, 0.90],
    b: [0.14, 0.42, 0.78],
    c: [0.26, 0.70, 0.92],
  },
};

const DEFAULT_PRESET = "electric-blue";

const MAX_DPR = 2;
const RENDER_SCALE = 0.85;

// ── SHARED GLSL (both WebGL1 and WebGL2 wrap this identically) ──────────────
const FRAG_CORE = `
uniform float uTime;
uniform float uSpeed;
uniform float uCells;
uniform float uDistortion;
uniform float uAspect;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uBlurEnabled;
uniform vec3 uPaletteA;
uniform vec3 uPaletteB;
uniform vec3 uPaletteC;

vec3 backdrop(vec2 uv, float t) {
  // Diagonal coordinate running ~45 deg from top-left toward bottom-right
  float dDiag = ((uv.x - 0.5) * uAspect + (uv.y - 0.5)) * 0.70710678;
  float wobble = sin(dDiag * 3.5 - t * 0.45) * 0.02;
  float dist = abs(dDiag + wobble);

  /* Overall vertical gradient. Light theme: a pale blue wash at the top
     (uv.y = 1.0) settling to white at the bottom (uv.y = 0.0). */
  float vertRamp = clamp(1.0 - uv.y, 0.0, 1.0);
  vec3 topTint = uPaletteA;
  vec3 bottomTint = vec3(1.0, 1.0, 1.0);
  vec3 base = mix(topTint, bottomTint, smoothstep(0.02, 0.96, vertRamp));

  // Brand-tinted light beam along the diagonal through the middle
  float core = exp(-dist * dist * 38.0);
  float halo = exp(-dist * 2.6);

  vec3 cyanHighlight = uPaletteC; // cyan/teal highlight core
  vec3 blueMids = uPaletteB;       // electric blue mids

  /* On a light ground the beam has to be a tint rather than an overlay, or
     it burns a saturated bar across the middle of the banner. */
  vec3 beam = mix(blueMids, cyanHighlight, core);
  vec3 col = mix(base, beam, clamp(halo * 0.44 + core * 0.2, 0.0, 1.0));
  col = mix(col, cyanHighlight, core * 0.16);

  col = mix(topTint, col, smoothstep(1.08, 0.46, uv.y));
  col = mix(col, bottomTint, smoothstep(0.26, -0.06, uv.y) * 0.5);

  return col;
}

vec3 computeColor(vec2 uv) {
  float t = uTime * uSpeed;
  float cells = max(uCells, 1.0);

  // 1. Mouse distance in aspect-corrected coordinates
  vec2 delta = uv - uMouse;
  vec2 deltaAspect = vec2(delta.x * uAspect, delta.y);
  float distSq = dot(deltaAspect, deltaAspect);

  // Gaussian lens falloff
  float mouseFalloff = exp(-distSq * 28.0) * uMouseStrength;

  // 2. 2D Lens Distortion:
  // Radially deflects space around the pointer so diagonal rods curve in a crisp circular lens
  float warpStrength = uDistortion * 0.45;
  vec2 lensOffset = delta * (mouseFalloff * warpStrength);
  vec2 warpedUv = uv - lensOffset;

  // 3. Fine diagonal rod coordinate in ~45° rotated space
  float stripCoord = ((warpedUv.x - 0.5) * uAspect + (warpedUv.y - 0.5)) * 0.70710678;
  float cellX = stripCoord * cells;
  float cellIdx = floor(cellX);
  float local = fract(cellX) * 2.0 - 1.0; // -1..1 across one thin rod

  // 4. Half-circle cylinder profile: 1 at rod ridge, 0 at rod seams
  float rod = sqrt(clamp(1.0 - local * local, 0.0, 1.0));
  float edge = 1.0 - rod;

  // 5. Subtle ambient breathing sway between neighbouring rods
  float sway = sin(t * 0.35 + cellIdx * 2.1) * 0.32
             + sin(t * 0.17 + cellIdx * 0.7) * 0.16;

  // 6. Backdrop refraction through the glass rods
  vec2 diagNormal = vec2(0.70710678, 0.70710678);
  float rodRefract = (sway * 0.015 + local * 0.012) / sqrt(cells / 8.0);
  vec2 bentUv = warpedUv + diagNormal * rodRefract;

  // 7. Prismatic chromatic dispersion concentrated tightly at rod seams (edge^2)
  float disp = edge * edge * (0.0012 + uDistortion * 0.003);
  vec3 col;
  col.r = backdrop(bentUv + diagNormal * disp, t).r;
  col.g = backdrop(bentUv, t).g;
  col.b = backdrop(bentUv - diagNormal * disp, t).b;

  // 8. Interactive Blur: multi-sample box blur under the cursor lens
  if (uBlurEnabled > 0.5 && mouseFalloff > 0.01) {
    float blurAmt = mouseFalloff * 0.012;
    vec3 soft = col;
    soft += backdrop(bentUv + vec2(blurAmt, blurAmt), t);
    soft += backdrop(bentUv - vec2(blurAmt, blurAmt), t);
    soft += backdrop(bentUv + vec2(-blurAmt, blurAmt), t);
    soft += backdrop(bentUv + vec2(blurAmt, -blurAmt), t);
    col = mix(col, soft / 5.0, clamp(mouseFalloff * 2.2, 0.0, 1.0));
  }

  /* 9. Sharp specular spine down each thin rod. On a light ground an additive
        glint clips to flat white, so it is mixed toward white instead. */
  float specular = pow(rod, 20.0) * (0.42 + mouseFalloff * 0.5);
  col = mix(col, vec3(1.0), clamp(specular * 0.5, 0.0, 1.0));

  // 10. Crisp seam groove shadow (defines clean light-to-dark separation between thin rods)
  float seamShadow = smoothstep(0.70, 1.0, edge) * 0.2;
  col *= (1.0 - seamShadow);

  // 11. Cursor highlight — a tint on light, not a bloom
  col = mix(col, uPaletteC, clamp(mouseFalloff * 0.22, 0.0, 1.0));

  return col;
}
`;

const VERT_WEBGL2 = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 pos = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = pos * 0.5;
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}
`;

const FRAG_WEBGL2 = `#version 300 es
precision highp float;
${FRAG_CORE}
in vec2 vUv;
out vec4 fragColor;
void main() {
  fragColor = vec4(computeColor(vUv), 1.0);
}
`;

const VERT_WEBGL1 = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = (aPosition + 1.0) / 4.0;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAG_WEBGL1 = `
precision highp float;
${FRAG_CORE}
varying vec2 vUv;
void main() {
  gl_FragColor = vec4(computeColor(vUv), 1.0);
}
`;

const COVER_TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("LiquidGlassBackground shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertSrc, fragSrc) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("LiquidGlassBackground link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export default function LiquidGlassBackground({
  preset = DEFAULT_PRESET,
  speed = 1,
  cells = 18,
  distortion = 200,
  interactive = true,
  interactiveBlur = true,
  className = "",
  style,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const contextAttrs = {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    };

    let gl = canvas.getContext("webgl2", contextAttrs);
    let isWebGL2 = Boolean(gl);
    if (!gl) {
      gl = canvas.getContext("webgl", contextAttrs) || canvas.getContext("experimental-webgl", contextAttrs);
      isWebGL2 = false;
    }

    if (!gl) {
      setWebglOk(false);
      return undefined;
    }

    if (gl.isContextLost()) {
      console.warn("LiquidGlassBackground: WebGL context was already lost on mount; falling back to CSS.");
      setWebglOk(false);
      return undefined;
    }

    const program = createProgram(
      gl,
      isWebGL2 ? VERT_WEBGL2 : VERT_WEBGL1,
      isWebGL2 ? FRAG_WEBGL2 : FRAG_WEBGL1,
    );
    if (!program) {
      setWebglOk(false);
      return undefined;
    }
    gl.useProgram(program);

    let vao = null;
    let posBuffer = null;
    if (isWebGL2) {
      const gl2 = gl;
      vao = gl2.createVertexArray();
      gl2.bindVertexArray(vao);
    } else {
      posBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, COVER_TRIANGLE, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, "aPosition");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }

    const uniforms = {
      time: gl.getUniformLocation(program, "uTime"),
      speed: gl.getUniformLocation(program, "uSpeed"),
      cells: gl.getUniformLocation(program, "uCells"),
      distortion: gl.getUniformLocation(program, "uDistortion"),
      aspect: gl.getUniformLocation(program, "uAspect"),
      mouse: gl.getUniformLocation(program, "uMouse"),
      mouseStrength: gl.getUniformLocation(program, "uMouseStrength"),
      blurEnabled: gl.getUniformLocation(program, "uBlurEnabled"),
      paletteA: gl.getUniformLocation(program, "uPaletteA"),
      paletteB: gl.getUniformLocation(program, "uPaletteB"),
      paletteC: gl.getUniformLocation(program, "uPaletteC"),
    };

    let bufferW = 0;
    let bufferH = 0;
    /* Adaptive resolution. The shader is a full-screen refraction with blur,
       so its cost is almost entirely per pixel: at 1.7x device resolution a
       1440x900 hero is ~3.7M pixels a frame. On an Intel UHD 620 that ran the
       contact page at 7-21fps with the pointer still. It starts at full
       quality and, if frames are running long, steps the buffer down - the
       glass is soft by design, so a lower buffer upscaled by the canvas is
       close to indistinguishable, and a strong GPU never leaves step one. */
    /* It waits 3s before measuring - the first seconds after load are decode,
       font and chunk work, not the shader - and only steps down after two
       slow windows in a row, to a floor of half resolution. */
    const quality = { scale: 1, steps: [1, 0.72, 0.5], step: 0, samples: [], last: 0, slow: 0, from: performance.now() + 3000 };
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR) * RENDER_SCALE * quality.scale;
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (w !== bufferW || h !== bufferH) {
        bufferW = w;
        bufferH = h;
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const palette = PRESETS[preset] || PRESETS[DEFAULT_PRESET];
    const normDistortion = Math.min(400, Math.max(0, distortion)) / 400;
    const cellsClamped = Math.max(2, cells);

    const mouse = { x: 0.5, y: 0.5, strength: 0, target: 0 };

    const draw = (t) => {
      gl.uniform1f(uniforms.time, t);
      gl.uniform1f(uniforms.speed, speed);
      gl.uniform1f(uniforms.cells, cellsClamped);
      gl.uniform1f(uniforms.distortion, normDistortion);
      gl.uniform1f(uniforms.aspect, bufferW / Math.max(bufferH, 1));
      gl.uniform2f(uniforms.mouse, mouse.x, mouse.y);
      gl.uniform1f(uniforms.mouseStrength, interactive ? mouse.strength : 0);
      gl.uniform1f(uniforms.blurEnabled, interactive && interactiveBlur ? 1 : 0);
      gl.uniform3f(uniforms.paletteA, palette.a[0], palette.a[1], palette.a[2]);
      gl.uniform3f(uniforms.paletteB, palette.b[0], palette.b[1], palette.b[2]);
      gl.uniform3f(uniforms.paletteC, palette.c[0], palette.c[1], palette.c[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    if (reduceMotion) {
      draw(0);
      return () => {
        ro.disconnect();
        gl.deleteProgram(program);
        if (vao) gl.deleteVertexArray(vao);
        if (posBuffer) gl.deleteBuffer(posBuffer);
      };
    }

    const inViewRef = { current: false };
    const rafRef = { current: 0 };
    const start0 = performance.now();

    const startLoop = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(frame);
    };

    function frame(now) {
      rafRef.current = requestAnimationFrame(frame);
      if (!inViewRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
        quality.last = 0;
        return;
      }
      mouse.strength += (mouse.target - mouse.strength) * 0.08;

      if (quality.last && now > quality.from) {
        quality.samples.push(now - quality.last);
        if (quality.samples.length >= 60) {
          const sorted = quality.samples.sort((x, y) => x - y);
          const median = sorted[sorted.length >> 1];
          quality.samples = [];
          // two windows in a row under ~45fps: drop a step, while there is one
          quality.slow = median > 22 ? quality.slow + 1 : 0;
          if (quality.slow >= 2 && quality.step < quality.steps.length - 1) {
            quality.slow = 0;
            quality.step += 1;
            quality.scale = quality.steps[quality.step];
            resize();
          }
        }
      }
      quality.last = now;


      draw((now - start0) / 1000);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = Boolean(entry?.isIntersecting);
        if (inViewRef.current) startLoop();
      },
      { rootMargin: "150px" },
    );
    io.observe(wrap);

    // Global window-level cursor tracking converted to local UV via getBoundingClientRect()
    const onPointerMove = (event) => {
      const wrapEl = wrapRef.current;
      if (!wrapEl) return;
      const rect = wrapEl.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      mouse.target = inside ? 1 : 0;
      if (inside) {
        mouse.x = x;
        mouse.y = 1 - y; // UV space is bottom-up
      }
    };
    const onPointerEnd = () => {
      mouse.target = 0;
    };

    if (interactive) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerup", onPointerEnd, { passive: true });
      window.addEventListener("pointercancel", onPointerEnd, { passive: true });
      window.addEventListener("pointerleave", onPointerEnd, { passive: true });
      document.addEventListener("mouseleave", onPointerEnd, { passive: true });
    }

    startLoop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      if (interactive) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerEnd);
        window.removeEventListener("pointercancel", onPointerEnd);
        window.removeEventListener("pointerleave", onPointerEnd);
        document.removeEventListener("mouseleave", onPointerEnd);
      }
      gl.deleteProgram(program);
      if (vao) gl.deleteVertexArray(vao);
      if (posBuffer) gl.deleteBuffer(posBuffer);
    };
  }, [preset, speed, cells, distortion, interactive, interactiveBlur]);

  return (
    <div
      ref={wrapRef}
      className={`og-liquid-glass ${className}${webglOk ? "" : " og-liquid-glass--fallback"}`.trim()}
      style={style}
    >
      {webglOk && <canvas ref={canvasRef} className="og-liquid-glass__canvas" aria-hidden="true" />}
      <div className="og-liquid-glass__css-fallback" aria-hidden="true">
        <span
          className="og-liquid-glass__blob og-liquid-glass__blob--a"
          style={{ background: `radial-gradient(circle, ${toRgba(PRESETS[preset]?.a || PRESETS[DEFAULT_PRESET].a)} 0%, transparent 72%)` }}
        />
        <span
          className="og-liquid-glass__blob og-liquid-glass__blob--b"
          style={{ background: `radial-gradient(circle, ${toRgba(PRESETS[preset]?.b || PRESETS[DEFAULT_PRESET].b)} 0%, transparent 72%)` }}
        />
        <span
          className="og-liquid-glass__blob og-liquid-glass__blob--c"
          style={{ background: `radial-gradient(circle, ${toRgba(PRESETS[preset]?.c || PRESETS[DEFAULT_PRESET].c)} 0%, transparent 72%)` }}
        />
      </div>
    </div>
  );
}

function toRgba(stop) {
  const [r, g, b] = stop;
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, 0.55)`;
}
