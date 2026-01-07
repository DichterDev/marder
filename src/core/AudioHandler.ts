export class AudioHandler {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;

  public async init(): Promise<void> {
    try {
      this.audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(stream);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256; // Smaller FFT for faster, snappier response
      source.connect(this.analyser);

      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (err) {
      console.error("Audio initialization failed:", err);
    }
  }

  public getFrequencyData(): number {
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteFrequencyData(this.dataArray);

    // We only look at the first 4-6 bins (the low end/bass)
    let bassSum = 0;
    const binsToTrack = 6;
    for (let i = 0; i < binsToTrack; i++) {
      bassSum += this.dataArray[i]!;
    }

    const averageBass = bassSum / binsToTrack;
    return averageBass / 255; // Normalized 0.0 to 1.0
  }
}
