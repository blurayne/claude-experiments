#version 300 es
precision mediump float;
in vec3 vColor; in float vPhase; in float vSeed; out vec4 o;
void main(){
  vec2 q = gl_PointCoord*2.0-1.0;
  float r = length(q);
  if(r > 1.0) discard;
  float ang = atan(q.y, q.x) + vSeed*6.2831;
  float d = 1.0 - r;

  // the photosphere: a hard white core, at its tightest right at the collapse
  float core = pow(d, mix(26.0, 9.0, vPhase));
  // the light around it, spreading and softening as the blast runs
  float glow = pow(d, mix(7.0, 3.2, vPhase));

  // Radiating spikes. Two sets at different counts and angles, each a narrow lobe in
  // angle and a slow falloff in radius, so they reach well past the glow. They lead the
  // flash and are gone before it is: the blast is brightest first and blurs outward.
  float lead = exp(-vPhase*2.6);
  float s1 = pow(abs(cos(ang*3.0)), 34.0);
  float s2 = pow(abs(cos(ang*2.0 + 0.9)), 22.0);
  float spikes = (s1*0.85 + s2*0.5) * pow(d, 1.7) * lead;

  // The shock front: a shell overtaking the glow and thinning as it goes. Nothing
  // explodes into a perfect circle, so the radius is bent a little with angle — enough
  // that the front reads as ejecta rather than as a drawn ring.
  // Ejecta are not evenly bright around the rim. Modulating brightness rather than
  // radius is what keeps this: bending the radius with angle only turns the circle into
  // a polygon, while an uneven rim on a round front reads as clumps.
  float sh = clamp(vPhase*1.35, 0.0, 1.0);
  float clumps = 0.68 + 0.32*sin(ang*5.0 + vSeed*17.0)*sin(ang*2.0 - vSeed*9.0);
  float ring = exp(-pow((r - sh)/mix(0.07, 0.19, vPhase), 2.0)) * (1.0 - vPhase)*0.85 * clumps;

  // cooling: blue-white through the peak, then into the ejecta's red
  vec3 hot  = vec3(0.86, 0.92, 1.0);
  vec3 cool = vec3(1.0, 0.52, 0.26);
  vec3 tint = mix(hot, cool, smoothstep(0.15, 1.0, vPhase));

  float a = core*1.5 + glow*0.9 + spikes*0.8 + ring*0.7;
  vec3 col = vColor * tint * (glow*0.9 + spikes*0.8 + ring*0.7)
           + vColor * core * 1.5;              // the core stays white, whatever the tint
  o = vec4(col, a);
}