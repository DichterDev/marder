const float RECOVERY = 8.0;
const float SPEED_X = 2.0;
const float SPEED_Y = 1.5;

float getWobbleNoise(vec3 p, float time) {
  return sin(p.x * RECOVERY + time * SPEED_X) * cos(p.y * RECOVERY + time * SPEED_Y) * sin(p.z * RECOVERY + time);
}

float getDetailNoise(vec3 p, float time) {
  return sin(p.x * 20.0 - time * 2.0) * cos(p.z * 20.0 + time * 2.0);
}

vec3 calculateWobble(vec3 pos, float time, float audioFreq) {
  float noise = getWobbleNoise(pos, time);

  float displacement = noise * 0.3 * pow(audioFreq, 2.0);

  return normalize(pos) * displacement;
}

vec3 morphPosition(vec3 current, vec3 target, float progress) {
  return mix(current, target, progress);
}
