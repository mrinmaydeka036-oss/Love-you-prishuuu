import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: LetterExperience,
  head: () => ({
    meta: [
      { title: "A Letter For You" },
      { name: "description", content: "A love letter, sealed with intention. Open when you're ready." },
    ],
  }),
});

type Stage = "envelope" | "opening" | "letter" | "prompt" | "video" | "transitioning" | "finale";

function LetterExperience() {
  const [stage, setStage] = useState<Stage>("envelope");
  const [heartsGo, setHeartsGo] = useState(false);
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const romanticVideoRef = useRef<HTMLVideoElement | null>(null);

  const stopMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      const start = a.volume;
      const steps = 12;
      let i = 0;
      const id = setInterval(() => {
        i++;
        a.volume = Math.max(0, start * (1 - i / steps));
        if (i >= steps) {
          clearInterval(id);
          a.pause();
          a.currentTime = 0;
          a.volume = start;
        }
      }, 40);
    } catch {
      a.pause();
    }
  };

  const openEnvelope = () => {
    if (stage !== "envelope") return;
    setStage("opening");
    const a = audioRef.current;
    if (a) {
      a.volume = 0.65;
      a.currentTime = 0;
      a.play().catch(() => {});
    }
    setTimeout(() => setStage("letter"), 2200);
  };

  useEffect(() => {
    if (stage !== "letter") return;
    const t = setTimeout(() => {
      stopMusic();
      setStage("prompt");
    }, 4200);
    return () => clearTimeout(t);
  }, [stage]);

  const onYes = () => {
    setStage("video");
    setTimeout(() => {
      const v = romanticVideoRef.current;
      if (v) {
        v.muted = false;
        v.play().catch(() => {
          v.muted = true;
          v.play().catch(() => {});
        });
      }
    }, 60);
  };

  const goToFinale = () => {
    setStage("transitioning");
    setTimeout(() => {
      setStage("finale");
      setTimeout(() => setHeartsGo(true), 600);
      bgVideoRef.current?.play().catch(() => {});
    }, 1200);
  };

  return (
    <main className="relative min-h-screen w-full scene-vignette overflow-hidden">
      <audio ref={audioRef} src="/music.mp3" preload="auto" loop />

      <AmbientParticles />

      {(stage === "envelope" || stage === "opening") && (
        <EnvelopeScene stage={stage} onOpen={openEnvelope} />
      )}

      {stage === "letter" && <LetterScene />}

      {stage === "prompt" && <LovePrompt onYes={onYes} />}

      {stage === "video" && (
        <RomanticVideo videoRef={romanticVideoRef} onEnded={goToFinale} />
      )}

      {stage === "transitioning" && (
        <div
          className="fixed inset-0 z-[70] bg-black"
          style={{ animation: "fadeIn 1.1s ease forwards" }}
        />
      )}

      {stage === "finale" && <FinaleScene videoRef={bgVideoRef} heartsGo={heartsGo} />}
    </main>
  );
}

