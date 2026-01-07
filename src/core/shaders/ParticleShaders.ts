export const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uImplode; // 0.0 = normal, 1.0 = imploded

  void main() {
    vUv = uv;

    // Calculate implosion: lerp between original position and a point near center
    // We use 0.1 so it doesn't disappear entirely, but looks like a dense core
    vec3 implodedPos = position * 0.1;
    vec3 finalPos = mix(position, implodedPos, uImplode);

    // Add some "unstable" jitter when imploding
    if(uImplode > 0.1) {
       finalPos += sin(uTime * 20.0 + position.y) * 0.02 * uImplode;
    }

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);

    // Inverse scaling as requested before
    float baseSize = 2.0;
    float distanceScale = abs(mvPosition.z) * 0.5;

    gl_PointSize = baseSize * distanceScale;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fragmentShader = `
  uniform vec3 uColor; // Add this line

  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;

    float glow = 0.5 - r;
    // Use the uniform here
    gl_FragColor = vec4(uColor * glow * 2.0, 1.0);
  }
`;
