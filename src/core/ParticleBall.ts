import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders/ParticleShaders';

export class ParticleBall {
  public mesh: THREE.Points;
  private material: THREE.ShaderMaterial;
  private targetImplode = 0;
  private targetExplode = 0;

  constructor() {
    const geometry = new THREE.SphereGeometry(0.8, 64, 64); // High density
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x00bfff) },
        uImplode: { value: 0 },
        uExplode: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.mesh = new THREE.Points(geometry, this.material);
  }

  update(time: number) {
    this.material.uniforms.uTime!.value = time;
    const uniforms = this.material.uniforms;
    uniforms.uImplode!.value = THREE.MathUtils.lerp(uniforms.uImplode!.value, this.targetImplode, 0.15);
    uniforms.uExplode!.value = THREE.MathUtils.lerp(uniforms.uExplode!.value, this.targetExplode, 0.15); 
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
}