/* ================= Envelope ================= */
function EnvelopeScene({ stage, onOpen }: { stage: Stage; onOpen: () => void }) {
  const opening = stage === "opening";
  return (
    <section
      className="relative flex min-h-screen w-full flex-col items-center justify-center px-5 py-10"
      style={{
        transformOrigin: "50% 45%",
        animation: opening ? "cinematicZoom 2.2s cubic-bezier(.65,.05,.36,1) forwards" : undefined,
      }}
    >
      <p
        className="mb-6 text-center text-xs uppercase tracking-[0.5em] text-accent/80 sm:text-sm"
        style={{ animation: "fadeUp 1.2s ease .2s both" }}
      >
        A Letter For You
      </p>
      <h1
        className="mb-10 text-center font-serif text-4xl italic text-foreground/90 sm:text-5xl md:text-6xl"
        style={{ animation: "fadeUp 1.2s ease .5s both" }}
      >
        <span className="gold-text">Open when you're ready</span>
      </h1>

      <button
        onClick={onOpen}
        aria-label="Open envelope"
        className="group relative block cursor-pointer border-0 bg-transparent p-0 outline-none"
        style={{
          width: "min(90vw, 500px)",
          aspectRatio: "1.5 / 1",
          animation: opening ? undefined : "envelopeFloat 5s ease-in-out infinite",
          perspective: "1200px",
        }}
      >
        <div
          className="absolute inset-0 rounded-md"
          style={{
            background:
              "linear-gradient(160deg, var(--envelope) 0%, var(--envelope-dark) 100%)",
            boxShadow: "var(--shadow-envelope), inset 0 0 40px oklch(0 0 0 / 0.15)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-md" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, transparent 49.6%, oklch(0 0 0 / 0.12) 50%, transparent 50.4%), linear-gradient(45deg, transparent 49.6%, oklch(0 0 0 / 0.12) 50%, transparent 50.4%)",
            }}
          />
        </div>

        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-sm parchment"
          style={{
            width: "88%",
            height: "78%",
            transform: "translate(-50%, -50%)",
            opacity: opening ? 1 : 0,
            animation: opening ? "letterRise 1.6s cubic-bezier(.2,.7,.2,1) .6s forwards" : undefined,
            zIndex: 1,
          }}
        >
          <div className="flex h-full items-center justify-center p-4">
            <p className="ink-script text-center text-2xl sm:text-3xl">for you</p>
          </div>
        </div>

        <div
          className="absolute left-0 right-0 top-0"
          style={{
            height: "62%",
            transformOrigin: "50% 0%",
            transformStyle: "preserve-3d",
            transform: opening ? "rotateX(180deg)" : "rotateX(0deg)",
            transition: "transform 1.6s cubic-bezier(.5,.05,.3,1)",
            zIndex: 2,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background: "linear-gradient(180deg, var(--envelope) 0%, var(--envelope-dark) 100%)",
              boxShadow: "inset 0 -12px 30px oklch(0 0 0 / 0.2)",
              backfaceVisibility: "hidden",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              transform: "rotateX(180deg)",
              background: "linear-gradient(180deg, oklch(0.82 0.05 72) 0%, oklch(0.7 0.06 62) 100%)",
              backfaceVisibility: "hidden",
            }}
          />
        </div>

        <div
          className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "18%",
            aspectRatio: "1",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle at 35% 30%, oklch(0.6 0.22 22) 0%, var(--wax) 55%, oklch(0.28 0.14 20) 100%)",
            boxShadow:
              "0 6px 16px oklch(0 0 0 / 0.5), inset 0 -3px 8px oklch(0 0 0 / 0.4), inset 0 3px 6px oklch(0.9 0.1 30 / 0.4)",
            zIndex: 3,
            opacity: opening ? 0 : 1,
            transition: "opacity .3s",
            display: "grid",
            placeItems: "center",
            color: "oklch(0.92 0.06 60)",
          }}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" width="45%" height="45%" fill="currentColor">
            <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
          </svg>
        </div>
      </button>

      {!opening && (
        <p
          className="mt-10 text-center text-sm text-muted-foreground sm:text-base"
          style={{ animation: "fadeUp 1.2s ease 1s both" }}
        >
          Tap the envelope
        </p>
      )}
    </section>
  );
}

