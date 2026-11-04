"use client";

import { useEffect, useRef } from "react";

/**
 * Hero background: a slowly turning 3D neural network. Nodes sit on a
 * loose sphere, each linked to its nearest neighbours, with small signals
 * travelling along the links. Calm by design: slow rotation, gentle
 * pointer parallax, paused when off screen, a still frame for reduced motion.
 */
export default function NeuralField() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return;
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 0, 8);
      const world = new THREE.Group();
      scene.add(world);

      // Deterministic pseudo-random so the network looks the same on every load
      let seed = 7;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      // Nodes on a loose fibonacci sphere, plus a sparse inner cloud
      const N = 520;
      const pos: number[] = [];
      for (let i = 0; i < N; i++) {
        const inner = i % 6 === 0;
        const k = i + 0.5;
        const phi = Math.acos(1 - (2 * k) / N);
        const theta = Math.PI * (1 + Math.sqrt(5)) * k;
        const r = inner ? 0.6 + rand() * 1.3 : 2.3 + (rand() - 0.5) * 0.35;
        pos.push(
          r * Math.cos(theta) * Math.sin(phi),
          r * Math.sin(theta) * Math.sin(phi) * 0.92,
          r * Math.cos(phi)
        );
      }
      const P = (i: number) => new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);

      // Links: each node to its 3 nearest neighbours under a distance cap
      const edges: [number, number][] = [];
      const seen = new Set<string>();
      for (let i = 0; i < N; i++) {
        const a = P(i);
        const near: { j: number; d: number }[] = [];
        for (let j = 0; j < N; j++) {
          if (j === i) continue;
          const d = a.distanceToSquared(P(j));
          if (d < 0.75) near.push({ j, d });
        }
        near.sort((x, y) => x.d - y.d);
        for (const { j } of near.slice(0, 3)) {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!seen.has(key)) {
            seen.add(key);
            edges.push([i, j]);
          }
        }
      }

      const cA = new THREE.Color("#7c9cff");
      const cB = new THREE.Color("#b69cff");
      const cC = new THREE.Color("#6fd6ff");
      const colorAt = (v: import("three").Vector3) => {
        const t = (v.y + 2.5) / 5;
        const c = cA.clone().lerp(cB, Math.min(1, Math.max(0, t)));
        return c.lerp(cC, Math.max(0, -v.x) / 6);
      };

      // Points
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      const pCol: number[] = [];
      const pSize: number[] = [];
      for (let i = 0; i < N; i++) {
        const c = colorAt(P(i));
        pCol.push(c.r, c.g, c.b);
        pSize.push(i % 6 === 0 ? 1.6 : 0.8 + rand() * 1.4);
      }
      pGeo.setAttribute("color", new THREE.Float32BufferAttribute(pCol, 3));
      pGeo.setAttribute("size", new THREE.Float32BufferAttribute(pSize, 1));

      const pointMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() } },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          uniform float uTime;
          uniform float uPx;
          varying vec3 vColor;
          varying float vFade;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            float tw = 0.75 + 0.25 * sin(uTime * 1.3 + position.x * 3.1 + position.y * 2.3);
            gl_PointSize = size * tw * uPx * (26.0 / -mv.z);
            vFade = smoothstep(-11.0, -5.5, mv.z);
            vColor = color;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          varying vec3 vColor;
          varying float vFade;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(vColor, a * (0.35 + 0.65 * vFade));
          }`,
      });
      world.add(new THREE.Points(pGeo, pointMat));

      // Lines
      const lPos: number[] = [];
      const lCol: number[] = [];
      for (const [i, j] of edges) {
        const a = P(i);
        const b = P(j);
        lPos.push(a.x, a.y, a.z, b.x, b.y, b.z);
        const ca = colorAt(a);
        const cb = colorAt(b);
        lCol.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b);
      }
      const lGeo = new THREE.BufferGeometry();
      lGeo.setAttribute("position", new THREE.Float32BufferAttribute(lPos, 3));
      lGeo.setAttribute("color", new THREE.Float32BufferAttribute(lCol, 3));
      const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.13,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      world.add(new THREE.LineSegments(lGeo, lineMat));

      // Signals travelling along links
      const S = 46;
      const signals = Array.from({ length: S }, () => ({
        e: Math.floor(rand() * edges.length),
        t: rand(),
        v: 0.35 + rand() * 0.5,
      }));
      const sGeo = new THREE.BufferGeometry();
      const sPos = new Float32Array(S * 3);
      sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
      const dotCanvas = document.createElement("canvas");
      dotCanvas.width = dotCanvas.height = 64;
      const ctx = dotCanvas.getContext("2d")!;
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.35, "rgba(200,212,255,0.8)");
      grad.addColorStop(1, "rgba(142,166,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      const dotTex = new THREE.CanvasTexture(dotCanvas);
      const sMat = new THREE.PointsMaterial({
        size: 0.16,
        map: dotTex,
        color: 0xdfe6ff,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      world.add(new THREE.Points(sGeo, sMat));

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e: PointerEvent) => {
        pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      let offsetX = 0;
      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const wide = w >= 960;
        offsetX = wide ? 2.6 : 0;
        camera.position.z = wide ? 8 : 9.5;
        camera.updateProjectionMatrix();
        world.position.x = offsetX;
        world.position.y = wide ? 0.25 : -0.4;
        world.scale.setScalar(wide ? 0.86 : 1);
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      let visible = true;
      const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
      io.observe(el);

      const clock = new THREE.Clock();
      let raf = 0;
      const tmpA = new THREE.Vector3();
      const tmpB = new THREE.Vector3();

      const step = (dt: number, t: number) => {
        pointer.x += (pointer.tx - pointer.x) * 0.04;
        pointer.y += (pointer.ty - pointer.y) * 0.04;
        world.rotation.y = t * 0.06 + pointer.x * 0.25;
        world.rotation.x = 0.25 + pointer.y * 0.15;
        pointMat.uniforms.uTime.value = t;

        for (let k = 0; k < S; k++) {
          const s = signals[k];
          s.t += dt * s.v;
          if (s.t >= 1) {
            // hop to a link that starts where this one ended
            const end = edges[s.e][1];
            const next = edges.findIndex(([a], idx) => a === end && idx !== s.e);
            s.e = next >= 0 ? next : Math.floor(rand() * edges.length);
            s.t = 0;
          }
          const [i, j] = edges[s.e];
          tmpA.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
          tmpB.set(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]);
          tmpA.lerp(tmpB, s.t);
          sPos[k * 3] = tmpA.x;
          sPos[k * 3 + 1] = tmpA.y;
          sPos[k * 3 + 2] = tmpA.z;
        }
        sGeo.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
      };

      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!visible || document.hidden) return;
        step(Math.min(clock.getDelta(), 0.05), clock.elapsedTime);
      };

      if (reduced) step(0, 2);
      else frame();
      requestAnimationFrame(() => (el.dataset.ready = "true"));

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        ro.disconnect();
        io.disconnect();
        pGeo.dispose();
        lGeo.dispose();
        sGeo.dispose();
        pointMat.dispose();
        lineMat.dispose();
        sMat.dispose();
        dotTex.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={host} className="neural" aria-hidden />;
}
