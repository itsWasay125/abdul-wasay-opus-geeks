import * as THREE from "three";

function isLikelyLowPowerDevice() {
  const isMac = /Macintosh|Mac OS X/.test(navigator.userAgent);
  const limitedCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 6;
  const limitedMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
  return isMac || limitedCores || limitedMemory || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function createRenderer(canvas) {
  const lowPower = isLikelyLowPowerDevice();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !lowPower,
    powerPreference: lowPower ? "default" : "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.35));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}

function fitRenderer(renderer, camera, canvas) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width || window.innerWidth));
  const height = Math.max(1, Math.floor(rect.height || window.innerHeight));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function createSceneLoop(canvas, draw, preferredFps = 45, pauseOffscreen = true) {
  const targetFps = isLikelyLowPowerDevice() ? 30 : preferredFps;
  const frameInterval = 1000 / targetFps;
  let active = true;
  let frameId = 0;
  let lastFrame = performance.now();

  const observer = pauseOffscreen
    ? new IntersectionObserver(
        ([entry]) => {
          active = entry.isIntersecting;
        },
        { rootMargin: "160px" },
      )
    : null;
  observer?.observe(canvas);

  const tick = (time) => {
    frameId = requestAnimationFrame(tick);
    if (!active || document.hidden || time - lastFrame < frameInterval) return;
    const delta = Math.min(2, (time - lastFrame) / 16.67);
    lastFrame = time;
    draw(delta);
  };

  draw(0);
  frameId = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frameId);
    observer?.disconnect();
  };
}

export function initNoiseCloudScene(canvas) {
  if (!canvas) return () => {};

  const lowPower = isLikelyLowPowerDevice();
  const renderScale = lowPower ? 0.4 : 0.55;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: lowPower ? "default" : "high-performance",
  });

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uCenter: { value: new THREE.Vector2(0.62, 0.52) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float uTime;
      uniform float uAspect;
      uniform vec2 uCenter;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.55;
        mat2 rot = mat2(1.6, 1.2, -1.2, 1.6);
        for (int i = 0; i < 5; i++) {
          value += amplitude * noise(p);
          p = rot * p;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = vUv - uCenter;
        uv.x *= uAspect;

        // stretch the cloud field horizontally like a nebula
        vec2 p = vec2(uv.x * 1.05, uv.y * 2.35);
        float d = length(p);
        float t = uTime * 0.16;

        // slow churn so the cloud visibly breathes and swirls
        float swirl = 0.22 * sin(uTime * 0.12 + d * 3.0);
        p = mat2(cos(swirl), -sin(swirl), sin(swirl), cos(swirl)) * p;

        float n1 = fbm(p * 2.4 + vec2(t, -t * 0.55));
        float n2 = fbm(p * 4.6 - vec2(t * 0.8, t * 0.45) + n1 * 1.7);
        float wisps = fbm(p * 7.5 + vec2(-t * 0.55, t * 0.35) + n2 * 1.2);

        float falloff = smoothstep(1.1, 0.0, d);
        float cloud = falloff * (n1 * 0.72 + n2 * 0.62 + wisps * 0.34 - 0.42);
        cloud = pow(max(cloud, 0.0), 1.7);

        float core = exp(-d * d * 30.0) * 2.3 + exp(-d * d * 6.0) * 0.5;
        float rays = exp(-abs(uv.y) * 14.0) * smoothstep(0.95, 0.0, abs(uv.x)) * 0.34 * (0.6 + n1 * 0.6);

        // Opus Geeks theme: deep blue base, cyan wisps, purple accents
        vec3 deepBlue = vec3(0.07, 0.20, 0.62);
        vec3 cyan = vec3(0.04, 0.72, 0.88);
        vec3 skyBlue = vec3(0.22, 0.52, 0.98);
        vec3 purple = vec3(0.49, 0.23, 0.93);

        vec3 col = deepBlue * cloud * 1.9;
        col += skyBlue * pow(cloud, 2.0) * 1.6;
        col += cyan * cloud * smoothstep(0.55, 0.0, abs(uv.y)) * 0.85;
        col += purple * cloud * smoothstep(0.7, 0.0, d) * 0.95;
        col += vec3(0.82, 0.92, 1.0) * (core * (0.8 + n2 * 0.5) + rays);

        // fine grain so the cloud reads as noise, not gradients
        float grain = hash(vUv * vec2(1700.0, 950.0) + fract(uTime) * 17.0);
        col += (grain - 0.5) * 0.028;

        col = col / (1.0 + col * 0.85);
        col += vec3(0.012, 0.008, 0.03);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  scene.add(quad);

  const fit = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor((rect.width || window.innerWidth) * renderScale));
    const height = Math.max(1, Math.floor((rect.height || window.innerHeight) * renderScale));
    renderer.setSize(width, height, false);
    uniforms.uAspect.value = width / height;
  };
  fit();
  const onResize = () => fit();
  window.addEventListener("resize", onResize);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    uniforms.uTime.value = 40;
    renderer.render(scene, camera);
    return () => {
      window.removeEventListener("resize", onResize);
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }

  const stopLoop = createSceneLoop(canvas, (delta) => {
    uniforms.uTime.value += delta / 60; // delta is normalized to 60fps frames -> seconds
    renderer.render(scene, camera);
  }, 30, true);

  return () => {
    stopLoop();
    window.removeEventListener("resize", onResize);
    quad.geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}

