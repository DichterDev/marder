uniform vec3 uOrange;
uniform vec3 uBlack;
varying vec3 vPosition;

void main() {
    if (length(gl_PointCoord - 0.5) > 0.5) discard;

    // Normalize coordinates for pattern mapping
    vec3 n = normalize(vPosition);
    
    // Procedural Basketball Seams logic
    float thickness = 0.03;
    float verticalSeam = step(1.0 - thickness, abs(n.x)) + step(1.0 - thickness, abs(n.z));
    float horizontalSeam = step(thickness, abs(n.y)) * step(abs(n.y), thickness * 1.5);
    float equator = step(1.0 - thickness, abs(n.y));

    float isSeam = clamp(verticalSeam + horizontalSeam + equator, 0.0, 1.0);
    vec3 finalColor = mix(uOrange, uBlack, isSeam);

    gl_FragColor = vec4(finalColor, 1.0);
}