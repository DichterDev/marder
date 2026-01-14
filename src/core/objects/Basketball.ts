import * as THREE from "three";
import { PARTICLE_RES } from "../Constants";
import vertexShader from "../shaders/ball/vertex.glsl";
import fragmentShader from "../shaders/ball/fragment.glsl";

export class ParticleBall {
  public mesh: THREE.Points;
  private material: THREE.ShaderMaterial;
  
  // Internal "Source of Truth" for the colors we WANT to reach
  private targetColorStart = new THREE.Color(0xFFFFFF);
  private targetColorEnd = new THREE.Color(0x757575);

  // States for scaling
  private targetImplode = 0;
  private targetExplode = 0;
  private currentScale = 1.0;

  constructor() {
    // Using the shared resolution constant for future morphing compatibility
    const geometry = new THREE.SphereGeometry(0.8, PARTICLE_RES, PARTICLE_RES);
    
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uAudioFreq: { value: 0 },
        uScale: { value: 1.0 },
        uColorStart: { value: this.targetColorStart },
        uColorEnd: { value: this.targetColorEnd },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.mesh = new THREE.Points(geometry, this.material);
  }

  public update(elapsed: number, delta: number): void {
    const uniforms = this.material!.uniforms;
    
    uniforms.uTime!.value = elapsed;

    this.mesh.rotation.y += 0.5 * delta;
    this.mesh.rotation.x += 0.2 * delta;

    // 3. Fluid Color Flow (Exponential Decay)
    const flowSpeed = 2.5; 
    const lerpFactor = 1.0 - Math.exp(-flowSpeed * delta);

    // Smoothly nudge visible colors toward target colors
    uniforms.uColorStart!.value.lerp(this.targetColorStart, lerpFactor);
    uniforms.uColorEnd!.value.lerp(this.targetColorEnd, lerpFactor);

    // 4. Smooth Scaling (Implode / Explode Logic)
    const scaleLerp = 1.0 - Math.pow(0.001, delta);
    let targetScale = 1.0;
    if (this.targetImplode > 0.5) targetScale = 0.4;
    else if (this.targetExplode > 0.5) targetScale = 1.8;

    this.currentScale = THREE.MathUtils.lerp(this.currentScale, targetScale, scaleLerp);
    uniforms.uScale!.value = this.currentScale;
  }

  public setGradient(start: string | number, end: string | number): void {
    this.targetColorStart.set(start);
    this.targetColorEnd.set(end);
  }

  public setAudioReaction(freq: number): void {
    this.material!.uniforms.uAudioFreq!.value = freq;
  }

  public setImplode(active: boolean): void { this.targetImplode = active ? 1 : 0; }
  public setExplode(active: boolean): void { this.targetExplode = active ? 1 : 0; }

  public dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}