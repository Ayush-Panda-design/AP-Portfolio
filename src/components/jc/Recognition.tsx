import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";

// Add the real post/video links here and the cards become clickable.
const ITEMS = [
  { k: "ChaiCode", t: "Featured as a standout student", d: "Highlighted on ChaiCode's official X and LinkedIn pages, and my video was published on their channel.", links: [{ l: "X post", href: "https://x.com/AyushPanda85699" }, { l: "LinkedIn post", href: "https://lnkd.in/p/dwBfJ5tH" }, { l: "Video", href: "" }], c: "#FFD66B" },
  { k: "Freelance", t: "Shipped work for real clients", d: "Built and delivered freelance projects end to end, from requirements to deploy.", links: [], c: "#8fb39a" },
];

/* ------------------------------------------------------------------ */
/*  A scroll-built room: every piece flies in as you scroll down and    */
/*  flies back out as you scroll up. Stage units: 1000 x 560 (desktop). */
/* ------------------------------------------------------------------ */

const backOut = (t: number) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);

type Pos = { x: number; y: number; w: number; mx?: number; my?: number; mw?: number };
type From = { x?: number; y?: number; r?: number; s?: number };

// stage units -> css vars (desktop 1000x560, mobile 1000x1580)
const vars = (p: Pos) => {
  const mx = p.mx ?? (p.x - 50) * 1.32 + 40;
  const my = p.my ?? p.y * 1.32 + 20;
  const mw = p.mw ?? p.w * 1.32;
  return {
    ["--l" as string]: `${p.x / 10}%`, ["--t" as string]: `${(p.y / 560) * 100}%`, ["--w" as string]: `${p.w / 10}%`,
    ["--ml" as string]: `${mx / 10}%`, ["--mt" as string]: `${(my / 1580) * 100}%`, ["--mw" as string]: `${mw / 10}%`,
  };
};

function Piece({ p, at, from, pos, z = 1, live, className = "", children }: {
  p: MotionValue<number>; at: [number, number]; from: From; pos: Pos; z?: number; live?: boolean; className?: string; children: ReactNode;
}) {
  const t = useTransform(p, at, [0, 1], { clamp: true, ease: backOut });
  const x = useTransform(t, [0, 1], [`${from.x ?? 0}vw`, "0vw"]);
  const y = useTransform(t, [0, 1], [`${from.y ?? 0}vh`, "0vh"]);
  const rotate = useTransform(t, [0, 1], [from.r ?? 0, 0]);
  const scale = useTransform(t, [0, 1], [from.s ?? 0.6, 1]);
  const opacity = useTransform(t, [0, 0.1], [0, 1]);
  const pe = useTransform(t, (v) => (live && v > 0.97 ? "auto" : "none"));
  return (
    <motion.div className={`rc2-piece ${className}`} style={{ x, y, rotate, scale, opacity, zIndex: z, pointerEvents: pe, ...vars(pos) }}>
      {children}
    </motion.div>
  );
}

const svgProps = { className: "rc2-svg", "aria-hidden": true } as const;

const Window = () => (
  <svg {...svgProps} viewBox="0 0 170 150">
    <defs>
      <linearGradient id="rcsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#16181d" /><stop offset="1" stopColor="#262a32" /></linearGradient>
    </defs>
    <rect width="170" height="150" rx="10" fill="#3a3430" />
    <rect x="10" y="10" width="150" height="128" rx="4" fill="url(#rcsky)" />
    <circle cx="118" cy="44" r="16" fill="#F1E7C9" /><circle cx="126" cy="39" r="14" fill="#1d2027" />
    {[[30, 30], [52, 58], [80, 24], [100, 70], [140, 90], [40, 98]].map(([x, y], i) => <circle key={i} className="rc2-tw" style={{ animationDelay: `${i * 0.4}s` }} cx={x} cy={y} r="1.6" fill="#fff" />)}
    <rect x="82" y="10" width="6" height="128" fill="#3a3430" /><rect x="10" y="72" width="150" height="6" fill="#3a3430" />
    <path d="M10 10 H44 Q36 50 42 138 H10Z" fill="#7a5646"  /><path d="M160 10 H126 Q134 50 128 138 H160Z" fill="#7a5646"  />
    <rect x="-5" y="138" width="180" height="11" rx="3" fill="#4a423a" />
  </svg>
);

