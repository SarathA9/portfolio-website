"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Global, mouse- and scroll-reactive particle / neural-network field.
 * Raw Three.js (no r3f) for minimal deps and full control.
 * Sits fixed behind all content; pointer-events are disabled.
 */
export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || typeof window === "undefined") return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width / height, 1, 2000);
    camera.position.z = 480;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // WebGL unavailable — CSS aurora remains as the backdrop
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // ---- particles ----
    const COUNT = width < 640 ? 70 : 120;
    const SPREAD = 760;
    const HALF = SPREAD / 2;
    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const palette = [
      new THREE.Color(0x22d3ee),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0xe23bd6),
      new THREE.Color(0x38bdf8),
    ];
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * SPREAD;
      positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 0.7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 0.6;
      velocities[i * 3] = (Math.random() - 0.5) * 0.25;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.25;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
      const c = palette[(Math.random() * palette.length) | 0];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const pMat = new THREE.PointsMaterial({
      size: 3.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(pGeo, pMat);
    group.add(points);

    // ---- connecting lines ----
    const MAX_SEG = COUNT * 6;
    const linePositions = new Float32Array(MAX_SEG * 2 * 3);
    const lineColors = new Float32Array(MAX_SEG * 2 * 3);
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3).setUsage(
        THREE.DynamicDrawUsage
      )
    );
    lGeo.setAttribute(
      "color",
      new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage)
    );
    const lMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const lines = new THREE.LineSegments(lGeo, lMat);
    group.add(lines);

    const LINK_DIST = 134;
    const LINK_DIST_SQ = LINK_DIST * LINK_DIST;

    // ---- interaction state ----
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth - 0.5;
      target.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let scrollY = window.scrollY;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let running = true;

    const animate = () => {
      if (!running) return;
      raf = requestAnimationFrame(animate);

      if (!reduce) {
        for (let i = 0; i < COUNT; i++) {
          positions[i * 3] += velocities[i * 3];
          positions[i * 3 + 1] += velocities[i * 3 + 1];
          positions[i * 3 + 2] += velocities[i * 3 + 2];
          for (let a = 0; a < 3; a++) {
            const idx = i * 3 + a;
            const bound = a === 1 ? HALF * 0.7 : a === 2 ? HALF * 0.6 : HALF;
            if (positions[idx] > bound || positions[idx] < -bound)
              velocities[idx] *= -1;
          }
        }
        pGeo.attributes.position.needsUpdate = true;
      }

      // rebuild proximity lines
      let seg = 0;
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const dsq = dx * dx + dy * dy + dz * dz;
          if (dsq < LINK_DIST_SQ && seg < MAX_SEG) {
            const alpha = 1 - Math.sqrt(dsq) / LINK_DIST;
            const o = seg * 6;
            linePositions[o] = positions[i * 3];
            linePositions[o + 1] = positions[i * 3 + 1];
            linePositions[o + 2] = positions[i * 3 + 2];
            linePositions[o + 3] = positions[j * 3];
            linePositions[o + 4] = positions[j * 3 + 1];
            linePositions[o + 5] = positions[j * 3 + 2];
            for (let k = 0; k < 2; k++) {
              const co = o + k * 3;
              lineColors[co] = 0.45 * alpha;
              lineColors[co + 1] = 0.4 * alpha;
              lineColors[co + 2] = 0.95 * alpha;
            }
            seg++;
          }
        }
      }
      lGeo.setDrawRange(0, seg * 2);
      lGeo.attributes.position.needsUpdate = true;
      lGeo.attributes.color.needsUpdate = true;

      // ease pointer + scroll-driven camera
      current.x += (target.x - current.x) * 0.04;
      current.y += (target.y - current.y) * 0.04;
      group.rotation.y =
        current.x * 0.5 + (reduce ? 0 : performance.now() * 0.00002);
      group.rotation.x = current.y * 0.3;
      camera.position.y = -scrollY * 0.06;
      camera.position.z = 480 - Math.min(scrollY * 0.05, 120);
      camera.lookAt(0, camera.position.y * 0.4, 0);

      renderer.render(scene, camera);
    };
    const isLight = () =>
      document.documentElement.getAttribute("data-theme") === "light";

    // particle field is dark-theme only; pause it on light / hidden tabs
    const syncRunning = () => {
      if (document.hidden || isLight()) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        animate();
      }
    };

    if (!isLight()) animate();
    else running = false;

    document.addEventListener("visibilitychange", syncRunning);
    window.addEventListener("themechange", syncRunning);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", syncRunning);
      window.removeEventListener("themechange", syncRunning);
      pGeo.dispose();
      pMat.dispose();
      lGeo.dispose();
      lMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="three-bg pointer-events-none fixed inset-0 -z-10"
      aria-hidden
    />
  );
}
