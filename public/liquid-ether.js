import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const DEFAULT_COLORS = ["#5227FF", "#FF9FFC", "#B19EEF"];

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 vUv;

  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uTime;
  uniform float uStrength;
  uniform vec3 uColors[4];

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
      (c - a) * u.y * (1.0 - u.x) +
      (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.02;
      amplitude *= 0.5;
    }

    return value;
  }

  vec3 palette(float t) {
    vec3 c0 = uColors[0];
    vec3 c1 = uColors[1];
    vec3 c2 = uColors[2];
    vec3 c3 = uColors[3];

    if (t < 0.33) {
      return mix(c0, c1, smoothstep(0.0, 0.33, t));
    }
    if (t < 0.66) {
      return mix(c1, c2, smoothstep(0.33, 0.66, t));
    }
    return mix(c2, c3, smoothstep(0.66, 1.0, t));
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 centered = (uv - 0.5) * aspect;
    vec2 pointer = (uPointer - 0.5) * aspect;

    float t = uTime * 0.16;
    vec2 warpA = vec2(
      fbm(centered * 1.8 + vec2(0.0, t)),
      fbm(centered * 1.8 + vec2(4.7, -t))
    );
    vec2 warpB = vec2(
      fbm(centered * 2.4 - warpA * 1.1 + vec2(3.2, t * 1.3)),
      fbm(centered * 2.0 + warpA * 0.9 + vec2(7.1, -t * 1.1))
    );

    float pointerDist = length(centered - pointer);
    float pointerField = exp(-pointerDist * 5.4) * uStrength;

    float flow = fbm(centered * 2.2 + warpB * 1.8 + vec2(t, -t * 0.7));
    flow += pointerField * 0.55;
    flow = clamp(flow, 0.0, 1.0);

    vec3 color = palette(flow);

    float glow = smoothstep(0.95, 0.15, length(centered * vec2(0.88, 1.1)));
    float alpha = (0.3 + glow * 0.34 + pointerField * 0.24) * uStrength;

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.72));
  }
`;

function hexToThreeColor(value) {
  try {
    return new THREE.Color(value);
  } catch (_error) {
    return new THREE.Color("#ffffff");
  }
}

function parseColors(value) {
  const colors = String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const palette = colors.length ? colors : DEFAULT_COLORS;
  while (palette.length < 4) {
    palette.push(palette[palette.length - 1] || DEFAULT_COLORS[palette.length - 1] || "#ffffff");
  }

  return palette.slice(0, 4).map(hexToThreeColor);
}

class LiquidEtherBackground {
  constructor(host) {
    this.host = host;
    this.pointer = new THREE.Vector2(0.5, 0.5);
    this.pointerTarget = new THREE.Vector2(0.5, 0.5);
    this.clock = new THREE.Clock();
    this.frame = null;
    this.resizeObserver = null;
    this.visible = true;
    this.lastInteraction = performance.now();
    this.autoPhase = Math.random() * Math.PI * 2.0;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const colors = parseColors(host.dataset.colors);
    const strength = Number.parseFloat(host.dataset.strength || "0.55");

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uResolution: { value: new THREE.Vector2(1, 1) },
        uPointer: { value: this.pointer.clone() },
        uTime: { value: 0 },
        uStrength: { value: Number.isFinite(strength) ? strength : 0.35 },
        uColors: { value: colors }
      },
      vertexShader,
      fragmentShader
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.scene.add(this.mesh);

    host.appendChild(this.renderer.domElement);

    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
    this.animate = this.animate.bind(this);

    (host.parentElement || host).addEventListener("pointermove", this.handlePointerMove);
    (host.parentElement || host).addEventListener("pointerleave", this.handlePointerLeave);
    document.addEventListener("visibilitychange", this.handleVisibility);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);

    this.resize();
    this.animate();
  }

  resize() {
    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);
    this.renderer.setSize(width, height, false);
    this.material.uniforms.uResolution.value.set(width, height);
  }

  handlePointerMove(event) {
    const rect = (this.host.parentElement || this.host).getBoundingClientRect();
    this.pointerTarget.set(
      (event.clientX - rect.left) / Math.max(rect.width, 1),
      1 - (event.clientY - rect.top) / Math.max(rect.height, 1)
    );
    this.lastInteraction = performance.now();
  }

  handlePointerLeave() {
    this.lastInteraction = performance.now();
  }

  handleVisibility() {
    this.visible = !document.hidden;
    if (this.visible && !this.frame) {
      this.animate();
    }
  }

  animate() {
    if (!this.visible) {
      this.frame = null;
      return;
    }

    const elapsed = this.clock.getElapsedTime();
    const now = performance.now();
    const idleSeconds = (now - this.lastInteraction) / 1000;

    if (idleSeconds > 1.5) {
      this.autoPhase += 0.0038;
      this.pointerTarget.set(
        0.5 + Math.cos(this.autoPhase) * 0.18,
        0.52 + Math.sin(this.autoPhase * 1.27) * 0.14
      );
    }

    this.pointer.lerp(this.pointerTarget, 0.06);
    this.material.uniforms.uPointer.value.copy(this.pointer);
    this.material.uniforms.uTime.value = elapsed;

    this.renderer.render(this.scene, this.camera);
    this.frame = window.requestAnimationFrame(this.animate);
  }

  dispose() {
    if (this.frame) {
      window.cancelAnimationFrame(this.frame);
      this.frame = null;
    }

    (this.host.parentElement || this.host).removeEventListener("pointermove", this.handlePointerMove);
    (this.host.parentElement || this.host).removeEventListener("pointerleave", this.handlePointerLeave);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    this.resizeObserver?.disconnect();
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.host) {
      this.host.removeChild(this.renderer.domElement);
    }
  }
}

const hosts = Array.from(document.querySelectorAll("[data-liquid-ether]"));
const instances = hosts.map((host) => new LiquidEtherBackground(host));

window.addEventListener("beforeunload", () => {
  instances.forEach((instance) => instance.dispose());
});
