import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";

export class CameraHandler {
  private recognizer!: GestureRecognizer;
  private video: HTMLVideoElement;

  constructor(video: HTMLVideoElement) {
    this.video = video;
  }

  async init() {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      );
      this.recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
      this.video.srcObject = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
    } catch (err) {
      console.error("MediaPipe failed to load.", err);
    }
  }

  getResults() {
    if (this.video.readyState < 2) return null;
    const timestamp = Math.round(performance.now());
    try {
      return this.recognizer.recognizeForVideo(this.video, timestamp);
    } catch (err) {
      console.error("MediaPipe recog error: ", err);
      return null;
    }
  }
}
