#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in float aSize;
layout(location=2) in vec3 aColor;
layout(location=3) in float aWave; // 1: point rides the spiral density-wave pattern
layout(location=4) in vec3 aVel;   // heliocentric space velocity, km/s (real stars only)
uniform float uVelT;               // km/s -> scene displacement for the elapsed years
uniform mat4 uProj, uView;
uniform float uPx;
uniform float uSpin; // distance travelled at the flat-curve speed; 0 = no rotation
uniform float uWarp; // precession phase of the disk warp
uniform vec3 uSunPos; // center of the clearance bubble around the magnified solar system
uniform float uCap;   // sprite size ceiling (smaller at deep zoom: near stars stay point-like)
uniform float uWaveAll; // 1: treat every point in this draw as wave-riding (nebulae, dust)
uniform float uTime;    // wall-clock seconds for the variability animation
uniform float uVarMode; // 0 off | 1 stars (a few % pulse, reddening at minimum) | 2 nebulae (all breathe)
uniform vec3 uAnd;      // Andromeda's centre, galactic coordinates
uniform float uTide;    // 0 far apart .. 1 at contact
uniform float uWarpAmp; // how strongly this draw takes the disk warp
uniform float uMinB;    // brightness floor: lift the faintest stars to at least this
uniform float uMinSz;   // sprite floor in pixels: how small a star is allowed to get
uniform float uFadeOut; // 0 draws normally, 1 hides: used where a layer stops being true
uniform vec3 uOrg;    // rendering origin (the Sun) — keeps deep real-scale zooms float-precise
uniform float uGal;   // 1: this draw is a whole galaxy, placed by uGRot/uGOff
uniform mat3 uGRot;   // the galaxy's disk frame in scene coordinates (identity for ours)
uniform vec3 uGOff;   // the galaxy's centre (zero for ours)
uniform float uMerge; // 0 two galaxies .. 1 one relaxed remnant
out vec3 vColor;
void main(){
  vec3 p = aPos + aVel*uVelT;
  float fade = 1.0;
  if(uSpin != 0.0){
    float r = length(p.xz);
    // material stars: flat rotation curve, so they shear differentially. Wave-flagged
    // points (bar, arms, spur, gas, young stars) rigidly follow one pattern speed
    // instead — corotation at r=640 (~19 kly) — so stars stream through the arms
    // and the pattern never winds up: density-wave theory's answer to the winding problem.
    float w = max(aWave, uWaveAll);
    float d = mix(uSpin / max(r, 520.0), uSpin/640.0, w);
    float c = cos(d), s = sin(d);
    p = vec3(p.x*c + p.z*s, p.y, p.z*c - p.x*s);
    // Gaia-style warp: outer disk bends up on one side, down on the other,
    // and the whole pattern precesses retrograde (uWarp) like a wobbling top
    float wr = max(0.0, r - 950.0);
    p.y += uWarpAmp*(wr*0.13*sin(atan(p.x,p.z) - uWarp)  // integral-sign warp, growing outward
         + 4.0*sin(r*0.021));                            // faint corrugation ripples in the disk
    // the planetary system is drawn ~10-million-fold magnified; clear its space
    fade = smoothstep(80.0, 240.0, distance(p, uSunPos));
  }
  // Whole-galaxy draws: place the cloud in the world — identity for the Milky Way,
  // Andromeda's measured orientation and moving centre for its own — then the mutual
  // tide, then, while the remnant relaxes, the slide into a single spheroid.
  if(uGal > 0.5){
    float rL = length(aPos.xz);      // radius in the galaxy's own disk, pre-transform
    p = uGRot*p + uGOff;
    // Tidal pull toward the companion. A real encounter is an N-body problem; this is
    // the leading effect only — the differential pull grows with disk radius, so the
    // outer disk reaches into a bridge while the core barely moves. Softened and
    // capped: a bare inverse square tears passing stars into a streak.
    if(uTide > 0.001){
      vec3 dv = uAnd - p;
      float dd = length(dv);
      float pull = uTide * (rL/900.0) * 480.0 / (1.0 + (dd*dd)/(2600.0*2600.0));
      p += normalize(dv) * min(pull, 560.0);
    }
    // Coalescence: violent relaxation scrambles both disks into one elliptical.
    // Each star slides to a stable pseudo-random spot on a de-Vaucouleurs-ish
    // spheroid, mildly flattened, its radius loosely keeping the star's rank.
    if(uMerge > 0.001){
      float h1 = fract(sin(dot(aPos.xy, vec2(127.1,311.7)))*43758.5453);
      float h2 = fract(sin(dot(aPos.yz, vec2(269.5,183.3)))*43758.5453);
      float cz = h2*2.0-1.0, sz = sqrt(max(0.0, 1.0-cz*cz)), ph = 6.28318*h1;
      vec3 tgt = vec3(sz*cos(ph), cz*0.72, sz*sin(ph))
               * (90.0 + 200.0*pow(0.5*(h1+h2), 1.6)*3.0 + length(aPos)*0.34);
      p = mix(p, tgt, uMerge*uMerge);
    }
  }
  vec4 mv = uView * vec4(p - uOrg,1.0);
  gl_Position = uProj * mv;
  float dd = max(1e-9, -mv.z); // no floor of 1: real-scale zooms get much closer than that
  float s0 = aSize * uPx / dd;
  gl_PointSize = clamp(s0, max(uMinSz, 0.7), uCap);
  // a star smaller than a pixel keeps its flux, not its size: clamped points dim by
  // the area they were denied, so the far field stops shimmering at full brightness.
  // Referenced against the fixed floor, so the min-size slider still brightens.
  float sub = clamp(s0/0.7, 0.0, 1.0);
  float fluxKeep = mix(1.0, sub*sub, 0.62);
  vec3 col = aColor;
  if(uVarMode > 0.5){
    float h = fract(sin(dot(aPos.xz, vec2(12.9898,78.233)))*43758.5453);
    if(uVarMode < 1.5){
      // variable stars: ~4-5% of points pulse Mira/Cepheid-style — dimmer AND redder
      // at minimum light, because the star is coolest there
      if(h > 0.955){
        float w = 2.0 + 10.0*fract(h*97.0);
        float dim = 0.5 + 0.5*sin(uTime*w + h*6283.0);
        col *= 0.45 + 0.75*dim;
        col.g *= 0.85 + 0.15*dim;
        col.b *= 0.70 + 0.30*dim;
      }
    } else {
      // nebulae: every puff breathes gently and drifts in hue (ionization flicker)
      float ph = h*6283.0;
      float s1 = sin(uTime*0.5 + ph), s2 = sin(uTime*0.23 + ph*1.7);
      col *= 0.82 + 0.18*s1;
      col.r *= 1.0 + 0.10*s2;
      col.b *= 1.0 - 0.08*s2;
    }
  }
  // A floor rather than a gain: anything already brighter than it is left alone, so
  // raising it reveals the faint disk without blowing out the arms and the core.
  if(uMinB > 0.0){
    float lum = max(max(col.r, col.g), col.b);
    if(lum > 0.0002 && lum < uMinB) col *= uMinB/lum;
  }
  vColor = col * fade * fluxKeep * (1.0 - uFadeOut);
}