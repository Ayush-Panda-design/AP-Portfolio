import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Boy, B_FLY0, B_START, B_W } from "./Boy";
import { scrollToY } from "./lib";

export type TrackItem = { key: string; accent: string; label: string; node: ReactNode };

/** Phone version of the pinned tours: vertical scroll slides the cards sideways while the avatar walks. */
export function MobileTrack({ label, title, items, vh = 55, hint, throwImages }: { label: string; title: string; items: TrackItem[]; vh?: number; hint: string; throwImages?: (string | undefined)[] }) {
  const n = items.length;
  const ref = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(390);
  const [i, setI] = useState(0);
  useEffect(() => {
    const on = () => setVw(window.innerWidth);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  const raw = useMotionValue(0);
  useEffect(() => {
    const upd = () => {
      const el = ref.current;
      if (!el) return;
      const len = el.offsetHeight - window.innerHeight;
      raw.set(len > 0 ? Math.max(0, Math.min(1, -el.getBoundingClientRect().top / len)) : 0);
    };
    upd();
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    return () => {
      window.removeEventListener("scroll", upd);
      window.removeEventListener("resize", upd);
    };
  }, [raw]);
  const p = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.35 });
  const thrown = !!throwImages;
  // throw mode: card k appears when he lets go of it; the track then centres on it
  const [rel, setRel] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    if (!thrown) return setI(Math.max(0, Math.min(n - 1, Math.round(v * (n - 1)))));
    const k = (v - B_START) / B_W;
    const r = k < 0 ? 0 : k >= n ? n : Math.floor(k) + (k - Math.floor(k) >= B_FLY0 ? 1 : 0);
    setRel(r);
    setI(Math.max(0, r - 1));
  });
  const cardW = Math.round(vw * 0.8);
  const gap = 14;
  const stride = cardW + gap;
  const walkX = useTransform(p, (v) => -v * (n - 1) * stride);
  const throwX = useSpring(0, { stiffness: 170, damping: 22 });
  useEffect(() => { if (thrown) throwX.set(-i * stride); }, [thrown, i, stride, throwX]);
  const x = thrown ? throwX : walkX;
  const go = (k: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (k / Math.max(1, n - 1)) * (el.offsetHeight - window.innerHeight));
  };
  return (
    <div className="mt-tour" ref={ref} style={{ height: `${n * vh + 100}vh` }}>
      <div className="mt-in">
        <div className="mt-head">
          <span className="jc-label">{label}</span>
          <h2 className="jc-h2" style={{ fontSize: "clamp(28px,8.4vw,44px)" }}>{title}</h2>
        </div>
        <div className="mt-stage">
          <Boy p={p} n={n} mode={thrown ? "throw" : "walk"} images={throwImages} line={items[i].label} />
          <div className="mt-floor" />
        </div>
        <motion.div className="mt-track" style={{ x, paddingLeft: (vw - cardW) / 2, gap }}>
          {items.map((it, k) => (
            <motion.div
              key={it.key}
              className={`mt-card ${k === i && (!thrown || rel > 0) ? "on" : ""} ${thrown ? "hot" : ""}`}
              style={{ width: cardW, ["--a" as string]: it.accent, pointerEvents: thrown && k >= rel ? "none" : "auto" }}
              animate={thrown ? (k < rel ? { opacity: k === i ? 1 : 0.5, scale: k === i ? 1 : 0.94, y: 0, rotate: 0 } : { opacity: 0, scale: 0.3, y: -150, rotate: -12 }) : undefined}
              transition={{ type: "spring", stiffness: 220, damping: 17 }}
            >
              {it.node}
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-dots">
          {items.map((it, k) => <button key={it.key} className={k === i ? "on" : ""} onClick={() => go(k)} aria-label={it.label} style={{ ["--a" as string]: it.accent }} />)}
        </div>
        <p className="mt-hint">{hint}</p>
      </div>
    </div>
  );
}
