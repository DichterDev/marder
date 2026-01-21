#include "../common/utils.glsl"

uniform float uTime;
uniform float uAudioFreq;
uniform float uScale;
uniform bool uExplode;
uniform float uExplodeTime;
uniform float uMorphProgress;

attribute vec3 aTargetPosition;

varying vec3 vPosition;

void main() {
  vec3 pos = position;

  if (uExplode) {
    vec3 baseDir = normalize(position);

    float noiseX = getWobbleNoise(pos.xyz, uTime * 0.5);
    float noiseY = getWobbleNoise(pos.yzx, uTime * 0.5);
    float noiseZ = getWobbleNoise(pos.zxy, uTime * 0.5);
    vec3 noiseDir = vec3(noiseX, noiseY, noiseZ) * 0.4;

    vec3 finalDir = normalize(baseDir + noiseDir);

    float speed = 3.0;

    float individualSpeed = speed * (0.8 + getDetailNoise(pos, 0.0) * 0.4);

    pos += finalDir * individualSpeed * uExplodeTime;
  } else {
    pos = morphPosition(position, aTargetPosition, uMorphProgress);
    pos += calculateWobble(pos, uTime, uAudioFreq);
  }

  pos *= uScale;

  vPosition = pos;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  float baseSize = 3.0;

  gl_PointSize = baseSize * (10.0 / length(mvPosition.xyz));
  gl_Position = projectionMatrix * mvPosition;
}
