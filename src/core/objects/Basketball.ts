import * as THREE from "three";
import { PARTICLE_RES } from "../Constants";
import vertexShader from "../shaders/basketball/vertex.glsl";
import fragmentShader from "../shaders/basketball/fragment.glsl";
import type { Object } from "./Object";
import type { GestureState } from "@/types/GestureState";

export class Basketball implements Object {
  public mesh: THREE.Points;
  private material: THREE.ShaderMaterial;


  constructor() {
    const geometry = new THREE.SphereGeometry(
      1.0,
      PARTICLE_RES - 1,
      PARTICLE_RES - 1,
    );

    geometry.translate(0, 1, 0);

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uAudioFreq: { value: 0 },
        uScale: { value: 2.0 },
        uOrange: { value: new THREE.Color("#EA7B40") },
        uBlack: { value: new THREE.Color(0x000000) },
        uMorphProgress: { value: 0.0 },
      },
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    this.mesh = new THREE.Points(geometry, this.material);
  }

  public update(elapsed: number, delta: number): void {
    const uniforms = this.material!.uniforms;

    uniforms.uTime!.value = elapsed;

    this.mesh.rotation.y += 10 * delta;

    uniforms.uScale!.value = 2.0;
  }

  handleAudio(freq: number): void {
    this.material.uniforms.uAudioFreq!.value = freq;
  }

  handleGesture(state: GestureState): void {}

  public dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
