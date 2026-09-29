// virtual:index.js
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
var PAGES = ["hero", "about", "skills", "work", "contact"];
var PAGE_DEPTH = 80;
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
var root = document.getElementById("root") ?? document.body;
root.appendChild(renderer.domElement);
var scene = new THREE.Scene();
scene.background = new THREE.Color(0);
scene.fog = new THREE.FogExp2(0, 9e-3);
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 600);
camera.position.set(0, 8, 32);
camera.lookAt(0, 4, 0);
var composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
var bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.35, 0.4, 0.88);
composer.addPass(bloom);
var fxaa = new ShaderPass(FXAAShader);
fxaa.uniforms["resolution"].value.set(1 / window.innerWidth, 1 / window.innerHeight);
composer.addPass(fxaa);
var ambient = new THREE.AmbientLight(16777215, 0.48);
ambient.name = "amb";
scene.add(ambient);
function addDirLight(x, y, z, intensity, name) {
  const l = new THREE.DirectionalLight(16777215, intensity);
  l.name = name;
  l.position.set(x, y, z);
  l.castShadow = true;
  l.shadow.mapSize.set(1024, 1024);
  l.shadow.camera.near = 0.1;
  l.shadow.camera.far = 300;
  l.shadow.camera.left = -80;
  l.shadow.camera.right = 80;
  l.shadow.camera.top = 60;
  l.shadow.camera.bottom = -20;
  l.shadow.bias = -1e-3;
  l.shadow.normalBias = 0.02;
  scene.add(l);
  return l;
}
addDirLight(10, 30, 10, 3, "dir1");
addDirLight(-15, 20, -10, 1.2, "rim1");
var accentLight = new THREE.PointLight(14221118, 28, 70, 2);
accentLight.position.set(0, 12, 12);
scene.add(accentLight);
var whiteMat = new THREE.MeshStandardMaterial({ color: 16777215, roughness: 0.18, metalness: 0.12 });
var darkMat = new THREE.MeshStandardMaterial({ color: 1118481, roughness: 0.55, metalness: 0.05 });
var greyMat = new THREE.MeshStandardMaterial({ color: 10066329, roughness: 0.3, metalness: 0.1 });
var mirrorMat = new THREE.MeshStandardMaterial({ color: 16777215, roughness: 0, metalness: 1 });
var accentMat = new THREE.MeshStandardMaterial({ color: 14221118, emissive: 2636800, emissiveIntensity: 0.35, roughness: 0.24, metalness: 0.35 });
var groundGeo = new THREE.PlaneGeometry(300, PAGE_DEPTH * (PAGES.length + 1));
var groundMesh = new THREE.Mesh(groundGeo, darkMat);
groundMesh.name = "masterGround";
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.position.z = -PAGE_DEPTH * (PAGES.length - 1) / 2;
groundMesh.receiveShadow = true;
scene.add(groundMesh);
var allColumns = [];
var colIdx = 0;
function addCol(x, y, z, h, w, matChoice) {
  const geo = new THREE.BoxGeometry(w, h, w);
  const mat = matChoice === 0 ? whiteMat : matChoice === 1 ? greyMat : darkMat;
  const m = new THREE.Mesh(geo, mat);
  m.name = `col_${colIdx++}`;
  m.position.set(x, h / 2 + y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  m.userData.baseY = h / 2 + y;
  scene.add(m);
  allColumns.push(m);
  return m;
}
(function buildHero() {
  const oz = 0;
  const halo = new THREE.Mesh(new THREE.TorusGeometry(10.5, 0.08, 12, 180), accentMat);
  halo.name = "heroHalo";
  halo.position.set(0, 9, -7);
  halo.rotation.x = Math.PI / 2.3;
  scene.add(halo);
  const n = 36;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1) * 2 - 1;
    const x = t * 30;
    const z = oz - Math.abs(t) * 8 - 2;
    const h = THREE.MathUtils.lerp(7, 26, 1 - Math.abs(t) * 0.85) + Math.random() * 4;
    const w = 0.9 + Math.random() * 0.35;
    addCol(x, 0, z, h, w, i % 2 === 0 ? 0 : 1);
  }
  for (let row = 1; row <= 4; row++) {
    const nn = 16 - row * 2;
    for (let i = 0; i < nn; i++) {
      const t = i / (nn - 1) * 2 - 1;
      const x = t * (24 - row * 2);
      const z = oz - 12 - row * 8;
      const h = 3 + Math.random() * 16;
      addCol(x, 0, z, h, 0.7 + Math.random() * 0.4, Math.random() > 0.5 ? 0 : 1);
    }
  }
  for (let i = 0; i < 30; i++) {
    const x = THREE.MathUtils.randFloatSpread(55);
    const z = oz + THREE.MathUtils.randFloat(2, 14);
    const h = 0.5 + Math.random() * 4;
    addCol(x, 0, z, h, 0.18 + Math.random() * 0.18, 1);
  }
})();
(function buildAbout() {
  const oz = -PAGE_DEPTH;
  const sGeo = new THREE.SphereGeometry(5, 64, 64);
  const sMesh = new THREE.Mesh(sGeo, whiteMat);
  sMesh.name = "aboutSphere";
  sMesh.position.set(0, 8, oz);
  sMesh.castShadow = true;
  scene.add(sMesh);
  const rGeo = new THREE.TorusGeometry(9, 0.12, 16, 120);
  const rMesh = new THREE.Mesh(rGeo, greyMat);
  rMesh.name = "aboutRing1";
  rMesh.position.set(0, 8, oz);
  rMesh.rotation.x = Math.PI / 2.5;
  scene.add(rMesh);
  const rGeo2 = new THREE.TorusGeometry(12, 0.07, 12, 100);
  const rMesh2 = new THREE.Mesh(rGeo2, greyMat);
  rMesh2.name = "aboutRing2";
  rMesh2.position.set(0, 8, oz);
  rMesh2.rotation.x = Math.PI / 3;
  rMesh2.rotation.z = 0.4;
  scene.add(rMesh2);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    const sg = new THREE.SphereGeometry(0.5 + Math.random() * 0.4, 16, 16);
    const sm = new THREE.Mesh(sg, i % 2 === 0 ? whiteMat : greyMat);
    sm.name = `aboutOrb_${i}`;
    sm.position.set(Math.cos(a) * 9, 8 + Math.sin(a) * 3.5, oz + Math.sin(a) * 2);
    sm.userData.orbitAngle = a;
    sm.userData.orbitR = 9;
    sm.userData.orbitCenterZ = oz;
    sm.castShadow = true;
    scene.add(sm);
  }
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2;
    const r = 18 + Math.random() * 6;
    const x = Math.cos(a) * r;
    const z = oz + Math.sin(a) * r * 0.5;
    const h = 4 + Math.random() * 20;
    addCol(x, 0, z, h, 0.6 + Math.random() * 0.5, i % 3 === 0 ? 0 : 1);
  }
})();
(function buildSkills() {
  const oz = -PAGE_DEPTH * 2;
  const helixCount = 40;
  for (let i = 0; i < helixCount; i++) {
    const frac = i / helixCount;
    const angle1 = frac * Math.PI * 6;
    const angle2 = angle1 + Math.PI;
    const r = 5;
    const y = frac * 28;
    const size = 0.35 + Math.sin(frac * Math.PI) * 0.25;
    const g = new THREE.SphereGeometry(size, 12, 12);
    const m1 = new THREE.Mesh(g, whiteMat);
    m1.name = `helix1_${i}`;
    m1.position.set(Math.cos(angle1) * r, y, oz + Math.sin(angle1) * r);
    m1.castShadow = true;
    scene.add(m1);
    const m2 = new THREE.Mesh(g, greyMat);
    m2.name = `helix2_${i}`;
    m2.position.set(Math.cos(angle2) * r, y, oz + Math.sin(angle2) * r);
    m2.castShadow = true;
    scene.add(m2);
    if (i % 3 === 0) {
      const dx = m2.position.x - m1.position.x;
      const dz = m2.position.z - m1.position.z;
      const len = Math.sqrt(dx * dx + dz * dz);
      const barGeo = new THREE.CylinderGeometry(0.06, 0.06, len, 6);
      const bar = new THREE.Mesh(barGeo, greyMat);
      bar.name = `helixBar_${i}`;
      bar.position.set(
        (m1.position.x + m2.position.x) / 2,
        y,
        (m1.position.z + m2.position.z) / 2
      );
      bar.rotation.z = Math.PI / 2;
      bar.rotation.y = Math.atan2(dz, dx);
      scene.add(bar);
    }
  }
  for (let i = 0; i < 20; i++) {
    const side = i < 10 ? 1 : -1;
    const x = side * (12 + Math.random() * 12);
    const z = oz + THREE.MathUtils.randFloatSpread(30);
    const h = 4 + Math.random() * 22;
    addCol(x, 0, z, h, 0.5 + Math.random() * 0.4, i % 2 === 0 ? 0 : 1);
  }
})();
(function buildWork() {
  const oz = -PAGE_DEPTH * 3;
  const archW = 20, archH = 18, archD = 2;
  const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(archD, archH, archD), whiteMat);
  leftPillar.name = "archLeft";
  leftPillar.position.set(-archW / 2, archH / 2, oz);
  leftPillar.castShadow = true;
  scene.add(leftPillar);
  const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(archD, archH, archD), whiteMat);
  rightPillar.name = "archRight";
  rightPillar.position.set(archW / 2, archH / 2, oz);
  rightPillar.castShadow = true;
  scene.add(rightPillar);
  const topBeam = new THREE.Mesh(new THREE.BoxGeometry(archW + archD, archD, archD), whiteMat);
  topBeam.name = "archTop";
  topBeam.position.set(0, archH, oz);
  topBeam.castShadow = true;
  scene.add(topBeam);
  const shapes = [
    { geo: new THREE.BoxGeometry(3, 3, 3), x: -14, y: 10, z: oz + 5 },
    { geo: new THREE.OctahedronGeometry(2.2), x: -7, y: 13, z: oz + 3 },
    { geo: new THREE.IcosahedronGeometry(2), x: 0, y: 16, z: oz + 8 },
    { geo: new THREE.TetrahedronGeometry(2.4), x: 7, y: 11, z: oz + 4 },
    { geo: new THREE.BoxGeometry(2.5, 2.5, 2.5), x: 14, y: 14, z: oz + 6 },
    { geo: new THREE.DodecahedronGeometry(2), x: -10, y: 6, z: oz + 10 },
    { geo: new THREE.OctahedronGeometry(1.5), x: 10, y: 7, z: oz + 9 }
  ];
  shapes.forEach((s, i) => {
    const m = new THREE.Mesh(s.geo, i % 2 === 0 ? whiteMat : greyMat);
    m.name = `workShape_${i}`;
    m.position.set(s.x, s.y, s.z);
    m.userData.floatOffset = i * 0.7;
    m.userData.rotAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    m.castShadow = true;
    scene.add(m);
  });
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2;
    const len = 14 + Math.random() * 12;
    const rodGeo = new THREE.BoxGeometry(0.08, 0.08, len);
    const rod = new THREE.Mesh(rodGeo, greyMat);
    rod.name = `workRod_${i}`;
    rod.position.set(Math.cos(a) * len / 2, 0.04, oz + Math.sin(a) * len / 2);
    rod.rotation.y = -a;
    scene.add(rod);
  }
})();
(function buildContact() {
  const oz = -PAGE_DEPTH * 4;
  const obeliskGeo = new THREE.CylinderGeometry(0.01, 2.5, 38, 4);
  const obelisk = new THREE.Mesh(obeliskGeo, whiteMat);
  obelisk.name = "obelisk";
  obelisk.position.set(0, 19, oz);
  obelisk.rotation.y = Math.PI / 4;
  obelisk.castShadow = true;
  scene.add(obelisk);
  for (let i = 0; i < 30; i++) {
    const a = i / 30 * Math.PI * 2;
    const r = 8 + Math.random() * 16;
    const h = 3 + Math.random() * 22;
    const topR = Math.random() * 0.5;
    const botR = 0.3 + Math.random() * 1.2;
    const seg = Math.random() > 0.5 ? 3 : 4;
    const geo = new THREE.CylinderGeometry(topR, botR, h, seg);
    const m = new THREE.Mesh(geo, i % 3 === 0 ? whiteMat : i % 3 === 1 ? greyMat : mirrorMat);
    m.name = `crystal_${i}`;
    m.position.set(Math.cos(a) * r, h / 2, oz + Math.sin(a) * r * 0.7);
    m.rotation.y = Math.random() * Math.PI;
    m.castShadow = true;
    scene.add(m);
  }
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    const plateGeo = new THREE.BoxGeometry(0.08, 6, 4);
    const plate = new THREE.Mesh(plateGeo, mirrorMat);
    plate.name = `contactPlate_${i}`;
    plate.position.set(Math.cos(a) * 11, 10 + Math.sin(i) * 3, oz + Math.sin(a) * 5);
    plate.rotation.y = a + Math.PI / 4;
    plate.userData.floatOffset = i * 0.9;
    plate.castShadow = true;
    scene.add(plate);
  }
})();
var style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;600;700;900&display=swap');
  :root { --accent: #d9ff3f; --line: rgba(255,255,255,0.16); }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow: hidden; font-family: 'Inter', sans-serif; background: #000; color: #fff; }
  ::selection { background: var(--accent); color: #050505; }

  #atmosphere {
    position: fixed; inset: 0; z-index: 80; pointer-events: none;
    background:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px),
      radial-gradient(circle at 50% 42%, transparent 18%, rgba(0,0,0,0.36) 68%, rgba(0,0,0,0.72) 100%);
    background-size: 72px 72px, 72px 72px, 100% 100%;
  }
  #atmosphere::after {
    content: ''; position: absolute; inset: 0; opacity: 0.12;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.6'/%3E%3C/svg%3E");
  }

  /* \u2500\u2500 NAV \u2500\u2500 */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 34px; background: linear-gradient(to bottom, rgba(0,0,0,0.72), transparent);
  }
  .nav-logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 14px; cursor: pointer; }
  .nav-mark { width: 8px; height: 8px; background: var(--accent); box-shadow: 0 0 18px rgba(217,255,63,0.7); }
  .nav-links { display: flex; gap: 36px; }
  .nav-link {
    font-size: 12px; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase;
    color: #fff; cursor: pointer; transition: color 0.2s, opacity 0.2s;
    user-select: none;
  }
  .nav-link::after { content: ''; display: block; width: 0; height: 1px; margin-top: 5px; background: var(--accent); transition: width 0.25s ease; }
  .nav-link:hover, .nav-link.active { color: #fff; opacity: 1; }
  .nav-link:hover::after, .nav-link.active::after { width: 100%; }
  .nav-invert {
    font-size: 11px; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(255,255,255,0.45); cursor: pointer; transition: color 0.2s;
    padding: 7px 14px; border: 1px solid rgba(255,255,255,0.25);
  }
  .nav-invert:hover { color: #fff; border-color: #fff; }

  /* \u2500\u2500 PROGRESS BAR \u2500\u2500 */
  #progressBar {
    position: fixed; top: 0; left: 0; height: 2px;
    background: var(--accent); width: 0%; box-shadow: 0 0 14px rgba(217,255,63,0.65);
    z-index: 300; transition: width 0.1s;
  }

  /* \u2500\u2500 SECTION LABEL \u2500\u2500 */
  #sectionLabel {
    position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
    z-index: 200; text-align: center; pointer-events: none;
  }
  #sectionLabel .label-name {
    font-size: clamp(10px, 1.2vw, 14px); font-weight: 300; letter-spacing: 0.35em;
    text-transform: uppercase; color: rgba(255,255,255,0.35);
  }
  #sectionLabel .label-hint {
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(255,255,255,0.2); margin-top: 6px;
    animation: pulse 2.5s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:0.2} 50%{opacity:0.7} }

  /* \u2500\u2500 HERO \u2500\u2500 */
  #heroUI {
    position: fixed; top: 45%; left: 50%; transform: translate(-50%, -50%);
    width: min(92vw, 1100px);
    text-align: center; pointer-events: none; z-index: 100; user-select: none;
    transition: opacity 0.4s;
  }
  #heroUI::before, #heroUI::after {
    content: ''; position: absolute; top: 50%; width: clamp(30px, 8vw, 130px); height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35));
  }
  #heroUI::before { right: calc(100% + 18px); }
  #heroUI::after { left: calc(100% + 18px); transform: scaleX(-1); }
  .hero-kicker { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 18px; color: rgba(255,255,255,0.58); font-size: 10px; text-transform: uppercase; letter-spacing: 0.22em; }
  .hero-kicker::before { content: ''; width: 28px; height: 1px; background: var(--accent); }
  .hero-name {
    font-size: clamp(58px, 10vw, 148px); font-weight: 900;
    line-height: 0.84; color: #fff; text-transform: none; position: relative; isolation: isolate;
    font-family: "Arial Rounded MT Bold", "Trebuchet MS", sans-serif;
  }
  .hero-name span { display: block; }
  .hero-name .liquid-text {
    position: relative; z-index: 2; color: transparent;
    background: linear-gradient(180deg, #f4ffff 0%, #9ff3ff 18%, #28b8e6 42%, #075682 58%, #3bd3f2 72%, #d9ffff 88%, #65cde7 100%);
    background-size: 100% 220%; background-position: center 10%;
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
    -webkit-text-stroke: 2px rgba(221,253,255,0.9);
    text-shadow:
      0 2px 0 #087da3, 0 4px 0 #066382, 0 6px 0 #044a65,
      0 9px 0 #023246, 0 14px 24px rgba(0,0,0,0.95);
    filter: drop-shadow(0 0 14px rgba(55,211,244,0.35));
    animation: liquidShine 5s ease-in-out infinite;
  }
  .hero-name .liquid-text::after {
    content: attr(data-text); position: absolute; inset: 0; z-index: 3;
    color: transparent; -webkit-text-stroke: 1px transparent;
    background: linear-gradient(110deg, transparent 28%, rgba(255,255,255,0.95) 42%, transparent 52%);
    background-size: 220% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
    animation: liquidSweep 4.8s ease-in-out infinite;
  }
  .hero-name .outline {
    position: relative; z-index: 1; color: #fff;
    -webkit-text-stroke: 0;
    text-shadow: 0 3px 0 #a8a8a8, 0 7px 16px rgba(0,0,0,0.8);
  }
  .name-drops { position: absolute; inset: 0; z-index: 4; pointer-events: none; }
  .name-drop {
    position: absolute; display: block; width: var(--size); aspect-ratio: 1; border-radius: 50% 48% 55% 45%;
    background: radial-gradient(circle at 30% 22%, #fff 0 9%, #bff8ff 14%, #32c7ef 42%, #07547b 72%);
    border: 1px solid rgba(210,251,255,0.85);
    box-shadow: inset -4px -5px 9px rgba(0,35,65,0.8), inset 3px 3px 6px rgba(255,255,255,0.7), 0 0 15px rgba(46,205,240,0.5), 0 8px 14px rgba(0,0,0,0.8);
    animation: dropFloat 4s ease-in-out infinite;
  }
  .name-drop:nth-child(1) { --size: 24px; top: -8%; left: 10%; animation-delay: -1.1s; }
  .name-drop:nth-child(2) { --size: 15px; top: 18%; right: 2%; animation-delay: -2.4s; }
  .name-drop:nth-child(3) { --size: 20px; top: 43%; left: 28%; animation-delay: -0.4s; }
  .name-drop:nth-child(4) { --size: 12px; top: 58%; right: 20%; animation-delay: -3.1s; }
  @keyframes liquidShine { 0%,100% { background-position: center 15%; } 50% { background-position: center 85%; } }
  @keyframes liquidSweep { 0%,25% { background-position: 160% 0; } 70%,100% { background-position: -80% 0; } }
  @keyframes dropFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-10px) scale(1.08); } }
  .hero-sub {
    font-size: clamp(11px, 1.3vw, 16px); font-weight: 200; letter-spacing: 0.35em;
    text-transform: uppercase; color: rgba(255,255,255,0.4); margin-top: 18px;
  }
  .hero-divider { width: 54px; height: 2px; background: var(--accent); margin: 22px auto; }
  .hero-scroll {
    font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase;
    color: rgba(255,255,255,0.3); animation: pulse 2.5s ease-in-out infinite;
  }

  /* \u2500\u2500 OVERLAY SECTIONS \u2500\u2500 */
  .page-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    z-index: 150; display: flex; align-items: center; justify-content: center;
    pointer-events: none; opacity: 0; transition: opacity 0.6s ease;
  }
  .page-overlay::before {
    content: ''; position: absolute; inset: 15% 12%; z-index: -1;
    background: radial-gradient(ellipse at center, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.55) 45%, transparent 76%);
    filter: blur(16px);
  }
  .page-overlay.visible { opacity: 1; pointer-events: all; }
  .overlay-inner {
    max-width: 860px; width: 92%; text-align: center; position: relative;
    animation: none;
  }
  .overlay-inner::before {
    content: attr(data-index); position: absolute; top: -52px; left: 50%; transform: translateX(-50%);
    color: rgba(255,255,255,0.035); font-size: clamp(90px, 14vw, 190px); font-weight: 900;
    line-height: 1; pointer-events: none; z-index: -1;
  }
  .page-overlay.visible .overlay-inner {
    animation: slideUp 0.7s cubic-bezier(.16,1,.3,1) forwards;
  }
  @keyframes slideUp {
    from { opacity:0; transform: translateY(40px); }
    to   { opacity:1; transform: translateY(0); }
  }

  .section-eyebrow {
    font-size: 11px; font-weight: 400; letter-spacing: 0.4em; text-transform: uppercase;
    color: rgba(255,255,255,0.3); margin-bottom: 18px;
  }
  .section-eyebrow::before { content: ''; display: inline-block; width: 24px; height: 1px; margin: 0 10px 3px 0; background: var(--accent); }
  .section-title {
    font-size: clamp(40px, 7vw, 96px); font-weight: 900; letter-spacing: 0;
    line-height: 1; margin-bottom: 28px;
  }
  .section-body {
    font-size: 15px; font-weight: 300; line-height: 1.9;
    color: rgba(255,255,255,0.55); max-width: 580px; margin: 0 auto 36px;
  }

  /* ABOUT STATS */
  .about-portrait {
    width: 148px; aspect-ratio: 1; margin: 0 auto 24px; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.28); border-bottom: 3px solid var(--accent); background: #111;
  }
  .about-portrait img {
    width: 100%; height: 100%; display: block; object-fit: cover; object-position: 50% 34%;
    filter: grayscale(1) contrast(1.08); transform: scale(1.01);
    transition: filter 0.5s ease, transform 0.7s cubic-bezier(.16,1,.3,1);
  }
  .about-portrait:hover img { filter: grayscale(0) contrast(1); transform: scale(1.05); }
  .about-stats {
    display: flex; gap: 1px; background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.08); margin-bottom: 36px;
  }
  .stat-cell {
    flex: 1; background: #000; padding: 24px 12px; text-align: center;
  }
  .stat-num { font-size: 32px; font-weight: 900; color: var(--accent); }
  .stat-label { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-top: 6px; }

  /* SKILLS */
  #overlay-2 {
    justify-content: flex-start; padding: 88px 7vw 56px;
    background: linear-gradient(90deg, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.9) 42%, rgba(0,0,0,0.18) 68%, transparent 100%);
  }
  #overlay-2::before { display: none; }
  #overlay-2 .overlay-inner {
    width: min(620px, 48vw); max-width: none; max-height: calc(100vh - 150px);
    overflow-y: auto; padding: 0 26px 0 0; text-align: left; scrollbar-width: none;
  }
  #overlay-2 .overlay-inner::-webkit-scrollbar { display: none; }
  #overlay-2 .overlay-inner::before {
    top: -64px; right: 10px; left: auto; transform: none; color: rgba(217,255,63,0.07);
  }
  #overlay-2 .section-eyebrow { color: rgba(217,255,63,0.72); }
  #overlay-2 .section-title { margin-bottom: 18px; font-size: clamp(52px, 6vw, 86px); }
  #overlay-2 .section-body { max-width: 460px; margin: 0 0 28px; color: rgba(255,255,255,0.48); }
  .skills-grid {
    counter-reset: capability; display: grid; grid-template-columns: repeat(2, 1fr);
    gap: 0; background: transparent; border-top: 1px solid rgba(255,255,255,0.16);
    margin-bottom: 0;
  }
  .skill-cell {
    counter-increment: capability; background: rgba(0,0,0,0.28); padding: 17px 18px 17px 46px;
    text-align: left; border-bottom: 1px solid rgba(255,255,255,0.12); transition: background 0.2s;
  }
  .skill-cell:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.12); }
  .skill-cell { position: relative; overflow: hidden; }
  .skill-cell::before {
    content: counter(capability, decimal-leading-zero); position: absolute; top: 18px; left: 14px;
    color: rgba(217,255,63,0.5); font-size: 9px; letter-spacing: 0.08em;
  }
  .skill-cell::after {
    content: ''; position: absolute; inset: auto 0 0; height: 2px; background: var(--accent);
    transform: scaleX(0); transform-origin: left; transition: transform 0.35s ease;
  }
  .skill-cell:hover { background: rgba(217,255,63,0.055); }
  .skill-cell:hover::after { transform: scaleX(1); }
  .skill-name { font-size: 13px; font-weight: 600; letter-spacing: 0; margin-bottom: 4px; }
  .skill-sub { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.3); }
  .skill-bar { height: 2px; background: rgba(255,255,255,0.09); margin-top: 11px; }
  .skill-fill { height: 100%; background: var(--accent); transition: width 1s ease; }

  /* WORK */
  .work-grid {
    display: grid; grid-template-columns: repeat(2, 1fr);
    gap: 1px; background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.08); margin-bottom: 36px;
  }
  .work-card {
    position: relative; display: block; background: #000; padding: 28px 52px 28px 24px; text-align: left;
    color: #fff; text-decoration: none;
    cursor: pointer; overflow: hidden; transition: background 0.25s, transform 0.25s;
  }
  .work-card::after { content: '\\2197'; position: absolute; top: 24px; right: 22px; color: var(--accent); font-size: 20px; transition: transform 0.25s; }
  .work-card:hover { background: rgba(255,255,255,0.055); transform: translateY(-2px); }
  .work-card:hover::after { transform: translate(3px, -3px); }
  .work-num { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.2); margin-bottom: 12px; }
  .work-title { font-size: 16px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 10px; }
  .work-desc { font-size: 12px; font-weight: 300; line-height: 1.75; color: rgba(255,255,255,0.45); }
  .work-tag { display: inline-block; margin-top: 14px; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.25); }
  #overlay-3 .overlay-inner { max-height: 88vh; overflow-y: auto; scrollbar-width: none; }
  #overlay-3 .overlay-inner::-webkit-scrollbar { display: none; }

  /* CONTACT */
  .contact-links {
    display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 36px;
  }
  .contact-link {
    padding: 13px 26px; border: 1px solid rgba(255,255,255,0.18);
    font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(255,255,255,0.6); text-decoration: none;
    transition: all 0.2s; cursor: pointer;
  }
  .contact-link:first-child { border-color: var(--accent); background: var(--accent); color: #050505; font-weight: 700; }
  .contact-link:hover { border-color: var(--accent); color: var(--accent); background: rgba(217,255,63,0.05); }
  .contact-link:first-child:hover { background: #fff; border-color: #fff; color: #050505; }

  #viewportFrame { position: fixed; inset: 14px; z-index: 190; pointer-events: none; border: 1px solid rgba(255,255,255,0.08); }
  #viewportFrame::before, #viewportFrame::after { content: ''; position: absolute; width: 34px; height: 3px; background: var(--accent); }
  #viewportFrame::before { top: -1px; left: -1px; }
  #viewportFrame::after { right: -1px; bottom: -1px; }
  .availability { position: fixed; left: 34px; bottom: 30px; z-index: 210; display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.5); font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; }
  .availability-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 12px var(--accent); animation: pulse 2s infinite; }

  #telemetry {
    position: fixed; top: 82px; right: 34px; z-index: 200; display: grid; gap: 4px;
    text-align: right; color: rgba(255,255,255,0.28); font-size: 9px;
    letter-spacing: 0.16em; text-transform: uppercase; pointer-events: none;
  }
  #telemetry strong { color: rgba(255,255,255,0.65); font-weight: 500; }

  /* SIDE LABELS */
  .side-label {
    position: fixed; bottom: 36px; font-size: 10px; letter-spacing: 0.2em;
    text-transform: uppercase; color: rgba(255,255,255,0.25); writing-mode: vertical-rl;
    z-index: 200; font-weight: 300;
  }
  #sideLeft  { left: 28px;  transform: rotate(180deg); }
  #sideRight { right: 28px; }

  /* CURSOR */
  #cursor { position: fixed; width: 8px; height: 8px; background: #fff; border-radius: 50%; pointer-events: none; z-index: 9999; transform: translate(-50%,-50%); mix-blend-mode: difference; }
  #cursorRing { position: fixed; width: 34px; height: 34px; border: 1px solid rgba(255,255,255,0.5); border-radius: 50%; pointer-events: none; z-index: 9998; transform: translate(-50%,-50%); mix-blend-mode: difference; transition: width 0.3s, height 0.3s; }
  #cursorRing.is-hovering { width: 54px; height: 54px; border-color: var(--accent); }
  @media (pointer: fine) { body, a, [data-page], #invertBtn { cursor: none; } }

  /* SCROLL SCROLL INDICATOR */
  #scrollIndicator {
    position: fixed; right: 28px; top: 50%; transform: translateY(-50%);
    z-index: 200; display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .scroll-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: rgba(255,255,255,0.2); cursor: pointer;
    transition: background 0.3s, transform 0.3s;
  }
  .scroll-dot.active { background: #fff; transform: scale(1.4); }
  .scroll-dot.active { background: var(--accent); box-shadow: 0 0 10px rgba(217,255,63,0.75); }

  @media (max-width: 700px) {
    nav { padding: 20px 22px; }
    #heroUI { top: 46%; width: 96vw; }
    .hero-name { font-size: clamp(44px, 14vw, 64px); line-height: 0.88; transform: scaleX(0.82); }
    .name-drop:nth-child(1), .name-drop:nth-child(3) { display: none; }
    .hero-kicker { max-width: 270px; margin: 0 auto 14px; font-size: 8px; line-height: 1.5; }
    .hero-sub { max-width: 280px; margin: 16px auto 0; line-height: 1.7; letter-spacing: 0.22em; }
    .nav-links { gap: 14px; }
    .nav-link { font-size: 9px; }
    .nav-invert { padding: 5px 9px; font-size: 9px; }
    .overlay-inner { width: calc(100% - 44px); max-height: calc(100vh - 120px); overflow-y: auto; scrollbar-width: none; }
    .overlay-inner::-webkit-scrollbar { display: none; }
    .section-eyebrow { margin-bottom: 10px; }
    .section-title { margin-bottom: 14px; font-size: 40px; }
    .section-body { margin-bottom: 16px; font-size: 12px; line-height: 1.55; }
    #overlay-2 { align-items: center; padding: 76px 22px 70px; background: rgba(0,0,0,0.8); }
    #overlay-2 .overlay-inner { width: 100%; max-height: calc(100vh - 146px); padding-right: 0; }
    #overlay-2 .section-title { font-size: 40px; }
    #overlay-2 .section-body { margin-bottom: 18px; }
    #overlay-2 .skills-grid { grid-template-columns: 1fr; }
    #overlay-2 .skill-cell { padding: 12px 12px 12px 42px; }
    #overlay-2 .skill-cell:nth-child(odd) { border-right: 0; }
    #overlay-2 .skill-cell::before { top: 13px; }
    .about-portrait { width: 104px; margin-bottom: 14px; }
    .stat-cell { padding: 12px 6px; }
    .stat-num { font-size: 22px; }
    .stat-label { font-size: 8px; letter-spacing: 0.08em; }
    #viewportFrame { inset: 8px; }
    .availability { left: 22px; bottom: 20px; }
    #atmosphere { background-size: 44px 44px, 44px 44px, 100% 100%; }
    #telemetry, #sideLeft, #sideRight, #sectionLabel, #cursor, #cursorRing { display: none; }
    #heroUI::before, #heroUI::after { display: none; }
  }
`;
document.head.appendChild(style);
var atmosphere = document.createElement("div");
atmosphere.id = "atmosphere";
(document.getElementById("root") ?? document.body).appendChild(atmosphere);
var cursor = document.createElement("div");
cursor.id = "cursor";
(document.getElementById("root") ?? document.body).appendChild(cursor);
var cursorRing = document.createElement("div");
cursorRing.id = "cursorRing";
(document.getElementById("root") ?? document.body).appendChild(cursorRing);
var mx = -100;
var my = -100;
var rx = -100;
var ry = -100;
document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
});
(function trackCursor() {
  rx += (mx - rx) * 0.35;
  ry += (my - ry) * 0.35;
  cursor.style.left = mx + "px";
  cursor.style.top = my + "px";
  cursorRing.style.left = rx + "px";
  cursorRing.style.top = ry + "px";
  requestAnimationFrame(trackCursor);
})();
var progressBar = document.createElement("div");
progressBar.id = "progressBar";
(document.getElementById("root") ?? document.body).appendChild(progressBar);
var viewportFrame = document.createElement("div");
viewportFrame.id = "viewportFrame";
(document.getElementById("root") ?? document.body).appendChild(viewportFrame);
var availability = document.createElement("div");
availability.className = "availability";
availability.innerHTML = `<span class="availability-dot"></span>Available for select projects`;
(document.getElementById("root") ?? document.body).appendChild(availability);
var telemetry = document.createElement("div");
telemetry.id = "telemetry";
telemetry.innerHTML = `<span>Scene <strong id="sceneCount">01 / 05</strong></span><span id="coordinates">X 00.0 / Z 000.0</span>`;
(document.getElementById("root") ?? document.body).appendChild(telemetry);
var nav = document.createElement("nav");
nav.innerHTML = `
  <div class="nav-logo" data-page="0"><span class="nav-mark"></span>KM / 26</div>
  <div class="nav-links">
    <span class="nav-link" data-page="1">About</span>
    <span class="nav-link" data-page="2">Skills</span>
    <span class="nav-link" data-page="3">Work</span>
    <span class="nav-link" data-page="4">Contact</span>
  </div>
  <span class="nav-invert" id="invertBtn">Invert</span>
`;
(document.getElementById("root") ?? document.body).appendChild(nav);
var scrollIndicator = document.createElement("div");
scrollIndicator.id = "scrollIndicator";
PAGES.forEach((p, i) => {
  const dot = document.createElement("div");
  dot.className = "scroll-dot" + (i === 0 ? " active" : "");
  dot.dataset.page = i;
  dot.title = p.toUpperCase();
  dot.addEventListener("click", () => navigateToPage(i));
  scrollIndicator.appendChild(dot);
});
(document.getElementById("root") ?? document.body).appendChild(scrollIndicator);
var sideLeft = document.createElement("div");
sideLeft.id = "sideLeft";
sideLeft.className = "side-label";
sideLeft.textContent = "Portfolio 2026";
(document.getElementById("root") ?? document.body).appendChild(sideLeft);
var sideRight = document.createElement("div");
sideRight.id = "sideRight";
sideRight.className = "side-label";
sideRight.textContent = "Design \xD7 Code \xD7 Vision";
(document.getElementById("root") ?? document.body).appendChild(sideRight);
var sectionLabel = document.createElement("div");
sectionLabel.id = "sectionLabel";
sectionLabel.innerHTML = `<div class="label-name" id="labelName">Hero</div><div class="label-hint">\u2193 Scroll to explore</div>`;
(document.getElementById("root") ?? document.body).appendChild(sectionLabel);
var heroUI = document.createElement("div");
heroUI.id = "heroUI";
heroUI.innerHTML = `
  <div class="hero-kicker">Digital experiences, built with intent</div>
  <h1 class="hero-name">
    <span class="liquid-text" data-text="Kamalesh">Kamalesh</span>
    <span class="outline">M.</span>
    <span class="name-drops" aria-hidden="true"><i class="name-drop"></i><i class="name-drop"></i><i class="name-drop"></i><i class="name-drop"></i></span>
  </h1>
  <div class="hero-sub">Creative Developer &amp; Designer</div>
  <div class="hero-divider"></div>
  <div class="hero-scroll">\u2193 Scroll to Enter</div>
`;
(document.getElementById("root") ?? document.body).appendChild(heroUI);
var overlayData = {
  1: {
    eyebrow: "001 \u2014 About",
    title: "Who I Am",
    body: `Kamalesh is a multidisciplinary creative developer \u2014 blending code, design, and technology into memorable digital experiences. From immersive 3D environments to rigorous visual identities, every pixel is intentional.`,
    extra: `
      <div class="about-portrait">
        <img src="assets/kamalesh-portrait.jpg" alt="Portrait of Kamalesh M" />
      </div>
      <div class="about-stats">
        <div class="stat-cell"><div class="stat-num">5+</div><div class="stat-label">Years Experience</div></div>
        <div class="stat-cell"><div class="stat-num">40+</div><div class="stat-label">Projects</div></div>
        <div class="stat-cell"><div class="stat-num">12+</div><div class="stat-label">Clients</div></div>
        <div class="stat-cell"><div class="stat-num">\u221E</div><div class="stat-label">Curiosity</div></div>
      </div>
    `
  },
  2: {
    eyebrow: "002 \u2014 Skills",
    title: "Capabilities",
    body: `A full spectrum of modern craft \u2014 from pixel-perfect UI to GPU-accelerated 3D.`,
    extra: `
      <div class="skills-grid">
        ${[
      ["Three.js / WebGL", "3D & Rendering", 90],
      ["React & Next.js", "Frontend Dev", 88],
      ["Figma & Sketch", "UI / UX Design", 92],
      ["GLSL Shaders", "GPU Code", 80],
      ["Motion Design", "After Effects", 85],
      ["Brand Strategy", "Identity Systems", 87],
      ["Node.js / API", "Backend", 78],
      ["Typography", "Type Direction", 90],
      ["Creative Direction", "Art & Vision", 95]
    ].map(([n, s, p]) => `<div class="skill-cell"><div class="skill-name">${n}</div><div class="skill-sub">${s}</div><div class="skill-bar"><div class="skill-fill" style="width:${p}%"></div></div></div>`).join("")}
      </div>
    `
  },
  3: {
    eyebrow: "003 \u2014 Work",
    title: "Selected Work",
    body: `Projects that blend engineering precision with creative vision.`,
    extra: `
      <div class="work-grid">
        <a class="work-card" href="https://github.com/kamalesh2585-byte/ai-resume-analyzer" target="_blank" rel="noopener noreferrer"><div class="work-num">01</div><div class="work-title">AI Resume Analyzer</div><div class="work-desc">Full-stack resume analysis and building workspace with file extraction and transparent rule-based scoring.</div><div class="work-tag">TypeScript \xB7 Full Stack</div></a>
        <a class="work-card" href="https://github.com/kamalesh2585-byte/binlay" target="_blank" rel="noopener noreferrer"><div class="work-num">02</div><div class="work-title">Nariyal Co.</div><div class="work-desc">Responsive coconut-products ecommerce experience with catalog, cart, checkout, wishlist, and admin views.</div><div class="work-tag">Next.js \xB7 TypeScript</div></a>
        <a class="work-card" href="https://github.com/kamalesh2585-byte/Expense-Alert" target="_blank" rel="noopener noreferrer"><div class="work-num">03</div><div class="work-title">Expense Alert</div><div class="work-desc">Daily budget monitor that stores expenses in SQLite and sends email alerts when limits are exceeded.</div><div class="work-tag">Node.js \xB7 SQLite</div></a>
        <a class="work-card" href="https://github.com/kamalesh2585-byte/Kamalesh" target="_blank" rel="noopener noreferrer"><div class="work-num">04</div><div class="work-title">Portfolio Website</div><div class="work-desc">Responsive personal portfolio with dark mode, animated sections, project showcases, and contact tools.</div><div class="work-tag">Next.js \xB7 Framer Motion</div></a>
        <a class="work-card" href="https://github.com/kamalesh2585-byte/ruroxz-chat" target="_blank" rel="noopener noreferrer"><div class="work-num">05</div><div class="work-title">Ruroxz Chat</div><div class="work-desc">A JavaScript chat application project focused on interactive communication.</div><div class="work-tag">JavaScript \xB7 Chat</div></a>
        <a class="work-card" href="https://github.com/kamalesh2585-byte/sns-maps" target="_blank" rel="noopener noreferrer"><div class="work-num">06</div><div class="work-title">CampusNav</div><div class="work-desc">Campus navigation platform with searchable maps, graph-based routes, events, location details, and admin operations.</div><div class="work-tag">Next.js \xB7 Express \xB7 Prisma</div></a>
      </div>
    `
  },
  4: {
    eyebrow: "004 \u2014 Contact",
    title: "Let's Build",
    body: `Available for freelance, full-time roles, and global collaborations. Currently open to new projects.`,
    extra: `
      <div class="contact-links">
        <a class="contact-link" href="mailto:kamalesh2585@gmail.com">\u2709 Email</a>
        <a class="contact-link" href="https://www.linkedin.com/feed/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a class="contact-link" href="https://github.com/kamalesh2585-byte" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    `
  }
};
var overlays = {};
Object.entries(overlayData).forEach(([page, data]) => {
  const div = document.createElement("div");
  div.className = "page-overlay";
  div.id = `overlay-${page}`;
  div.innerHTML = `
    <div class="overlay-inner" data-index="0${page}">
      <div class="section-eyebrow">${data.eyebrow}</div>
      <div class="section-title">${data.title}</div>
      <div class="section-body">${data.body}</div>
      ${data.extra}
    </div>
  `;
  ;
  (document.getElementById("root") ?? document.body).appendChild(div);
  overlays[page] = div;
});
var inverted = false;
document.getElementById("invertBtn").addEventListener("click", () => {
  inverted = !inverted;
  scene.background = new THREE.Color(inverted ? 16777215 : 0);
  scene.fog = new THREE.FogExp2(inverted ? 16777215 : 0, 9e-3);
  document.body.style.background = inverted ? "#fff" : "#000";
  document.body.style.color = inverted ? "#000" : "#fff";
  document.body.style.filter = inverted ? "invert(1)" : "";
});
document.querySelectorAll("[data-page]").forEach((el) => {
  el.addEventListener("click", () => navigateToPage(parseInt(el.dataset.page)));
});
document.querySelectorAll("a, [data-page], #invertBtn").forEach((el) => {
  el.addEventListener("mouseenter", () => cursorRing.classList.add("is-hovering"));
  el.addEventListener("mouseleave", () => cursorRing.classList.remove("is-hovering"));
});
var MAX_SCROLL = PAGE_DEPTH * (PAGES.length - 1) + 20;
var targetScrollZ = 0;
var currentScrollZ = 0;
var currentPage = 0;
var mouseCamX = 0;
var mouseCamY = 0;
function navigateToPage(pageIdx) {
  targetScrollZ = pageIdx * PAGE_DEPTH;
}
window.addEventListener("wheel", (e) => {
  targetScrollZ += e.deltaY * 0.08;
  targetScrollZ = THREE.MathUtils.clamp(targetScrollZ, 0, MAX_SCROLL);
}, { passive: true });
var touchStartY = 0;
window.addEventListener("touchstart", (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });
window.addEventListener("touchmove", (e) => {
  const dy = touchStartY - e.touches[0].clientY;
  targetScrollZ = THREE.MathUtils.clamp(targetScrollZ + dy * 0.4, 0, MAX_SCROLL);
  touchStartY = e.touches[0].clientY;
}, { passive: true });
window.addEventListener("mousemove", (e) => {
  mouseCamX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseCamY = (e.clientY / window.innerHeight - 0.5) * 2;
});
var clock = new THREE.Clock();
var camX = 0;
var camSmoothY = 8;
var PAGE_NAMES = ["Hero", "About", "Skills", "Work", "Contact"];
function animate() {
  const t = clock.getElapsedTime();
  currentScrollZ += (targetScrollZ - currentScrollZ) * 0.055;
  camX += (mouseCamX * 3.5 - camX) * 0.04;
  camSmoothY += (8 + mouseCamY * 1.5 - camSmoothY) * 0.04;
  camera.position.set(
    camX,
    camSmoothY,
    32 - currentScrollZ
  );
  camera.lookAt(camX * 0.15, 4, -currentScrollZ + 5);
  document.getElementById("coordinates").textContent = `X ${camX.toFixed(1).padStart(4, "0")} / Z ${currentScrollZ.toFixed(1).padStart(5, "0")}`;
  const rawPage = Math.round(currentScrollZ / PAGE_DEPTH);
  const page = THREE.MathUtils.clamp(rawPage, 0, PAGES.length - 1);
  if (page !== currentPage) {
    currentPage = page;
    updatePageUI(page);
  }
  const prog = currentScrollZ / MAX_SCROLL * 100;
  progressBar.style.width = prog + "%";
  const heroFade = THREE.MathUtils.clamp(1 - currentScrollZ / 30, 0, 1);
  heroUI.style.opacity = heroFade;
  Object.entries(overlays).forEach(([pg, el]) => {
    const pgNum = parseInt(pg);
    const shouldShow = pgNum === page;
    el.classList.toggle("visible", shouldShow);
  });
  const aboutSphere = scene.getObjectByName("aboutSphere");
  if (aboutSphere) {
    aboutSphere.rotation.y = t * 0.25;
    aboutSphere.rotation.x = t * 0.12;
    aboutSphere.position.y = 8 + Math.sin(t * 0.6) * 0.5;
  }
  const ring1 = scene.getObjectByName("aboutRing1");
  if (ring1) {
    ring1.rotation.z = t * 0.18;
    ring1.position.y = 8 + Math.sin(t * 0.6) * 0.5;
  }
  const ring2 = scene.getObjectByName("aboutRing2");
  if (ring2) {
    ring2.rotation.x = Math.PI / 3 + t * 0.12;
    ring2.position.y = 8 + Math.sin(t * 0.6) * 0.5;
  }
  for (let i = 0; i < 8; i++) {
    const orb = scene.getObjectByName(`aboutOrb_${i}`);
    if (orb) {
      const a = orb.userData.orbitAngle + t * 0.4;
      const r = orb.userData.orbitR;
      const cz = orb.userData.orbitCenterZ;
      orb.position.x = Math.cos(a) * r;
      orb.position.y = 8 + Math.sin(a) * 3.5;
      orb.position.z = cz + Math.sin(a) * 2;
    }
  }
  for (let i = 0; i < 7; i++) {
    const ws = scene.getObjectByName(`workShape_${i}`);
    if (ws) {
      ws.position.y = ws.position.y + Math.sin(t * 0.5 + ws.userData.floatOffset) * 8e-3;
      ws.rotateOnAxis(ws.userData.rotAxis, 6e-3);
    }
  }
  for (let i = 0; i < 8; i++) {
    const plate = scene.getObjectByName(`contactPlate_${i}`);
    if (plate) {
      plate.position.y = 10 + Math.sin(i) * 3 + Math.sin(t * 0.4 + plate.userData.floatOffset) * 1.2;
      plate.rotation.y += 5e-3;
    }
  }
  const ob = scene.getObjectByName("obelisk");
  if (ob) ob.rotation.y = t * 0.15;
  const halo = scene.getObjectByName("heroHalo");
  if (halo) {
    halo.rotation.z = t * 0.12;
    halo.rotation.x = Math.PI / 2.3 + Math.sin(t * 0.35) * 0.08;
    halo.position.y = 9 + Math.sin(t * 0.7) * 0.35;
  }
  allColumns.forEach((col, i) => {
    col.position.y = col.userData.baseY + Math.sin(i * 0.4 + t * 0.3) * 0.15;
  });
  scene.rotation.y = Math.sin(t * 0.035) * 0.04;
  composer.render();
}
renderer.setAnimationLoop(animate);
function updatePageUI(page) {
  document.querySelectorAll(".scroll-dot").forEach((d, i) => d.classList.toggle("active", i === page));
  document.querySelectorAll(".nav-link[data-page]").forEach((el) => el.classList.toggle("active", parseInt(el.dataset.page) === page));
  document.getElementById("labelName").textContent = PAGE_NAMES[page];
  document.getElementById("sceneCount").textContent = `${String(page + 1).padStart(2, "0")} / 05`;
}
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  fxaa.uniforms["resolution"].value.set(1 / window.innerWidth, 1 / window.innerHeight);
});
