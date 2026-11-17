import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Batter, BAT_START, batSpan } from "./Batter";

const STEPS = [
  { t: "Clarify the idea", d: "Turn a fuzzy idea into requirements before writing any code.", c: "#FFD23F", m: "Requirements first, before any code." },
  { t: "Model the data", d: "Schema first: relations, constraints and migrations that won't hurt later.", c: "#9FD3FF", m: "Schema, relations and migrations first." },
  { t: "Design the API", d: "Typed end to end, with tRPC or REST, plus auth and rate limits from day one.", c: "#B7A2FF", m: "Typed end to end, with auth from day one." },
  { t: "Build the UI", d: "React and Tailwind, fast by default, with motion where it earns its place.", c: "#FF6B4A", m: "React and Tailwind, with purposeful motion." },
  { t: "Review hard", d: "AI-assisted PR review plus human sign-off before anything merges.", c: "#4F9E4A", m: "AI-assisted PR review plus human sign-off." },
  { t: "Ship with CI/CD", d: "Background jobs, previews and deploys that happen without ceremony.", c: "#FFB48A", m: "CI/CD, previews and deploys without ceremony." },
  { t: "Watch and iterate", d: "Real usage tells the truth. Fix, polish, repeat.", c: "#FFD23F", m: "Real usage tells the truth. Fix and repeat." },
];
const N = STEPS.length;
type Rect = { x: number; y: number; w: number; h: number };
type Geo = {
  rects: Rect[];
  spot: { x: number; y: number };
  zoom: number;
  ring: { cx: number; cy: number; rx: number; ry: number } | null;
  spine: { x: number; y0: number; y1: number } | null;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const ease = (t: number) => t * t * (3 - 2 * t);
const back = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
const REVEAL = 0.022; // pop in, zoomed and highlighted
const HOLD = 0.04; // stay in the spotlight
const PLACE = 0.05; // glide to its place on the ring
const hitAt = (i: number) => BAT_START + (i + 0.76) * batSpan(N);

/** Desktop: the seven steps sit on an ellipse to the right of the batter. Phone: a straight column with a spine. */
function layout(W: number, H: number, narrow = false): Geo {
  if (narrow) {
    const left = 0.4 * W, w = 0.97 * W - left, top = 0.22 * H, gap = 5, ch = (0.86 * H - top - gap * (N - 1)) / N;
    return {
      rects: STEPS.map((_, i) => ({ x: left, y: top + i * (ch + gap), w, h: ch })),
      spot: { x: left + w / 2 - 0.05 * W, y: (top + 0.86 * H) / 2 },
      zoom: 1.12,
      ring: null,
      spine: { x: left - 8, y0: top + ch / 2, y1: top + (N - 1) * (ch + gap) + ch / 2 },
    };
  }
  const left = 0.34 * W, right = 0.975 * W, top = 0.31 * H, bottom = 0.91 * H;
  const cw = Math.min(250, Math.max(200, 0.135 * W)), ch = Math.min(126, Math.max(104, 0.135 * H));
  const cx = (left + right) / 2, cy = (top + bottom) / 2;
  const rx = (right - left) / 2 - cw / 2, ry = (bottom - top) / 2 - ch / 2;
  return {
    rects: STEPS.map((_, i) => {
      const f = Math.PI + (i * 2 * Math.PI) / N;
      return { x: cx + rx * Math.cos(f) - cw / 2, y: cy + ry * Math.sin(f) - ch / 2, w: cw, h: ch };
    }),
    spot: { x: cx, y: cy },
    zoom: 1.45,
    ring: { cx, cy, rx, ry },
    spine: null,
  };
}

function StepCard({ s, i, r, g, p, narrow }: { s: (typeof STEPS)[number]; i: number; r: Rect; g: Geo; p: MotionValue<number>; narrow: boolean }) {
  const a = hitAt(i);
  const rv = (v: number) => clamp01((v - a) / REVEAL);
  const pl = (v: number) => ease(clamp01((v - (a + HOLD)) / PLACE));
  const hx = r.x + r.w / 2, hy = r.y + r.h / 2;
  const scale = useTransform(p, (v) => {
    const t = rv(v);
    const base = t <= 0 ? 0.2 : 0.2 + (g.zoom - 0.2) * back(t);
    return base + (1 - base) * pl(v);
  });
  const x = useTransform(p, (v) => (g.spot.x - hx) * (1 - pl(v)));
  const y = useTransform(p, (v) => (g.spot.y - hy) * (1 - pl(v)) + (1 - rv(v)) * 26);
  const opacity = useTransform(p, (v) => clamp01(rv(v) * 3));
  const [hot, setHot] = useState(false);
  const [on, setOn] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    setHot(rv(v) > 0 && pl(v) < 0.92);
    setOn(pl(v) >= 0.92);
  });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  return (
    <motion.article
      className={"pr-card" + (on ? " on" : "") + (hot ? " hot" : "")}
      style={{ left: r.x, top: r.y, width: r.w, height: r.h, x, y, scale, opacity, pointerEvents: on ? "auto" : "none", ["--a" as string]: s.c }}
      animate={{ rotateX: tilt.y, rotateY: tilt.x }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      onPointerMove={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        setTilt({ x: ((e.clientX - b.left) / b.width - 0.5) * 12, y: -((e.clientY - b.top) / b.height - 0.5) * 12 });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <span className="pr-n">{String(i + 1).padStart(2, "0")}</span>
      <h3>{s.t}</h3>
      <p>{narrow ? s.m : s.d}</p>
    </motion.article>
  );
}

/** The path the steps hang on: drawn in as each one lands. */
function Track({ g, p, w, h }: { g: Geo; p: MotionValue<number>; w: number; h: number }) {
  const draw = useTransform(p, [hitAt(0) + HOLD, hitAt(N - 1) + HOLD + PLACE], [0.001, 1], { clamp: true });
  let d = "";
  if (g.ring) {
    const { cx, cy, rx, ry } = g.ring;
    d = `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy}`;
  } else if (g.spine) {
    d = `M ${g.spine.x} ${g.spine.y0} L ${g.spine.x} ${g.spine.y1}`;
  }
  return (
    <svg className="pr-track" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <path d={d} className="base" fill="none" />
      <motion.path d={d} className="live" fill="none" style={{ pathLength: draw }} />
    </svg>
  );
}

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const targets = useRef<{ x: number; y: number }[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [kick, setKick] = useState(0);
  const [done, setDone] = useState(false);
  const [placed, setPlaced] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  useMotionValueEvent(p, "change", (v) => {
    setDone(v > 0.97);
    setPlaced(Math.max(0, Math.min(N, STEPS.filter((_, i) => v >= hitAt(i) + HOLD + PLACE).length)));
  });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const narrow = size.w > 0 && size.w < 900;
  const ready = size.w > 0;
  const g = ready ? layout(size.w, size.h, narrow) : null;
  // every pitch flies to the spotlight; the card then glides out to its own spot
  targets.current = g ? STEPS.map(() => g.spot) : [];

  return (
    <section id="process" data-scene="arthur" className="jc-sec pr-sec">
      <div className="pr-tour" ref={ref} style={{ height: `${N * 46 + 100}vh` }}>
        <div className={"pr-in" + (narrow ? " nar" : "")} ref={stage}>
          <div className="pr-head">
            <span className="jc-label">How I work</span>
            <h2>From fuzzy idea to live product.</h2>
            <p>The loop I follow on ShipFlow, Relvion, EdinForm and Votora.</p>
          </div>
          {g && <Track g={g} p={p} w={size.w} h={size.h} />}
          {g && !narrow && (
            <div className="pr-core" style={{ left: g.spot.x, top: g.spot.y }} aria-hidden>
              <b>{String(placed).padStart(2, "0")}<i> / {String(N).padStart(2, "0")}</i></b>
              <span>steps in place</span>
            </div>
          )}
          {g && g.rects.map((r, i) => <StepCard key={STEPS[i].t} s={STEPS[i]} i={i} r={r} g={g} p={p} narrow={narrow} />)}
          {ready && <Batter p={p} n={N} targets={targets} kick={kick} />}
          <button className="pr-hit" aria-label="Make him swing" onClick={() => done && setKick((k) => k + 1)} style={{ pointerEvents: done ? "auto" : "none" }} />
          <div className="pr-floor" />
          <div className="pr-hint">{done ? "Click the batter for a sixer" : "Scroll: every pitch reveals a step"}</div>
        </div>
      </div>
    </section>
  );
}
