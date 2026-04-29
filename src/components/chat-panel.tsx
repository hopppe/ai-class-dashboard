"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { ui } from "@/lib/i18n";

const micIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden
  >
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="9" y1="22" x2="15" y2="22" />
  </svg>
);

const speakerIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5"
    aria-hidden
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const pauseIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5"
    aria-hidden
  >
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const resumeIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5"
    aria-hidden
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

type ChatMsg = { role: "user" | "assistant"; content: string };

type Props = {
  metrics: unknown;
};

const sendIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5"
    aria-hidden
  >
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4z" />
  </svg>
);

const chatIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[18px] w-[18px]"
    aria-hidden
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export function ChatPanel({ metrics }: Props) {
  const { lang } = useLanguage();
  const T = ui[lang].chat;

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [audioPaused, setAudioPaused] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef("audio/webm");
  const isTranscribingRef = useRef(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const question = input.trim();
    if (!question || loading) return;

    const history = messages;
    const nextMessages: ChatMsg[] = [
      ...messages,
      { role: "user", content: question },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, data: metrics, history, language: lang }),
      });
      const json = (await res.json()) as
        | { success: true; data: { answer: string } }
        | { success: false; error: string };
      if (!json.success) throw new Error(json.error);
      const answer = String(json.data.answer ?? "").trim();
      if (!answer) throw new Error("Empty response from analyst");
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to respond");
    } finally {
      setLoading(false);
    }
  }

  async function transcribeChunks(chunks: Blob[], mimeType: string) {
    if (isTranscribingRef.current || chunks.length === 0) return;
    isTranscribingRef.current = true;
    const snapshot = chunks.slice();
    const blob = new Blob(snapshot, { type: mimeType });
    const form = new FormData();
    form.append("file", blob, "recording.webm");
    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const json = (await res.json()) as
        | { success: true; text: string }
        | { success: false; error: string };
      if (json.success) setLiveTranscript(json.text);
    } finally {
      isTranscribingRef.current = false;
    }
  }

  async function toggleRecording() {
    if (recording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access denied");
      return;
    }

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    mimeTypeRef.current = mimeType;

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
        void transcribeChunks(audioChunksRef.current, mimeType);
      }
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      setRecording(false);

      // Wait for any in-flight transcription then do a final pass
      const waitForInflight = () =>
        new Promise<void>((resolve) => {
          const check = () =>
            isTranscribingRef.current ? setTimeout(check, 100) : resolve();
          check();
        });
      await waitForInflight();

      const blob = new Blob(audioChunksRef.current, { type: mimeType });
      const form = new FormData();
      form.append("file", blob, "recording.webm");
      try {
        const res = await fetch("/api/transcribe", { method: "POST", body: form });
        const json = (await res.json()) as
          | { success: true; text: string }
          | { success: false; error: string };
        if (!json.success) throw new Error(json.error);
        const finalText = json.text.trim();
        if (finalText) {
          setInput((prev) => (prev ? `${prev} ${finalText}` : finalText));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Transcription failed");
      } finally {
        setLiveTranscript("");
      }
    };

    recorder.start(2000);
    setRecording(true);
  }

  function toggleAudioPause() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
      setAudioPaused(false);
    } else {
      audio.pause();
      setAudioPaused(true);
    }
  }

  async function speakMessage(text: string, index: number) {
    // If this message is already loaded, toggle pause/resume instead
    if (playingIndex === index) {
      toggleAudioPause();
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }

    setPlayingIndex(index);
    setAudioPaused(false);

    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Speech failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        audioRef.current = null;
        setPlayingIndex(null);
        setAudioPaused(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        audioRef.current = null;
        setPlayingIndex(null);
        setAudioPaused(false);
        URL.revokeObjectURL(url);
        setError("Audio playback failed");
      };
      await audio.play();
    } catch (err) {
      audioRef.current = null;
      setPlayingIndex(null);
      setAudioPaused(false);
      setError(err instanceof Error ? err.message : "Speech failed");
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <section className="flex w-full min-w-0 flex-col overflow-hidden rounded-md border border-rule bg-surface shadow-[0_1px_0_rgba(28,26,26,0.04),0_8px_24px_-12px_rgba(28,26,26,0.12)]">
      <header className="flex items-end justify-between gap-4 border-b border-rule px-6 py-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 shrink-0 text-ink">{chatIcon}</span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
              {T.section}
            </p>
            <h3 className="mt-1 font-serif text-xl tracking-tight text-ink">
              {T.cardTitle}
            </h3>
          </div>
        </div>
        <span className="hidden shrink-0 font-serif text-xs italic text-muted sm:inline">
          {T.company}
        </span>
      </header>

      <div
        ref={scrollerRef}
        className="max-h-[460px] min-h-[260px] flex-1 space-y-4 overflow-y-auto px-6 py-5"
      >
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[200px] items-center justify-center text-center text-sm text-muted">
            <p className="max-w-md">
              {T.emptyLine}{" "}
              <em className="text-foreground">{T.emptyExample}</em>
            </p>
          </div>
        ) : null}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`group flex flex-col gap-1 ${
              m.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-md px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-ink text-surface"
                  : "border border-rule bg-background text-foreground"
              }`}
            >
              {m.content}
            </div>
            {m.role === "assistant" ? (
              <button
                type="button"
                onClick={() => void speakMessage(m.content, i)}
                disabled={playingIndex !== null && playingIndex !== i}
                title={
                  playingIndex === i
                    ? audioPaused ? "Resume" : "Pause"
                    : "Read aloud"
                }
                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-opacity ${
                  playingIndex === i
                    ? "text-ink opacity-100"
                    : "text-muted opacity-0 group-hover:opacity-100 hover:text-ink"
                } disabled:cursor-not-allowed`}
              >
                {playingIndex === i
                  ? audioPaused ? resumeIcon : pauseIcon
                  : speakerIcon}
                {playingIndex === i
                  ? audioPaused ? "Resume" : "Pause"
                  : "Listen"}
              </button>
            ) : null}
          </div>
        ))}

        {loading ? (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-rule bg-background px-4 py-2.5 text-sm text-muted">
              <span className="flex items-center gap-1">
                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/60"
                  style={{ animationDelay: "-0.3s" }}
                />
                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/60"
                  style={{ animationDelay: "-0.15s" }}
                />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/60" />
              </span>
              <span className="ms-1 italic">{T.thinking}</span>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mx-6 mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {error}
        </p>
      ) : null}

      <form
        className="flex w-full min-w-0 items-end gap-3 border-t border-rule p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <textarea
          value={recording ? liveTranscript : input}
          onChange={(e) => { if (!recording) setInput(e.target.value); }}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={recording ? "Listening…" : "Ask about your numbers…"}
          className={`block max-h-32 min-h-[40px] w-full min-w-0 flex-1 resize-none rounded-md border px-3 py-2 text-sm placeholder:text-muted focus:outline-none ${
            recording
              ? "border-rose-300 bg-rose-50 text-rose-700 italic focus:border-rose-400"
              : "border-rule bg-background text-ink focus:border-ink"
          }`}
          disabled={loading}
          readOnly={recording}
        />
        <button
          type="button"
          onClick={() => void toggleRecording()}
          title={recording ? "Stop recording" : "Record voice"}
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition-colors ${
            recording
              ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
              : "border-rule bg-background text-muted hover:border-ink hover:text-ink"
          }`}
        >
          {recording ? (
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
          ) : (
            micIcon
          )}
        </button>
        <button
          type="submit"
          disabled={loading || input.trim().length === 0}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-ink px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-surface transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sendIcon}
          {loading ? T.sending : T.send}
        </button>
      </form>
    </section>
  );
}
