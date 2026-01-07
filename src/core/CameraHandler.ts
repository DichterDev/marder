import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";

export class CameraHandler {
  private recognizer!: GestureRecognizer;
  private video: HTMLVideoElement;

  constructor(video: HTMLVideoElement) { this.video = video; }

  async init() {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    this.recognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2
    });
    this.video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
  }

  getResults() {
    if (this.video.readyState < 2) return null;
    return this.recognizer.recognizeForVideo(this.video, performance.now());
  }
}
