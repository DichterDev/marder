import * as THREE from "three";
import { PARTICLE_RES } from "../Constants";
import vertexShader from "../shaders/basketball/vertex.glsl";
import fragmentShader from "../shaders/basketball/fragment.glsl";
import type { Object } from "./Object";
import type { GestureState } from "@/types/GestureState";

export class Basketball implements Object {
  public mesh: THREE.Points;
  private material: THREE.ShaderMaterial;

  private currentScale: number = 1.0;

  constructor() {
    const geometry = new THREE.SphereGeometry(
      1.0,
      PARTICLE_RES - 1,
      PARTICLE_RES - 1,
    );

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uAudioFreq: { value: 0 },
        uScale: { value: 1.0 },
        uOrange: { value: new THREE.Color(THREE.Color.NAMES.darkorange) },
        uBlack: { value: new THREE.Color(THREE.Color.NAMES.black) },
        uMorphProgress: { value: 0.0 },
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

    uniforms.uScale!.value = this.currentScale;
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