const Clock = () => (
  <svg {...svgProps} viewBox="0 0 80 80">
    <circle cx="40" cy="40" r="37" fill="#f3ecdc" stroke="#3a3430" strokeWidth="6" />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x="39" y="8" width="2" height={i % 3 ? 4 : 7} fill="#3a3430" transform={`rotate(${i * 30} 40 40)`} />)}
    <rect x="38.5" y="22" width="3" height="19" rx="1.5" fill="#1b1b1d" transform="rotate(-40 40 40)" />
    <rect className="rc2-min" x="39" y="14" width="2" height="27" rx="1" fill="#1b1b1d" />
    <circle cx="40" cy="40" r="3" fill="#FFD66B" />
  </svg>
);

const Floor = () => (
  <svg {...svgProps} viewBox="0 0 1000 44" preserveAspectRatio="none">
    <rect width="1000" height="44" fill="#1c1b1a" /><rect width="1000" height="3" fill="#2c2a28" />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={i * 125 + 40} y="3" width="2" height="41" fill="#151514" />)}
    <ellipse cx="360" cy="20" rx="300" ry="13" fill="#2f2e2c" /><ellipse cx="360" cy="20" rx="270" ry="9" fill="none" stroke="rgba(245,242,234,.28)" strokeWidth="2" strokeDasharray="6 8" />
  </svg>
);

const Desk = () => (
  <svg {...svgProps} viewBox="0 0 560 148">
    <rect width="560" height="20" rx="6" fill="#b58a5c" /><rect width="560" height="5" rx="3" fill="#c9a073" />
    <rect x="14" y="20" width="532" height="12" fill="#8d6a45" />
    <rect x="24" y="32" width="16" height="116" fill="#775736" />
    <rect x="380" y="32" width="150" height="112" rx="4" fill="#9c7549" />
    <rect x="390" y="42" width="130" height="44" rx="3" fill="#ab8255" /><rect x="390" y="92" width="130" height="44" rx="3" fill="#ab8255" />
    <rect x="435" y="58" width="40" height="7" rx="3" fill="#4a3524" /><rect x="435" y="108" width="40" height="7" rx="3" fill="#4a3524" />
  </svg>
);

const Chair = () => (
  <svg {...svgProps} viewBox="0 0 150 210">
    <rect x="30" y="10" width="22" height="112" rx="11" fill="#66625c" transform="rotate(-6 41 66)" />
    <rect x="30" y="112" width="100" height="22" rx="11" fill="#57534e" />
    <rect x="75" y="134" width="10" height="48" fill="#555" />
    <path d="M26 190 H134" stroke="#555" strokeWidth="8" strokeLinecap="round" />
    {[28, 80, 132].map((x) => <circle key={x} cx={x} cy="198" r="8" fill="#262626" />)}
  </svg>
);

