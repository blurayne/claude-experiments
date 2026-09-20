#version 300 es
// One quad per radio object, built from the vertex index — no buffer. The corners are the
// object's outline in its own sky plane, with margin for the soft edges: centre plus the two
// half-axis vectors, each scaled by uMargin. The fragment shader gets the corner's place on
// the outline as uv in [−1, 1]·uMargin.
uniform mat4 uProj, uView;
uniform vec3 uC, uA, uB;
uniform float uMargin;
out vec2 vUv;
void main(){
  int i = gl_VertexID;
  vec2 q = vec2(float(i & 1)*2.0 - 1.0, float((i >> 1) & 1)*2.0 - 1.0)*uMargin;
  vUv = q;
  gl_Position = uProj*uView*vec4(uC + uA*q.x + uB*q.y, 1.0);
}
