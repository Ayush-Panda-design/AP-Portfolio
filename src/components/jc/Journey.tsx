import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Boy } from "./Boy";
import { ROOMS, type Room } from "./journeyData";
import { scrollToY } from "./lib";

const N = ROOMS.length;

/** The inside of one carriage: a fixed layout, the same for every room. */
function Carriage({ r, lit, onGo }: { r: Room; lit: boolean; onGo: () => void }) {
  const [mi, setMi] = useState(0);
  const [open, setOpen] = useState(0);
  const mod = r.mods[mi];
  const sec = mod.sections[open] ?? mod.sections[0];
  const total = r.mods.reduce((n, m) => n + m.sections.reduce((a, x) => a + x.items.length, 0), 0);
  const pick = (k: number) => (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setOpen(k);
  };

  return (
    <div className={`cb ${lit ? "lit" : ""}`} style={{ ["--a" as string]: r.accent }} onClick={() => !lit && onGo()}>
      <header className="cb-top">
        <span className="cb-no">{r.num}</span>
        <span>{r.room}</span>
        <span className="cb-meta">{total} topics</span>
      </header>
      <h3 className="cb-title">{r.title}</h3>
      <p className="cb-tag">{r.tagline}</p>

      <div className="cb-tabs">
        {r.mods.length > 1 ? (
          r.mods.map((m, k) => (
            <button key={m.id} className={k === mi ? "on" : ""} onClick={(e) => { e.stopPropagation(); setMi(k); setOpen(0); }}>
              {m.title}
            </button>
          ))
        ) : (
          <span className="cb-only">Topics covered</span>
        )}
      </div>

      <div className="cb-main">
        <ul className="cb-nav">
          {mod.sections.map((x, k) => (
            <li key={x.t}>
              <button className={k === open ? "on" : ""} onMouseEnter={() => lit && setOpen(k)} onClick={pick(k)}>{x.t}</button>
            </li>
          ))}
        </ul>
        <div className="cb-detail" key={`${mi}-${open}`}>
          <h4>{sec.t}<span>{sec.items.length} {sec.items.length === 1 ? "item" : "items"}</span></h4>
          <ol>
            {sec.items.map((it, i) => (
              <li key={it}><i>{String(i + 1).padStart(2, "0")}</i>{it}</li>
            ))}
          </ol>
        </div>
      </div>

      <footer className="cb-foot"><span>Stack</span>{r.faces.map((f) => f.t).join(" · ")}</footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  The train: every room is a carriage, chained to the next one.      */
/* ------------------------------------------------------------------ */

const EX = 0.75; // extra scroll after the last carriage, to reach the engine
const WR = 17; // carriage wheel radius

type Lay = { s: number[]; c: number[]; cen: number; t: number };

const Wheel = ({ x, y, r, rot, spokes = 6 }: { x: number; y: number; r: number; rot: MotionValue<number>; spokes?: number }) => (
  <motion.g style={{ rotate: rot, transformBox: "fill-box", transformOrigin: "center" }}>
    <circle cx={x} cy={y} r={r} fill="var(--p-card2)" stroke="var(--p-ink2)" strokeWidth={r > 25 ? 5 : 3.5} />
    {Array.from({ length: spokes }, (_, i) => {
      const a = (i / spokes) * Math.PI;
      return <line key={i} x1={x - Math.cos(a) * (r - 4)} y1={y - Math.sin(a) * (r - 4)} x2={x + Math.cos(a) * (r - 4)} y2={y + Math.sin(a) * (r - 4)} stroke="var(--p-ink2)" strokeWidth="2.5" />;
    })}
    <circle cx={x} cy={y} r={r * 0.22} fill="var(--p-ink2)" />
    <circle cx={x} cy={y - r * 0.62} r={r * 0.12} fill="var(--a, #FFD66B)" />
  </motion.g>
);

function Bogie({ rot, left }: { rot: MotionValue<number>; left: string }) {
  return (
    <svg className="jr-bogie" viewBox="0 0 150 46" style={{ left }} aria-hidden>
      <rect x="6" y="4" width="138" height="9" rx="3" fill="var(--p-ink2)" />
      {[38, 112].map((x) => <path key={x} d={`M${x - 10} 13 l5 5 l-10 0 l5 5 l-10 0`} stroke="var(--p-ink2)" strokeWidth="2.5" fill="none" strokeLinejoin="round" />)}
      <Wheel x={38} y={29} r={WR} rot={rot} />
      <Wheel x={112} y={29} r={WR} rot={rot} />
    </svg>
  );
}

/** Hook + three-link chain joining two carriages. */
function Coupler({ k, w, gap, L }: { k: number; w: number; gap: number; L: MotionValue<Lay> }) {
  const x = useTransform(L, (l) => l.c[k] + (w * l.s[k]) / 2 - l.cen - 9);
  return (
    <motion.svg className="jr-coupler" viewBox="0 0 82 30" style={{ x, width: gap + 18 }} aria-hidden>
      <rect x="0" y="9" width="10" height="12" rx="2" fill="var(--p-ink2)" /><rect x="72" y="9" width="10" height="12" rx="2" fill="var(--p-ink2)" />
      <rect x="10" y="13.5" width="62" height="3" fill="var(--p-ink2)" />
      <rect x="12" y="8" width="24" height="14" rx="7" fill="none" stroke="var(--p-ink)" strokeWidth="3.4" />
      <rect x="29" y="12" width="24" height="6" rx="3" fill="none" stroke="var(--p-ink)" strokeWidth="3.4" />
      <rect x="46" y="8" width="24" height="14" rx="7" fill="none" stroke="var(--p-ink)" strokeWidth="3.4" />
      <circle cx="41" cy="15" r="2.2" fill="var(--a, #FFD66B)" />
    </motion.svg>
  );
}

function Engine({ rot }: { rot: MotionValue<number> }) {
  return (
    <svg className="jr-engine" viewBox="0 0 520 300" aria-hidden>
      {/* chimney + smoke */}
      <path d="M430 62 h48 l-7 -18 h-34z" fill="#2b2b2b" /><rect x="440" y="60" width="28" height="48" fill="#2b2b2b" />
      {[0, 1, 2].map((i) => <circle key={i} className="jr-puff" style={{ animationDelay: `${i * 0.9}s` }} cx="454" cy="40" r="13" fill="var(--p-ink2)" />)}
      {/* body */}
      <rect x="14" y="236" width="490" height="14" fill="#2b2b2b" /><rect x="0" y="232" width="14" height="24" rx="3" fill="#8a8680" />
      <rect x="176" y="104" width="276" height="126" rx="22" fill="#FFD66B" />
      {[190, 414].map((x) => <rect key={x} x={x} y="104" width="8" height="126" fill="#2b2b2b" opacity=".85" />)}
      <path d="M296 104 a24 24 0 0 1 48 0z" fill="#E3B13A" />
      <text x="300" y="176" textAnchor="middle" fontSize="19" fontWeight="800" letterSpacing="3" fill="#2b2b2b">AP EXPRESS</text>
      <rect x="446" y="104" width="52" height="126" rx="12" fill="#2b2b2b" /><circle cx="470" cy="166" r="17" fill="none" stroke="#8a8680" strokeWidth="3" />
      <circle cx="504" cy="150" r="12" fill="#F5F2EA" stroke="#2b2b2b" strokeWidth="3" />
      <polygon points="492,238 520,238 520,270 500,270" fill="#8a8680" />
      {/* cab */}
      <rect x="24" y="50" width="160" height="186" rx="8" fill="#2b2b2b" /><rect x="12" y="38" width="184" height="18" rx="6" fill="#3d3d3d" />
      <rect x="48" y="84" width="100" height="66" rx="7" fill="#F5F2EA" />
      <circle cx="98" cy="116" r="12" fill="#b98159" /><path d="M85 109 q13 -14 26 0z" fill="#2b2b2b" /><rect x="84" y="128" width="28" height="22" rx="5" fill="#D9A93B" />
      <rect x="60" y="172" width="76" height="20" rx="3" fill="#FFD66B" /><text x="98" y="187" textAnchor="middle" fontSize="12" fontWeight="800" fill="#2b2b2b">No. AP-01</text>
      {/* running gear */}
      <rect x="236" y="259" width="164" height="8" rx="3" fill="#8a8680" />
      <Wheel x={88} y={280} r={20} rot={rot} spokes={5} />
      {[236, 318, 400].map((x) => <Wheel key={x} x={x} y={266} r={34} rot={rot} spokes={8} />)}
      <Wheel x={468} y={280} r={20} rot={rot} spokes={5} />
    </svg>
  );
}

function CarSlot({ i, w, L, className = "", children }: { i: number; w: number; L: MotionValue<Lay>; className?: string; children: React.ReactNode }) {
  const x = useTransform(L, (l) => l.c[i] - l.cen - w / 2);
  const scale = useTransform(L, (l) => l.s[i]);
  const m = useTransform(L, (l) => Math.min(1, Math.abs(l.t - i)));
  const y = useTransform(m, (v) => -12 * (1 - v));
  const filter = useTransform(m, (v) => `brightness(${(1 - 0.42 * v).toFixed(3)}) saturate(${(1 - 0.5 * v).toFixed(3)})`);
  const zIndex = useTransform(m, (v) => Math.round((1 - v) * 10));
  return (
    <motion.div className={`jr-slot2 ${className}`} style={{ width: w, x, y, scale, filter, zIndex }}>
      {children}
    </motion.div>
  );
}

export function Journey() {
  const ref = useRef<HTMLElement>(null);
  const [vp, setVp] = useState({ w: 1440, h: 900 });
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [bubble, setBubble] = useState<string | null>("Wait for me! 🚂");
  const mobile = vp.w < 820;

  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  const W = mobile ? Math.round(vp.w * 0.86) : Math.round(Math.min(vp.w * 0.52, 840));
  const E = mobile ? Math.round(vp.w * 0.7) : Math.round(W * 0.62); // engine width
  const GAP = mobile ? 40 : 64; // distance between carriages (the coupler lives here)
  const STEPS = N - 1 + EX;

  // entrance (section scrolls in) and the pinned tour
  const enter = useScroll({ target: ref, offset: ["start end", "start start"] });
  const rv = useSpring(enter.scrollYProgress, { stiffness: 120, damping: 30, mass: 0.35 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.35 });

  // where every carriage sits: the one in front is full size, the rest are a little smaller; spacing follows size
  const dW = useMotionValue(W), dE = useMotionValue(E), dG = useMotionValue(GAP), dS = useMotionValue(STEPS);
  useEffect(() => { dW.set(W); dE.set(E); dG.set(GAP); dS.set(STEPS); }, [W, E, GAP, STEPS, dW, dE, dG, dS]);
  const L = useTransform([p, dW, dE, dG, dS], ([v, w0, e0, g0, n0]: number[]): Lay => {
    const t = v * n0;
    const s: number[] = [], c: number[] = [];
    let x = 0;
    for (let i = 0; i <= N; i++) {
      const si = 1 - 0.12 * Math.min(1, Math.abs(t - i));
      const w = i < N ? w0 : e0;
      s.push(si);
      c.push(x + (w * si) / 2);
      x += w * si + g0;
    }
    const i0 = Math.min(N, Math.floor(t));
    const i1 = Math.min(N, i0 + 1);
    return { s, c, cen: c[i0] + (c[i1] - c[i0]) * (t - Math.floor(t)), t };
  });

  // the train arrives from the right as the section scrolls in; the avatar runs in from the left
  const trainX = useTransform(rv, [0, 1], ["70vw", "0vw"]);
  const trainOp = useTransform(rv, [0, 0.25], [0, 1]);
  const boyX = useTransform(rv, [0, 1], ["-34vw", "0vw"]);
  const walkP = useTransform([rv, p], ([a, b]) => (b as number) - 0.07 * (1 - (a as number)));
  // ground runs faster than the carriages move on screen, so the train rolls forward while the avatar gains on it
  const groundPx = useTransform([walkP, dW, dG, dS], ([v, w0, g0, n0]: number[]) => -(v * n0 * (w0 + g0) * 1.35));
  const floorPos = useTransform(groundPx, (v) => `${v}px 0`);
  const dashPos = useTransform(groundPx, (v) => `${v * 1.15}px 0`);
  const wheel = useTransform([walkP, dW, dG, dS], ([v, w0, g0, n0]: number[]) => ((v * n0 * (w0 + g0) * 0.35) / WR) * 57.2958);

  useMotionValueEvent(p, "change", (v) => {
    const best = Math.max(0, Math.min(N - 1, Math.round(v * STEPS)));
    activeRef.current = best;
    setActive(best);
  });

  useEffect(() => {
    if (mobile) return;
    setBubble(active === 0 ? "Wait for me! 🚂" : ROOMS[active].room);
    const t = setTimeout(() => setBubble(null), 2400);
    return () => clearTimeout(t);
  }, [active, mobile]);

  const go = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const len = el.offsetHeight - window.innerHeight;
    scrollToY(top + (Math.max(0, Math.min(N - 1, i)) / STEPS) * len);
  };

  // ← / → walk to the next carriage while the tour is on screen
  useEffect(() => {
    if (mobile) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && /input|textarea/i.test(t.tagName)) return;
      const r = ref.current?.getBoundingClientRect();
      if (!r || r.top > 10 || r.bottom < window.innerHeight * 0.6) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(activeRef.current + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(activeRef.current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobile]);

  const r = ROOMS[active];
  return (
    <section id="journey" data-scene="royal" ref={ref} className="jr-tour" style={{ height: `${N * (mobile ? 38 : 46) + 100}vh` }}>
      <div className="jr-in" style={{ ["--a" as string]: r.accent }}>
        <div className="jr-head">
          <span className="jc-label">The journey · carriage {r.num} of {String(N).padStart(2, "0")}</span>
          <div className="jr-doors">
            {ROOMS.map((d, i) => (
              <button key={d.id} className={i === active ? "on" : i < active ? "past" : ""} onClick={() => go(i)} aria-label={d.title} title={`${d.num} · ${d.title}`} style={{ ["--a" as string]: d.accent }} />
            ))}
          </div>
          <span className="jr-hint2">{mobile ? "Keep scrolling to ride the train" : "← → to hop between carriages"}</span>
        </div>

        <div className="jr-ground" aria-hidden />
        <motion.div className="jr-track2" style={{ backgroundPosition: floorPos }} aria-hidden />
        <motion.div className="jr-dashes" style={{ backgroundPosition: dashPos }} aria-hidden />

        <motion.div className="jr-train" style={{ x: trainX, opacity: trainOp }}>
          {ROOMS.map((room, i) => (
            <CarSlot key={room.id} i={i} w={W} L={L}>
              <div className="jr-car" style={{ ["--a" as string]: room.accent }}>
                <div className="roof"><i /><i /></div>
                <Carriage r={room} lit={i === active} onGo={() => go(i)} />
                <div className="skirt"><b>No. {room.num}</b><span>{room.room}</span></div>
                <Bogie rot={wheel} left="9%" />
                <Bogie rot={wheel} left="66%" />
              </div>
            </CarSlot>
          ))}
          {ROOMS.map((room, k) => <Coupler key={`c${k}`} k={k} w={W} gap={GAP} L={L} />)}
          <CarSlot i={N} w={E} L={L} className="eng">
            <Engine rot={wheel} />
          </CarSlot>
        </motion.div>

        <motion.div className="jr-boywrap" style={{ x: boyX }}>
          <Boy p={walkP} n={N} mode="walk" line={bubble} />
        </motion.div>
      </div>
    </section>
  );
}
