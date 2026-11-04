"use client";

import { useEffect, useRef } from "react";

/**
 * Hero 3D scene: a developer (blue cap, long dark hair, grey knit sweater)
 * coding at his desk. Built entirely from primitives in Three.js:
 *  - the monitor shows real code being typed, with syntax colours and a cursor
 *  - hands type and keyboard keys press down; every few seconds he pauses to think
 *  - he glances at your cursor when you point at the scene
 *  - coffee steam, a swaying plant, screen glow on his face, soft shadows
 * Pauses off screen; reduced motion gets a still frame.
 */

const SNIPPETS: { file: string; code: string }[] = [
  {
    file: "rfc_defense.py",
    code: `import numpy as np
from sentence_transformers import SentenceTransformer

# Rank-Faithfulness Consistency (RFC)
def rfc_scores(query, docs, model):
    q = model.encode(query, normalize_embeddings=True)
    d = model.encode(docs, normalize_embeddings=True)
    relevance = d @ q
    centroid = d.mean(axis=0)
    context = d @ centroid
    return relevance - context

def flag_poisoned(query, docs, model, tau=0.12):
    scores = rfc_scores(query, docs, model)
    return [doc for doc, s in zip(docs, scores) if s > tau]

# AUC 0.99 on a single poisoned passage`,
  },
  {
    file: "Portfolio.tsx",
    code: `import { useMemo, useState } from "react";
import { retrieve } from "@/lib/search";

export default function Portfolio() {
  const [query, setQuery] = useState("LLM security");
  const hits = useMemo(() => retrieve(query, 5), [query]);

  return (
    <Search value={query} onChange={setQuery}>
      {hits.map((h) => (
        <Result key={h.doc.id} score={h.score} {...h.doc} />
      ))}
    </Search>
  );
}`,
  },
  {
    file: "maze_nav.py",
    code: `# Husarion RosBot: autonomous maze navigation
grid = OccupancyGrid(lidar, depth_cam, floor_colour)

while not reached(goal):
    pose = scan_match(grid, lidar.scan())
    path = a_star(grid, pose, goal)
    v, w = pure_pursuit(path, pose, lookahead=0.35)
    robot.drive(v, w)

    if floating_wall_detected(depth_cam):
        grid.mark_blocked(depth_cam.obstacles())

print("5 / 5 mazes solved in", total_time, "s")`,
  },
];

const KEYWORDS = new Set([
  "import", "from", "def", "return", "for", "in", "if", "while", "not", "and", "or",
  "export", "default", "function", "const", "let", "as", "True", "False", "None", "print",
]);

type Tok = { t: string; c: string };
function tokenize(line: string): Tok[] {
  const out: Tok[] = [];
  const re = /(#.*$|\/\/.*$)|("[^"]*"?|'[^']*'?|`[^`]*`?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|(.)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m[1]) out.push({ t: m[1], c: "#6b7488" });
    else if (m[2]) out.push({ t: m[2], c: "#a5e3a0" });
    else if (m[3]) out.push({ t: m[3], c: "#f5b77a" });
    else if (m[4]) {
      const next = line.slice(re.lastIndex).trimStart()[0];
      if (KEYWORDS.has(m[4])) out.push({ t: m[4], c: "#c49bff" });
      else if (next === "(") out.push({ t: m[4], c: "#8ec5ff" });
      else if (/^[A-Z]/.test(m[4])) out.push({ t: m[4], c: "#f2d479" });
      else out.push({ t: m[4], c: "#dfe4ee" });
    } else if (m[5]) out.push({ t: m[5], c: "#dfe4ee" });
    else out.push({ t: m[6], c: "#8f98ab" });
  }
  return out;
}

