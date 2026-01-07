// src/core/shaders/ParticleShaders.ts

export const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  uniform float uTime;
  uniform float uImplode;
  uniform float uExplode;
  uniform float uAudioFreq;
  uniform float uScale;

  void main() {
    vUv = uv;
    vPosition = position;

    vec3 normalDir = normalize(position);
    
    // 1. Base Scaling
    vec3 scaledPos = position * uScale;

    // 2. Solar Flare / Swirling Spikes Logic
    // Adding uTime inside the trig functions causes the 'noise' to rotate
    float noise = sin(position.x * 8.0 + uTime * 2.0) * cos(position.y * 8.0 + uTime * 1.5) * sin(position.z * 8.0 + uTime);
    
    // Spike reaction to Audio
    float spikeFactor = pow(uAudioFreq, 2.5) * 4.0; 
    vec3 spikeOffset = normalDir * (noise * spikeFactor);

    // 3. Morph States
    vec3 implodedPos = scaledPos * 0.2; 
    vec3 explodedPos = scaledPos + normalDir * 1.5;

    // 4. Final Position
    vec3 targetPos = mix(scaledPos, implodedPos, uImplode);
    targetPos = mix(targetPos, explodedPos, uExplode);
    targetPos += spikeOffset;

    vec4 mvPosition = modelViewMatrix * vec4(targetPos, 1.0);
    
    float baseSize = 5.0; 
    float distanceScale = (10.0 / length(mvPosition.xyz)); 
    gl_PointSize = baseSize * distanceScale;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fragmentShader = `
  varying vec3 vPosition;
  uniform float uTime;
  uniform vec3 uColor;

  vec3 getRainbow(float hue) {
    vec3 rgb = clamp(abs(mod(hue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return rgb;
  }

  void main() {
    // 1. Create a hard-edged circle
    float dist = distance(gl_PointCoord, vec2(0.5));
    
    // Hard discard: anything outside the radius is gone. 
    // No anti-aliasing or transparency = no black outlines.
    if (dist > 0.5) discard;

    // 2. Rainbow Color Logic
    // This only changes the color based on time and vertical position
    float hue = mod(uTime * 0.1 + vPosition.y * 0.2, 1.0);
    vec3 rainbowColor = getRainbow(hue);
    
    // Mix the gesture color (Red/Green) with the rainbow
    vec3 finalColor = mix(uColor, rainbowColor, 0.7);

    // 3. Output as a solid, 100% opaque block
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
