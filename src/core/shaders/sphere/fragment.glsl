// Uniforms received from the TypeScript ParticleBall object
uniform vec3 uColorStart;
uniform vec3 uColorEnd;
uniform float uTime;
uniform float uScale;
uniform bool uRainbow;

// Varying received from the Vertex Shader
varying vec3 vPosition;

vec3 getRainbow(float t) {
    vec3 c = vec3(t);
    return 0.5 + 0.5 * cos(6.3 * (vec3(1.0, 0.66, 0.33) + t));
}

void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) {
        discard;
    }

    float normY = vPosition.y / uScale;
    float t = uTime * 2.0;
    float y = normY * 3.2;
    float fraction = sin(y + t) * 0.5 + 0.5;

    fraction = pow(fraction, 0.75);

    vec3 finalColor;
    if (uRainbow) {
      finalColor = getRainbow(fraction);
    } else {
      finalColor = mix(uColorStart, uColorEnd, fraction);
    }

    gl_FragColor = vec4(finalColor, 1.0);
}