const Student = () => (
  <svg {...svgProps} viewBox="0 0 190 250">
    <path d="M150 150 L152 226" stroke="#363b47" strokeWidth="22" strokeLinecap="round" fill="none" />
    <path d="M70 150 L150 150" stroke="#414756" strokeWidth="26" strokeLinecap="round" fill="none" />
    <path d="M139 232 q0 -9 12 -9 h22 q9 0 9 9 v5 h-43z" fill="#f4f1e8" /><rect x="139" y="236" width="43" height="5" rx="2" fill="#cfc8b6" />
    <path d="M62 68 C46 100 50 136 60 154 L98 154 C100 124 102 98 98 68 Z" fill="#D9A93B" />
    <path d="M86 84 L108 120 L168 128" stroke="#B98C2C" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M80 80 L112 122 L168 128" stroke="#D9A93B" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="170" cy="128" r="8" fill="#b98159" />
    <rect x="76" y="52" width="14" height="20" fill="#a46f4b" />
    <ellipse cx="82" cy="68" rx="18" ry="8" fill="#B98C2C" />
    <circle cx="86" cy="36" r="26" fill="#b98159" />
    {[[64, 24, 12], [78, 12, 13], [96, 11, 13], [109, 22, 11], [62, 38, 9]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#1b1410" />)}
    <circle cx="101" cy="36" r="2.6" fill="#1b1410" /><path d="M97 30 q5 -3 10 0" stroke="#1b1410" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M112 38 q4 4 0 8" stroke="#a46f4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M98 50 q8 5 14 -1" stroke="#1b1410" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M60 36 C58 4 112 2 110 36" stroke="#eadfc6" strokeWidth="5" fill="none" strokeLinecap="round" />
    <ellipse cx="66" cy="42" rx="9" ry="12" fill="#23232a" stroke="#eadfc6" strokeWidth="3" />
  </svg>
);

const Laptop = () => (
  <svg {...svgProps} viewBox="0 0 170 113">
    <defs>
      <linearGradient id="rcscr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#202020" /><stop offset="1" stopColor="#2b2b2b" /></linearGradient>
      <linearGradient id="rcvid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4a4640" /><stop offset="1" stopColor="#35322e" /></linearGradient>
    </defs>
    <rect x="14" width="142" height="94" rx="7" fill="#161616" stroke="#444" strokeWidth="2" />
    <rect x="20" y="6" width="130" height="82" rx="3" fill="url(#rcscr)" />
    <rect x="26" y="12" width="76" height="46" rx="3" fill="url(#rcvid)" />
    <circle cx="64" cy="35" r="10" fill="#fff" opacity=".92" /><path d="M61 30 L61 40 L70 35Z" fill="#4a4640" />
    <rect x="30" y="16" width="22" height="9" rx="4" fill="#c8483a" /><text x="41" y="22.6" fontSize="6" fontWeight="800" fill="#fff" textAnchor="middle">LIVE</text>
    {[0, 1, 2, 3, 4].map((i) => <g key={i}><circle cx="111" cy={15 + i * 9.5} r="2.4" fill={i < 3 ? "#7fa88a" : "rgba(255,255,255,.3)"} /><rect x="117" y={13 + i * 9.5} width={28 - (i % 3) * 5} height="4.5" rx="2" fill="rgba(255,255,255,.4)" /></g>)}
    <rect x="26" y="64" width="118" height="5" rx="2.5" fill="rgba(255,255,255,.2)" /><rect x="26" y="64" width="72" height="5" rx="2.5" fill="#FFD66B" />
    {["#FFD66B", "#7fa88a", "#8a97a8", "#4a4640"].map((c, i) => <circle key={c} cx={32 + i * 13} cy="78" r="5" fill={c} />)}
    <path d="M0 96 H170 L162 108 Q161 112 156 112 H14 Q9 112 8 108Z" fill="#b4b0a8" /><rect x="68" y="96" width="34" height="4" rx="2" fill="#8f8b84" />
  </svg>
);

const Mug = () => (
  <svg {...svgProps} viewBox="0 0 40 44">
    <path d="M30 20 q10 0 10 9 q0 9 -10 9" stroke="#EDE6D3" strokeWidth="4" fill="none" />
    <rect x="3" y="14" width="27" height="29" rx="5" fill="#EDE6D3" /><rect x="3" y="14" width="27" height="6" rx="3" fill="#fff8e6" />
    {[10, 17, 24].map((x, i) => <path key={x} className="rc2-steam" style={{ animationDelay: `${i * 0.5}s` }} d={`M${x} 11 q-4 -4 0 -8 q4 -4 0 -8`} transform="translate(0 8)" stroke="rgba(255,255,255,.7)" strokeWidth="2" fill="none" strokeLinecap="round" />)}
  </svg>
);

const Books = () => (
  <svg {...svgProps} viewBox="0 0 54 34">
    <rect y="22" width="54" height="12" rx="2" fill="#6d7a8c" /><rect x="4" y="11" width="48" height="11" rx="2" fill="#7a9a80" /><rect x="2" width="50" height="11" rx="2" fill="#c9a24a" />
    <rect x="8" y="27" width="38" height="2" fill="rgba(255,255,255,.55)" /><rect x="10" y="15" width="30" height="2" fill="rgba(255,255,255,.55)" /><rect x="8" y="4" width="34" height="2" fill="rgba(255,255,255,.55)" />
  </svg>
);

const Lamp = () => (
  <svg {...svgProps} viewBox="0 0 58 110" style={{ overflow: "visible" }}>
    <defs><linearGradient id="rccone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFD66B" stopOpacity=".2" /><stop offset="1" stopColor="#FFD66B" stopOpacity="0" /></linearGradient></defs>
    <polygon className="rc2-cone" points="46,40 58,48 180,120 80,128" fill="url(#rccone)" />
    <ellipse cx="22" cy="104" rx="18" ry="5" fill="#262626" />
    <path d="M22 102 L18 62 L36 30" stroke="#b8b4ac" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="18" cy="62" r="4" fill="#8a867f" />
    <path d="M26 16 L50 24 L58 44 L32 36Z" fill="#FFD66B" /><circle cx="50" cy="42" r="5" fill="#fff4c2" />
  </svg>
);

const Plant = () => (
  <svg {...svgProps} viewBox="0 0 90 150">
    {[-42, -22, 0, 22, 42].map((a, i) => <ellipse key={a} cx="45" cy="58" rx="11" ry="46" fill={i % 2 ? "#587a55" : "#6f8f6a"} transform={`rotate(${a} 45 104)`} />)}
    <path d="M22 106 H68 L62 146 H28Z" fill="#a5654d" /><rect x="18" y="100" width="54" height="10" rx="3" fill="#b97760" />
  </svg>
);

const Trophy = () => (
  <svg {...svgProps} viewBox="0 0 70 90">
    <path d="M16 12 H6 C6 28 12 34 18 34 M54 12 H64 C64 28 58 34 52 34" stroke="#B8962F" strokeWidth="4" fill="none" />
    <path d="M16 4 H54 V32 C54 46 44 54 35 54 C26 54 16 46 16 32Z" fill="#D9B64E" />
    <polygon points="35,16 38,24 46,24 40,29 42,37 35,32 28,37 30,29 24,24 32,24" fill="#fff3c4" />
    <rect x="31" y="54" width="8" height="14" fill="#B8962F" /><rect x="18" y="68" width="34" height="8" rx="2" fill="#7a5a2b" /><rect x="12" y="76" width="46" height="10" rx="2" fill="#5b4220" />
  </svg>
);

const Bubble = ({ bg, fg, children, delay = 0 }: { bg: string; fg?: string; children: ReactNode; delay?: number }) => (
  <div className="rc2-bob" style={{ animationDelay: `${delay}s` }}><div className="rc2-bubble" style={{ ["--bg" as string]: bg, ...(fg ? { color: fg } : {}) }}>{children}</div></div>
);

export function Recognition() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 130, damping: 28, mass: 0.35 });
  const headOp = useTransform(p, [0, 0.05], [0, 1]);
  const headY = useTransform(p, [0, 0.05], [24, 0]);

  return (
    <section id="recognition" data-scene="recognition" className="jc-sec rc2" ref={ref}>
      <div className="rc2-sticky">
        <motion.div className="rc2-head" style={{ opacity: headOp, y: headY }}>
          <span className="jc-label">Along the way</span>
          <h2 className="rc2-title">Recognition &amp; status.</h2>
        </motion.div>

        <div className="rc2-stage">
          <Piece p={p} at={[0, 0.08]} from={{ s: 0.9 }} pos={{ x: 0, y: 0, w: 1000, mx: 0, my: 0, mw: 1000 }} z={0} className="room"><span /></Piece>
          <Piece p={p} at={[0.05, 0.14]} from={{ y: 30 }} pos={{ x: 0, y: 504, w: 1000, mx: 0, my: 685, mw: 1000 }} z={1}><Floor /></Piece>
          <Piece p={p} at={[0.1, 0.22]} from={{ x: -40, y: -60, r: -20 }} pos={{ x: 40, y: 30, w: 170 }} z={1}><Window /></Piece>
          <Piece p={p} at={[0.14, 0.25]} from={{ x: 50, y: -70, r: 260, s: 0.3 }} pos={{ x: 275, y: 36, w: 72 }} z={1}><Clock /></Piece>
          <Piece p={p} at={[0.2, 0.34]} from={{ x: -80, y: 10, r: -12 }} pos={{ x: 60, y: 372, w: 560 }} z={4}><Desk /></Piece>
          <Piece p={p} at={[0.29, 0.42]} from={{ x: -60, y: 40, r: -30 }} pos={{ x: 115, y: 300, w: 150 }} z={2}><Chair /></Piece>
          <Piece p={p} at={[0.37, 0.5]} from={{ y: -90, r: 8, s: 0.7 }} pos={{ x: 110, y: 209, w: 237 }} z={3}><Student /></Piece>
          <Piece p={p} at={[0.46, 0.58]} from={{ x: 80, y: -30, r: 18 }} pos={{ x: 322, y: 259, w: 170 }} z={5}><Laptop /></Piece>
          <Piece p={p} at={[0.53, 0.62]} from={{ x: 60, y: 60, r: 90, s: 0.3 }} pos={{ x: 500, y: 328, w: 36 }} z={5}><Mug /></Piece>
          <Piece p={p} at={[0.56, 0.65]} from={{ y: 80, r: -25 }} pos={{ x: 542, y: 338, w: 54 }} z={5}><Books /></Piece>
          <Piece p={p} at={[0.59, 0.69]} from={{ x: -30, y: -80, r: -40 }} pos={{ x: 72, y: 264, w: 58 }} z={5}><Lamp /></Piece>
          <Piece p={p} at={[0.64, 0.74]} from={{ x: 40, y: 80, s: 0.2 }} pos={{ x: 640, y: 372, w: 90 }} z={2}><Plant /></Piece>

          {ITEMS.map((it, i) => (
            <Piece key={it.k} p={p} at={i ? [0.74, 0.88] : [0.66, 0.8]} from={{ x: 90, y: i ? 40 : -40, r: i ? 14 : -14, s: 0.7 }} pos={{ x: 738, y: i ? 252 : 22, w: 248, mx: 30, my: i ? 1240 : 775, mw: 940 }} z={6} live className="card">
              <div className="rc2-card" style={{ ["--a" as string]: it.c }}>
                <small>{it.k}</small>
                <h3>{it.t}</h3>
                <p>{it.d}</p>
                {it.links.some((l) => l.href) && <div className="lk">{it.links.filter((l) => l.href).map((l) => <a key={l.l} href={l.href} target="_blank" rel="noreferrer">{l.l} ↗</a>)}</div>}
              </div>
            </Piece>
          ))}

          <Piece p={p} at={[0.82, 0.92]} from={{ x: 40, y: 70, r: 30, s: 0.3 }} pos={{ x: 805, y: 430, w: 70 }} z={3} className="nom"><Trophy /></Piece>
          <Piece p={p} at={[0.86, 0.94]} from={{ x: -20, y: -50, s: 0.3 }} pos={{ x: 362, y: 108, w: 150 }} z={7}><Bubble bg="#F5F2EA">Great work! 👏</Bubble></Piece>
          <Piece p={p} at={[0.89, 0.96]} from={{ x: -30, y: -40, s: 0.3 }} pos={{ x: 330, y: 176, w: 120 }} z={7}><Bubble bg="#FFD66B" delay={0.6}>&lt;/&gt; shipping</Bubble></Piece>
          <Piece p={p} at={[0.92, 0.99]} from={{ x: 20, y: -40, s: 0.3 }} pos={{ x: 472, y: 204, w: 90 }} z={7}><Bubble bg="#3b3b3b" fg="#F5F2EA" delay={1.1}>chai ☕</Bubble></Piece>
        </div>
      </div>
    </section>
  );
}
