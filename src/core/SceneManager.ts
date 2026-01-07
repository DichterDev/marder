// src/core/SceneManager.ts
import * as THREE from 'three';
import type { GestureRecognizerResult, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { ParticleBall } from './ParticleBall';
import { HandLandmark } from '../types/HandLandmarks';
import { HandGesture } from '../types/Gestures';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private ball: ParticleBall;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // 4. Initialize the Particle Ball
    this.ball = new ParticleBall();
    this.scene.add(this.ball.mesh);

    // Handle Window Resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  public render(results: GestureRecognizerResult | null): void {
    if (results) {
      this.processHandData(results);
    }

    const time = performance.now() / 1000;
    this.ball.update(time);

    this.renderer.render(this.scene, this.camera);
  }

  private processHandData(results: GestureRecognizerResult): void {
    if (!results.landmarks || results.landmarks.length === 0) return;

    results.landmarks.forEach((landmarks, index) => {
      const handedness = results.handedness[index]![0]!.categoryName;
      const gesture = results.gestures[index]![0]!.categoryName as HandGesture;

      // 1. LEFT HAND: Position the ball
      if (handedness === "Left") {
        const trackingPoint = landmarks[HandLandmark.MIDDLE_FINGER_MCP];
        this.updateBallPosition(trackingPoint!);

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
            this.ball.setExplode(false);
            this.ball.setImplode(false);
            break;
        }
      }

      // 2. RIGHT HAND: Change the ball color
      if (handedness === "Right") {
        this.handleGestures(gesture);
      }
    });
  }

  private updateBallPosition(point: NormalizedLandmark): void {
    const x = -(point.x - 0.5) * 16;
    const y = -(point.y - 0.5) * 10;
    const z = -point.z * 10; // Depth is relative to the wrist

    this.ball.mesh.position.set(x, y, z);
  }

  private handleGestures(gesture: HandGesture): void {
    switch (gesture) {
      case HandGesture.OPEN_PALM:
        this.ball.setColor("#ff3333"); // Pulse Red
        break;
      case HandGesture.THUMB_UP:
        this.ball.setColor("#33ff33"); // Pulse Green
        break;
      default:
        break;
    }
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public dispose(): void {
    this.renderer.dispose();
    this.ball.mesh.geometry.dispose();
    (this.ball.mesh.material as THREE.ShaderMaterial).dispose();
  }
}
