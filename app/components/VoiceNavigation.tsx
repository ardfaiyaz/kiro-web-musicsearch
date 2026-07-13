"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { useAudioPlayer } from "./AudioPlayerContext";
import { useRouter } from "next/navigation";

export default function VoiceNavigation() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { pause, resume, playNext, previousTrack } = useAudioPlayer();
  const router = useRouter();

  const processCommand = useCallback(
    (text: string) => {
      const lower = text.toLowerCase().trim();

      if (lower === "play" || lower === "resume") {
        resume();
        setFeedback("Resuming playback");
      } else if (lower === "pause" || lower === "stop") {
        pause();
        setFeedback("Paused");
      } else if (lower === "play next" || lower === "next" || lower === "skip") {
        playNext();
        setFeedback("Playing next track");
      } else if (lower === "previous" || lower === "go back") {
        previousTrack();
        setFeedback("Playing previous track");
      } else if (lower.startsWith("search for ")) {
        const query = lower.replace("search for ", "").trim();
        if (query) {
          router.push(`/search?q=${encodeURIComponent(query)}`);
          setFeedback(`Searching for: ${query}`);
        }
      } else if (lower === "go to favorites" || lower === "favorites") {
        router.push("/favorites");
        setFeedback("Going to favorites");
      } else if (lower === "go to discover" || lower === "discover") {
        router.push("/discover");
        setFeedback("Going to discover");
      } else if (lower === "go home" || lower === "home") {
        router.push("/");
        setFeedback("Going home");
      } else {
        setFeedback(`Command not recognized: "${text}"`);
      }
    },
    [pause, resume, playNext, previousTrack, router]
  );

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setFeedback("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback("Listening...");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      const text = result[0].transcript;
      setTranscript(text);

      if (result.isFinal) {
        processCommand(text);
        setTranscript("");
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setFeedback("Error occurred during recognition");
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [processCommand]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clear feedback after 3 seconds
  useEffect(() => {
    if (feedback && feedback !== "Listening...") {
      const timer = setTimeout(() => setFeedback(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  return (
    <div className="fixed bottom-36 right-16 z-40 flex flex-col items-end gap-2 sm:bottom-20">
      {/* Feedback display */}
      {(feedback || transcript) && (
        <div
          className="max-w-[200px] rounded-lg bg-surface px-3 py-2 text-xs text-foreground shadow-md"
          role="status"
          aria-live="polite"
        >
          {transcript && (
            <p className="italic text-muted">&quot;{transcript}&quot;</p>
          )}
          {feedback && <p>{feedback}</p>}
        </div>
      )}

      {/* Voice button */}
      <button
        onClick={toggleListening}
        className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-premium ${
          isListening
            ? "bg-error text-white animate-pulse"
            : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
        }`}
        aria-label={isListening ? "Stop voice navigation" : "Start voice navigation"}
        aria-pressed={isListening}
        title="Voice Navigation"
      >
        {isListening ? (
          <MicOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Mic className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