export function initHeroScene(canvas) {
  if (!canvas) return () => {};

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 120);
  camera.position.set(0, 0, 9);

  const renderer = createRenderer(canvas);
  fitRenderer(renderer, camera, canvas);

  const group = new THREE.Group();
  scene.add(group);

  const particleCount = window.innerWidth < 720 ? 720 : 1300;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  const colorA = new THREE.Color(0x7c3aed);
  const colorB = new THREE.Color(0x06b6d4);

  for (let index = 0; index < particleCount; index += 1) {
    const radius = 8 + Math.random() * 26;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    particlePositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    particlePositions[index * 3 + 2] = radius * Math.cos(phi) - 10;

    const mixed = colorA.clone().lerp(colorB, Math.random() * 0.72);
    particleColors[index * 3] = mixed.r;
    particleColors[index * 3 + 1] = mixed.g;
    particleColors[index * 3 + 2] = mixed.b;
  }

  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  particlesGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

  const particles = new THREE.Points(
    particlesGeometry,
    new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  group.add(particles);

  const mouse = { x: 0, y: 0 };
  const onPointer = (event) => {
    mouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (event.clientY / window.innerHeight - 0.5) * 2;
  };
  const onResize = () => fitRenderer(renderer, camera, canvas);
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("resize", onResize);

  const stopLoop = createSceneLoop(canvas, (delta) => {
    particles.rotation.y += 0.0007 * delta;
    particles.rotation.x += 0.0002 * delta;
    group.rotation.y += (mouse.x * 0.14 - group.rotation.y) * 0.035;
    group.rotation.x += (-mouse.y * 0.08 - group.rotation.x) * 0.035;
    camera.position.x += (mouse.x * 0.75 - camera.position.x) * 0.035;
    camera.position.y += (-mouse.y * 0.42 - camera.position.y) * 0.035;
    camera.lookAt(0, 0, -7);

    renderer.render(scene, camera);
  });

  return () => {
    stopLoop();
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("resize", onResize);
    particlesGeometry.dispose();
    particles.material.dispose();
    renderer.dispose();
  };
}

