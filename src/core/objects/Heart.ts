import * as THREE from "three";
import { PARTICLE_RES, PARTICLE_COUNT } from "../Constants";
import vertexShader from "../shaders/heart/vertex.glsl";
import fragmentShader from "../shaders/heart/fragment.glsl";

export class ParticleHeart {
  public mesh: THREE.Points;
  private material: THREE.ShaderMaterial;

  constructor() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);

    // Distribute particles using parametric heart equations
    for (let i = 0; i < PARTICLE_RES; i++) {
      for (let j = 0; j < PARTICLE_RES; j++) {
        const index = (i * PARTICLE_RES + j) * 3;
        
        // Map grid to 0-1 range
        const u = i / PARTICLE_RES;
        const v = j / PARTICLE_RES;
        
        // Parametric angles
        const phi = u * Math.PI * 2;
        const theta = v * Math.PI;

        // 3D Heart Equation (Parametric)
        // x = 16 * sin^3(phi)
        // y = 13 * cos(phi) - 5 * cos(2*phi) - 2 * cos(3*phi) - cos(4*phi)
        // z = adds depth/curvature based on theta
        
        const x = 16 * Math.pow(Math.sin(phi), 3);
        const y = 13 * Math.cos(phi) - 5 * Math.cos(2 * phi) - 2 * Math.cos(3 * phi) - Math.cos(4 * phi);
        
        // Apply vertical curvature to make it 3D (Z-axis depth)
        const z = Math.sin(theta) * (5 + Math.abs(x) * 0.5);

        // Scale down to match the 0.8 base size of the sphere
        const scale = 0.05;
        positions[index] = x * scale;
        positions[index + 1] = y * scale;
        positions[index + 2] = z * scale;
      }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uAudioFreq: { value: 0 },
        uScale: { value: 1.0 },
        uColorStart: { value: new THREE.Color(0xff0000) }, // Deep Red
        uColorEnd: { value: new THREE.Color(0xff6666) },   // Light Red/Pink
        uTargetColorStart: { value: new THREE.Color(0xff0000) },
        uTargetColorEnd: { value: new THREE.Color(0xff6666) },
        uColorEase: { value: 0.0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.mesh = new THREE.Points(geometry, this.material);
  }

  public update(elapsed: number, delta: number): void {
    const uniforms = this.material.uniforms;
    uniforms.uTime!.value = elapsed;

    // Heart only rotates around the X-axis as requested
    this.mesh.rotation.x += 0.8 * delta;

    // Uniform scale/audio response (shared logic)
    uniforms.uScale!.value = 1.0; 
  }

  public setAudioReaction(freq: number): void {
    this.material.uniforms.uAudioFreq!.value = freq;
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}