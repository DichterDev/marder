export class AudioHandler {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  
  private currentFilePath: string | null = null;

  public async init(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256; 
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      
      this.gainNode.gain.value = 0.4;
      
    } catch (err) {
      console.error("Audio initialization failed:", err);
    }
  }

  public async playAudio(filePath: string): Promise<void> {
    // Wenn der Song schon läuft, brechen wir ab (verhindert Stottern)
    if (this.currentFilePath === filePath) return;
    
    if (!this.audioContext || !this.analyser || !this.gainNode) return;

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    try {
      const response = await fetch(filePath);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.stopCurrent();

      const srcNode = this.audioContext.createBufferSource();
      srcNode.buffer = audioBuffer;
      srcNode.loop = true;

      srcNode.connect(this.analyser);
      this.analyser.connect(this.gainNode);

      srcNode.start(0);
      
      this.currentSource = srcNode;
      this.currentFilePath = filePath;

    } catch (e) {
      console.error(`Konnte Audio nicht laden: ${filePath}`, e);
    }
  }

  public stop(): void {
    this.stopCurrent();
    this.currentFilePath = null;
  }

  private stopCurrent() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) { /* ignore */ }
      this.currentSource = null;
    }
  }

  public getFrequencyData(): number {
    if (!this.analyser || !this.dataArray) return 0;
    
    this.analyser.getByteFrequencyData(this.dataArray);

    let bassSum = 0;
    const binsToTrack = 6;
    for (let i = 0; i < binsToTrack; i++) {
      bassSum += this.dataArray[i];
    }

    return (bassSum / binsToTrack) / 255; 
  }
} 