export function initOrbScene(canvas) {
  if (!canvas) return () => {};

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80);
  camera.position.set(0, 0, 7);

  const renderer = createRenderer(canvas);
  fitRenderer(renderer, camera, canvas);

  const group = new THREE.Group();
  scene.add(group);

  const sphereGeometry = new THREE.SphereGeometry(1.8, isLikelyLowPowerDevice() ? 36 : 52, isLikelyLowPowerDevice() ? 36 : 52);
  const wire = new THREE.Mesh(
    sphereGeometry,
    new THREE.MeshBasicMaterial({
      color: 0x9f7aea,
      wireframe: true,
      transparent: true,
      opacity: 0.48,
    }),
  );

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(2.04, isLikelyLowPowerDevice() ? 36 : 52, isLikelyLowPowerDevice() ? 36 : 52),
    new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x7c3aed) },
        intensity: { value: 1.0 },
      },
      vertexShader:
        "varying vec3 vNormal; void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader:
        "uniform vec3 glowColor; uniform float intensity; varying vec3 vNormal; void main(){ float strength = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0); gl_FragColor = vec4(glowColor, strength * intensity); }",
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  );

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.45, 0.012, 12, 160),
    new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.58,
    }),
  );
  ring.rotation.x = Math.PI / 2.45;

  group.add(glow, wire, ring);

  const starGeometry = new THREE.BufferGeometry();
  const starCount = 220;
  const starPositions = new Float32Array(starCount * 3);
  for (let index = 0; index < starCount; index += 1) {
    starPositions[index * 3] = (Math.random() - 0.5) * 10;
    starPositions[index * 3 + 1] = (Math.random() - 0.5) * 7;
    starPositions[index * 3 + 2] = -2 - Math.random() * 10;
  }
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.035,
      transparent: true,
      opacity: 0.54,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(stars);

  const onResize = () => fitRenderer(renderer, camera, canvas);
  window.addEventListener("resize", onResize);

  const stopLoop = createSceneLoop(canvas, (delta) => {
    group.rotation.y += 0.006 * delta;
    group.rotation.x += 0.0025 * delta;
    ring.rotation.z -= 0.004 * delta;
    stars.rotation.y += 0.001 * delta;
    renderer.render(scene, camera);
  });

  return () => {
    stopLoop();
    window.removeEventListener("resize", onResize);
    sphereGeometry.dispose();
    wire.material.dispose();
    glow.geometry.dispose();
    glow.material.dispose();
    ring.geometry.dispose();
    ring.material.dispose();
    starGeometry.dispose();
    stars.material.dispose();
    renderer.dispose();
  };
}

