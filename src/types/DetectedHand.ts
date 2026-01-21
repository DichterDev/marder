import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { HandGesture } from "./Gestures";

export class DetectedHand {
  public landmarks: NormalizedLandmark[] = [];
  public gesture: HandGesture = HandGesture.NONE;
  public exists: boolean = false;

  constructor(
    landmarks: NormalizedLandmark[] = [],
    gesture: HandGesture = HandGesture.NONE,
  ) {
    this.landmarks = landmarks;
    this.gesture = gesture;
    this.exists = landmarks.length > 0;
  }
}
