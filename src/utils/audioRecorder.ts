export interface AudioRecordingResult {
  blob: Blob;
  url: string;
  durationSeconds: number;
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    this.audioChunks = [];
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.startTime = Date.now();
      this.mediaRecorder.start();
    } catch (err) {
      console.warn('Microphone permission denied or not available, falling back to simulation', err);
      throw new Error('Vui lòng cấp quyền truy cập Microphone trong trình duyệt để thu âm bài nói IELTS Speaking.');
    }
  }

  stop(): Promise<AudioRecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder chưa được khởi tạo'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = Math.round((Date.now() - this.startTime) / 1000);

        // Stop all audio tracks
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
        }

        resolve({
          blob: audioBlob,
          url: audioUrl,
          durationSeconds: duration,
        });
      };

      this.mediaRecorder.stop();
    });
  }
}
