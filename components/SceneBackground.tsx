"use client";

import { useEffect, useRef } from "react";

/**
 * A fixed 3D network behind the whole page that changes shape as you scroll:
 * sphere (hero) → double helix (research) → wave field (projects)
 * → ring (experience) → galaxy (contact). Nodes keep their identity while
 * morphing, so the same network visibly flows from one form into the next.
 */

const SECTIONS = ["top", "research", "projects", "experience", "contact"];

export default function SceneBackground() {
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

      let seed = 11;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      const N = 520;
      const U = Float32Array.from({ length: N }, rand);
      const V = Float32Array.from({ length: N }, rand);
      const W = Float32Array.from({ length: N }, rand);

      // Sphere base positions (also used to build the links)
      const sphere = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const k = i + 0.5;
        const phi = Math.acos(1 - (2 * k) / N);
        const theta = Math.PI * (1 + Math.sqrt(5)) * k;
        const inner = i % 6 === 0;
        const r = inner ? 0.6 + W[i] * 1.3 : 2.3 + (W[i] - 0.5) * 0.35;
        sphere[i * 3] = r * Math.cos(theta) * Math.sin(phi);
        sphere[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi) * 0.92;
        sphere[i * 3 + 2] = r * Math.cos(phi);
      }

      const edges: [number, number][] = [];
      {
        const seen = new Set<number>();
        for (let i = 0; i < N; i++) {
          const near: { j: number; d: number }[] = [];
          for (let j = 0; j < N; j++) {
            if (j === i) continue;
            const dx = sphere[i * 3] - sphere[j * 3];
            const dy = sphere[i * 3 + 1] - sphere[j * 3 + 1];
            const dz = sphere[i * 3 + 2] - sphere[j * 3 + 2];
            const d = dx * dx + dy * dy + dz * dz;
            if (d < 0.75) near.push({ j, d });
          }
          near.sort((a, b) => a.d - b.d);
          for (const { j } of near.slice(0, 3)) {
            const key = Math.min(i, j) * N + Math.max(i, j);
            if (!seen.has(key)) {
              seen.add(key);
              edges.push([i, j]);
            }
          }
        }
      }

      let wide = window.innerWidth >= 960;
      const zAxis = new THREE.Vector3(0, 0, 1);
      const out = new THREE.Vector3();
      const rotX = (v: import("three").Vector3, a: number) => {
        const c = Math.cos(a), s = Math.sin(a);
        const y = v.y * c - v.z * s;
        v.z = v.y * s + v.z * c;
        v.y = y;
      };
      const rotY = (v: import("three").Vector3, a: number) => {
        const c = Math.cos(a), s = Math.sin(a);
        const x = v.x * c + v.z * s;
        v.z = -v.x * s + v.z * c;
        v.x = x;
      };

      // Shape k for node i at time t, written into `out`
      const shape = (k: number, i: number, t: number) => {
        const u = U[i], v = V[i], w = W[i];
        switch (k) {
          case 0: {
            out.set(sphere[i * 3], sphere[i * 3 + 1], sphere[i * 3 + 2]);
            rotY(out, t * 0.06);
            rotX(out, 0.25);
            const s = wide ? 0.86 : 1;
            out.multiplyScalar(s);
            out.x += wide ? 2.6 : 0;
            out.y += wide ? 0.25 : -0.4;
            break;
          }
          case 1: {
            // double helix with rungs
            const x = (u - 0.5) * (wide ? 17 : 11);
            const a = x * 0.85 + t * 0.35;
            const s0y = Math.cos(a) * 1.15, s0z = Math.sin(a) * 1.15;
            if (i % 4 === 0) {
              const m = w * 2 - 1;
              out.set(x, s0y * m, s0z * m);
            } else {
              const strand = i % 2 === 0 ? 1 : -1;
              out.set(x, s0y * strand + (v - 0.5) * 0.12, s0z * strand + (w - 0.5) * 0.12);
            }
            out.applyAxisAngle(zAxis, -0.22);
            break;
          }
          case 2: {
            // undulating field of nodes
            const c = i % 26, r = Math.floor(i / 26);
            const x = (c / 25 - 0.5) * (wide ? 17 : 10);
            const z = (r / 19 - 0.5) * 9;
            const y = Math.sin(x * 0.55 + t * 0.8) * 0.45 + Math.cos(z * 0.7 + t * 0.6) * 0.35;
            out.set(x, y - 1.2, z - 1);
            rotX(out, 0.42);
            break;
          }
          case 3: {
            // ring
            const a = u * Math.PI * 2 + t * 0.12;
            const b = v * Math.PI * 2;
            const R = wide ? 3.4 : 2.4, r = 0.55;
            out.set((R + r * Math.cos(b)) * Math.cos(a), r * Math.sin(b), (R + r * Math.cos(b)) * Math.sin(a));
            rotX(out, 1.05);
            rotY(out, -0.3);
            break;
          }
          default: {
            // galaxy
            const arm = i % 3;
            const d = Math.sqrt(u) * (wide ? 4.8 : 3.4);
            const a = (arm * Math.PI * 2) / 3 + d * 0.95 + t * 0.08 + (v - 0.5) * 0.5;
            out.set(Math.cos(a) * d, (w - 0.5) * 0.35 * (1.2 - d / 6), Math.sin(a) * d);
            rotX(out, 1.0);
            out.y -= 0.3;
          }
        }
        return out;
      };

      // Colours
      const cA = new THREE.Color("#7c9cff");
      const cB = new THREE.Color("#b69cff");
      const cC = new THREE.Color("#6fd6ff");
      const cur = new Float32Array(N * 3);
      cur.set(sphere);
      const col = new Float32Array(N * 3);
      const size = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const c = cA.clone().lerp(cB, U[i]).lerp(cC, V[i] * 0.5);
        col.set([c.r, c.g, c.b], i * 3);
        size[i] = i % 6 === 0 ? 1.6 : 0.8 + W[i] * 1.4;
      }

      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(cur, 3));
      pGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      pGeo.setAttribute("size", new THREE.BufferAttribute(size, 1));
      const pointMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uAlpha: { value: 1 } },
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
            vFade = smoothstep(-13.0, -5.0, mv.z);
            vColor = color;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          uniform float uAlpha;
          varying vec3 vColor;
          varying float vFade;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(vColor, a * (0.35 + 0.65 * vFade) * uAlpha);
          }`,
      });
      world.add(new THREE.Points(pGeo, pointMat));

      const lPos = new Float32Array(edges.length * 6);
      const lCol = new Float32Array(edges.length * 6);
      const lBase = new Float32Array(edges.length * 6);
      edges.forEach(([i, j], e) => {
        lBase.set([col[i * 3], col[i * 3 + 1], col[i * 3 + 2], col[j * 3], col[j * 3 + 1], col[j * 3 + 2]], e * 6);
      });
      lCol.set(lBase);
      const lGeo = new THREE.BufferGeometry();
      lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
      lGeo.setAttribute("color", new THREE.BufferAttribute(lCol, 3));
      const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.13,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      world.add(new THREE.LineSegments(lGeo, lineMat));

      // Signals
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
      const S = 46;
      const signals = Array.from({ length: S }, () => ({ e: Math.floor(rand() * edges.length), t: rand(), v: 0.35 + rand() * 0.5 }));
      const sPos = new Float32Array(S * 3);
      const sGeo = new THREE.BufferGeometry();
      sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
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

      // Scroll → which shape, and how far into the next one
      const anchors = () => SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
      let els = anchors();
      const scrollState = () => {
        const mid = window.innerHeight * 0.55;
        let idx = 0;
        let frac = 0;
        for (let i = 0; i < els.length; i++) {
          const top = els[i].getBoundingClientRect().top;
          if (top <= mid) {
            idx = i;
            const next = els[i + 1]?.getBoundingClientRect().top;
            frac = next !== undefined ? Math.min(1, (mid - top) / Math.max(1, next - top)) : 0;
          }
        }
        // morph during the last 40% of each section
        const k = Math.min(1, Math.max(0, (frac - 0.6) / 0.4));
        const ease = k * k * (3 - 2 * k);
        return { a: idx, b: Math.min(idx + 1, 4), m: idx >= 4 ? 0 : ease, s: idx + ease };
      };

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e: PointerEvent) => {
        pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        wide = w >= 960;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        els = anchors();
      };
      resize();
      window.addEventListener("resize", resize);

      const clock = new THREE.Clock();
      let raf = 0;
      let smooth = 0;
      const step = (dt: number, t: number) => {
        const st = scrollState();
        // ease the overall progress so fast scrolling still feels fluid
        smooth += (st.s - smooth) * Math.min(1, dt * 6 || 1);
        const a = Math.floor(smooth);
        const b = Math.min(a + 1, 4);
        const m = smooth - a;

        pointer.x += (pointer.tx - pointer.x) * 0.04;
        pointer.y += (pointer.ty - pointer.y) * 0.04;
        world.rotation.y = pointer.x * 0.18;
        world.rotation.x = pointer.y * 0.1;

        for (let i = 0; i < N; i++) {
          shape(a, i, t);
          const ax = out.x, ay = out.y, az = out.z;
          if (m > 0.0001 && b !== a) {
            shape(b, i, t);
            // stagger each node slightly so the morph ripples rather than snaps
            const d = Math.min(1, Math.max(0, m * 1.35 - U[i] * 0.35));
            cur[i * 3] = ax + (out.x - ax) * d;
            cur[i * 3 + 1] = ay + (out.y - ay) * d;
            cur[i * 3 + 2] = az + (out.z - az) * d;
          } else {
            cur[i * 3] = ax;
            cur[i * 3 + 1] = ay;
            cur[i * 3 + 2] = az;
          }
        }
        pGeo.attributes.position.needsUpdate = true;

        for (let e = 0; e < edges.length; e++) {
          const [i, j] = edges[e];
          lPos[e * 6] = cur[i * 3];
          lPos[e * 6 + 1] = cur[i * 3 + 1];
          lPos[e * 6 + 2] = cur[i * 3 + 2];
          lPos[e * 6 + 3] = cur[j * 3];
          lPos[e * 6 + 4] = cur[j * 3 + 1];
          lPos[e * 6 + 5] = cur[j * 3 + 2];
          // a link that is stretched beyond its natural length fades out, so morphs never streak
          const dx = lPos[e * 6] - lPos[e * 6 + 3];
          const dy = lPos[e * 6 + 1] - lPos[e * 6 + 4];
          const dz = lPos[e * 6 + 2] - lPos[e * 6 + 5];
          const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const f = Math.max(0, Math.min(1, 1 - (len - 0.8) / 0.5));
          for (let c = 0; c < 6; c++) lCol[e * 6 + c] = lBase[e * 6 + c] * f;
        }
        lGeo.attributes.position.needsUpdate = true;
        lGeo.attributes.color.needsUpdate = true;
        // links belong to the sphere; they fade as it unfolds into other shapes
        const sphereW = Math.max(0, 1 - smooth);
        lineMat.opacity = 0.05 + 0.09 * sphereW;

        for (let k = 0; k < S; k++) {
          const sg = signals[k];
          sg.t += dt * sg.v;
          if (sg.t >= 1) {
            const end = edges[sg.e][1];
            const next = edges.findIndex(([x], idx) => x === end && idx !== sg.e);
            sg.e = next >= 0 ? next : Math.floor(rand() * edges.length);
            sg.t = 0;
          }
          const [i, j] = edges[sg.e];
          for (let c = 0; c < 3; c++) sPos[k * 3 + c] = cur[i * 3 + c] + (cur[j * 3 + c] - cur[i * 3 + c]) * sg.t;
        }
        sGeo.attributes.position.needsUpdate = true;
        sMat.opacity = 0.95 * (0.25 + 0.75 * sphereW);

        // fly-through: the camera dips into the network between hero and helix
        const dip = Math.sin(Math.min(1, smooth) * Math.PI);
        camera.position.z = 8 - dip * 2.4;
        camera.position.y = -dip * 0.3;
        camera.lookAt(0, 0, 0);

        // quieter behind reading-heavy sections
        const base = wide ? 0.62 : 0.45;
        pointMat.uniforms.uAlpha.value = 1 - Math.min(1, smooth) * (1 - base);
        pointMat.uniforms.uTime.value = t;
        renderer.render(scene, camera);
      };

      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (document.hidden) return;
        step(Math.min(clock.getDelta(), 0.05), clock.elapsedTime);
      };
      if (reduced) {
        const once = () => step(1, 2);
        once();
        window.addEventListener("scroll", once, { passive: true });
        cleanup = () => window.removeEventListener("scroll", once);
      } else {
        frame();
      }
      requestAnimationFrame(() => (el.dataset.ready = "true"));

      const prev = cleanup;
      cleanup = () => {
        prev();
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("resize", resize);
        [pGeo, lGeo, sGeo].forEach((g) => g.dispose());
        [pointMat, lineMat, sMat].forEach((m) => m.dispose());
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

  return <div ref={host} className="scene" aria-hidden />;
}
