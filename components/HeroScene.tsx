"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The hero's 3D scene: a morphing chrome "query" blob with document cards
 * orbiting it, and one glowing card drifting off its orbit, the poisoned
 * document from the RAG backdoor research. It follows the pointer and
 * pauses when off screen.
 */

const NOISE = /* glsl */ `
uniform float uTime;
uniform float uAmp;
vec3 sa_mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 sa_mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 sa_permute(vec4 x){return sa_mod289(((x*34.0)+1.0)*x);}
vec4 sa_taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float sa_snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=sa_mod289(i);
  vec4 p=sa_permute(sa_permute(sa_permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=sa_taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
vec3 sa_displace(vec3 p){
  float n=sa_snoise(p*0.75+vec3(uTime*0.18));
  float n2=sa_snoise(p*2.1-vec3(uTime*0.31))*0.3;
  return p+normalize(p)*(n+n2)*uAmp;
}
`;

export default function HeroScene() {
  const host = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        setFallback(true);
        return;
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;

      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0, 9);

      const world = new THREE.Group();
      scene.add(world);

      // Blob
      const uniforms = { uTime: { value: 0 }, uAmp: { value: 0.17 } };
      const blobMat = new THREE.MeshPhysicalMaterial({
        color: 0xc9ccd6,
        metalness: 1,
        roughness: 0.12,
        iridescence: 1,
        iridescenceIOR: 1.6,
        iridescenceThicknessRange: [180, 620],
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.25,
      });
      blobMat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = uniforms.uTime;
        shader.uniforms.uAmp = uniforms.uAmp;
        shader.vertexShader = NOISE + shader.vertexShader;
        shader.vertexShader = shader.vertexShader
          .replace(
            "#include <beginnormal_vertex>",
            `vec3 objectNormal;
            {
              vec3 n0 = normalize(normal);
              vec3 t = normalize(cross(n0, abs(n0.y) < 0.99 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0)));
              vec3 b = normalize(cross(n0, t));
              float e = 0.012;
              vec3 q0 = sa_displace(position);
              vec3 q1 = sa_displace(position + t * e);
              vec3 q2 = sa_displace(position + b * e);
              objectNormal = normalize(cross(q1 - q0, q2 - q0));
              if (dot(objectNormal, n0) < 0.0) objectNormal = -objectNormal;
            }`
          )
          .replace("#include <begin_vertex>", "vec3 transformed = sa_displace(position);");
      };
      const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 40), blobMat);
      world.add(blob);

      // Orbiting document cards
      const ring = new THREE.Group();
      ring.rotation.set(1.15, 0.2, -0.35);
      world.add(ring);
      const cardGeo = new THREE.BoxGeometry(0.26, 0.36, 0.02);
      const cardMat = new THREE.MeshPhysicalMaterial({
        color: 0xe8eaf0,
        metalness: 0.9,
        roughness: 0.25,
        clearcoat: 1,
        envMapIntensity: 1.1,
      });
      const N = 26;
      const cards = new THREE.InstancedMesh(cardGeo, cardMat, N);
      const seeds = Array.from({ length: N }, (_, i) => ({
        a: (i / N) * Math.PI * 2,
        r: 2.0 + Math.sin(i * 12.9898) * 0.15,
        y: Math.sin(i * 78.233) * 0.12,
        s: 0.75 + ((i * 37) % 10) / 20,
      }));
      ring.add(cards);

      const poison = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.42, 0.024),
        new THREE.MeshStandardMaterial({ color: 0xe4f26b, emissive: 0xc8dc3c, emissiveIntensity: 1.1, roughness: 0.35 })
      );
      ring.add(poison);
      const glow = new THREE.PointLight(0xe4f26b, 6, 3.2, 2);
      poison.add(glow);

      const key = new THREE.PointLight(0x9db4ff, 40, 20, 2);
      key.position.set(3, 2, 4);
      scene.add(key);

      const dummy = new THREE.Object3D();
      const pointer = { x: 0, y: 0, tx: 0, ty: 0, speed: 0 };
      let lastX = 0;
      let lastY = 0;
      const onMove = (e: PointerEvent) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        pointer.speed = Math.min(1, pointer.speed + Math.hypot(nx - lastX, ny - lastY) * 2.5);
        lastX = nx;
        lastY = ny;
        pointer.tx = nx;
        pointer.ty = ny;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      let scrollP = 0;
      const onScroll = () => {
        scrollP = Math.min(1, window.scrollY / Math.max(1, el.clientHeight));
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      let baseY = 0.3;
      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Keep the object a sensible size on narrow screens
        camera.position.z = w < 700 ? 17 : 9.5;
        baseY = w < 700 ? 1.9 : 0.3;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      let visible = true;
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(el);

      const clock = new THREE.Clock();
      let raf = 0;
      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!visible || document.hidden) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;

        pointer.x += (pointer.tx - pointer.x) * 0.06;
        pointer.y += (pointer.ty - pointer.y) * 0.06;
        pointer.speed *= 0.94;

        uniforms.uTime.value = t;
        uniforms.uAmp.value += (0.16 + pointer.speed * 0.22 - uniforms.uAmp.value) * 0.08;

        world.rotation.y = pointer.x * 0.55;
        world.rotation.x = pointer.y * 0.35;
        blob.rotation.y += dt * 0.12;
        world.position.y = baseY + scrollP * 1.6;
        world.scale.setScalar(1 - scrollP * 0.25);

        key.position.x = 3 + pointer.x * 3;
        key.position.y = 2 - pointer.y * 3;

        for (let i = 0; i < N; i++) {
          const s = seeds[i];
          const a = s.a + t * 0.16;
          dummy.position.set(Math.cos(a) * s.r, s.y, Math.sin(a) * s.r);
          dummy.lookAt(0, 0, 0);
          dummy.rotateZ(t * 0.4 + i);
          dummy.scale.setScalar(s.s);
          dummy.updateMatrix();
          cards.setMatrixAt(i, dummy.matrix);
        }
        cards.instanceMatrix.needsUpdate = true;

        // The poisoned card ranks itself closer than it should: it drifts inward and out of plane.
        const pa = t * 0.16 + Math.PI * 0.27;
        const pr = 1.6 + Math.sin(t * 0.9) * 0.2;
        poison.position.set(Math.cos(pa) * pr, 0.35 + Math.sin(t * 1.3) * 0.25, Math.sin(pa) * pr);
        poison.lookAt(0, 0, 0);
        poison.rotateZ(Math.sin(t) * 0.6);

        renderer.render(scene, camera);
      };

      if (reduced) {
        renderer.render(scene, camera);
        clock.start();
        frame();
        cancelAnimationFrame(raf);
      } else {
        frame();
      }
      el.dataset.ready = "true";

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("scroll", onScroll);
        ro.disconnect();
        io.disconnect();
        renderer.dispose();
        pmrem.dispose();
        envTex.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={host} className="hero-scene" aria-hidden>
      {fallback && <div className="hero-scene-fallback" />}
    </div>
  );
}
