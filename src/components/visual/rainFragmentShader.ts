export const rainFragmentShader = `
precision highp float;

// Heartfelt - by Martijn Steinrucken aka BigWings - 2017
// Email: countfrolic@gmail.com  Twitter: @The_ArtOfCode
// Original shader: https://www.shadertoy.com/view/ltffzl
// License: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//
// Port notes:
// - Adapted for this React/WebGL background component.
// - iChannel0 is mapped to public/assets/backgrounds/rainy-mountain.jpg.
// - HAS_HEART behavior is intentionally disabled for a neutral rainy-glass planner background.
// - textureLod is replaced with a small fixed blur sampler for WebGL1 compatibility.

uniform vec3 iResolution;
uniform float iTime;
uniform vec4 iMouse;
uniform sampler2D iChannel0;
uniform vec2 uImageResolution;
uniform float uIntensity;

#define S(a, b, t) smoothstep(a, b, t)

vec3 N13(float p) {
  // from Dave Hoskins
  vec3 p3 = fract(vec3(p) * vec3(.1031, .11369, .13787));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
}

float N(float t) {
  return fract(sin(t * 12345.564) * 7658.76);
}

float Saw(float b, float t) {
  return S(0., b, t) * S(1., b, t);
}

vec2 DropLayer2(vec2 uv, float t) {
  vec2 UV = uv;
  uv.y += t * .75;
  vec2 a = vec2(6., 1.);
  vec2 grid = a * 2.;
  vec2 id = floor(uv * grid);

  float colShift = N(id.x);
  uv.y += colShift;

  id = floor(uv * grid);
  vec3 n = N13(id.x * 35.2 + id.y * 2376.1);
  vec2 st = fract(uv * grid) - vec2(.5, 0.);

  float x = n.x - .5;
  float y = UV.y * 20.;
  float wiggle = sin(y + sin(y));
  x += wiggle * (.5 - abs(x)) * (n.z - .5);
  x *= .7;

  float ti = fract(t + n.z);
  y = (Saw(.85, ti) - .5) * .9 + .5;
  vec2 p = vec2(x, y);

  float d = length((st - p) * a.yx);
  float mainDrop = S(.4, .0, d);

  float r = sqrt(S(1., y, st.y));
  float cd = abs(st.x - x);
  float trail = S(.23 * r, .15 * r * r, cd);
  float trailFront = S(-.02, .02, st.y - y);
  trail *= trailFront * r * r;

  y = UV.y;
  float trail2 = S(.2 * r, .0, cd);
  float droplets = max(0., (sin(y * (1. - y) * 120.) - st.y)) * trail2 * trailFront * n.z;
  y = fract(y * 10.) + (st.y - .5);
  float dd = length(st - vec2(x, y));
  droplets = S(.3, 0., dd);

  float m = mainDrop + droplets * r * trailFront;
  return vec2(m, trail);
}

float StaticDrops(vec2 uv, float t) {
  uv *= 40.;
  vec2 id = floor(uv);
  uv = fract(uv) - .5;
  vec3 n = N13(id.x * 107.45 + id.y * 3543.654);
  vec2 p = (n.xy - .5) * .7;
  float d = length(uv - p);
  float fade = Saw(.025, fract(t + n.z));
  return S(.3, 0., d) * fract(n.z * 10.) * fade;
}

vec2 Drops(vec2 uv, float t, float l0, float l1, float l2) {
  float s = StaticDrops(uv, t) * l0;
  vec2 m1 = DropLayer2(uv, t) * l1;
  vec2 m2 = DropLayer2(uv * 1.85, t) * l2;
  float c = s + m1.x + m2.x;
  c = S(.3, 1., c);
  return vec2(c, max(m1.y * l0, m2.y * l1));
}

vec2 coverUv(vec2 uv) {
  vec2 screen = iResolution.xy;
  vec2 image = max(uImageResolution, vec2(1.));
  float screenAspect = screen.x / screen.y;
  float imageAspect = image.x / image.y;

  if (screenAspect > imageAspect) {
    float scale = imageAspect / screenAspect;
    uv.y = uv.y * scale + (1. - scale) * .5;
  } else {
    float scale = screenAspect / imageAspect;
    uv.x = uv.x * scale + (1. - scale) * .5;
  }

  return clamp(uv, vec2(0.), vec2(1.));
}

vec3 blurTexture(vec2 uv, float blur) {
  vec2 px = blur / iResolution.xy;
  vec3 col = texture2D(iChannel0, uv).rgb * .18;
  col += texture2D(iChannel0, uv + px * vec2( 1.,  0.)).rgb * .10;
  col += texture2D(iChannel0, uv + px * vec2(-1.,  0.)).rgb * .10;
  col += texture2D(iChannel0, uv + px * vec2( 0.,  1.)).rgb * .10;
  col += texture2D(iChannel0, uv + px * vec2( 0., -1.)).rgb * .10;
  col += texture2D(iChannel0, uv + px * vec2( 1.,  1.)).rgb * .08;
  col += texture2D(iChannel0, uv + px * vec2(-1.,  1.)).rgb * .08;
  col += texture2D(iChannel0, uv + px * vec2( 1., -1.)).rgb * .08;
  col += texture2D(iChannel0, uv + px * vec2(-1., -1.)).rgb * .08;
  col += texture2D(iChannel0, uv + px * vec2( 2.,  0.)).rgb * .05;
  col += texture2D(iChannel0, uv + px * vec2(-2.,  0.)).rgb * .05;
  return col;
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = (fragCoord - .5 * iResolution.xy) / iResolution.y;
  vec2 UV = fragCoord / iResolution.xy;

  float T = iTime;
  float t = T * .2;
  float rainAmount = clamp(uIntensity, 0., 1.);
  float staticDrops = S(-.5, 1., rainAmount) * 1.15;
  float layer1 = S(.25, .75, rainAmount);
  float layer2 = S(.0, .5, rainAmount);

  vec2 c = Drops(uv, t, staticDrops, layer1, layer2);
  vec2 e = vec2(.0015, 0.);
  float cx = Drops(uv + e, t, staticDrops, layer1, layer2).x;
  float cy = Drops(uv + e.yx, t, staticDrops, layer1, layer2).x;
  vec2 n = vec2(cx - c.x, cy - c.x);

  vec2 refractedUv = coverUv(UV + n * (.075 + rainAmount * .035));
  float focus = mix(5.2, 1.4, S(.08, .22, c.x));
  focus += c.y * 2.2;

  vec3 col = blurTexture(refractedUv, focus);
  col *= mix(vec3(.9, .96, 1.03), vec3(.78, .86, .82), .32);
  col = mix(col, vec3(.78, .84, .80), .12 + rainAmount * .08);

  float vignette = 1. - dot(UV - .5, UV - .5) * .55;
  col *= vignette;
  col *= .88;

  gl_FragColor = vec4(col, 1.);
}
`;
