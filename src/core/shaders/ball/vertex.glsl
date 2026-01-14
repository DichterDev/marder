#include "../common/utils.glsl"

uniform float uTime;
uniform float uAudioFreq;
uniform float uScale;

varying vec3 vPosition;

void main() {
    vec3 pos = position;

    // 1. Apply Audio-Responsive Wobble from utility
    // This creates an intensity-based vibrating effect rather than a simple expansion
    pos += calculateWobble(pos, uTime, uAudioFreq);

    // 2. Apply Scale Constraints (Implode/Explode)
    pos *= uScale;
    
    // Pass position to fragment shader for procedural gradient calculation
    vPosition = pos;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Size attenuation: particles get smaller with distance
    gl_PointSize = (12.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}