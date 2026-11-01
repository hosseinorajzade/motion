// Ashima Arts 3D simplex noise (MIT)
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
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
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
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
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`

export const blobVertex = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
uniform vec2 uMouse;
uniform float uMouseForce;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
${noise}

float displace(vec3 p){
  vec3 q = p * uFreq;
  float n = snoise(q + vec3(uTime * 0.22, uTime * 0.17, -uTime * 0.12));
  n += 0.2 * snoise(q * 2.0 - uTime * 0.3);
  // Bulge towards the pointer
  vec3 m = normalize(vec3(uMouse * 1.4, 1.0));
  float pull = pow(max(dot(normalize(p), m), 0.0), 5.0) * uMouseForce;
  return n * uAmp + pull * 0.25;
}

void main(){
  vec3 n = normalize(position);
  float r = length(position);
  vec3 up = abs(n.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 t = normalize(cross(n, up));
  vec3 b = normalize(cross(n, t));

  float d = displace(position);
  vec3 p0 = position + n * d;

  // Recompute the normal from two neighbouring displaced points
  float e = 0.012;
  vec3 q1 = normalize(position + t * e) * r;
  vec3 q2 = normalize(position + b * e) * r;
  vec3 p1 = q1 + normalize(q1) * displace(q1);
  vec3 p2 = q2 + normalize(q2) * displace(q2);
  vec3 nn = normalize(cross(p1 - p0, p2 - p0));
  if (dot(nn, n) < 0.0) nn = -nn;

  vNoise = d;
  vNormal = normalize(normalMatrix * nn);
  vec4 mv = modelViewMatrix * vec4(p0, 1.0);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`

export const blobFragment = /* glsl */ `
uniform vec3 uAccent;
uniform vec3 uDeep;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;

void main(){
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vView);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.4);

  vec3 l1 = normalize(vec3(-0.6, 0.8, 0.7));
  vec3 l2 = normalize(vec3(0.8, -0.4, 0.3));
  float diff = max(dot(n, l1), 0.0);
  float spec = pow(max(dot(n, normalize(l1 + v)), 0.0), 140.0);
  float rim2 = pow(max(dot(n, l2), 0.0), 3.0);

  vec3 irid = 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + fres * 0.7 + vNoise * 0.8 + uTime * 0.02));
  vec3 col = mix(vec3(0.02), uDeep, diff * 0.55);
  col += irid * fres * 0.28;
  col += uAccent * pow(fres, 1.3) * 1.15;
  col += uAccent * rim2 * 0.35;
  col += vec3(1.0) * spec * 0.12;
  col += uAccent * smoothstep(0.15, 0.55, vNoise) * 0.12;
  gl_FragColor = vec4(col, 1.0);
}
`

export const particlesVertex = /* glsl */ `
uniform float uTime;
uniform float uSize;
attribute float aSeed;
varying float vSeed;
void main(){
  vec3 p = position;
  p += 0.08 * vec3(sin(uTime * 0.6 + aSeed * 40.0), cos(uTime * 0.5 + aSeed * 30.0), sin(uTime * 0.4 + aSeed * 20.0));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (0.4 + aSeed) * (1.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
  vSeed = aSeed;
}
`

export const particlesFragment = /* glsl */ `
uniform vec3 uAccent;
varying float vSeed;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  vec3 col = mix(vec3(0.94, 0.93, 0.9), uAccent, step(0.82, vSeed));
  gl_FragColor = vec4(col, a * (0.25 + vSeed * 0.55));
}
`
