// Common Utilities for Marder Particle Project

const float RECOVERY = 8.0;
const float SPEED_X = 2.0;
const float SPEED_Y = 1.5;

// 3D Pseudo-Noise using trigonometric math
// Provides a lightweight "wobble" without external dependencies
float getWobbleNoise(vec3 p, float time) {
    return sin(p.x * RECOVERY + time * SPEED_X) * cos(p.y * RECOVERY + time * SPEED_Y) * sin(p.z * RECOVERY + time);
}

// Higher frequency noise for detail or "shimmer"
float getDetailNoise(vec3 p, float time) {
    return sin(p.x * 20.0 - time * 2.0) * cos(p.z * 20.0 + time * 2.0);
}

// Calculates a 3D displacement vector based on audio frequency
// Used to create a vibrating, organic motion responsive to bass
vec3 calculateWobble(vec3 pos, float time, float audioFreq) {
    float noise = getWobbleNoise(pos, time);

    // Displacement scales directly with the audio handler output
    float displacement = noise * pow(audioFreq, 2.5);
    
    return normalize(pos) * displacement;
}

// Shared Morphing Interpolation for vertex transitions
vec3 morphPosition(vec3 current, vec3 target, float progress) {
    return mix(current, target, progress);
}