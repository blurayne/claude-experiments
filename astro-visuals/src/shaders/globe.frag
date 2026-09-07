#version 300 es
precision highp float;
uniform vec3 uSunV, uAxisV, uPrimeV;     // view space: toward the Sun; the spin axis; the prime meridian on the equator
uniform float uAvg;                      // 1: the clock outruns the day — light is the daily mean by latitude
uniform float uMirror, uDisc, uTime, uMoon;
uniform float uMolten, uOcean, uSea, uHaze, uVeg, uIceLat, uCloud, uLights, uDrift;
uniform sampler2D uMap; uniform float uHasMap, uDry, uSeaLevel; uniform mat3 uPlate[7];
out vec4 o;
// today's real land and its plate, looked up for a planet-frame direction
vec3 mapAt(vec3 v){ float lat = asin(clamp(v.z,-1.0,1.0)), lon = atan(v.y, v.x);
  return texture(uMap, vec2(lon/6.2831853+0.5, 0.5-lat/3.14159265)).rgb; }
float h31(vec3 p){ p=fract(p*0.3183099+vec3(0.71,0.113,0.419)); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn3(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x), mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x), mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm3(vec3 p){ float a=0.5,s=0.0; for(int i=0;i<4;i++){ s+=a*vn3(p); p=p*2.07+vec3(1.3,2.1,0.7); a*=0.5; } return s; }
void main(){
  vec2 q = gl_PointCoord*2.0-1.0; q.y = -q.y; q.x *= uMirror;   // sprite space -> view space
  float rr = length(q)/uDisc;
  if(rr > 1.09) discard;
  if(rr > 1.0){                                                 // the atmosphere, beyond the limb
    if(uMoon > 0.5 || uMolten > 0.99) discard;
    float t = (rr-1.0)/0.09, glow = exp(-t*2.6)*(1.0-t);
    vec3 atm = mix(vec3(0.38,0.62,1.0), vec3(1.0,0.58,0.28), uHaze);
    vec2 d = q/max(length(q),1e-4);
    float side = smoothstep(-0.45, 0.45, dot(vec3(d,0.0), uSunV) + 0.35*uSunV.z);
    o = vec4(atm*glow*0.6*side*(0.35+0.65*uOcean), 0.0); return;   // additive
  }
  vec3 n = vec3(q/uDisc, sqrt(max(0.0, 1.0-rr*rr)));
  float lit = dot(n, uSunV);
  vec3 Q = cross(uAxisV, uPrimeV);
  vec3 p = vec3(dot(n,uPrimeV), dot(n,Q), dot(n,uAxisV));       // the planet's own frame; p.z = sin(latitude)
  // when a frame spans days the terminator would land somewhere new each time and strobe;
  // the light becomes the day's mean instead — brightest at the equator, dim at the poles
  lit = mix(lit, 0.18 + 0.62*pow(sqrt(max(0.0, 1.0 - p.z*p.z)), 0.7), uAvg);
  float day = smoothstep(-0.10, 0.18, lit), dif = max(lit, 0.0);
  float lat = abs(asin(clamp(p.z,-1.0,1.0)))*57.2958;
  vec3 col;
  if(uMoon > 0.5){
    // grey regolith, dark maria in the lowest of the low-frequency noise, and a pass of
    // fine crater texture; no atmosphere, so the terminator is hard
    float m = fbm3(p*2.4+vec3(4.0)), c = fbm3(p*13.0);
    float maria = smoothstep(0.66, 0.74, m);
    col = mix(vec3(0.56,0.55,0.53), vec3(0.28,0.28,0.30), maria) * (0.82+0.36*(c-0.5));
    col *= 0.04 + 0.96*pow(dif, 0.85);
    o = vec4(col, 1.0); return;
  }
  vec3 dr = vec3(uDrift, uDrift*0.7, -uDrift*0.4);
  float land, shallow, cont = 0.0;
  if(uHasMap > 0.5){
    // the real map: each plate carried by its own rotation. Every plate is asked, and
    // land wins over water: a plate's polygon carries ocean too, and where two moved
    // polygons overlap that ocean must not punch a hole in the other plate's land.
    // Between the plates, where none claims the point, there is sea.
    land = 0.0; shallow = 0.0;
    for(int k=0;k<7;k++){
      vec3 q = uPlate[k]*p; vec3 m = mapAt(q);
      if(int(floor(m.g*255.0/32.0+0.5)) == k){
        if(m.r > land){ land = m.r; cont = m.b; }
        else if(land <= 0.0) cont = max(cont, m.b);
      }
    }
    // the oceans retreat to their deepest basins as they go — the map has no depths, so
    // the continentality field stands in, inverted
    float water = (1.0-land) * smoothstep(uSeaLevel+0.04, uSeaLevel-0.04, cont);
    land = 1.0 - water;
    shallow = (1.0-land) * smoothstep(0.12, 0.45, cont);   // from 0.12: open water inside a plate's polygon reads as the water outside it, so no seams where a plate has moved
  } else {
    float h = fbm3(p*2.6 + dr) + 0.35*fbm3(p*7.0 + 1.7*dr) - 0.17;
    land = smoothstep(uSea-0.025, uSea+0.025, h);
    shallow = smoothstep(uSea-0.10, uSea, h);
    cont = land*0.5;
  }
  // the land: bare rock, greened by vegetation where it is not desert, whitened by ice.
  // Deserts: the subtropical belts, and the interiors far from any coast — the more so
  // in the dry periods, a supercontinent's heart most of all
  float dry = max(exp(-pow((lat-24.0)/11.0, 2.0)), pow(cont, 1.4)*(0.55 + 0.7*uDry));
  dry = min(1.0, dry*(0.8 + 0.5*uDry));
  float detail = fbm3(p*5.0+dr*2.0);                              // one texture, shared below
  vec3 rock = mix(vec3(0.42,0.32,0.22), vec3(0.62,0.52,0.36), detail);
  vec3 green = mix(vec3(0.15,0.30,0.09), vec3(0.28,0.42,0.14), fract(detail*1.7+0.3));
  vec3 landCol = mix(rock, green, uVeg*(1.0-dry*0.85));
  vec3 sea = mix(vec3(0.02,0.10,0.32), vec3(0.05,0.28,0.42), shallow*0.6);
  sea = mix(sea, vec3(0.06,0.14,0.18), uHaze*0.6);                // a dimmer, greener sea under the haze
  col = mix(sea, landCol, land);
  col = mix(col, vec3(0.42,0.34,0.24), (1.0-uOcean)*(1.0-land));  // a sea floor bared as the oceans go
  float ice = smoothstep(uIceLat-6.0, uIceLat+6.0, lat + 4.0*(detail-0.5)) * (1.0-uMolten);
  col = mix(col, vec3(1.0,1.0,1.0), ice);
  // clouds, drifting, and their shadows a little sunward of them on the ground
  vec3 cq = p*4.2 + vec3(uTime*0.012, 0.0, -uTime*0.007) + dr*0.3;
  float cl = fbm3(cq);
  float cloud = smoothstep(0.50 + 0.22*(1.0-uCloud), 0.74, cl) * min(1.0, uCloud*1.4);
  vec3 sunP = vec3(dot(uSunV,uPrimeV), dot(uSunV,Q), dot(uSunV,uAxisV));   // the Sun in the planet frame
  float clS = fbm3(cq + sunP*0.09*(1.0-uAvg));   // the shadow offset would jump with the Sun's phase
  float shadow = smoothstep(0.50 + 0.22*(1.0-uCloud), 0.74, clS) * min(1.0, uCloud*1.4);
  col *= 1.0 - 0.35*shadow*(1.0-cloud);
  col = mix(col, vec3(0.96,0.97,0.99), cloud*0.92);
  // the haze: an orange cast, thicker toward the limb
  col = mix(col, col*vec3(1.05,0.72,0.42)+vec3(0.10,0.05,0.0), uHaze*(0.45+0.45*(1.0-n.z)));
  // sunlight: snow and cloud scatter forward, so they hold their brightness under a low
  // sun; the terminator is softened by the air, and reddened in it
  float difS = mix(dif, pow(dif, 0.6), max(ice, cloud));
  float dusk = exp(-pow(lit/0.16, 2.0)) * uOcean;                               // the band around the terminator
  vec3 R = reflect(-uSunV, n);
  float spec = pow(max(R.z,0.0), 180.0) * (1.0-land) * (1.0-cloud) * uOcean * (1.0-uHaze*0.7) * (1.0-uAvg);
  col = col*(0.012 + 0.988*difS) + vec3(0.9,0.9,0.8)*spec*0.35;
  col += vec3(0.9,0.45,0.18) * dusk * 0.10 * (1.0-uHaze);
  // the air itself: Rayleigh blue over the day side, strongest where the view grazes it
  float fres = pow(1.0 - n.z, 2.2);
  vec3 air = mix(vec3(0.30,0.55,1.0), vec3(1.0,0.6,0.3), uHaze);
  col += air * fres * (0.10 + 0.45*day) * (0.4 + 0.6*uOcean) * (1.0-uMolten);
  // molten: the crust dark, cracked with lava, glowing on its own — only when it is
  if(uMolten > 0.001){
    float cracks = smoothstep(0.55, 0.78, fbm3(p*9.0+vec3(uTime*0.02)));
    vec3 lava = vec3(0.05,0.03,0.03)*(0.3+0.7*dif) + vec3(1.0,0.32,0.04)*(0.25+cracks*1.2);
    col = mix(col, lava, uMolten);
  }
  // the night side: cities, in the one era that has them, crossfading out through the dusk
  if(uLights > 0.001){
    float city = smoothstep(0.72, 0.9, vn3(p*70.0)) * land * (1.0-ice) * (1.0-dry*0.5);
    col += vec3(1.0,0.80,0.45) * city * uLights * smoothstep(0.12, -0.20, lit) * (1.0-cloud*0.7) * 0.9;
  }
  o = vec4(col, 1.0);
}