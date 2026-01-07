export const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uImplode;
  uniform float uExplode;

  void main() {
    vUv = uv;

    // Normal is the direction away from the sphere center
    vec3 direction = normalize(position);

    // Logic:
    // Implode pulls toward center (position * 0.1)
    // Explode pushes away from center (position + direction * 2.0)
    vec3 implodedPos = position * 0.1;
    vec3 explodedPos = position + direction * 2.0;

    // Blend between states
    vec3 targetPos = mix(position, implodedPos, uImplode);
    targetPos = mix(targetPos, explodedPos, uExplode);

    vec4 mvPosition = modelViewMatrix * vec4(targetPos, 1.0);
    
    // Your Inverse Scaling
    float baseSize = 2.0; 
    float distanceScale = abs(mvPosition.z) * 0.5; 
    gl_PointSize = baseSize * distanceScale;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition; // Pass position from vertex shader
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uAudioFreq; // We'll add this for audio

  // Helper function for rainbow colors
  vec3 rainbow(float h) {
    float r = abs(h * 6.0 - 3.0) - 1.0;
    float g = 2.0 - abs(h * 6.0 - 2.0);
    float b = 2.0 - abs(h * 6.0 - 4.0);
    return clamp(vec3(r, g, b), 0.0, 1.0);
  }

  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Cycle hue based on time and position
    float hue = mod(uTime * 0.2 + vPosition.y * 0.1, 1.0);
    vec3 rainbowColor = rainbow(hue);

    // Mix standard color with rainbow based on some logic or keep it pure rainbow
    vec3 finalColor = mix(uColor, rainbowColor, 0.8);

    float glow = 0.5 - r;
    gl_FragColor = vec4(finalColor * glow * (2.0 + uAudioFreq * 5.0), 1.0);
  }
`;
