#include "../common/utils.glsl"

uniform float uTime;
uniform float uAudioFreq;
uniform float uScale;
varying vec3 vPosition;

void main() {
    vec3 pos = position;

    // Apply Audio Wobble (vibrating heart effect)
    pos += calculateWobble(pos, uTime, uAudioFreq);
    
    pos *= uScale;
    vPosition = pos;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (14.0 / -mvPosition.z); // Slightly larger particles for the heart
    gl_Position = projectionMatrix * mvPosition;
}