function buildWorldMapCanvas() {
  const W = 1024, H = 512;
  const off = document.createElement("canvas");
  off.width = W; off.height = H;
  const ctx = off.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";

  const lx = (lon) => ((lon + 180) / 360) * W;
  const ly = (lat) => ((90 - lat) / 180) * H;
  const poly = (pts) => {
    ctx.beginPath();
    ctx.moveTo(lx(pts[0][0]), ly(pts[0][1]));
    for (let i = 1; i < pts.length; i++) ctx.lineTo(lx(pts[i][0]), ly(pts[i][1]));
    ctx.closePath();
    ctx.fill();
  };

  // North America (mainland + Central America)
  poly([
    [-168,60],[-165,54],[-133,55],[-124,48],[-124,38],[-117,32],[-110,23],
    [-105,22],[-95,16],[-92,15],[-88,13],[-84,10],[-80,8],[-77,8],
    [-79,9],[-84,10],[-87,16],[-87,21],[-91,21],[-94,20],[-97,22],
    [-97,26],[-94,30],[-89,30],[-82,28],[-81,25],[-80,25],[-80,31],
    [-75,35],[-74,40],[-67,44],[-53,47],[-56,52],[-64,58],[-65,68],
    [-80,72],[-141,72],[-168,60],
  ]);
  // Greenland
  poly([
    [-44,60],[-52,62],[-56,66],[-55,72],[-64,76],[-30,84],[-18,77],[-24,70],[-39,65],[-44,60],
  ]);
  // South America
  poly([
    [-72,12],[-75,10],[-77,8],[-80,0],[-81,-4],[-70,-18],[-72,-30],[-73,-40],
    [-74,-50],[-68,-55],[-68,-52],[-62,-40],[-58,-35],[-50,-30],[-43,-23],
    [-37,-15],[-35,-5],[-52,5],[-63,11],[-72,12],
  ]);
  // Europe (mainland + Scandinavia as one blob)
  poly([
    [-9,36],[-9,44],[3,44],[8,44],[15,37],[18,40],[23,38],[28,41],
    [30,44],[38,48],[30,52],[24,56],[22,60],[28,70],[20,71],[15,66],
    [5,62],[5,58],[8,56],[10,54],[2,51],[-2,51],[-5,50],[-9,44],[-9,36],
  ]);
  // Great Britain
  poly([[-5,50],[-2,50],[2,51],[-2,51],[-6,54],[-2,57],[0,58],[-3,58],[-5,58],[-6,54],[-5,50]]);
  // Ireland
  poly([[-10,52],[-6,50],[-6,54],[-10,54],[-10,52]]);
  // Iceland
  poly([[-24,64],[-13,63],[-13,66],[-18,67],[-24,65],[-24,64]]);
  // Africa
  poly([
    [-5,36],[-2,35],[10,37],[13,33],[25,30],[32,30],[34,28],[38,22],
    [43,12],[51,11],[45,2],[40,-2],[36,-18],[33,-26],[27,-34],[18,-34],
    [16,-30],[12,-18],[8,-4],[2,-1],[0,5],[-5,5],[-17,15],[-13,30],[-5,36],
  ]);
  // Madagascar
  poly([[44,-12],[50,-16],[48,-24],[44,-26],[44,-20],[44,-12]]);
  // Middle East + Turkey + Arabia
  poly([
    [26,42],[36,36],[38,22],[43,12],[50,12],[58,22],[60,22],[56,26],
    [48,30],[42,28],[36,28],[26,36],[26,42],
  ]);
  // Asia (Eurasia east of Caspian — India, China, Siberia, SE Asia)
  poly([
    [52,36],[60,36],[68,28],[68,24],[72,20],[72,15],[77,8],[80,10],
    [88,22],[90,22],[100,20],[100,5],[104,-8],[108,-6],[110,5],
    [118,4],[120,10],[125,0],[130,0],[140,-5],[143,-5],[145,0],
    [143,5],[138,10],[120,20],[118,28],[120,30],[122,36],[120,40],
    [124,40],[128,44],[132,48],[135,50],[140,60],[130,65],[110,70],
    [80,72],[60,68],[40,70],[38,48],[52,36],
  ]);
  // Borneo
  poly([[108,-4],[116,-4],[118,4],[110,5],[108,-4]]);
  // Sumatra
  poly([[95,5],[105,-5],[106,-4],[102,0],[98,4],[95,5]]);
  // New Guinea
  poly([[131,-8],[141,-8],[145,-5],[142,-3],[138,-5],[132,-3],[131,-8]]);
  // Australia
  poly([
    [114,-22],[114,-28],[117,-34],[122,-34],[130,-32],[140,-35],
    [148,-38],[152,-27],[152,-24],[148,-20],[140,-18],[136,-12],
    [130,-12],[124,-14],[114,-22],
  ]);
  // New Zealand (N + S island rough)
  poly([[172,-34],[178,-38],[177,-41],[172,-38],[172,-34]]);
  poly([[168,-44],[172,-46],[170,-46],[167,-44],[168,-44]]);
  // Japan (Honshu)
  poly([[130,32],[132,34],[136,34],[140,36],[141,40],[140,42],[130,32]]);
  // Sri Lanka
  poly([[80,10],[81,8],[81,7],[80,6],[80,10]]);
  // Philippines (Luzon rough)
  poly([[120,14],[122,14],[122,18],[120,18],[120,14]]);
  // Taiwan
  poly([[120,22],[121,22],[121,25],[120,25],[120,22]]);

  return off;
}

