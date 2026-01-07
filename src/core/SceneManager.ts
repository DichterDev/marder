// src/core/SceneManager.ts
import * as THREE from "three";
import type {
  GestureRecognizerResult,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import { ParticleBall } from "./ParticleBall";
import { HandLandmark } from "../types/HandLandmarks";
import { HandGesture } from "../types/Gestures";
import { DetectedHand } from "../types/DetectedHand.ts";
import { AudioHandler } from "./AudioHandler";
import Stats from "stats.js";

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private ball: ParticleBall;
  private audio: AudioHandler;
  private stats: Stats;

  constructor(canvas: HTMLCanvasElement) {
    this.stats = new Stats();
    this.stats.showPanel(0);

    this.stats.dom.style.position = "absolute";
    this.stats.dom.style.top = "10px";
    this.stats.dom.style.left = "10px";
    this.stats.dom.style.zIndex = "100";
    document.body.appendChild(this.stats.dom);

    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.z = 12;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.ball = new ParticleBall();
    this.scene.add(this.ball.mesh);

    this.audio = new AudioHandler();

    window.addEventListener("resize", () => this.onWindowResize());
  }

  public async initAudio(): Promise<void> {
    await this.audio.init();
  }

  public render(results: GestureRecognizerResult | null): void {
    this.stats.begin();

    if (results) {
      this.processHandData(results);
    }

    const time = performance.now() / 1000;

    // 1. Fetch Bass Data
    const freq = this.audio.getFrequencyData();
    this.ball.setAudioReaction(freq);

    // 2. Update Ball (handles lerps)
    this.ball.update(time);

    // 3. APPLY CONSTANT ROTATION
    // Y-axis rotation creates a traditional spin, X-axis adds a slight tumble
    this.ball.mesh.rotation.y += 0.005;
    this.ball.mesh.rotation.x += 0.002;

    this.renderer.render(this.scene, this.camera);

    this.stats.end();
  }

  private processHandData(results: GestureRecognizerResult): void {
    if (!results.landmarks || results.landmarks.length === 0) return;

    // Initialize with empty objects using the new class
    let leftHand = new DetectedHand();
    let rightHand = new DetectedHand();

    results.landmarks.forEach((landmarks, index) => {
      const handedness = results.handedness[index]![0]!.categoryName;
      const gesture = results.gestures[index]![0]!.categoryName as HandGesture;

      if (handedness === "Left") {
        leftHand = new DetectedHand(landmarks, gesture);
      } else if (handedness === "Right") {
        rightHand = new DetectedHand(landmarks, gesture);
      }
    });

    // Control Logic: Check 'exists' flag and gestures
    const canMove =
      leftHand.exists &&
      rightHand.exists &&
      leftHand.gesture === HandGesture.OPEN_PALM &&
      rightHand.gesture === HandGesture.I_LOVE_YOU;

    if (canMove) {
      const palmCenter = this.calculatePalmCenter(leftHand.landmarks);
      this.updateBallPosition(palmCenter);
    }

    if (leftHand.exists) {
      this.handleLeftHandMorph(leftHand.gesture);
    }

    if (rightHand.exists) {
      this.handleRightHandColor(rightHand.gesture);
    }
  }

  private calculatePalmCenter(
    landmarks: NormalizedLandmark[],
  ): NormalizedLandmark {
    const wrist = landmarks[HandLandmark.WRIST]!;
    const indexBase = landmarks[HandLandmark.INDEX_FINGER_MCP]!;
    const pinkyBase = landmarks[HandLandmark.PINKY_MCP]!;

    return {
      x: (wrist.x + indexBase.x + pinkyBase.x) / 3,
      y: (wrist.y + indexBase.y + pinkyBase.y) / 3,
      z: (wrist.z + indexBase.z + pinkyBase.z) / 3,
      visibility:
        ((wrist.visibility ?? 1) +
          (indexBase.visibility ?? 1) +
          (pinkyBase.visibility ?? 1)) /
        3,
    };
  }
  private updateBallPosition(point: NormalizedLandmark): void {
    const x = -(point.x - 0.5) * 25;
    const y = -(point.y - 0.5) * 15;
    const z = -point.z * 15;
    this.ball.mesh.position.set(x, y, z);
  }

  private handleLeftHandMorph(gesture: HandGesture): void {
    switch (gesture) {
      case HandGesture.CLOSED_FIST:
        this.ball.setImplode(true);
        this.ball.setExplode(false);
        break;
      case HandGesture.POINTING_UP:
        this.ball.setExplode(true);
        this.ball.setImplode(false);
        break;
      default:
        break;
    }
  }

  private handleRightHandColor(gesture: HandGesture): void {
    switch (gesture) {
      case HandGesture.OPEN_PALM:
        this.ball.setColor("#ff3333");
        break;
      case HandGesture.THUMB_UP:
        this.ball.setColor("#33ff33");
        break;
      default:
        break;
    }
  }

  private onWindowResize(): void {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public dispose(): void {
    document.body.removeChild(this.stats.dom);
    this.renderer.dispose();
    this.ball.mesh.geometry.dispose();
    (this.ball.mesh.material as THREE.ShaderMaterial).dispose();
  }
}