export default function HeroDesk() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoundedBoxGeometry } = await import("three/examples/jsm/geometries/RoundedBoxGeometry.js");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return;
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;
      scene.environmentIntensity = 0.32;

      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
      const target = new THREE.Vector3(0, 0.72, 0.12);
      let narrow = false;

      // ---------- helpers ----------
      const mat = (color: string, o: Partial<import("three").MeshPhysicalMaterialParameters> = {}) =>
        new THREE.MeshPhysicalMaterial({ color, roughness: 0.75, metalness: 0, ...o });
      const disposables: { dispose: () => void }[] = [];
      const add = <T extends import("three").Object3D>(parent: import("three").Object3D, o: T, shadow = true) => {
        o.traverse((c) => {
          const m = c as import("three").Mesh;
          if (m.isMesh) {
            m.castShadow = shadow;
            m.receiveShadow = true;
            disposables.push(m.geometry);
          }
        });
        parent.add(o);
        return o;
      };
      const box = (w: number, h: number, d: number, r: number, m: import("three").Material) =>
        new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), m);
      const up = new THREE.Vector3(0, 1, 0);
      const tmp = new THREE.Vector3();
      // a cylinder stretched between two points (used for limbs); joints get spheres
      const limbGeo = new THREE.CylinderGeometry(1, 1, 1, 16);
      const jointGeo = new THREE.SphereGeometry(1, 16, 12);
      disposables.push(limbGeo, jointGeo);
      const limb = (m: import("three").Material, r: number) => {
        const mesh = new THREE.Mesh(limbGeo, m);
        mesh.castShadow = true;
        mesh.userData.r = r;
        return mesh;
      };
      const joint = (m: import("three").Material, r: number) => {
        const mesh = new THREE.Mesh(jointGeo, m);
        mesh.scale.setScalar(r);
        mesh.castShadow = true;
        return mesh;
      };
      const setLimb = (mesh: import("three").Mesh, a: import("three").Vector3, b: import("three").Vector3) => {
        tmp.subVectors(b, a);
        const len = tmp.length();
        const r = mesh.userData.r as number;
        mesh.position.copy(a).addScaledVector(tmp, 0.5);
        mesh.quaternion.setFromUnitVectors(up, tmp.normalize());
        mesh.scale.set(r, len, r);
      };

      // ---------- materials ----------
      const M = {
        wood: mat("#b8875c", { roughness: 0.55, clearcoat: 0.4, clearcoatRoughness: 0.5 }),
        metal: mat("#2a2e38", { roughness: 0.35, metalness: 0.7 }),
        monitor: mat("#1a1d25", { roughness: 0.4, metalness: 0.5 }),
        keyboard: mat("#2b2f3a", { roughness: 0.5 }),
        key: mat("#3c4150", { roughness: 0.55 }),
        chair: mat("#2c3140", { roughness: 0.6 }),
        seat: mat("#3a4257", { roughness: 0.9, sheen: 1, sheenColor: new THREE.Color("#6a7590") }),
        skin: mat("#c98a63", { roughness: 0.55, sheen: 0.3, sheenColor: new THREE.Color("#ffb38a") }),
        sweater: mat("#4c535f", { roughness: 0.95, sheen: 1, sheenRoughness: 0.6, sheenColor: new THREE.Color("#9aa3b6") }),
        pants: mat("#20232b", { roughness: 0.85 }),
        shoe: mat("#ebe7df", { roughness: 0.6 }),
        sole: mat("#9a948a", { roughness: 0.8 }),
        cap: mat("#4f7bb3", { roughness: 0.85, sheen: 0.6, sheenColor: new THREE.Color("#a9c6ef") }),
        hair: mat("#17120f", { roughness: 0.45, clearcoat: 0.3 }),
        eye: mat("#111317", { roughness: 0.2, clearcoat: 1 }),
        mug: mat("#ece7de", { roughness: 0.3, clearcoat: 0.6 }),
        coffee: mat("#3b2416", { roughness: 0.2 }),
        pot: mat("#d8cfc1", { roughness: 0.8 }),
        leaf: mat("#5c9b6d", { roughness: 0.6, sheen: 0.4, sheenColor: new THREE.Color("#a6e0b4") }),
        rug: mat("#161b2c", { roughness: 1 }),
        book1: mat("#7d8fd6"),
        book2: mat("#c96f5c"),
        book3: mat("#e2d3a6"),
      };
      Object.values(M).forEach((m) => disposables.push(m));

      const world = new THREE.Group();
      scene.add(world);

      // ---------- floor ----------
      const rugCv = document.createElement("canvas");
      rugCv.width = rugCv.height = 256;
      const rctx = rugCv.getContext("2d")!;
      const rg = rctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      rg.addColorStop(0, "#fff");
      rg.addColorStop(0.55, "#fff");
      rg.addColorStop(1, "#000");
      rctx.fillStyle = rg;
      rctx.fillRect(0, 0, 256, 256);
      const rugAlpha = new THREE.CanvasTexture(rugCv);
      disposables.push(rugAlpha);
      M.rug.alphaMap = rugAlpha;
      M.rug.transparent = true;
      M.rug.depthWrite = false;
      const rug = new THREE.Mesh(new THREE.CircleGeometry(1.6, 64), M.rug);
      rug.rotation.x = -Math.PI / 2;
      rug.receiveShadow = true;
      disposables.push(rug.geometry);
      world.add(rug);
      const catcher = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.35 }));
      catcher.rotation.x = -Math.PI / 2;
      catcher.position.y = -0.001;
      catcher.receiveShadow = true;
      disposables.push(catcher.geometry, catcher.material as import("three").Material);
      world.add(catcher);

      // ---------- desk ----------
      const desk = new THREE.Group();
      world.add(desk);
      const top = box(1.55, 0.05, 0.74, 0.02, M.wood);
      top.position.set(0, 0.755, -0.05);
      add(desk, top);
      for (const [x, z] of [[-0.72, -0.37], [0.72, -0.37], [-0.72, 0.27], [0.72, 0.27]]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.73, 12), M.metal);
        leg.position.set(x, 0.365, z);
        add(desk, leg);
      }

      // monitor
      const mon = new THREE.Group();
      mon.position.set(0.02, 0.78, -0.3);
      mon.rotation.y = 0.38; // angled a little toward the viewer
      desk.add(mon);
      const base = box(0.22, 0.015, 0.15, 0.007, M.monitor);
      base.position.y = 0.008;
      add(mon, base);
      const neck = box(0.04, 0.2, 0.03, 0.01, M.monitor);
      neck.position.set(0, 0.11, -0.02);
      add(mon, neck);
      const bezel = box(0.78, 0.46, 0.028, 0.012, M.monitor);
      bezel.position.set(0, 0.33, 0);
      add(mon, bezel);

      // code screen texture
      const cv = document.createElement("canvas");
      cv.width = 1024;
      cv.height = 592;
      const ctx = cv.getContext("2d")!;
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      const screenMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
      disposables.push(tex, screenMat);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.428), screenMat);
      screen.position.set(0, 0.33, 0.0145);
      disposables.push(screen.geometry);
      mon.add(screen);
      const glow = new THREE.PointLight("#88a6ff", 1.6, 2.2, 2);
      glow.position.set(0, 1.12, 0.05);
      world.add(glow);

      // keyboard with keys
      const kb = new THREE.Group();
      kb.position.set(0, 0.78, 0.08);
      desk.add(kb);
      add(kb, box(0.46, 0.022, 0.15, 0.008, M.keyboard));
      const KX = 14, KZ = 4;
      const keyGeo = new RoundedBoxGeometry(0.026, 0.012, 0.026, 2, 0.004);
      disposables.push(keyGeo);
      const keys = new THREE.InstancedMesh(keyGeo, M.key, KX * KZ);
      keys.castShadow = true;
      const keyDown = new Float32Array(KX * KZ);
      const dummy = new THREE.Object3D();
      const placeKeys = () => {
        for (let i = 0; i < KX; i++)
          for (let j = 0; j < KZ; j++) {
            const k = i * KZ + j;
            dummy.position.set(-0.2 + i * 0.0308, 0.014 - keyDown[k] * 0.006, -0.05 + j * 0.032);
            dummy.updateMatrix();
            keys.setMatrixAt(k, dummy.matrix);
          }
        keys.instanceMatrix.needsUpdate = true;
      };
      placeKeys();
      kb.add(keys);

      const mouse = box(0.06, 0.022, 0.1, 0.011, M.keyboard);
      mouse.position.set(0.34, 0.79, 0.1);
      add(desk, mouse);

      // mug + steam
      const mug = new THREE.Group();
      mug.position.set(-0.45, 0.78, 0.02);
      desk.add(mug);
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 24, 1, true), M.mug);
      cup.position.y = 0.05;
      (cup.material as import("three").Material).side = THREE.DoubleSide;
      add(mug, cup);
      const cupBottom = new THREE.Mesh(new THREE.CircleGeometry(0.04, 24), M.mug);
      cupBottom.rotation.x = -Math.PI / 2;
      cupBottom.position.y = 0.002;
      add(mug, cupBottom);
      const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.043, 24), M.coffee);
      coffee.rotation.x = -Math.PI / 2;
      coffee.position.y = 0.085;
      add(mug, coffee, false);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.008, 10, 20, Math.PI * 1.2), M.mug);
      handle.position.set(-0.05, 0.05, 0);
      handle.rotation.z = Math.PI * 0.4;
      add(mug, handle);

      const steamCv = document.createElement("canvas");
      steamCv.width = steamCv.height = 64;
      const sctx = steamCv.getContext("2d")!;
      const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,0.9)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, 64, 64);
      const steamTex = new THREE.CanvasTexture(steamCv);
      disposables.push(steamTex);
      const steam = Array.from({ length: 7 }, (_, i) => {
        const sm = new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0 });
        disposables.push(sm);
        const s = new THREE.Sprite(sm);
        s.userData.phase = i / 7;
        mug.add(s);
        return s;
      });

      // plant
      const plant = new THREE.Group();
      plant.position.set(0.6, 0.78, -0.25);
      desk.add(plant);
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.1, 24), M.pot);
      pot.position.y = 0.05;
      add(plant, pot);
      const leaves = new THREE.Group();
      leaves.position.y = 0.1;
      plant.add(leaves);
      const leafGeo = new THREE.SphereGeometry(1, 16, 10);
      disposables.push(leafGeo);
      for (let i = 0; i < 9; i++) {
        const lf = new THREE.Mesh(leafGeo, M.leaf);
        const a = (i / 9) * Math.PI * 2;
        const tilt = 0.5 + (i % 3) * 0.25;
        lf.scale.set(0.022, 0.1, 0.008);
        lf.position.set(Math.cos(a) * 0.03, 0.08 + (i % 3) * 0.02, Math.sin(a) * 0.03);
        lf.rotation.set(Math.sin(a) * tilt, -a, -Math.cos(a) * tilt);
        lf.castShadow = true;
        leaves.add(lf);
      }

      // books
      const books = new THREE.Group();
      books.position.set(-0.6, 0.78, -0.3);
      books.rotation.y = 0.25;
      desk.add(books);
      [M.book1, M.book2, M.book3].forEach((m, i) => {
        const b = box(0.2 - i * 0.015, 0.032, 0.14, 0.004, m);
        b.position.y = 0.016 + i * 0.033;
        b.rotation.y = (i - 1) * 0.12;
        add(books, b);
      });

      // ---------- chair ----------
      const chair = new THREE.Group();
      chair.position.set(0, 0, 0.66);
      world.add(chair);
      const seat = box(0.5, 0.07, 0.47, 0.03, M.seat);
      seat.position.y = 0.47;
      add(chair, seat);
      const back = box(0.44, 0.34, 0.06, 0.03, M.seat);
      back.position.set(0, 0.72, 0.25);
      back.rotation.x = -0.12;
      add(chair, back);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 12), M.metal);
      pole.position.y = 0.26;
      add(chair, pole);
      for (let i = 0; i < 5; i++) {
        const arm = box(0.3, 0.03, 0.04, 0.012, M.chair);
        const a = (i / 5) * Math.PI * 2;
        arm.position.set(Math.cos(a) * 0.15, 0.06, Math.sin(a) * 0.15);
        arm.rotation.y = -a;
        add(chair, arm);
        const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 8), M.metal);
        wheel.position.set(Math.cos(a) * 0.29, 0.025, Math.sin(a) * 0.29);
        add(chair, wheel);
      }

      // ---------- character ----------
      const guy = new THREE.Group();
      world.add(guy);

      const pelvis = new THREE.Vector3(0, 0.58, 0.66);
      const torsoGroup = new THREE.Group();
      torsoGroup.position.copy(pelvis);
      guy.add(torsoGroup);
      // torso leans forward toward the desk
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.24, 8, 20), M.sweater);
      torso.position.set(0, 0.22, -0.04);
      torso.rotation.x = -0.22;
      torso.scale.set(1.05, 1, 0.78);
      torso.castShadow = true;
      disposables.push(torso.geometry);
      torsoGroup.add(torso);
      // knit collar
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.025, 10, 24), M.sweater);
      collar.position.set(0, 0.46, -0.12);
      collar.rotation.x = Math.PI / 2 - 0.25;
      collar.castShadow = true;
      disposables.push(collar.geometry);
      torsoGroup.add(collar);

      const headGroup = new THREE.Group();
      headGroup.position.set(0, 0.5, -0.13);
      torsoGroup.add(headGroup);
      const neckM = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 16), M.skin);
      neckM.position.y = 0.02;
      disposables.push(neckM.geometry);
      headGroup.add(neckM);
      const head = new THREE.Group();
      head.position.set(0, 0.14, -0.01);
      headGroup.add(head);
      const skull = new THREE.Mesh(new THREE.SphereGeometry(0.105, 32, 24), M.skin);
      skull.scale.set(0.92, 1.05, 1);
      skull.castShadow = true;
      disposables.push(skull.geometry);
      head.add(skull);
      for (const s of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), M.skin);
        ear.scale.set(0.5, 1, 0.8);
        ear.position.set(s * 0.096, 0, 0.005);
        disposables.push(ear.geometry);
        head.add(ear);
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.011, 12, 10), M.eye);
        eye.position.set(s * 0.035, 0.01, -0.097);
        disposables.push(eye.geometry);
        head.add(eye);
      }
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 10), M.skin);
      nose.position.set(0, -0.015, -0.104);
      disposables.push(nose.geometry);
      head.add(nose);
      // hair: back of head + long hair falling to the shoulders
      // hair showing under the cap at the back and sides
      const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.108, 28, 16, Math.PI / 2 - 1.35, 2.7, Math.PI * 0.4, Math.PI * 0.32), M.hair);
      hairBack.position.set(0, -0.005, 0.014);
      hairBack.scale.set(1.02, 1, 1.04);
      disposables.push(hairBack.geometry);
      head.add(hairBack);
      const hairLong = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.13, 6, 16), M.hair);
      hairLong.position.set(0, -0.1, 0.085);
      hairLong.rotation.x = 0.3;
      hairLong.scale.set(1.2, 1, 0.55);
      hairLong.castShadow = true;
      disposables.push(hairLong.geometry);
      head.add(hairLong);
      // blue cap with brim
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.114, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), M.cap);
      cap.position.y = 0.01;
      cap.scale.set(0.97, 0.95, 1.02);
      cap.castShadow = true;
      disposables.push(cap.geometry);
      head.add(cap);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 24, 1, false, Math.PI / 2, Math.PI), M.cap);
      brim.position.set(0, 0.012, -0.098);
      brim.scale.set(1.15, 1, 1.05);
      brim.rotation.x = 0.16;
      brim.castShadow = true;
      disposables.push(brim.geometry);
      head.add(brim);
      const button = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), M.cap);
      button.position.y = 0.122;
      disposables.push(button.geometry);
      head.add(button);

      // arms (shoulder → elbow → hand), rebuilt every frame for typing
      const shoulder = [new THREE.Vector3(-0.17, 1.0, 0.56), new THREE.Vector3(0.17, 1.0, 0.56)];
      const elbow = [new THREE.Vector3(-0.23, 0.82, 0.4), new THREE.Vector3(0.23, 0.82, 0.4)];
      const handBase = [new THREE.Vector3(-0.09, 0.815, 0.13), new THREE.Vector3(0.09, 0.815, 0.13)];
      const upperArm = [limb(M.sweater, 0.048), limb(M.sweater, 0.048)];
      const foreArm = [limb(M.sweater, 0.042), limb(M.sweater, 0.042)];
      const hands = [0, 1].map(() => {
        const h = new THREE.Mesh(new THREE.SphereGeometry(0.036, 16, 12), M.skin);
        h.scale.set(1, 0.6, 1.25);
        h.castShadow = true;
        disposables.push(h.geometry);
        return h;
      });
      const elbowBalls = [joint(M.sweater, 0.046), joint(M.sweater, 0.046)];
      const wrists = [joint(M.sweater, 0.043), joint(M.sweater, 0.043)];
      [...upperArm, ...foreArm, ...hands, ...elbowBalls, ...wrists].forEach((m) => guy.add(m));
      const shoulderBalls = [0, 1].map((i) => {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), M.sweater);
        s.position.copy(shoulder[i]);
        s.castShadow = true;
        disposables.push(s.geometry);
        guy.add(s);
        return s;
      });

      // legs: hip → knee → ankle
      for (const sx of [-1, 1]) {
        const hip = new THREE.Vector3(sx * 0.09, 0.56, 0.66);
        const knee = new THREE.Vector3(sx * 0.1, 0.56, 0.32);
        const ankle = new THREE.Vector3(sx * 0.11, 0.09, 0.34);
        const thigh = limb(M.pants, 0.068);
        setLimb(thigh, hip, knee);
        const shin = limb(M.pants, 0.055);
        setLimb(shin, knee, ankle);
        guy.add(thigh, shin);
        const kneeBall = joint(M.pants, 0.062);
        kneeBall.position.copy(knee);
        const hipBall = joint(M.pants, 0.07);
        hipBall.position.copy(hip);
        guy.add(kneeBall, hipBall);
        const shoe = box(0.1, 0.07, 0.2, 0.03, M.shoe);
        shoe.position.set(sx * 0.11, 0.045, 0.3);
        add(guy, shoe);
        const sole = box(0.104, 0.02, 0.205, 0.008, M.sole);
        sole.position.set(sx * 0.11, 0.012, 0.3);
        add(guy, sole);
      }

      // ---------- lights ----------
      scene.add(new THREE.HemisphereLight("#bcc8ff", "#16181f", 0.9));
      const key = new THREE.DirectionalLight("#fff1e2", 2.4);
      key.position.set(2.2, 3.6, 2.2);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -1.6;
      key.shadow.camera.right = 1.6;
      key.shadow.camera.top = 1.6;
      key.shadow.camera.bottom = -1.6;
      key.shadow.bias = -0.0005;
      key.shadow.normalBias = 0.02;
      key.shadow.radius = 4;
      scene.add(key);
      const rim = new THREE.DirectionalLight("#a291ff", 1.8);
      rim.position.set(-2.5, 2.2, -2.2);
      scene.add(rim);

      // ---------- code screen ----------
      const mono = "600 27px ui-monospace, Menlo, Consolas, 'DejaVu Sans Mono', monospace";
      let snip = 0;
      let typed = 0; // characters shown on screen
      let typedF = 0; // fractional typing progress
      let lastDrawn = -1;
      let lastBlink = -1;
      const LINE_H = 34;
      const VISIBLE = 14;
      const drawScreen = (t: number) => {
        const blink = Math.floor(t * 2.2) % 2;
        if (typed === lastDrawn && blink === lastBlink) return;
        lastDrawn = typed;
        lastBlink = blink;
        const W = cv.width, H = cv.height;
        ctx.fillStyle = "#0e1117";
        ctx.fillRect(0, 0, W, H);
        // title bar
        ctx.fillStyle = "#161a22";
        ctx.fillRect(0, 0, W, 42);
        ["#ff6b62", "#f6c046", "#35c759"].forEach((c, i) => {
          ctx.fillStyle = c;
          ctx.beginPath();
          ctx.arc(24 + i * 22, 21, 7, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.fillStyle = "#0e1117";
        ctx.fillRect(110, 8, 230, 34);
        ctx.font = "500 19px ui-sans-serif, system-ui, sans-serif";
        ctx.fillStyle = "#c9d1e0";
        ctx.fillText(SNIPPETS[snip].file, 128, 31);
        // sidebar
        ctx.fillStyle = "#12151c";
        ctx.fillRect(0, 42, 52, H - 42);

        const text = SNIPPETS[snip].code.slice(0, typed);
        const lines = text.split("\n");
        const first = Math.max(0, lines.length - VISIBLE);
        ctx.font = mono;
        ctx.textBaseline = "alphabetic";
        for (let li = first; li < lines.length; li++) {
          const y = 82 + (li - first) * LINE_H;
          ctx.fillStyle = "#4a5266";
          ctx.textAlign = "right";
          ctx.fillText(String(li + 1), 44, y);
          ctx.textAlign = "left";
          let x = 76;
          for (const tok of tokenize(lines[li])) {
            ctx.fillStyle = tok.c;
            ctx.fillText(tok.t, x, y);
            x += ctx.measureText(tok.t).width;
          }
          if (li === lines.length - 1 && blink) {
            ctx.fillStyle = "#8ea6ff";
            ctx.fillRect(x + 2, y - 24, 14, 30);
          }
        }
        // status bar
        ctx.fillStyle = "#3b4fb8";
        ctx.fillRect(0, H - 28, W, 28);
        ctx.font = "500 16px ui-sans-serif, system-ui, sans-serif";
        ctx.fillStyle = "#e9edff";
        ctx.fillText(`Ln ${lines.length}, Col ${lines[lines.length - 1].length + 1}    UTF-8    ${SNIPPETS[snip].file.endsWith(".py") ? "Python" : "TypeScript React"}`, 16, H - 9);
        tex.needsUpdate = true;
      };

      // ---------- interaction ----------
      const pointer = { x: 0, y: 0, tx: 0, ty: 0, inside: false };
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
        pointer.inside = pointer.tx > -1.1 && pointer.tx < 1.1 && pointer.ty > -1.1 && pointer.ty < 1.1;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      const resize = () => {
        const w = el.clientWidth, h = el.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        narrow = w / h < 1.1;
        camera.fov = narrow ? 34 : 28;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(el);

      // ---------- animation ----------
      let mode: "type" | "think" = "type";
      let modeUntil = 7;
      let lookYaw = 0, lookPitch = 0, lean = 0, nextKey = 0;
      const clock = new THREE.Clock();
      const handPos = [new THREE.Vector3(), new THREE.Vector3()];

      const step = (dt: number, t: number) => {
        pointer.x += (pointer.tx - pointer.x) * 0.05;
        pointer.y += (pointer.ty - pointer.y) * 0.05;

        if (t > modeUntil) {
          mode = mode === "type" ? "think" : "type";
          modeUntil = t + (mode === "type" ? 6 + Math.random() * 4 : 2.2 + Math.random() * 1.2);
        }
        const typing = mode === "type";

        // code progress
        if (typing) {
          typedF += dt * 26;
          // after a snippet is finished, hold it briefly, then start the next file
          if (typedF >= SNIPPETS[snip].code.length + 40) {
            snip = (snip + 1) % SNIPPETS.length;
            typedF = 0;
          }
        }
        typed = Math.min(Math.floor(typedF), SNIPPETS[snip].code.length);
        drawScreen(t);

        // keys
        if (typing && t > nextKey) {
          keyDown[Math.floor(Math.random() * keyDown.length)] = 1;
          nextKey = t + 0.05 + Math.random() * 0.07;
        }
        for (let k = 0; k < keyDown.length; k++) keyDown[k] = Math.max(0, keyDown[k] - dt * 9);
        placeKeys();

        // posture
        const wantLean = typing ? 0 : 0.09;
        lean += (wantLean - lean) * Math.min(1, dt * 3);
        const breath = Math.sin(t * 1.7) * 0.006;
        torsoGroup.rotation.x = lean;
        torsoGroup.position.y = pelvis.y + breath;

        // head: toward the screen, or at your cursor when you point at the scene
        let wantYaw = typing ? Math.sin(t * 0.7) * 0.05 : 0.18;
        let wantPitch = typing ? 0.22 : -0.05;
        if (pointer.inside) {
          wantYaw = Math.max(-0.9, Math.min(0.9, pointer.x * 0.9 + 0.35));
          wantPitch = Math.max(-0.3, Math.min(0.3, pointer.y * 0.35));
        }
        lookYaw += (wantYaw - lookYaw) * Math.min(1, dt * 4);
        lookPitch += (wantPitch - lookPitch) * Math.min(1, dt * 4);
        head.rotation.y = -lookYaw;
        head.rotation.x = lookPitch + (typing ? Math.sin(t * 9) * 0.008 : 0);
        head.rotation.z = typing ? 0 : Math.sin(t * 1.3) * 0.08;

        // arms: hands bob while typing, rest when thinking
        for (let i = 0; i < 2; i++) {
          const ph = i * 1.9;
          const bob = typing ? Math.max(0, Math.sin(t * 15 + ph)) * 0.014 : 0;
          const drift = typing ? Math.sin(t * 2.3 + ph) * 0.03 : 0;
          handPos[i].copy(handBase[i]);
          handPos[i].x += drift;
          handPos[i].y += bob;
          if (!typing) {
            handPos[i].z += 0.06;
            handPos[i].y -= 0.005;
          }
          const sh = tmp.copy(shoulder[i]);
          sh.y += breath;
          sh.z += lean * 0.6;
          shoulderBalls[i].position.copy(sh);
          const el2 = elbow[i].clone();
          el2.z += lean * 0.5;
          setLimb(upperArm[i], sh.clone(), el2);
          setLimb(foreArm[i], el2, handPos[i]);
          elbowBalls[i].position.copy(el2);
          wrists[i].position.lerpVectors(el2, handPos[i], 0.86);
          hands[i].position.copy(handPos[i]);
          hands[i].position.y += 0.006;
        }

        // steam
        steam.forEach((s) => {
          const p = (t * 0.35 + s.userData.phase) % 1;
          s.position.set(Math.sin(p * 6 + s.userData.phase * 10) * 0.015, 0.1 + p * 0.22, 0);
          const sc = 0.03 + p * 0.07;
          s.scale.set(sc, sc, sc);
          (s.material as import("three").SpriteMaterial).opacity = Math.sin(p * Math.PI) * 0.22;
        });
        leaves.rotation.z = Math.sin(t * 0.9) * 0.04;
        leaves.rotation.x = Math.sin(t * 0.7 + 1) * 0.03;
        glow.intensity = 1.4 + Math.sin(t * 3) * 0.06;

        // camera: three-quarter view that drifts with the pointer
        const ang = 0.98 + pointer.x * 0.16;
        const dist = 4.5;
        camera.position.set(Math.sin(ang) * dist, 2.0 - pointer.y * 0.18, Math.cos(ang) * dist);
        camera.lookAt(target);

        renderer.render(scene, camera);
      };

      let raf = 0;
      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!visible || document.hidden) return;
        step(Math.min(clock.getDelta(), 0.05), clock.elapsedTime);
      };
      if (reduced) {
        typedF = 420;
        step(0, 3);
      } else frame();
      requestAnimationFrame(() => (el.dataset.ready = "true"));

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        ro.disconnect();
        io.disconnect();
        disposables.forEach((d) => d.dispose());
        keys.dispose();
        env.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={host} className="desk-stage" aria-hidden />;
}
