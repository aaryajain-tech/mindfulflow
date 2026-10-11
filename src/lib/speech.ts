// Speech utilities for Web Speech API with Fallback capabilities

export interface SpeechRecognitionResultHandler {
  onResult: (text: string) => void;
  onEnd?: () => void;
  onError?: (err: string) => void;
}

export class SpeechManager {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(handlers: SpeechRecognitionResultHandler): boolean {
    if (!this.recognition) return false;

    try {
      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        handlers.onResult(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        if (handlers.onError) {
          handlers.onError(event.error || 'Speech recognition error');
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (handlers.onEnd) {
          handlers.onEnd();
        }
      };

      this.recognition.start();
      return true;
    } catch (err) {
      this.isListening = false;
      if (handlers.onError) {
        handlers.onError('Unable to start mic input');
      }
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch { /* ignore */ }
      this.isListening = false;
    }
  }

  public speakText(text: string, onEnd?: () => void): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower, relaxing pace
      utterance.pitch = 1.0;
      
      if (onEnd) {
        utterance.onend = onEnd;
      }

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.error('TTS error:', e);
      return false;
    }
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechManager = new SpeechManager();
