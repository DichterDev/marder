uniform vec3 uColorStart;
uniform vec3 uColorEnd;
uniform float uColorEase;

varying vec3 vPosition;

void main() {
    // Round particle shape
    if (length(gl_PointCoord - 0.5) > 0.5) discard;

    // Heart Gradient mapping (Y-axis)
    float h = clamp((vPosition.y / 0.8) + 0.5, 0.0, 1.0);
    vec3 finalColor = mix(uColorStart, uColorEnd, h);

    gl_FragColor = vec4(finalColor, 1.0);
}