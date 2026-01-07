export class AudioHandler {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;

  public async init(): Promise<void> {
    this.audioContext = new AudioContext();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = this.audioContext.createMediaStreamSource(stream);
    
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);
    
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  public getFrequencyData(): number {
    if (!this.analyser || !this.dataArray) return 0;
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Get average frequency (normalized 0.0 to 1.0)
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    return sum / this.dataArray.length / 255;
  }
}
