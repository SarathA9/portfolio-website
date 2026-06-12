"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Draggable, self-rotating, scroll-reactive 3D object for the hero.
 * An all-wireframe geometric form — nested neon line shells + a point halo,
 * matching the surrounding particle-network aesthetic (no solid fill).
 */
export default function HeroObject() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || typeof window === "undefined") return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = mount.clientWidth || 440;
    let height = mount.clientHeight || 440;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6.2;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    const dom = renderer.domElement;
    dom.style.touchAction = "none";
    dom.style.cursor = "grab";

    const group = new THREE.Group();
    scene.add(group);

    // theme-aware palette: neon-additive on dark, deeper-ink-normal on light
    const light =
      document.documentElement.getAttribute("data-theme") === "light";
    const blend = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    const COL = light
      ? { shell: 0x4f46e5, mid: 0x7c3aed, core: 0x0e7490, dots: 0x4f46e5 }
      : { shell: 0x22d3ee, mid: 0x8b5cf6, core: 0x67e8f9, dots: 0x22d3ee };
    const OPA = light
      ? { shell: 0.75, mid: 0.8, core: 0.9, dots: 0.9 }
      : { shell: 0.5, mid: 0.6, core: 0.75, dots: 0.85 };

    const wire = (radius: number, detail: number, color: number, opacity: number) => {
      const geo = new THREE.IcosahedronGeometry(radius, detail);
      const mat = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity,
        blending: blend,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);
      return { mesh, geo, mat };
    };

    // nested neon wireframe shells (cyan outer → violet mid → bright-cyan core)
    const shell = wire(2.05, 1, COL.shell, OPA.shell);
    const mid = wire(1.4, 1, COL.mid, OPA.mid);
    const core = wire(0.72, 0, COL.core, OPA.core);

    // outer point halo
    const dotGeo = new THREE.IcosahedronGeometry(2.55, 3);
    const dotMat = new THREE.PointsMaterial({
      color: COL.dots,
      size: 0.05,
      transparent: true,
      opacity: OPA.dots,
      blending: blend,
      depthWrite: false,
    });
    const dots = new THREE.Points(dotGeo, dotMat);
    group.add(dots);

    // ---- drag interaction ----
    let dragging = false;
    let px = 0;
    let py = 0;
    let velX = 0.004;
    let velY = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      px = e.clientX;
      py = e.clientY;
      dom.style.cursor = "grabbing";
      try {
        dom.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - px;
      const dy = e.clientY - py;
      group.rotation.y += dx * 0.01;
      group.rotation.x += dy * 0.01;
      velX = dx * 0.0009;
      velY = dy * 0.0009;
      px = e.clientX;
      py = e.clientY;
    };
    const up = () => {
      dragging = false;
      dom.style.cursor = "grab";
    };
    dom.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    let scrollY = window.scrollY;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      width = mount.clientWidth || width;
      height = mount.clientHeight || height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    ro.observe(mount);

    let raf = 0;
    let running = true;
    const animate = () => {
      if (!running) return;
      raf = requestAnimationFrame(animate);

      if (!dragging) {
        if (!reduce) {
          group.rotation.y += velX || 0.004;
          group.rotation.x += velY * 0.25;
        }
        velX += (0.004 - velX) * 0.02;
        velY *= 0.94;
      }
      if (!reduce) {
        // differential rotation of each shell for depth
        shell.mesh.rotation.y -= 0.0024;
        shell.mesh.rotation.x += 0.0012;
        mid.mesh.rotation.y += 0.004;
        mid.mesh.rotation.z += 0.0016;
        core.mesh.rotation.x -= 0.006;
        dots.rotation.y += 0.0016;
      }
      const t = performance.now() * 0.001;
      const s = 1 + (reduce ? 0 : Math.sin(t) * 0.03);
      mid.mesh.scale.setScalar(s);
      core.mesh.scale.setScalar(1 + (reduce ? 0 : Math.sin(t * 1.3) * 0.05));
      group.position.y = reduce ? 0 : Math.sin(t * 0.8) * 0.08;
      group.rotation.z = -scrollY * 0.0004;

      renderer.render(scene, camera);
    };
    animate();

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        animate();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      dom.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      [shell, mid, core].forEach((w) => {
        w.geo.dispose();
        w.mat.dispose();
      });
      dotGeo.dispose();
      dotMat.dispose();
      renderer.dispose();
      if (dom.parentNode === mount) mount.removeChild(dom);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="h-full w-full"
      aria-label="Interactive 3D wireframe object — drag to rotate"
      role="img"
    />
  );
}
