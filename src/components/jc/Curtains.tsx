import { animate, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Phase = "load" | "hello" | "open" | "gone";

/** Palace-curtain opening: velvet drapes with gold trim stay closed behind a Namaste, then part to reveal the site. */
export function Curtains({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("load");
  const done = useRef(onDone);
  done.current = onDone;
  const bar = useRef<HTMLElement | null>(null);
  const num = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const paint = (v: number) => {
      const r = Math.round(v);
      if (bar.current) bar.current.style.transform = `scaleX(${v / 100})`;
      if (num.current) num.current.textContent = String(r);
    };
    paint(0);
    // load what the first screen needs while the counter runs, so nothing pops in after the curtains part
    const assets = Promise.race([
      Promise.all(
        ["/hero-scene.jpg", "/curtain-left.png", "/curtain-right.png"].map(
          (src) => new Promise<void>((res) => {
            const im = new Image();
            im.onload = () => (im.decode ? im.decode().then(() => res(), () => res()) : res());
            im.onerror = () => res();
            im.src = src;
          }),
        ),
      ),
      new Promise<void>((res) => setTimeout(res, 2500)),
    ]);
    let stopped = false;
    const first = animate(0, 90, {
      duration: reduce ? 0.15 : 0.7,
      ease: [0.3, 0, 0.2, 1],
      onUpdate: paint,
      onComplete: () => {
        void assets.then(() => {
          if (stopped) return;
          animate(90, 100, {
            duration: reduce ? 0.1 : 0.22,
            ease: "easeOut",
            onUpdate: paint,
            onComplete: () => {
              setPhase("hello");
              timers.push(setTimeout(() => setPhase("open"), reduce ? 100 : 380));
              timers.push(setTimeout(() => done.current(), reduce ? 150 : 380 + 150));
              timers.push(setTimeout(() => setPhase("gone"), reduce ? 500 : 380 + 1350));
            },
          });
        });
      },
    });
    return () => {
      stopped = true;
      first.stop();
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    if (phase === "gone") {
      el.style.overflow = "";
      return;
    }
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = "";
    };
  }, [phase]);

  if (phase === "gone") return null;
  const open = phase === "open";
  const ease = [0.77, 0, 0.18, 1] as const;

  return (
    <div className="cur" aria-hidden={open} role="presentation">
      {/* the two velvet drapes (cut from the reference photo) */}
      <motion.div
        className="cur-img l"
        initial={false}
        animate={{ x: open ? "-101%" : "0%" }}
        transition={{ duration: 1.15, ease }}
        style={{ backgroundImage: "url(/curtain-left.png)" }}
      />
      <motion.div
        className="cur-img r"
        initial={false}
        animate={{ x: open ? "101%" : "0%" }}
        transition={{ duration: 1.15, ease }}
        style={{ backgroundImage: "url(/curtain-right.png)" }}
      />
      <motion.i className="cur-light" initial={false} animate={{ opacity: open ? 0 : 1 }} transition={{ duration: 0.45 }} />

      {/* centre: the welcome */}
      <motion.div className="cur-mid" initial={false} animate={open ? { opacity: 0, scale: 1.08 } : { opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: "easeIn" }}>
        <motion.div className="cur-om" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}>
          <svg viewBox="0 0 120 40" aria-hidden>
            <path d="M4 20 H46 M74 20 H116" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M60 6 L68 20 L60 34 L52 20 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="60" cy="20" r="2.4" fill="currentColor" />
          </svg>
        </motion.div>
        <div className="cur-hi">
          <motion.span key={phase === "load" ? "a" : "b"} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="dv">
            नमस्ते
          </motion.span>
          <motion.span className="en" initial={{ opacity: 0 }} animate={{ opacity: phase === "load" ? 0.7 : 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
            {phase === "load" ? "Namaste · welcome to my portfolio" : "Namaste 🙏  Welcome"}
          </motion.span>
        </div>
        <div className="cur-bar" aria-hidden>
          <i ref={bar as React.RefObject<HTMLElement>} />
        </div>
        <small className="cur-n"><span ref={num as React.RefObject<HTMLElement>}>0</span>%</small>
      </motion.div>
    </div>
  );
}
