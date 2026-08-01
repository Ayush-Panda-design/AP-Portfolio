import { motion } from "framer-motion";
import { PlayIcon as Play } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const ACCENT: Record<
  string,
  { ring: string; glow: string; sheen: string; dot: string; blob: string }
> = {
  teal: {
    ring: "ring-accent/25",
    glow: "shadow-[0_20px_44px_-26px_rgba(94,234,212,0.55)]",
    sheen: "via-accent/25",
    dot: "bg-accent",
    blob: "bg-accent/25",
  },
  violet: {
    ring: "ring-violet-400/25",
    glow: "shadow-[0_20px_44px_-26px_rgba(167,139,250,0.5)]",
    sheen: "via-violet-400/25",
    dot: "bg-violet-400",
    blob: "bg-violet-400/25",
  },
  amber: {
    ring: "ring-amber-400/25",
    glow: "shadow-[0_20px_44px_-26px_rgba(251,191,36,0.45)]",
    sheen: "via-amber-400/25",
    dot: "bg-amber-400",
    blob: "bg-amber-400/25",
  },
  pink: {
    ring: "ring-pink-400/25",
    glow: "shadow-[0_20px_44px_-26px_rgba(244,114,182,0.45)]",
    sheen: "via-pink-400/25",
    dot: "bg-pink-400",
    blob: "bg-pink-400/25",
  },
};

type Props = {
  src: string;
  title: string;
  accent: string;
};

export function ProjectVideoCover({ src, title, accent }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const a = ACCENT[accent] ?? ACCENT.teal;

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    video.muted = true;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "80px", threshold: 0.15 },
    );

    io.observe(wrap);
    return () => io.disconnect();
  }, [src]);

  return (
    <motion.div
      ref={wrapRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className={cn(
        "group/cover relative mx-5 mt-5 overflow-hidden rounded-xl border border-border-line/80 ring-1 transition-shadow duration-300 sm:mx-6",
        a.ring,
        a.glow,
      )}
    >
      <div className="relative aspect-[944/451] w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${title} demo preview`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover/cover:scale-[1.03]"
        />

        <motion.div
          className={cn(
            "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl",
            a.blob,
          )}
          animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-bg/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg via-bg/40 to-transparent" />

        <span className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-bg/75 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink backdrop-blur-md">
          <span className="relative flex h-1.5 w-1.5">
            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", a.dot)} />
            <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", a.dot)} />
          </span>
          Live demo
        </span>

        <span className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-bg/75 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover/cover:opacity-100">
          <Play size={9} fill="currentColor" /> Open to watch
        </span>
      </div>
    </motion.div>
  );
}