/* ================= Letter ================= */
function LetterScene() {
  return (
    <section
      className="fixed inset-0 z-40 flex items-center justify-center px-4 py-8 sm:px-8"
      style={{ animation: "fadeIn .8s ease forwards" }}
    >
      <div
        className="relative w-full"
        style={{ maxWidth: "min(720px, 96vw)", perspective: "1600px" }}
      >
        <div
          className="parchment relative rounded-t-md px-6 pt-8 sm:px-14 sm:pt-14"
          style={{
            transformOrigin: "50% 100%",
            animation: "unfoldTop 1.1s cubic-bezier(.2,.7,.2,1) .1s both",
            paddingBottom: "1.5rem",
          }}
        >
          <p className="ink-script text-center text-4xl leading-none sm:text-5xl">My love,</p>
        </div>

        <div
          className="parchment relative rounded-b-md px-6 pb-10 pt-2 sm:px-14 sm:pb-14"
          style={{
            transformOrigin: "50% 0%",
            animation: "unfoldBottom 1.1s cubic-bezier(.2,.7,.2,1) .9s both",
            marginTop: "-1px",
          }}
        >
          <div
            className="space-y-5 ink-hand text-[1.35rem] leading-[1.55] sm:text-2xl md:text-3xl"
            style={{ animation: "fadeIn 1s ease 1.6s both" }}
          >
            <p>
              If you're reading this, then the universe finally kept its promise —
              it led me to you.
            </p>
            <p>
              I don't know every chapter of our story yet, but I know the ending:
              it's us, quiet mornings, loud laughter, and a lifetime of small,
              certain <em>yeses</em>.
            </p>
            <p>
              Every version of me has been walking toward every version of you.
              Take my hand. Let's begin.
            </p>
          </div>

          <div
            className="mt-8 flex flex-col items-end gap-1"
            style={{ animation: "fadeIn 1s ease 2s both" }}
          >
            <span className="ink-hand text-xl sm:text-2xl">Yours, always —</span>
            <span className="ink-script text-4xl sm:text-5xl">Your Future Husband</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= Love Prompt Popup ================= */
function LovePrompt({ onYes }: { onYes: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-6"
      style={{
        background: "oklch(0 0 0 / 0.72)",
        backdropFilter: "blur(10px)",
        animation: "fadeIn .6s ease forwards",
      }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl px-8 py-10 text-center"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.96 0.04 20) 0%, oklch(0.88 0.08 15) 100%)",
          boxShadow:
            "0 40px 90px -20px oklch(0 0 0 / 0.7), 0 0 60px oklch(0.7 0.22 15 / 0.4)",
          animation: "letterRise .8s cubic-bezier(.2,.7,.2,1) both",
          border: "1px solid oklch(0.8 0.12 15 / 0.5)",
        }}
      >
        <h3 className="ink-script text-4xl sm:text-5xl" style={{ color: "oklch(0.4 0.22 15)" }}>
          ❤️ Do You Love Me? ❤️
        </h3>
        <p className="mt-4 font-serif italic text-lg text-[oklch(0.35_0.08_20)] sm:text-xl">
          Just one honest answer…
        </p>
        <button
          onClick={onYes}
          className="mt-8 w-full rounded-full px-8 py-4 text-lg font-semibold tracking-wide text-white transition-transform hover:scale-[1.04] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, oklch(0.72 0.24 20), oklch(0.55 0.24 12))",
            boxShadow: "0 12px 30px -8px oklch(0.5 0.22 15 / 0.7), inset 0 -3px 8px oklch(0 0 0 / 0.15)",
            animation: "glowPulse 2.2s ease-in-out infinite",
          }}
        >
          💖 YES 💖
        </button>
      </div>
    </div>
  );
}

/* ================= Fullscreen Video.mp4 ================= */
function RomanticVideo({
  videoRef,
  onEnded,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onEnded: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] bg-black" style={{ animation: "fadeIn .6s ease forwards" }}>
      <video
        ref={videoRef}
        src="/Video.mp4"
        className="absolute inset-0 h-full w-full object-contain bg-black"
        playsInline
        autoPlay
        controls={false}
        onEnded={onEnded}
      />
    </div>
  );
}

/* ================= Finale ================= */
function FinaleScene({
  videoRef,
  heartsGo,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  heartsGo: boolean;
}) {
  return (
    <section className="fixed inset-0 z-50 overflow-hidden" style={{ animation: "fadeIn 1.2s ease forwards" }}>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        style={{ filter: "brightness(0.55) saturate(1.1)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, oklch(0.25 0.12 20 / 0.4) 0%, oklch(0.08 0.03 15 / 0.95) 80%)",
        }}
      />

      <RosePetals count={26} />
      <AmbientParticles dense />

      <div className="relative z-10 flex min-h-full items-center justify-center p-6 text-center">
        <div style={{ animation: "fadeUp 1.4s ease .4s both" }}>
          <p className="mb-4 text-xs uppercase tracking-[0.5em] text-accent">Forever</p>
          <h2 className="ink-script text-6xl leading-none sm:text-7xl md:text-8xl gold-text">
            I love you
          </h2>
          <p className="mt-6 font-serif text-lg italic text-foreground/80 sm:text-xl">
            — Your Future Husband
          </p>
        </div>
      </div>

      {heartsGo && <HeartExplosion />}
    </section>
  );
}

