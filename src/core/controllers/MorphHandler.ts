import * as THREE from "three";
import type { Object } from "../objects/Object";

export class MorphHandler {
  private isMorphing: boolean = false;
  private progress: number = 0;
  private currentModel: Object | null = null;
  private targetModel: Object | null = null;

  private readonly MORPH_SPEED = 1.2;

  public startMorph(current: Object, target: Object): void {
    if (this.isMorphing) return;

    this.isMorphing = true;
    this.progress = 0;
    this.currentModel = current;
    this.targetModel = target;

    const targetPositions = target.mesh.geometry.getAttribute("position");
    this.currentModel.mesh.geometry.setAttribute(
      "aTargetPosition",
      targetPositions,
    );
  }

  public update(delta: number): boolean {
    if (!this.isMorphing || !this.currentModel) return false;

    this.progress += delta * this.MORPH_SPEED;

    const material = this.currentModel.mesh.material as THREE.ShaderMaterial;
    if (material.uniforms.uMorphProgress) {
      material.uniforms.uMorphProgress.value = Math.min(this.progress, 1.0);
    }

    if (this.progress >= 1.0) {
      this.isMorphing = false;
      return true;
    }

    return false;
  }

  public getTargetModel(): Object | null {
    return this.targetModel;
  }

  public isActive(): boolean {
    return this.isMorphing;
  }
}