export function initFooterGlobeScene(canvas) {
  if (!canvas) return () => {};

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
  camera.position.set(0, 0, 7.5);

  const renderer = createRenderer(canvas);
  fitRenderer(renderer, camera, canvas);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const globeGroup = new THREE.Group();
  globeGroup.rotation.z = -0.12;
  globeGroup.rotation.y = -0.55;
  scene.add(globeGroup);

  let renderReady = false;
  const renderOnce = () => {
    if (renderReady) renderer.render(scene, camera);
  };
  const textureLoader = new THREE.TextureLoader();
  const dayTexture = textureLoader.load("/assets/globe/earth-day.webp", renderOnce);
  const nightTexture = textureLoader.load("/assets/globe/earth-night.webp", renderOnce);
  const cloudTexture = textureLoader.load("/assets/globe/earth-clouds.webp", renderOnce);
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  cloudTexture.colorSpace = THREE.SRGBColorSpace;
  const anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), isLikelyLowPowerDevice() ? 2 : 4);
  [dayTexture, nightTexture, cloudTexture].forEach((texture) => {
    texture.anisotropy = anisotropy;
  });

  const sunDirection = new THREE.Vector3(0.55, 0.35, 2.4).normalize();
  const latLonToVector3 = (lat, lon, radius) => {
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;
    const cosLat = Math.cos(latRad);
    return new THREE.Vector3(
      -radius * cosLat * Math.cos(lonRad),
      radius * Math.sin(latRad),
      -radius * cosLat * Math.sin(lonRad),
    );
  };
  const globeSegments = isLikelyLowPowerDevice() ? 64 : 96;
  const earthGeometry = new THREE.SphereGeometry(2.05, globeSegments, globeSegments);
  const earthMaterial = new THREE.ShaderMaterial({
    uniforms: {
      dayMap: { value: dayTexture },
      nightMap: { value: nightTexture },
      sunDirection: { value: sunDirection },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;
      void main() {
        vUv = uv;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D dayMap;
      uniform sampler2D nightMap;
      uniform vec3 sunDirection;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;
      void main() {
        vec3 normal = normalize(vWorldNormal);
        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        float sunlight = dot(normal, normalize(sunDirection));
        float dayMix = smoothstep(-0.18, 0.32, sunlight);
        vec3 dayColor = pow(texture2D(dayMap, vUv).rgb, vec3(0.82)) * 1.48;
        vec3 nightColor = texture2D(nightMap, vUv).rgb * 0.72;
        vec3 surface = mix(nightColor, dayColor, dayMix);
        float oceanGlint = pow(max(dot(reflect(-normalize(sunDirection), normal), viewDirection), 0.0), 46.0);
        float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 4.0);
        surface += vec3(0.18, 0.34, 0.58) * oceanGlint * dayMix * 0.34;
        surface += vec3(0.06, 0.19, 0.38) * rim * 0.34;
        gl_FragColor = vec4(surface, 1.0);
      }
    `,
  });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(2.075, globeSegments, globeSegments),
    new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      blending: THREE.NormalBlending,
    }),
  );
  clouds.renderOrder = 2;

  const aura = new THREE.Mesh(
    new THREE.SphereGeometry(2.23, isLikelyLowPowerDevice() ? 48 : 64, isLikelyLowPowerDevice() ? 48 : 64),
    new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color(0x4da3ff) } },
      vertexShader:
        "varying vec3 vNormal; void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader:
        "uniform vec3 glowColor; varying vec3 vNormal; void main(){ float glow = pow(0.78 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0); gl_FragColor = vec4(glowColor, glow * 0.62); }",
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  );
  globeGroup.add(aura, earth, clouds);

  const locations = [
    { name: "Karachi", lat: 24.86, lon: 67.01, primary: true },
    { name: "Florida", lat: 26.01, lon: -80.15 },
    { name: "London", lat: 51.5, lon: -0.12 },
    { name: "Dubai", lat: 25.2, lon: 55.27 },
    { name: "Singapore", lat: 1.35, lon: 103.82 },
    { name: "Sydney", lat: -33.86, lon: 151.2 },
    { name: "United States", label: "50 U.S. STATES", lat: 39.5, lon: -98.35, primary: true },
  ];
  const stateCoordinates = [
    [32.38, -86.3], [58.3, -134.42], [33.45, -112.07], [34.75, -92.29],
    [38.58, -121.49], [39.74, -104.99], [41.76, -72.68], [39.16, -75.52],
    [30.44, -84.28], [33.75, -84.39], [21.31, -157.86], [43.62, -116.2],
    [39.8, -89.65], [39.77, -86.16], [41.59, -93.62], [39.05, -95.68],
    [38.2, -84.88], [30.46, -91.14], [44.31, -69.78], [38.98, -76.49],
    [42.36, -71.06], [42.73, -84.56], [44.95, -93.09], [32.3, -90.18],
    [38.58, -92.17], [46.59, -112.04], [40.81, -96.68], [39.16, -119.77],
    [43.21, -71.54], [40.22, -74.77], [35.69, -105.94], [42.65, -73.76],
    [35.78, -78.64], [46.81, -100.78], [39.96, -82.99], [35.47, -97.52],
    [44.94, -123.03], [40.27, -76.88], [41.82, -71.41], [34.0, -81.03],
    [44.37, -100.35], [36.16, -86.78], [30.27, -97.74], [40.76, -111.89],
    [44.26, -72.58], [37.54, -77.44], [47.04, -122.9], [38.35, -81.63],
    [43.07, -89.4], [41.14, -104.82],
  ];
  const stateDotGeometry = new THREE.SphereGeometry(0.018, 8, 8);
  const stateDotMaterial = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
  });
  const stateDots = new THREE.InstancedMesh(stateDotGeometry, stateDotMaterial, stateCoordinates.length);
  const stateMatrix = new THREE.Object3D();
  stateCoordinates.forEach(([lat, lon], index) => {
    stateMatrix.position.copy(latLonToVector3(lat, lon, 2.092));
    stateMatrix.updateMatrix();
    stateDots.setMatrixAt(index, stateMatrix.matrix);
  });
  stateDots.instanceMatrix.needsUpdate = true;
  globeGroup.add(stateDots);

  const beaconCoreGeometry = new THREE.SphereGeometry(0.052, 18, 18);
  const beaconHaloGeometry = new THREE.RingGeometry(0.09, 0.145, 32);
  const beaconCoreMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const beaconHaloMaterial = new THREE.MeshBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const createLocationLabel = (text) => {
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 512;
    labelCanvas.height = 128;
    const context = labelCanvas.getContext("2d");
    context.fillStyle = "rgba(3, 10, 29, 0.88)";
    context.strokeStyle = "rgba(96, 165, 250, 0.72)";
    context.lineWidth = 3;
    context.beginPath();
    context.roundRect(3, 3, 506, 122, 30);
    context.fill();
    context.stroke();
    context.fillStyle = "#dbeafe";
    context.font = "800 42px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 256, 66);
    const texture = new THREE.CanvasTexture(labelCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: true,
        depthWrite: false,
      }),
    );
    sprite.scale.set(0.68, 0.17, 1);
    sprite.userData.texture = texture;
    return sprite;
  };
  const beacons = locations.map((location) => {
    const beacon = new THREE.Group();
    const normal = latLonToVector3(location.lat, location.lon, 1).normalize();
    beacon.position.copy(normal.clone().multiplyScalar(2.085));
    beacon.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

    const core = new THREE.Mesh(beaconCoreGeometry, beaconCoreMaterial);
    const halo = new THREE.Mesh(beaconHaloGeometry, beaconHaloMaterial.clone());
    halo.material.color.set(location.primary ? 0x22d3ee : 0x60a5fa);
    halo.material.opacity = location.primary ? 1 : 0.72;
    beacon.add(core, halo);
    if (location.primary) {
      const label = createLocationLabel(location.label || "KARACHI HQ");
      label.position.set(0, 0.22, 0);
      beacon.add(label);
      beacon.userData.label = label;
    }
    beacon.userData.halo = halo;
    beacon.userData.primary = location.primary;
    globeGroup.add(beacon);
    return beacon;
  });

  const createConnection = (from, to, color, opacity = 0.48) => {
    const start = latLonToVector3(from.lat, from.lon, 2.075);
    const end = latLonToVector3(to.lat, to.lon, 2.075);
    const distance = start.distanceTo(end);
    const midpoint = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(2.2 + distance * 0.24);
    const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);
    const geometry = new THREE.TubeGeometry(curve, 64, opacity > 0.6 ? 0.018 : 0.012, 8, false);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const connection = new THREE.Mesh(geometry, material);
    connection.renderOrder = 4;
    globeGroup.add(connection);
    return connection;
  };
  const karachi = locations[0];
  const florida = locations[1];
  const connections = [
    createConnection(karachi, florida, 0x22d3ee, 0.68),
    createConnection(karachi, locations[2], 0x60a5fa),
    createConnection(karachi, locations[3], 0x818cf8),
    createConnection(florida, locations[4], 0x60a5fa, 0.38),
    createConnection(florida, locations[5], 0x818cf8, 0.32),
  ];

  scene.add(new THREE.HemisphereLight(0x8bc5ff, 0x081020, 0.72));
  const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
  sunLight.position.copy(sunDirection.clone().multiplyScalar(6));
  scene.add(sunLight);

  const starGeometry = new THREE.BufferGeometry();
  const starCount = isLikelyLowPowerDevice() ? 90 : 150;
  const starPositions = new Float32Array(starCount * 3);
  for (let index = 0; index < starCount; index += 1) {
    starPositions[index * 3] = (Math.random() - 0.5) * 11;
    starPositions[index * 3 + 1] = (Math.random() - 0.5) * 7;
    starPositions[index * 3 + 2] = -2 - Math.random() * 8;
  }
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: 0xb8d8ff,
      size: 0.022,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(stars);

  const pointer = { x: 0, y: 0 };
  const onPointerMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
    pointer.y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
  };
  const onResize = () => fitRenderer(renderer, camera, canvas);
  canvas.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("resize", onResize);

  let frame = 0;
  renderReady = true;
  const stopLoop = createSceneLoop(canvas, (delta) => {
    frame += 0.006 * delta;
    globeGroup.rotation.y += 0.0011 * delta;
    clouds.rotation.y += 0.00135 * delta;
    globeGroup.rotation.x += (pointer.y * -0.08 - globeGroup.rotation.x) * 0.018;
    globeGroup.position.x += (pointer.x * 0.12 - globeGroup.position.x) * 0.02;
    globeGroup.position.y = Math.sin(frame) * 0.035;
    stars.rotation.y += 0.00035 * delta;
    beacons.forEach((beacon, index) => {
      const pulse = 1 + Math.sin(frame * 6 + index * 0.8) * (beacon.userData.primary ? 0.3 : 0.18);
      beacon.userData.halo.scale.setScalar(pulse);
      beacon.userData.halo.material.opacity = (beacon.userData.primary ? 0.82 : 0.5) + Math.sin(frame * 6 + index) * 0.16;
    });

    renderer.render(scene, camera);
  }, 30, true);

  return () => {
    renderReady = false;
    stopLoop();
    canvas.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", onResize);
    dayTexture.dispose();
    nightTexture.dispose();
    cloudTexture.dispose();
    earthGeometry.dispose();
    earthMaterial.dispose();
    clouds.geometry.dispose();
    clouds.material.dispose();
    aura.geometry.dispose();
    aura.material.dispose();
    beaconCoreGeometry.dispose();
    beaconHaloGeometry.dispose();
    beaconCoreMaterial.dispose();
    beaconHaloMaterial.dispose();
    stateDotGeometry.dispose();
    stateDotMaterial.dispose();
    beacons.forEach((beacon) => beacon.userData.halo.material.dispose());
    beacons.forEach((beacon) => {
      beacon.userData.label?.material.dispose();
      beacon.userData.label?.userData.texture.dispose();
    });
    connections.forEach((connection) => {
      connection.geometry.dispose();
      connection.material.dispose();
    });
    starGeometry.dispose();
    stars.material.dispose();
    renderer.dispose();
  };
}
