import * as THREE from "three";
import type { GestureRecognizerResult } from "@mediapipe/tasks-vision";
import { Sphere } from "../objects/Sphere";
import { AudioHandler } from "../controllers/AudioHandler";
import { GestureHandler } from "../controllers/GestureHandler";
import { HandGesture } from "../../types/Gestures";
import type { GestureState } from "@/types/GestureState";
import type { Object } from "../objects/Object";
import { MorphHandler } from "../controllers/MorphHandler";
import { Basketball } from "../objects/Basketball";
import { Heart } from "../objects/Heart";

export class SceneManager {
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private audio: AudioHandler = new AudioHandler();
  private clock: THREE.Clock = new THREE.Clock();
  private gestureHandler: GestureHandler = new GestureHandler();
  private morphHandler: MorphHandler = new MorphHandler();

  private readonly frameInterval: number = 1 / 60;
  private deltaAccumulator: number = 0;

  private prevGestureState: GestureState | null = null;
  private gCounterLeft: number = 0;
  private gCounterRight: number = 0;

  private currentModel: Object;

  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const aspect = width / height;

    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.z = 12;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });

    this.renderer.setSize(width, height, false);

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.currentModel = new Sphere();
    this.scene.add(this.currentModel.mesh);

    window.addEventListener("resize", () => this.onWindowResize());
  }

  public async initAudio(): Promise<void> {
    await this.audio.init();
  }

  public render(results: GestureRecognizerResult | null): void {
    const frameDelta = this.clock.getDelta();
    this.deltaAccumulator += frameDelta;

    if (this.deltaAccumulator < this.frameInterval) {
      return;
    }

    const logicDelta = this.deltaAccumulator;
    this.deltaAccumulator %= this.frameInterval;
    const elapsed = this.clock.getElapsedTime();

    if (this.morphHandler.update(logicDelta)) {
      this.completeMorph();
    }

    if (results && !this.morphHandler.isActive()) {
      const state = this.gestureHandler.processResults(results);
      this.applyGestureState(state);
    }

    const bass = this.audio.getFrequencyData();
    this.currentModel.handleAudio(bass);

    this.currentModel.update(elapsed, logicDelta);

    this.renderer.render(this.scene, this.camera);
  }

  private applyGestureState(state: GestureState): void {
    if (this.prevGestureState) {
      if (this.prevGestureState.leftHand.gesture === state.leftHand.gesture) {
        this.gCounterLeft += 1;
      } else {
        this.gCounterLeft = 0;
      }

      if (this.prevGestureState.rightHand.gesture === state.rightHand.gesture) {
        this.gCounterRight += 1;
      } else {
        this.gCounterRight = 0;
      }
    }

    this.prevGestureState = state;

    if (state.leftHand.exists && !state.rightHand.exists) {
      let nextModel: Object | null = null;

      switch (state.leftHand.gesture) {
        case HandGesture.CLOSED_FIST:
          if (!(this.currentModel instanceof Sphere)) nextModel = new Sphere();
          break;
        case HandGesture.POINTING_UP:
          if (!(this.currentModel instanceof Basketball))
            nextModel = new Basketball();
          break;
        case HandGesture.I_LOVE_YOU:
          if (!(this.currentModel instanceof Heart)) nextModel = new Heart();
          break;
      }

      if (nextModel) {
        this.morphHandler.startMorph(this.currentModel, nextModel);
      }
    }

    if (this.gCounterLeft < 10) {
      state.leftHand.gesture = HandGesture.NONE;
    }

    if (this.gCounterRight < 10) {
      state.rightHand.gesture = HandGesture.NONE;
    }

    this.currentModel.handleGesture(state);

    if (state.targetPosition) {
      const target = new THREE.Vector3(
        state.targetPosition.x,
        state.targetPosition.y,
        state.targetPosition.z,
      );
      this.currentModel.mesh.position.lerp(target, 0.1);
    }
  }

  private onWindowResize(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private completeMorph(): void {
    const target = this.morphHandler.getTargetModel();
    if (!target) return;

    const lastPos = this.currentModel.mesh.position.clone();

    this.scene.remove(this.currentModel.mesh);
    this.currentModel.dispose();

    this.currentModel = target;
    this.currentModel.mesh.position.copy(lastPos);
    this.scene.add(this.currentModel.mesh);
  }

  public dispose(): void {
    this.scene.remove(this.currentModel.mesh);
    this.renderer.dispose();
    this.currentModel.dispose();
  }
}
