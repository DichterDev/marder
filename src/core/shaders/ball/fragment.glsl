// Uniforms received from the TypeScript ParticleBall object
uniform vec3 uColorStart;
uniform vec3 uColorEnd;
uniform float uTime;

// Varying received from the Vertex Shader
varying vec3 vPosition;

void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) {
        discard;
    }
    float h = sin(vPosition.y * 2.0 + uTime * 1.5) * 0.5 + 0.5;

    vec3 finalColor = mix(uColorStart, uColorEnd, h);

    gl_FragColor = vec4(finalColor, 1.0);
}