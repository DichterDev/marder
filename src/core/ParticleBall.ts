import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders/ParticleShaders";

export class ParticleBall {
  public mesh: THREE.Points;
  private material: THREE.ShaderMaterial;
  private targetImplode = 0;
  private targetExplode = 0;

  private minScale = 0.4;
  private maxScale = 1.8;
  private currentScale = 1.0;

  constructor() {
    const geometry = new THREE.SphereGeometry(0.8, 128, 128);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x00bfff) },
        uImplode: { value: 0 },
        uExplode: { value: 0 },
        uAudioFreq: { value: 0 },
        uScale: { value: 1.0 }, // New Uniform for size constraints
      },
      transparent: false,
      blending: THREE.NormalBlending,
      depthWrite: true,
    });
    this.mesh = new THREE.Points(geometry, this.material);
  }

  public update(time: number) {
    this.material.uniforms.uTime!.value = time;
    const uniforms = this.material.uniforms;

    // SLOWER TRANSITIONS: Changed from 0.15 to 0.05
    const transitionSpeed = 0.05;

    uniforms.uImplode!.value = THREE.MathUtils.lerp(
      uniforms.uImplode!.value,
      this.targetImplode,
      transitionSpeed,
    );

    uniforms.uExplode!.value = THREE.MathUtils.lerp(
      uniforms.uExplode!.value,
      this.targetExplode,
      transitionSpeed,
    );

    let targetScale = 1.0;
    if (this.targetImplode > 0.5) targetScale = this.minScale;
    if (this.targetExplode > 0.5) targetScale = this.maxScale;

    this.currentScale = THREE.MathUtils.lerp(
      this.currentScale,
      targetScale,
      transitionSpeed,
    );
    uniforms.uScale!.value = this.currentScale;
  }
  setColor(color: string) {
    let val = new THREE.Color(color);
    this.material.uniforms.uColor!.value = val;
  }

  public setImplode(active: boolean) {
    this.targetImplode = active ? 1 : 0;
  }

  public setExplode(active: boolean) {
    this.targetExplode = active ? 1 : 0;
  }

  public setAudioReaction(freq: number) {
    this.material.uniforms.uAudioFreq!.value = freq;
  }
}
