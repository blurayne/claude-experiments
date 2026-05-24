# Slothy-Hutty — 3D conversion plan

## Context
From concept art of **Slothy** (a Jabba/slug-shaped sloth-faced diner mascot: cream cap with a
red band, droopy panda eyes, stubby arms, tapering slug tail, cream **SLOTHY'S** burger apron;
the sheet shows front/side/back poses and three faces — closed smug, sleepy drool, wide laugh),
build a feature-rich, accurate, fully 3D character in the `slothy-hutty/` experiment subfolder.

Requirements that shaped this plan:
- Render in **two hand-written engines** — `webgl2.html` (raw WebGL2) and `webgpu.html` (raw
  WebGPU). No Three.js / CDNs; works offline.
- A button to **change the face** (all three expressions from the sheet).
- A **shading toggle** (cel-shaded to match the drawing, and smooth realistic 3D).
- **3D-print exports** in every format: plain STL, colored STL, colored 3MF, and OBJ+MTL+PNG
  (STL can't carry texture, so color/texture ships via the colored STL, 3MF, and textured OBJ).

## Architecture (single source of truth, shared by both engines + Node build)
- `slothy-math.js` — mat4/vec3; `perspective` (WebGL z∈[-1,1]) and `perspectiveZO` (WebGPU
  z∈[0,1]).
- `slothy-model.js` — procedural geometry as grouped parts (positions/normals/uvs/colors/indices):
  - **Body:** parametric loft from a control-point profile (front dome → belly → tapering tail),
    flattened bottom so it rests on the ground; per-vertex normals by face-normal accumulation.
  - **Colors:** olive-green back with mottled value-noise blotches blending to a cream belly;
    lighter tan face; near-black eye patches painted by distance to eye centers.
  - **Face features seated on the real surface** via `makeFrontZAt(bodyPositions)` so nothing
    sinks into the head dome: flattened eyeballs + droopy lids + highlight, brow, nose with
    nostrils, and three swappable mouths (closed upturned crease; half-open oval + drool drip;
    wide cavity + red throat + teeth row + tongue).
  - **Cap:** flattened dome + thin red band. **Apron:** a *shell that conforms to the body* —
    duplicate the front-belly triangles, push out along normals, UV-map to the baked apron art
    (`paintApron`). **Arms:** short tapered limbs with rounded hands. **Ground shadow:** flat
    translucent ellipse.
- `slothy-export.js` — painters (`CanvasPainter` for the browser, `BufferPainter` + 5×7 stencil
  font for Node), a dependency-free PNG encoder (zlib "stored"), a store-only ZIP writer, and
  serializers: `exportSTLBinary({colored})`, `export3MF`, `exportOBJ`. `flattenForExport`
  converts to Z-up millimetres (~110 mm) and reverses winding.
- `slothy-ui.js` — engine-agnostic orbit/zoom camera, HUD (Face / Shading / Auto-rotate / Reset /
  Download), animation loop, and Blob downloads. Talks to a `renderer` interface:
  `setFace · setShading · getParts · resize · render(cam)`.
- `webgl2.html` — GLSL ES 300; Blinn-Phong + quantized toon paths; cel adds an inverted-hull
  outline pass (front-face cull, positions pushed along normals). Mode-dependent background
  (dark studio / warm paper so outlines read). Apron texture painted via `CanvasPainter`.
- `webgpu.html` — WGSL mirror: pipelines for opaque / outline / blend + a background pipeline;
  per-draw uniforms via dynamic offsets; graceful fallback overlay when WebGPU is unavailable.
- `build.js` + `package.json` (`type: module`) — `node build.js` regenerates the committed
  artifacts: `slothy-hutty.stl`, `slothy-hutty-color.stl`, `slothy-hutty.3mf`,
  `slothy-hutty.obj/.mtl/.png`.
- `index.md` — landing page linking both viewers and the downloads.
- `.github/workflows/slothy-hutty.yml` — rebuilds artifacts on pushes to the sources and commits
  them back (path filter excludes the generated files). Root `README.md` lists the experiment.

## Verification
- `node build.js` writes all six artifacts; asserts STL triangle count, PNG header, ZIP/3MF
  signature; 3MF unzips and the PNG round-trips through inflate.
- Headless Playwright (SwiftShader) renders `webgl2.html` and screenshots all three faces in both
  shading modes plus front/back views (verified visually).
- `webgpu.html` initializes adapter/device, builds all pipelines with zero validation errors and
  runs at 60 fps. NOTE: headless WebGPU here neither composites into screenshots nor allows
  buffer-map readback, so its pixels can't be auto-captured in the sandbox; it should be opened in
  a WebGPU browser. Its draw logic mirrors the verified WebGL2 engine.

## Status: implemented
All engines, the model, exporters, build script, docs, workflow, and README entry are in place;
artifacts are generated and validated.
