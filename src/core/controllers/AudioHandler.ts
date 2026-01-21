export class AudioHandler {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  
  // Um zu verhindern, dass bei jedem Frame der gleiche Song neu startet
  private currentFilePath: string | null = null;

  public async init(): Promise<void> {
    try {
      // Setup ohne Mikrofon-Zugriff!
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256; 
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      
      // Standard-Lautstärke (etwas reduziert)
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
      // 1. Audio laden
      const response = await fetch(filePath);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // 2. Alten Song stoppen (Crossfade wäre hier möglich, aber wir machen Hard-Cut für Snappiness)
      this.stopCurrent();

      // 3. Neuen Song starten
      const srcNode = this.audioContext.createBufferSource();
      srcNode.buffer = audioBuffer;
      srcNode.loop = true; // Songs loopen, solange die Stimmung hält

      // Routing: Source -> Analyser -> Gain -> Speakers
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

    // Bassbereich (erste paar Bins) durchschnittlich berechnen
    let bassSum = 0;
    const binsToTrack = 6;
    for (let i = 0; i < binsToTrack; i++) {
      bassSum += this.dataArray[i];
    }

    return (bassSum / binsToTrack) / 255; 
  }
}