// Engine-agnostic UI: orbit/zoom camera, HUD buttons, animation loop, and the
// download menu. Each engine supplies a `renderer` implementing:
//   setFace(state) | setShading('cel'|'smooth') | getParts() | render(cam)
// where cam = { eye:[x,y,z], target:[x,y,z], up:[x,y,z], aspect, fovy }.
import { FACE_STATES, FACE_LABELS } from './slothy-model.js';
import { exportSTLBinary, export3MF, exportOBJ, makeZip } from './slothy-export.js';

const STYLE = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden;background:#1c2230;font-family:system-ui,Segoe UI,Roboto,sans-serif}
canvas{display:block;width:100vw;height:100vh;touch-action:none}
.hud{position:fixed;top:14px;left:14px;display:flex;flex-direction:column;gap:8px;z-index:10;user-select:none}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.title{font-weight:700;font-size:15px;color:#f2ecd9;text-shadow:0 1px 2px #000;letter-spacing:.5px}
.tag{font-size:11px;color:#aeb6c2;background:#0006;padding:2px 7px;border-radius:10px}
button.s{appearance:none;border:1px solid #ffffff22;background:#2b3346;color:#eef;
  padding:7px 11px;border-radius:9px;font-size:13px;cursor:pointer;transition:.12s;white-space:nowrap}
button.s:hover{background:#3a445c}
button.s:active{transform:translateY(1px)}
button.s.on{background:#7c5cff;border-color:#9b82ff}
.menu{position:relative}
.menu .items{position:absolute;top:calc(100% + 6px);left:0;display:none;flex-direction:column;
  gap:4px;background:#222a3a;border:1px solid #ffffff22;border-radius:10px;padding:6px;min-width:190px;
  box-shadow:0 12px 30px #000a}
.menu.open .items{display:flex}
.menu .items button{text-align:left}
.hint{position:fixed;bottom:12px;left:14px;font-size:11px;color:#8b93a3;z-index:10;text-shadow:0 1px 2px #000}
.fps{position:fixed;top:14px;right:16px;font-size:11px;color:#8b93a3;z-index:10;font-variant-numeric:tabular-nums}
.overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:50;
  background:#1c2230;color:#dfe4ee;text-align:center;padding:24px}
.overlay .box{max-width:440px}
.overlay a{color:#9b82ff}
`;

function el(tag, cls, txt) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  return e;
}

function download(name, data, mime) {
  const blob = data instanceof Uint8Array ? new Blob([data], { type: mime }) : new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function showOverlay(html) {
  const s = el('style'); s.textContent = STYLE; document.head.appendChild(s);
  const o = el('div', 'overlay');
  const box = el('div', 'box'); box.innerHTML = html; o.appendChild(box);
  document.body.appendChild(o);
}

export function createApp({ canvas, engineName, renderer }) {
  const style = el('style'); style.textContent = STYLE; document.head.appendChild(style);

  const cam = {
    theta: 0.55, phi: 1.12, dist: 5.6, target: [0, 0.82, 0],
    fovy: 50 * Math.PI / 180,
  };
  let auto = true, faceIdx = 0, shading = 'smooth';

  // ---- HUD ----
  const hud = el('div', 'hud');
  const titleRow = el('div', 'row');
  titleRow.append(el('div', 'title', 'SLOTHY'), el('div', 'tag', engineName));
  const row1 = el('div', 'row');
  const faceBtn = el('button', 's', 'Face: Smug ▸');
  const shadeBtn = el('button', 's', 'Shading: Smooth');
  const autoBtn = el('button', 's on', 'Auto-rotate');
  const resetBtn = el('button', 's', 'Reset view');
  row1.append(faceBtn, shadeBtn, autoBtn, resetBtn);

  const menu = el('div', 'menu');
  const dlBtn = el('button', 's', 'Download ▾');
  const items = el('div', 'items');
  const mk = (label, fn) => { const b = el('button', 's', label); b.onclick = () => { fn(); menu.classList.remove('open'); }; return b; };
  items.append(
    mk('STL (geometry)', () => download('slothy-hutty.stl', exportSTLBinary(renderer.getParts()), 'model/stl')),
    mk('STL (colored)', () => download('slothy-hutty-color.stl', exportSTLBinary(renderer.getParts(), { colored: true }), 'model/stl')),
    mk('3MF (color)', () => download('slothy-hutty.3mf', export3MF(renderer.getParts()), 'model/3mf')),
    mk('OBJ + MTL + PNG (.zip)', () => {
      const { obj, mtl, png } = exportOBJ(renderer.getParts());
      const enc = new TextEncoder();
      const zip = makeZip([
        { name: 'slothy-hutty.obj', data: enc.encode(obj) },
        { name: 'slothy-hutty.mtl', data: enc.encode(mtl) },
        { name: 'slothy-hutty.png', data: png },
      ]);
      download('slothy-hutty-obj.zip', zip, 'application/zip');
    }),
  );
  dlBtn.onclick = (e) => { e.stopPropagation(); menu.classList.toggle('open'); };
  document.addEventListener('click', () => menu.classList.remove('open'));
  menu.append(dlBtn, items);
  const row2 = el('div', 'row'); row2.append(menu);

  hud.append(titleRow, row1, row2);
  document.body.appendChild(hud);

  const fps = el('div', 'fps', '');
  document.body.appendChild(fps);
  const hint = el('div', 'hint', 'drag to orbit · scroll to zoom · buttons to change face & shading');
  document.body.appendChild(hint);

  faceBtn.onclick = () => {
    faceIdx = (faceIdx + 1) % FACE_STATES.length;
    const st = FACE_STATES[faceIdx];
    renderer.setFace(st);
    faceBtn.textContent = `Face: ${FACE_LABELS[st]} ▸`;
  };
  shadeBtn.onclick = () => {
    shading = shading === 'smooth' ? 'cel' : 'smooth';
    renderer.setShading(shading);
    shadeBtn.textContent = `Shading: ${shading === 'cel' ? 'Cel' : 'Smooth'}`;
  };
  autoBtn.onclick = () => { auto = !auto; autoBtn.classList.toggle('on', auto); };
  resetBtn.onclick = () => { cam.theta = 0.55; cam.phi = 1.12; cam.dist = 5.6; };

  // ---- controls ----
  let dragging = false, lx = 0, ly = 0;
  const onDown = (e) => { dragging = true; lx = e.clientX; ly = e.clientY; auto = false; autoBtn.classList.remove('on'); };
  const onUp = () => { dragging = false; };
  const onMove = (e) => {
    if (!dragging) return;
    cam.theta -= (e.clientX - lx) * 0.008;
    cam.phi = Math.max(0.15, Math.min(2.98, cam.phi - (e.clientY - ly) * 0.008));
    lx = e.clientX; ly = e.clientY;
  };
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointermove', onMove);
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    cam.dist = Math.max(2.6, Math.min(12, cam.dist * (1 + Math.sign(e.deltaY) * 0.08)));
  }, { passive: false });

  // ---- resize ----
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(canvas.clientWidth * dpr), h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      if (renderer.resize) renderer.resize(w, h);
    }
    return { w, h };
  }
  window.addEventListener('resize', resize);

  // ---- loop ----
  let last = performance.now(), acc = 0, frames = 0;
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (auto) cam.theta += dt * 0.35;
    const { w, h } = resize();
    const se = Math.sin(cam.phi), eye = [
      cam.target[0] + cam.dist * se * Math.sin(cam.theta),
      cam.target[1] + cam.dist * Math.cos(cam.phi),
      cam.target[2] + cam.dist * se * Math.cos(cam.theta),
    ];
    renderer.render({ eye, target: cam.target, up: [0, 1, 0], aspect: w / h || 1, fovy: cam.fovy });
    acc += dt; frames++;
    if (acc >= 0.5) { fps.textContent = (frames / acc).toFixed(0) + ' fps'; acc = 0; frames = 0; }
    requestAnimationFrame(loop);
  }
  resize();
  requestAnimationFrame(loop);
}
