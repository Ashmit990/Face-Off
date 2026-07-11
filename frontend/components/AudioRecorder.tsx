"use client";

import { useRef, useState } from "react";
import { transcribeAudio } from "@/lib/api";

export default function AudioRecorder({
  onTranscript,
}: {
  onTranscript: (text: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setTranscribing(true);
        try {
          const result = await transcribeAudio(blob);
          onTranscript(result.transcript);
        } catch (err: any) {
          setError(err.message || "Transcription failed");
        } finally {
          setTranscribing(false);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError("Microphone access denied or unavailable.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="flex items-center gap-3">
      {recording ? (
        <button
          type="button"
          onClick={stopRecording}
          id="stop-recording-btn"
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-[11px] bg-danger-100 border border-danger-200 text-danger-400 text-[13px] font-semibold transition-all hover:bg-danger-200/30"
        >
          <span className="relative flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-sm bg-danger-400 block" />
          </span>
          <span className="flex items-center gap-1.5">
            Stop
            <span className="flex gap-0.5">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="w-0.5 h-3 rounded-full bg-danger-400 animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          </span>
        </button>
      ) : (
        <button
          type="button"
          id="start-recording-btn"
          onClick={startRecording}
          disabled={transcribing}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-[11px] border border-border text-subtle text-[13px] font-semibold transition-all hover:text-ink hover:border-border-hover hover:bg-white/[0.03] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {transcribing ? (
            <>
              <span className="spinner flex-shrink-0" />
              Transcribing…
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-danger-400 flex-shrink-0" />
              Record answer
            </>
          )}
        </button>
      )}

      {error && (
        <span className="text-[12px] text-danger-400 font-medium">{error}</span>
      )}
    </div>
  );
}