/* ================= Particles ================= */
function AmbientParticles({ dense = false }: { dense?: boolean }) {
  const particles = useMemo(() => {
    const n = dense ? 40 : 22;
    return Array.from({ length: n }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 2 + Math.random() * 5,
      dx: (Math.random() - 0.5) * 120,
      dur: 8 + Math.random() * 10,
      delay: Math.random() * 8,
      rot: 200 + Math.random() * 600,
    }));
  }, [dense]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[5]" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute block rounded-full"
          style={{
            left: `${p.left}%`,
            top: "-5vh",
            width: p.size,
            height: p.size,
            background:
              "radial-gradient(circle, oklch(0.95 0.12 85 / 1) 0%, oklch(0.82 0.14 82 / 0.6) 40%, transparent 70%)",
            boxShadow: "0 0 12px oklch(0.85 0.14 82 / 0.9)",
            // @ts-expect-error css vars
            "--dx": `${p.dx}px`,
            "--rot": `${p.rot}deg`,
            animation: `drift ${p.dur}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ================= Rose Petals ================= */
function RosePetals({ count = 20 }: { count?: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        dx: (Math.random() - 0.5) * 200,
        rot: (Math.random() - 0.5) * 900,
        dur: 7 + Math.random() * 8,
        delay: Math.random() * 6,
        size: 14 + Math.random() * 18,
        hue: 8 + Math.random() * 12,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[6]" aria-hidden>
      {petals.map((p) => (
        <svg
          key={p.id}
          viewBox="0 0 32 32"
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.size,
            filter: `drop-shadow(0 3px 6px oklch(0 0 0 / 0.35))`,
            // @ts-expect-error css vars
            "--dx": `${p.dx}px`,
            "--rot": `${p.rot}deg`,
            animation: `petalFall ${p.dur}s linear ${p.delay}s infinite`,
          }}
        >
          <defs>
            <radialGradient id={`pg${p.id}`} cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor={`oklch(0.82 0.2 ${p.hue})`} />
              <stop offset="60%" stopColor={`oklch(0.55 0.22 ${p.hue})`} />
              <stop offset="100%" stopColor={`oklch(0.35 0.18 ${p.hue})`} />
            </radialGradient>
          </defs>
          <path d="M16 2 C 24 8, 30 16, 16 30 C 2 16, 8 8, 16 2 Z" fill={`url(#pg${p.id})`} />
        </svg>
      ))}
    </div>
  );
}

/* ================= Heart Explosion ================= */
function HeartExplosion() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => {
        const angle = (i / 34) * Math.PI * 2;
        const dist = 180 + Math.random() * 220;
        return {
          id: i,
          hx: Math.cos(angle) * dist,
          hy: Math.sin(angle) * dist - 60,
          rot: (Math.random() - 0.5) * 90,
          size: 18 + Math.random() * 30,
          delay: Math.random() * 0.25,
          hue: 8 + Math.random() * 14,
        };
      }),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[20]" aria-hidden>
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          transform: "translate(-50%,-50%)",
          animation: "heartCore 1.6s cubic-bezier(.2,.8,.2,1) forwards",
        }}
      >
        <svg viewBox="0 0 24 24" width="140" height="140" style={{ filter: "drop-shadow(0 0 40px oklch(0.7 0.22 15 / 0.9))" }}>
          <defs>
            <radialGradient id="coreH" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="oklch(0.92 0.15 18)" />
              <stop offset="60%" stopColor="oklch(0.65 0.24 14)" />
              <stop offset="100%" stopColor="oklch(0.4 0.2 14)" />
            </radialGradient>
          </defs>
          <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" fill="url(#coreH)" />
        </svg>
      </div>

      {hearts.map((h) => (
        <svg
          key={h.id}
          viewBox="0 0 24 24"
          width={h.size}
          height={h.size}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            // @ts-expect-error css vars
            "--hx": `${h.hx}px`,
            "--hy": `${h.hy}px`,
            "--hr": `${h.rot}deg`,
            animation: `heartBurst 1.8s cubic-bezier(.2,.7,.2,1) ${h.delay}s forwards`,
            filter: `drop-shadow(0 0 10px oklch(0.7 0.22 ${h.hue} / 0.9))`,
          }}
        >
          <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" fill={`oklch(0.65 0.24 ${h.hue})`} />
        </svg>
      ))}
    </div>
  );
}

export default LetterExperience;
    
