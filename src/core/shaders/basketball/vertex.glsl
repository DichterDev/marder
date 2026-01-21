#include "../common/utils.glsl"

uniform float uTime;
uniform float uAudioFreq;
uniform float uScale;
uniform float uMorphProgress;

attribute vec3 aTargetPosition;

varying vec3 vPosition;

void main() {
  vec3 pos = position;

  pos = morphPosition(position, aTargetPosition, uMorphProgress);

  pos += calculateWobble(pos, uTime, uAudioFreq);
  pos *= uScale;
  vPosition = pos;

  vPosition.y = mix(1.0, 0.0, uMorphProgress) * uScale;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  float baseSize = 3.0;
  gl_PointSize = baseSize * (10.0 / length(mvPosition.xyz));
  gl_Position = projectionMatrix * mvPosition;
}
